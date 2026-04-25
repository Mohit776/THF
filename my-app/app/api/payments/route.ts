import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const PAGE_SIZE = 10;
const PLATFORM_FEE_RATE = 0.10; // 10%

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1", 10);

    // ── Fetch bookings ──────────────────────────────────
    let query = adminDb.collection("bookings").orderBy("createdAt", "desc");

    if (startDate) {
      query = query.where("createdAt", ">=", new Date(`${startDate}T00:00:00+05:30`));
    }
    if (endDate) {
      query = query.where("createdAt", "<=", new Date(`${endDate}T23:59:59.999+05:30`));
    }

    const snapshot = await query.get();
    const allDocs = snapshot.docs;
    const total = allDocs.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    // paginate in memory (small dataset)
    const pageDocs = allDocs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // ── Collect unique partnerIds to batch-look up chef names ──
    const partnerIds = [...new Set(pageDocs.map((d) => d.data().partnerId).filter(Boolean))];
    const chefMap: Record<string, string> = {};
    await Promise.all(
      partnerIds.map(async (pid) => {
        const userDoc = await adminDb.collection("users").doc(pid as string).get();
        if (userDoc.exists) {
          chefMap[pid as string] = userDoc.data()?.name || "Unknown Chef";
        }
      })
    );

    // ── Build transactions ──────────────────────────────
    const transactions = pageDocs.map((doc) => {
      const d = doc.data();
      const amount = d.amount || 0;
      const platformFee = Math.round(amount * PLATFORM_FEE_RATE);
      const rawStatus = (d.status as string) || "active";

      // Normalise status to display labels
      let status: "Hold" | "Cancelled" | "Completed" = "Hold";
      if (rawStatus === "completed") status = "Completed";
      else if (rawStatus === "cancelled") status = "Cancelled";

      const dateValue = d.createdAt?.toDate ? d.createdAt.toDate() : null;
      const dateLabel = dateValue
        ? dateValue.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
        : "—";

      return {
        transactionId: doc.id.slice(0, 10).toUpperCase(),
        bookingId: doc.id.slice(0, 10).toUpperCase(),
        chefName: chefMap[d.partnerId] || "—",
        clientName: d.clientName || "—",
        dateTime: dateLabel,
        amount: `₹${amount.toLocaleString("en-IN")}`,
        platformFee: `₹${platformFee.toLocaleString("en-IN")}`,
        status,
      };
    });

    // ── Aggregates (whole result set, not just page) ────
    let totalProcessed = 0;
    let pendingPayouts = 0;
    let platformFeeEarned = 0;
    let pendingCount = 0;

    allDocs.forEach((doc) => {
      const d = doc.data();
      const amount = d.amount || 0;
      const fee = Math.round(amount * PLATFORM_FEE_RATE);
      totalProcessed += amount;
      platformFeeEarned += fee;
      const s = (d.status as string) || "";
      if (s !== "completed" && s !== "cancelled") {
        pendingPayouts += amount;
        pendingCount++;
      }
    });

    const formatLakh = (n: number) => {
      if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
      if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
      return `₹${n}`;
    };

    return NextResponse.json({
      transactions,
      totalPages,
      currentPage: page,
      total,
      summary: {
        totalProcessed: formatLakh(totalProcessed),
        pendingPayouts: formatLakh(pendingPayouts),
        pendingCount,
        platformFeeEarned: formatLakh(platformFeeEarned),
      },
    });
  } catch (err) {
    console.error("[payments API]", err);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

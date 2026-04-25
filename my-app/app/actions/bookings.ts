"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

export interface BookingRow {
  id: string;
  fullId: string;
  chefName: string;
  client: string;
  phone: string;
  eventType: string;
  date: string;
  time: string;
  guests: number;
  amount: string;
  rawAmount: number;
  status: string;
  address: string;
  location: string;
  requirements: string;
  zone: string;
  rawDate: number;
  hasNullDate?: boolean; // Issue #3: flag TBD dates
}

export interface BookingStats {
  completed: number;
  inProgress: number;
  scheduled: number;
  broadcasted: number; // Issue #1: separate bucket for broadcasted
  cancelled: number;
  total: number;
}

export interface BookingsData {
  stats: BookingStats;
  bookings: BookingRow[];
}

function formatDate(raw: any): { date: string; time: string; timestamp: number } {
  let d: Date | null = null;
  if (raw?.toDate) d = raw.toDate();
  else if (raw) d = new Date(raw);
  if (!d || isNaN(d.getTime())) return { date: "—", time: "—", timestamp: 0 };
  const date = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { date, time, timestamp: d.getTime() };
}

// Issue #1: "broadcasted" now gets its own status bucket instead of lumped into "Scheduled"
function normaliseStatus(raw: string = ""): string {
  const s = raw.toLowerCase().trim();
  if (s === "completed" || s === "done") return "Completed";
  if (s === "in_progress" || s === "inprogress" || s === "in progress" || s === "active") return "In progress";
  if (s === "broadcasted" || s === "broadcast") return "Broadcasted"; // FIX #1
  if (s === "scheduled" || s === "confirmed" || s === "pending") return "Scheduled";
  if (s === "cancelled" || s === "canceled" || s === "rejected") return "Cancelled";
  return "Scheduled"; // default
}

// Issue #9: canonical Firestore status values used when writing back
// NOTE: not exported — "use server" files can only export async functions
const DISPLAY_TO_FIRESTORE_STATUS: Record<string, string> = {
  "Completed":   "completed",
  "In progress": "in_progress",
  "Broadcasted": "broadcasted",
  "Scheduled":   "scheduled",
  "Cancelled":   "cancelled",
};

export async function getBookingsData(): Promise<{
  success: boolean;
  data?: BookingsData;
  error?: string;
}> {
  try {
    const [bookingsSnap, usersSnap] = await Promise.all([
      adminDb.collection("bookings").orderBy("createdAt", "desc").limit(100).get(),
      adminDb.collection("users").get(),
    ]);

    // Build a name lookup map: uid -> name
    // Issue #12: guard against empty-string email being used as chef name
    const nameMap: Record<string, string> = {};
    for (const doc of usersSnap.docs) {
      const d = doc.data();
      const email = d.email && d.email !== "" ? d.email : null;
      nameMap[doc.id] = d.name || d.displayName || email || "Unknown";
    }

    const stats: BookingStats = { completed: 0, inProgress: 0, scheduled: 0, broadcasted: 0, cancelled: 0, total: 0 };
    const bookings: BookingRow[] = [];

    for (const doc of bookingsSnap.docs) {
      const b = doc.data();
      const status = normaliseStatus(b.status);
      stats.total++;
      if (status === "Completed")    stats.completed++;
      else if (status === "In progress") stats.inProgress++;
      else if (status === "Broadcasted") stats.broadcasted++; // FIX #1
      else if (status === "Scheduled")   stats.scheduled++;
      else if (status === "Cancelled")   stats.cancelled++;

      // Issue #2: broadcasted bookings have partnerId = "generic-booking" — show broadcast info instead
      let chefName: string;
      if (b.partnerId === "generic-booking" || status === "Broadcasted") {
        const broadcastCount = Array.isArray(b.broadcastedTo) ? b.broadcastedTo.length : null;
        chefName = broadcastCount
          ? `Broadcast (${broadcastCount} chefs)`
          : "Broadcast";
      } else {
        chefName =
          nameMap[b.partnerId] ||
          nameMap[b.chefId] ||
          b.chefName ||
          "Unknown Chef";
      }

      const client =
        nameMap[b.clientId] ||
        b.clientName ||
        b.userName ||
        "Unknown Client";

      // Issue #3: track null dates explicitly — don't silently fall back to createdAt
      const hasNullDate = b.date === null || b.date === undefined;
      const rawForDate = hasNullDate ? null : (b.date ?? b.createdAt);
      const { date: resolvedDate, time, timestamp } = hasNullDate
        ? { date: "Date TBD", time: "—", timestamp: 0 }
        : formatDate(rawForDate);

      const amountValue = Number(b.amount) || 0;
      const amount = amountValue ? `₹${amountValue.toLocaleString("en-IN")}` : "—";

      bookings.push({
        id: `#${doc.id.slice(0, 5).toUpperCase()}`,
        fullId: doc.id,
        chefName,
        client,
        phone: b.phone || "",
        eventType: b.eventType || b.occasion || "Event",
        date: resolvedDate,
        time,
        guests: Number(b.guests) || 0,
        amount,
        rawAmount: amountValue,
        status,
        address: b.address || "",
        location: b.location || "",
        requirements: b.requirements || "",
        zone: b.zone || "",
        rawDate: timestamp,
        hasNullDate,
      });
    }

    return { success: true, data: { stats, bookings } };
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return { success: false, error: error.message || "Failed to fetch bookings." };
  }
}

export async function updateBooking(id: string, data: Partial<BookingRow & { rawStatus: string }>) {
  try {
    const updateData: any = {};
    if (data.rawAmount !== undefined) updateData.amount = data.rawAmount;
    if (data.zone !== undefined) updateData.zone = data.zone;
    if (data.status !== undefined) {
      // Issue #5: use replaceAll (not single replace) + Issue #9: use canonical Firestore value
      const canonical = DISPLAY_TO_FIRESTORE_STATUS[data.status];
      updateData.status = canonical ?? data.status.toLowerCase().replaceAll(" ", "_");
    }
    if (data.chefName !== undefined) updateData.chefName = data.chefName;

    await adminDb.collection("bookings").doc(id).update(updateData);
    revalidatePath("/bookings");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return { success: false, error: error.message || "Failed to update booking" };
  }
}

export async function deleteBooking(id: string) {
  try {
    await adminDb.collection("bookings").doc(id).delete();
    revalidatePath("/bookings");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting booking:", error);
    return { success: false, error: error.message || "Failed to delete booking" };
  }
}

export async function getChefBookings(chefId: string): Promise<{ success: boolean; data?: BookingRow[]; error?: string }> {
  try {
    // Query both fields where chef ID might be stored
    const [partnerSnap, chefSnap] = await Promise.all([
      adminDb.collection("bookings").where("partnerId", "==", chefId).get(),
      adminDb.collection("bookings").where("chefId", "==", chefId).get(),
    ]);

    const usersSnap = await adminDb.collection("users").get();
    const nameMap: Record<string, string> = {};
    for (const doc of usersSnap.docs) {
      const d = doc.data();
      // Issue #12: guard against empty-string email
      const email = d.email && d.email !== "" ? d.email : null;
      nameMap[doc.id] = d.name || d.displayName || email || "Unknown";
    }

    // Use Map to eliminate duplicates — keyed by full Firestore doc ID
    const uniqueDocs = new Map<string, { doc: FirebaseFirestore.QueryDocumentSnapshot; createdAtMs: number }>();
    for (const doc of partnerSnap.docs) {
      const ts = doc.data()?.createdAt?.toMillis?.() ?? 0;
      uniqueDocs.set(doc.id, { doc, createdAtMs: ts });
    }
    for (const doc of chefSnap.docs) {
      if (!uniqueDocs.has(doc.id)) {
        const ts = doc.data()?.createdAt?.toMillis?.() ?? 0;
        uniqueDocs.set(doc.id, { doc, createdAtMs: ts });
      }
    }

    const bookings: BookingRow[] = [];
    for (const { doc } of Array.from(uniqueDocs.values())) {
      const b = doc.data();
      const status = normaliseStatus(b.status);

      let chefName: string;
      if (b.partnerId === "generic-booking" || status === "Broadcasted") {
        const broadcastCount = Array.isArray(b.broadcastedTo) ? b.broadcastedTo.length : null;
        chefName = broadcastCount ? `Broadcast (${broadcastCount} chefs)` : "Broadcast";
      } else {
        chefName = nameMap[b.partnerId] || nameMap[b.chefId] || b.chefName || "Unknown Chef";
      }

      const client = nameMap[b.clientId] || b.clientName || b.userName || "Unknown Client";

      const hasNullDate = b.date === null || b.date === undefined;
      const { date, time, timestamp } = hasNullDate
        ? { date: "Date TBD", time: "—", timestamp: 0 }
        : formatDate(b.date ?? b.createdAt);

      const amountValue = Number(b.amount) || 0;
      const amount = amountValue ? `₹${amountValue.toLocaleString("en-IN")}` : "—";

      bookings.push({
        id: `#${doc.id.slice(0, 5).toUpperCase()}`,
        fullId: doc.id,
        chefName,
        client,
        phone: b.phone || "",
        eventType: b.eventType || b.occasion || "Event",
        date,
        time,
        guests: Number(b.guests) || 0,
        amount,
        rawAmount: amountValue,
        status,
        address: b.address || "",
        location: b.location || "",
        requirements: b.requirements || "",
        zone: b.zone || "",
        rawDate: timestamp,
        hasNullDate,
      });
    }

    // Issue #10: sort using the stored createdAtMs (not doc.id lookup which was always 0)
    bookings.sort((a, b) => {
      const valA = uniqueDocs.get(a.fullId)?.createdAtMs ?? 0;
      const valB = uniqueDocs.get(b.fullId)?.createdAtMs ?? 0;
      return valB - valA;
    });

    return { success: true, data: bookings };
  } catch (error: any) {
    console.error("Error fetching chef bookings:", error);
    return { success: false, error: error.message || "Failed to fetch bookings" };
  }
}

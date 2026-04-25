"use server";

import { adminDb } from "@/lib/firebase-admin";

export async function getDashboardStats() {
  try {
    // Fetch users directly from Firestore
    const usersSnapshot = await adminDb.collection("users").limit(100).get();
    
    const users = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        name: data.name || "Unknown User",
        email: data.email || null,
        phone: data.phone || data.emergencyPhone || "No Phone",
        city: data.city || "Unknown City",
        kycStatus: data.kycStatus || "unsubmitted",
        kycSubmittedAt: data.kycSubmittedAt || null,
        selfieUrl: data.kycDocuments?.selfieUrl || null,
      };
    });

    // Compute stats
    const totalUsers = users.length;
    const verifiedUsers = users.filter((u) => u.kycStatus === "approved" || u.kycStatus === "verified").length;
    
    const recentSignups = users.filter((u) => {
      if (!u.kycSubmittedAt) return false;
      const created = new Date(u.kycSubmittedAt);
      const now = new Date();
      const diffDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7;
    }).length;

    // Sort by recent submissions
    users.sort((a, b) => {
      if (!a.kycSubmittedAt) return 1;
      if (!b.kycSubmittedAt) return -1;
      return new Date(b.kycSubmittedAt).getTime() - new Date(a.kycSubmittedAt).getTime();
    });

    return {
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        recentSignups,
        pendingKyc: users.filter((u) => u.kycStatus === "pending_verification").length,
        users,
      }
    };
  } catch (error: any) {
    console.error("Error fetching Firestore stats:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch data from Firestore.",
    };
  }
}

// ──────────────────────────────────────────────────────────────
// Dashboard Analytics – powers /dashboard with live Firestore data
// ──────────────────────────────────────────────────────────────

interface MonthlyBooking {
  label: string;
  value: number;
}

interface BreakdownItem {
  label: string;
  count: number;
  pct: number;
}

interface ActivityItem {
  text: string;
  time: string;
}

interface MemberStats {
  addedThisMonth: number;
  onHold: number;
  suspended: number;
  activeTotal: number;
}

export interface RecentBooking {
  id: string;
  clientName: string;
  chefName: string;
  eventType: string;
  dateTime: string;
  amount: number;
  status: string;
}

export interface DashboardAnalytics {
  totalRevenue: number;
  activeChefs: number;
  totalChefs: number;
  totalBookings: number;
  avgBookingValue: number;
  pendingApproval: number;
  monthlyBookings: MonthlyBooking[];
  weeklyBookings: MonthlyBooking[];  // last 7 days, revenue per day
  peakMonth: string;
  avgPerMonth: number;
  ytdTotal: number;
  cuisineBreakdown: BreakdownItem[];
  locationBreakdown: BreakdownItem[];
  memberStats: MemberStats;
  recentActivity: ActivityItem[];
  recentBookings: RecentBooking[];
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} hrs ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getDashboardAnalytics(): Promise<{
  success: boolean;
  data?: DashboardAnalytics;
  error?: string;
}> {
  try {
    // ── Fetch users + bookings in parallel ──
    const [usersSnap, bookingsSnap] = await Promise.all([
      adminDb.collection("users").get(),
      adminDb.collection("bookings").get(),
    ]);

    // Build name lookup: doc.id → display name  (same pattern as bookings.ts)
    const nameMap: Record<string, string> = {};
    for (const doc of usersSnap.docs) {
      const d = doc.data();
      nameMap[doc.id] = d.name || d.displayName || d.email || "Unknown";
    }

    const allUsers = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    const allBookings = bookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    const totalChefs = allUsers.length;
    const activeChefs = allUsers.filter(
      (u) => u.kycStatus === "approved" || u.kycStatus === "verified"
    ).length;
    const pendingApproval = allUsers.filter(
      (u) => u.kycStatus === "pending_verification"
    ).length;
    const onHold = allUsers.filter((u) => u.status === "hold" || u.status === "suspended").length;

    // Added this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const addedThisMonth = allUsers.filter((u) => {
      const created = u.createdAt ? new Date(u.createdAt) : null;
      return created && created >= startOfMonth;
    }).length;

    let totalRevenue = 0;
    const monthRevenue: Record<number, number> = {};  // month index → total ₹
    const monthCounts: Record<number, number> = {};   // month index → booking count
    const cuisineCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};

    // Weekly: bucket last 7 calendar days (today inclusive)
    const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    // Build ordered array: oldest day first → newest day (today)
    const weekDays: { label: string; dateStr: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      weekDays.push({
        label: DAY_ABBR[d.getDay()],
        dateStr: d.toISOString().slice(0, 10), // YYYY-MM-DD
      });
    }
    const weekRevenue: Record<string, number> = {};
    weekDays.forEach((wd) => { weekRevenue[wd.dateStr] = 0; });

    for (const b of allBookings) {
      // Parse booking date
      let bDate: Date | null = null;
      if (b.createdAt?.toDate) bDate = b.createdAt.toDate();
      else if (b.createdAt) bDate = new Date(b.createdAt);
      if (b.date?.toDate) bDate = b.date.toDate();
      else if (b.date && !bDate) bDate = new Date(b.date);

      const amount = Number(b.amount) || 0;
      totalRevenue += amount;

      if (bDate) {
        // Monthly (current year)
        if (bDate.getFullYear() === now.getFullYear()) {
          const m = bDate.getMonth();
          monthRevenue[m] = (monthRevenue[m] || 0) + amount;
          monthCounts[m] = (monthCounts[m] || 0) + 1;
        }

        // Weekly (last 7 days)
        const dateKey = bDate.toISOString().slice(0, 10);
        if (dateKey in weekRevenue) {
          weekRevenue[dateKey] += amount;
        }
      }

      // Cuisine / Event type
      const cuisine = b.eventType || b.cuisineType || b.occasion || "Others";
      cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;

      // Location
      const loc = b.location || b.city || "Others";
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    }

    const avgBookingValue = allBookings.length > 0 ? Math.round(totalRevenue / allBookings.length) : 0;

    // Build monthly array (current year) — use revenue ₹ as value
    const monthlyBookings: MonthlyBooking[] = MONTH_LABELS.map((label, idx) => ({
      label,
      value: monthRevenue[idx] || 0,
    }));

    // Build weekly array — last 7 days revenue
    const weeklyBookings: MonthlyBooking[] = weekDays.map((wd) => ({
      label: wd.label,
      value: weekRevenue[wd.dateStr] || 0,
    }));

    const ytdTotal = monthlyBookings.reduce((s, m) => s + m.value, 0);
    const monthsWithData = monthlyBookings.filter((m) => m.value > 0);
    const avgPerMonth = monthsWithData.length > 0 ? Math.round(ytdTotal / monthsWithData.length) : 0;
    const peakEntry = monthlyBookings.reduce((p, c) => (c.value > p.value ? c : p), { label: "-", value: 0 });

    // Top 6 cuisines
    const cuisineBreakdown = buildBreakdown(cuisineCounts, allBookings.length);
    const locationBreakdown = buildBreakdown(locationCounts, allBookings.length);

    // ── Recent bookings structured for the table ──
    const sortedBookings = [...allBookings]
      .map((b) => {
        let d: Date | null = null;
        if (b.createdAt?.toDate) d = b.createdAt.toDate();
        else if (b.createdAt) d = new Date(b.createdAt);
        if (b.date?.toDate) d = b.date.toDate();
        else if (b.date && !d) d = new Date(b.date);
        return { ...b, _date: d };
      })
      .filter((b) => b._date)
      .sort((a, b) => b._date!.getTime() - a._date!.getTime())
      .slice(0, 6);

    // Create a map of doc IDs to names for quick lookup (doc.id = Firestore UID)
    // Resolve chef: partnerId is the primary field written by createBookingForChef

    const recentBookings: RecentBooking[] = sortedBookings.map((b) => {
      const d = b._date as Date;
      const dateStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
      const timeStr = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });

      // Mirror exactly what bookings.ts does — partnerId is the key field
      const resolvedChefName =
        nameMap[b.partnerId] ||
        nameMap[b.chefId] ||
        b.chefName ||
        "—";

      return {
        id: b.bookingId || b.id?.slice(0, 8).toUpperCase() || "TFH00000",
        clientName: b.clientName || b.userName || b.customerName || "—",
        chefName: resolvedChefName,
        eventType: b.eventType || b.occasion || b.cuisineType || "—",
        dateTime: `${dateStr}\n${timeStr}`,
        amount: Number(b.amount) || 0,
        status: b.status || "pending",
      };
    });

    // ── Recent activity (derived from bookings + users) ──
    const recentActivity: ActivityItem[] = [];

    for (const b of sortedBookings) {
      recentActivity.push({
        text: `New ${b.eventType || "booking"} for ${b.guests || "?"} guests at ${b.location || b.city || "Unknown"}`,
        time: timeAgo(b._date!),
      });
    }

    // Recent user signups
    const recentUsers = [...allUsers]
      .map((u) => {
        let d: Date | null = null;
        if (u.createdAt?.toDate) d = u.createdAt.toDate();
        else if (u.createdAt) d = new Date(u.createdAt);
        return { ...u, _date: d };
      })
      .filter((u) => u._date)
      .sort((a, b) => b._date!.getTime() - a._date!.getTime())
      .slice(0, 3);

    for (const u of recentUsers) {
      recentActivity.push({
        text: `New chef ${u.name || "Unknown"} onboarded`,
        time: timeAgo(u._date!),
      });
    }

    // Sort all activity by time
    recentActivity.sort((a, b) => {
      const order = (t: string) => {
        if (t.includes("Just now")) return 0;
        const num = parseInt(t) || 999;
        if (t.includes("min")) return num;
        if (t.includes("hr")) return num * 60;
        if (t.includes("day")) return num * 1440;
        return 9999;
      };
      return order(a.time) - order(b.time);
    });

    return {
      success: true,
      data: {
        totalRevenue,
        activeChefs,
        totalChefs,
        totalBookings: allBookings.length,
        avgBookingValue,
        pendingApproval,
        monthlyBookings,
        weeklyBookings,
        peakMonth: peakEntry.label,
        avgPerMonth,
        ytdTotal,
        cuisineBreakdown,
        locationBreakdown,
        memberStats: {
          addedThisMonth,
          onHold,
          suspended: onHold, // same field for now
          activeTotal: activeChefs,
        },
        recentActivity: recentActivity.slice(0, 7),
        recentBookings,
      },
    };
  } catch (error: any) {
    console.error("Error fetching dashboard analytics:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch analytics.",
    };
  }
}

function buildBreakdown(counts: Record<string, number>, total: number): BreakdownItem[] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, count]) => ({
      label,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
}

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
}

export interface BookingStats {
  completed: number;
  inProgress: number;
  scheduled: number;
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

function normaliseStatus(raw: string = ""): string {
  const s = raw.toLowerCase().trim();
  if (s === "completed" || s === "done") return "Completed";
  if (s === "in_progress" || s === "inprogress" || s === "in progress" || s === "active") return "In progress";
  if (s === "scheduled" || s === "confirmed" || s === "pending" || s === "broadcasted") return "Scheduled";
  if (s === "cancelled" || s === "canceled" || s === "rejected") return "Cancelled";
  return "Scheduled"; // default
}

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
    const nameMap: Record<string, string> = {};
    for (const doc of usersSnap.docs) {
      const d = doc.data();
      nameMap[doc.id] = d.name || d.displayName || d.email || "Unknown";
    }

    const stats: BookingStats = { completed: 0, inProgress: 0, scheduled: 0, cancelled: 0, total: 0 };
    const bookings: BookingRow[] = [];

    for (const doc of bookingsSnap.docs) {
      const b = doc.data();
      const status = normaliseStatus(b.status);
      stats.total++;
      if (status === "Completed") stats.completed++;
      else if (status === "In progress") stats.inProgress++;
      else if (status === "Scheduled") stats.scheduled++;
      else if (status === "Cancelled") stats.cancelled++;

      // Resolve names
      const chefName =
        nameMap[b.partnerId] ||
        nameMap[b.chefId] ||
        b.chefName ||
        "Unknown Chef";
      const client =
        nameMap[b.clientId] ||
        b.clientName ||
        b.userName ||
        "Unknown Client";

      const { date, time, timestamp } = formatDate(b.date ?? b.createdAt);
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
    if (data.status !== undefined) updateData.status = data.status.toLowerCase().replace(" ", "_");
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
      nameMap[doc.id] = d.name || d.displayName || d.email || "Unknown";
    }

    // Use Map to eliminate duplicates
    const uniqueDocs = new Map();
    for (const doc of partnerSnap.docs) uniqueDocs.set(doc.id, doc);
    for (const doc of chefSnap.docs) uniqueDocs.set(doc.id, doc);

    const bookings: BookingRow[] = [];
    for (const doc of Array.from(uniqueDocs.values())) {
      const b = doc.data();
      const status = normaliseStatus(b.status);
      
      const chefName = nameMap[b.partnerId] || nameMap[b.chefId] || b.chefName || "Unknown Chef";
      const client = nameMap[b.clientId] || b.clientName || b.userName || "Unknown Client";

      const { date, time, timestamp } = formatDate(b.date ?? b.createdAt);
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
      });
    }

    // Sort by createdAt desc
    bookings.sort((a, b) => {
      const valA = uniqueDocs.get(a.fullId)?.data()?.createdAt?.toMillis?.() || 0;
      const valB = uniqueDocs.get(b.fullId)?.data()?.createdAt?.toMillis?.() || 0;
      return valB - valA;
    });

    return { success: true, data: bookings };
  } catch (error: any) {
    console.error("Error fetching chef bookings:", error);
    return { success: false, error: error.message || "Failed to fetch bookings" };
  }
}

"use server";

import { adminDb } from "@/lib/firebase-admin";
import { sendPushNotification } from "@/lib/notifications";

export interface ChefForBroadcast {
  uid: string;
  name: string;
  initials: string;
  location: string;
  bookings: number;
  ratings: number;
  serviceType: string;
  fcmToken?: string;
}

/** Fetch chefs belonging to a specific zone for broadcast selection.
 *  Handles mismatched casing/format: "north" matches "North zone", "North", "north zone" etc.
 */
export async function getChefsByZone(
  zone: string
): Promise<{ success: boolean; chefs?: ChefForBroadcast[]; error?: string }> {
  try {
    // Fetch ALL users — Firestore has no case-insensitive query,
    // and stored values like "North zone" won't match a strict "north" filter.
    const usersSnap = await adminDb.collection("users").get();

    const bookingsSnap = await adminDb.collection("bookings").get();
    const allBookings = bookingsSnap.docs.map((d) => d.data()) as any[];

    const bookingsByPartner: Record<string, number> = {};
    for (const b of allBookings) {
      const pid = b.partnerId;
      if (!pid) continue;
      bookingsByPartner[pid] = (bookingsByPartner[pid] || 0) + 1;
    }

    // Normalise: strip spaces + lowercase so "North zone" → "northzone", "north" → "north"
    // Only check storedNorm.includes(zoneNorm) — never the reverse, because
    // "north".includes("") === true and would match every chef with no zone set.
    const normalise = (s: string) => s.toLowerCase().replace(/\s+/g, "");
    const zoneNorm = normalise(zone); // e.g. "north"

    const matchingDocs = usersSnap.docs.filter((doc) => {
      const stored = String(doc.data().zone ?? "").trim();
      if (!stored) return false; // skip chefs with no zone
      const storedNorm = normalise(stored); // e.g. "northzone"
      return storedNorm.includes(zoneNorm); // "northzone".includes("north") ✓
    });

    const chefs: ChefForBroadcast[] = matchingDocs.map((doc) => {
      const data = doc.data();
      const name = data.name || "Unknown";
      const initials = name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return {
        uid: doc.id,
        name,
        initials,
        location: [data.city, data.address].filter(Boolean).join(", ") || "Unknown",
        bookings: bookingsByPartner[doc.id] || 0,
        ratings: Number(data.ratings) || 0,
        serviceType: data.serviceType || data.role || "Halwai",
        fcmToken: data.fcmToken || "",
      };
    });

    chefs.sort((a, b) => a.name.localeCompare(b.name));

    return { success: true, chefs };
  } catch (error: any) {
    console.error("Error fetching chefs by zone:", error);
    return { success: false, error: error.message || "Failed to fetch chefs." };
  }
}

export async function createBookingForChef(
  partnerId: string,
  data: {
    clientName: string;
    phone: string;
    eventType: string;
    date: Date;
    location: string;
    guests: number;
    amount: number;
    zone?: string;
    requirements?: string;
    address?: string;
  },
  /** Optional: only broadcast to these specific chef UIDs */
  targetChefIds?: string[]
) {
  try {
    const bookingRef = await adminDb.collection("bookings").add({
      partnerId,
      clientName: data.clientName,
      phone: data.phone,
      eventType: data.eventType,
      date: data.date,
      location: data.location,
      address: data.address || "",
      guests: data.guests,
      amount: data.amount,
      zone: data.zone || "",
      requirements: data.requirements || "",
      status: "broadcasted",
      broadcastedTo: targetChefIds || [],
      createdAt: new Date(),
    });

    // Fetch tokens: either targeted chefs or all chefs with tokens
    let tokenQuery = adminDb.collection("users").where("fcmToken", "!=", "");
    const chefsSnap = await tokenQuery.get();

    let relevantDocs = chefsSnap.docs;
    if (targetChefIds && targetChefIds.length > 0) {
      relevantDocs = chefsSnap.docs.filter((doc) =>
        targetChefIds.includes(doc.id)
      );
    }

    const allTokens = Array.from(
      new Set(
        relevantDocs
          .map((doc) => doc.data().fcmToken as string)
          .filter(Boolean)
      )
    );

    if (allTokens.length > 0) {
      await sendPushNotification(
        allTokens,
        "🍽️ New Booking Available!",
        `${data.eventType} • ${data.guests} guests • ${data.location}`,
        { type: "new_booking_available", bookingId: bookingRef.id }
      );
    }

    console.log(
      `[createBooking] Notified ${allTokens.length} chef(s) about booking ${bookingRef.id}`
    );

    return { success: true, bookingId: bookingRef.id };
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return {
      success: false,
      error: error.message || "Failed to create booking",
    };
  }
}


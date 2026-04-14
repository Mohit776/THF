"use server";

import { adminDb } from "@/lib/firebase-admin";

import { sendPushNotification } from "@/lib/notifications";

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
  }
) {
  try {
    const bookingRef = await adminDb.collection("bookings").add({
      partnerId,
      clientName: data.clientName,
      phone: data.phone,
      eventType: data.eventType,
      date: data.date,
      location: data.location, // this is the city
      address: data.address || "",
      guests: data.guests,
      amount: data.amount,
      zone: data.zone || "",
      requirements: data.requirements || "",
      status: "broadcasted",
      createdAt: new Date(),
    });

    // Broadcast to ALL chefs who have a registered FCM token
    const chefsSnap = await adminDb
      .collection("users")
      .where("fcmToken", "!=", "")
      .get();

    const allTokens = Array.from(new Set(chefsSnap.docs
      .map((doc) => doc.data().fcmToken as string)
      .filter(Boolean)));

    if (allTokens.length > 0) {
      await sendPushNotification(
        allTokens,
        "🍽️ New Booking Available!",
        `${data.eventType} • ${data.guests} guests • ${data.location}`,
        { type: "new_booking_available", bookingId: bookingRef.id }
      );
    }

    console.log(`[createBooking] Notified ${allTokens.length} chef(s) about booking ${bookingRef.id}`);

    return { success: true, bookingId: bookingRef.id };
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return {
      success: false,
      error: error.message || "Failed to create booking",
    };
  }
}


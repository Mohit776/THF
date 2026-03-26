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
  }
) {
  try {
    const bookingRef = await adminDb.collection("bookings").add({
      partnerId,
      clientName: data.clientName,
      phone: data.phone,
      eventType: data.eventType,
      date: data.date,
      location: data.location,
      guests: data.guests,
      amount: data.amount,
      status: "pending",
      createdAt: new Date(),
    });

    // Notify the specific partner about the new direct booking assignment
    const partnerDoc = await adminDb.collection("users").doc(partnerId).get();
    if (partnerDoc.exists) {
      const partnerData = partnerDoc.data();
      if (partnerData?.fcmToken) {
        await sendPushNotification(
          [partnerData.fcmToken],
          "📌 New Booking Assigned!",
          `You've been assigned a ${data.eventType} for ${data.guests} guests at ${data.location}.`,
          { type: "direct_booking_assigned", bookingId: bookingRef.id }
        );
      }
    }

    return { success: true, bookingId: bookingRef.id };
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return {
      success: false,
      error: error.message || "Failed to create booking",
    };
  }
}


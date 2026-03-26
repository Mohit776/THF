import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendPushNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Ideally, add an authorization check here (e.g., matching a cron secret) 
  // const authHeader = request.headers.get("Authorization");
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new NextResponse("Unauthorized", { status: 401 });
  // }

  try {
    const now = new Date();
    // Look for bookings starting in the next 2.0 to 2.25 hours
    const triggerStart = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    const triggerEnd = new Date(now.getTime() + 2.25 * 60 * 60 * 1000); // 2h 15m from now

    console.log(`[Cron] Checking for bookings between ${triggerStart.toISOString()} and ${triggerEnd.toISOString()}`);

    const bookingsSnap = await adminDb
      .collection("bookings")
      .where("date", ">=", triggerStart)
      .where("date", "<=", triggerEnd)
      .where("status", "in", ["assigned", "pending"]) // only remind for active uncompleted/assigned bookings
      .get();

    if (bookingsSnap.empty) {
      return NextResponse.json({ success: true, message: "No upcoming bookings in the window", count: 0 });
    }

    let notifiedCount = 0;

    for (const doc of bookingsSnap.docs) {
      const data = doc.data();

      // Skip if reminder already sent or no specific partner assigned
      // If partnerId is empty, it means it's still a broadcast without a claimed chef
      if (data.reminderSent === true || !data.partnerId) {
        continue;
      }

      // Fetch the partner to get their FCM token
      const partnerDoc = await adminDb.collection("users").doc(data.partnerId).get();
      if (partnerDoc.exists) {
        const partnerData = partnerDoc.data();
        if (partnerData?.fcmToken) {
          await sendPushNotification(
            [partnerData.fcmToken],
            "⏰ Upcoming Booking Reminder",
            `Your booking for ${data.guests} guests at ${data.location} starts in 2 hours. Please get ready!`,
            { type: "booking_reminder", bookingId: doc.id }
          );
          notifiedCount++;

          // Mark booking so we don't remind again if cron overlaps
          await doc.ref.update({ reminderSent: true });
        }
      }
    }

    return NextResponse.json({ success: true, notifiedCount });
  } catch (error: any) {
    console.error("[Cron] Error sending booking reminders:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

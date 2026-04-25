/**
 * POST /api/send-custom-notification
 * Sends a broadcast push notification to ALL users in Firestore.
 * Body: { title: string, body: string, imageUrl?: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendPushNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { title, body, imageUrl } = await req.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: "title and body are required" },
        { status: 400 }
      );
    }

    // Collect FCM tokens from all users
    const usersSnap = await adminDb.collection("users").get();
    const tokens: string[] = [];

    for (const doc of usersSnap.docs) {
      const data = doc.data();
      if (data?.fcmToken && typeof data.fcmToken === "string" && data.fcmToken.trim().length > 0) {
        tokens.push(data.fcmToken);
      }
    }

    if (tokens.length === 0) {
      return NextResponse.json(
        { error: "No registered devices found", sent: 0 },
        { status: 200 }
      );
    }

    // Build optional data payload (small, no image bytes here)
    const data: Record<string, unknown> = {
      type: "custom_broadcast",
    };

    const result = await sendPushNotification(tokens, title, body, data, imageUrl ?? undefined);

    return NextResponse.json({
      totalDevices: tokens.length,
      ...result,
    });
  } catch (error: any) {
    console.error("[send-custom-notification] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

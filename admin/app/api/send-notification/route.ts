/**
 * Admin API route to send Expo push notifications.
 * POST /api/send-notification
 * Body: { tokens: string[], title: string, body: string, data?: object }
 */
import { NextRequest, NextResponse } from "next/server";

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  sound?: string;
  data?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  try {
    const { tokens, title, body, data } = await req.json();

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return NextResponse.json({ error: "No push tokens provided" }, { status: 400 });
    }

    // Build messages for Expo Push API
    const messages: ExpoPushMessage[] = tokens
      .filter((t: string) => t && t.startsWith("ExponentPushToken"))
      .map((token: string) => ({
        to: token,
        title,
        body,
        sound: "default",
        data: data || {},
      }));

    if (messages.length === 0) {
      return NextResponse.json({ error: "No valid Expo push tokens" }, { status: 400 });
    }

    // Send to Expo Push API in chunks of 100
    const CHUNK_SIZE = 100;
    const results = [];

    for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
      const chunk = messages.slice(i, i + CHUNK_SIZE);
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(chunk),
      });

      const result = await response.json();
      results.push(result);
    }

    console.log("[send-notification] Push sent to", messages.length, "devices");
    return NextResponse.json({ success: true, sent: messages.length, results });
  } catch (error: any) {
    console.error("[send-notification] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Admin API route to send FCM push notifications.
 * POST /api/send-notification
 * Body: { tokens: string[], title: string, body: string, data?: object }
 */
import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { tokens, title, body, data } = await req.json();

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return NextResponse.json({ error: "No push tokens provided" }, { status: 400 });
    }

    // Filter out invalid/empty tokens
    const validTokens = tokens.filter((t: string) => typeof t === "string" && t.trim().length > 0);

    if (validTokens.length === 0) {
      return NextResponse.json({ error: "No valid FCM push tokens" }, { status: 400 });
    }

    // FCM requires the data payload to strictly be Record<string, string>
    const stringifiedData: Record<string, string> = {};
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        stringifiedData[key] = String(value);
      }
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: stringifiedData,
      tokens: validTokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    // Log the outcome for debugging
    const failedTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(validTokens[idx]);
        console.warn("[send-notification] Failed to send push to token:", validTokens[idx], "Error:", resp.error);
      }
    });

    console.log(`[send-notification] Successfully sent: ${response.successCount}, Failed: ${response.failureCount}`);
    
    return NextResponse.json({ 
      success: true, 
      sent: response.successCount, 
      failed: response.failureCount,
      failedTokens
    });
  } catch (error: any) {
    console.error("[send-notification] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


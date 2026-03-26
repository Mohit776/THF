import admin from "@/lib/firebase-admin";

/**
 * Sends a push notification to one or more FCM tokens using Firebase Admin SDK.
 * @param tokens Array of FCM tokens to send to
 * @param title Notification title
 * @param body Notification body
 * @param data Optional custom data payload (will be stringified as required by FCM)
 */
export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  if (!tokens || tokens.length === 0) {
    return { success: false, error: "No tokens provided" };
  }

  // Filter out invalid/empty tokens
  const validTokens = tokens.filter((t) => typeof t === "string" && t.trim().length > 0);

  if (validTokens.length === 0) {
    return { success: false, error: "No valid FCM tokens" };
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

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    
    const failedTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(validTokens[idx]);
        console.warn("[sendPushNotification] Failed to send push to token:", validTokens[idx], "Error:", resp.error);
      }
    });

    console.log(`[sendPushNotification] Successfully sent: ${response.successCount}, Failed: ${response.failureCount}`);
    
    return { 
      success: true, 
      sent: response.successCount, 
      failed: response.failureCount,
      failedTokens
    };
  } catch (error: any) {
    console.error("[sendPushNotification] Error:", error);
    return { success: false, error: error.message };
  }
}

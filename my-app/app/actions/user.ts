"use server";

import { adminDb } from "@/lib/firebase-admin";

export async function getUserById(uid: string) {
  try {
    const doc = await adminDb.collection("users").doc(uid).get();
    if (!doc.exists) {
      return { success: false, error: "User not found" };
    }
    const data = doc.data();
    return {
      success: true,
      data: {
        uid: doc.id,
        ...data,
      }
    };
  } catch (error: any) {
    console.error("Error fetching user details:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch user details",
    };
  }
}

import { sendPushNotification } from "@/lib/notifications";

export async function updateKycStatus(uid: string, status: "approved" | "rejected") {
  try {
    await adminDb.collection("users").doc(uid).update({
      kycStatus: status,
      kycVerifiedAt: new Date().toISOString(),
    });

    // Fetch user to get FCM token for push notification
    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.fcmToken) {
        const title = status === "approved" ? "✅ KYC Approved!" : "❌ KYC Rejected";
        const body = status === "approved" 
          ? "Your account is verified! You can now start accepting bookings."
          : "Your documents were rejected. Please check the app and re-upload valid documents.";
          
        await sendPushNotification([userData.fcmToken], title, body, { type: "kyc_update", status });
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating KYC status:", error);
    return {
      success: false,
      error: error.message || "Failed to update KYC status",
    };
  }
}

export interface UserProfileData {
  phone?: string;
  email?: string;
  emergencyPhone?: string;
  gender?: string;
  jobType?: string;
  cuisines?: string[];      // stored as an array in Firestore
  workExperience?: string | string[];
  city?: string;
  zone?: string;
  address?: string;
  bankAccount?: string;
  ifscCode?: string;
  bankNumber?: string;
  upiId?: string;
  aadharNumber?: string;
  panNumber?: string;
}

export async function updateUserProfile(uid: string, data: UserProfileData) {
  try {
    const payload: Record<string, any> = {};
    (Object.keys(data) as (keyof UserProfileData)[]).forEach((key) => {
      if (data[key] !== undefined) payload[key] = data[key];
    });
    payload.updatedAt = new Date().toISOString();

    await adminDb.collection("users").doc(uid).update(payload);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error.message || "Failed to update profile" };
  }
}


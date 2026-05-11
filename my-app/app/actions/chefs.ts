"use server";

import admin, { adminDb, getAdminDb } from "@/lib/firebase-admin";

export interface ChefRow {
  uid: string;
  name: string;
  initials: string;
  city: string;
  zone: string;
  profilePct: number;
  bookings: number;
  ratings: number;
  earnings: number;
  docsStatus: "Approved" | "Pending" | string;
  status: "Active" | "Hold" | "Pending" | "Suspended" | "Inactive";
  createdAt: string;
  cuisines: string[];
  serviceType: string;
}

export interface ChefStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  inactive: number;
}

export interface ChefsListResult {
  stats: ChefStats;
  chefs: ChefRow[];
}

function getInitials(name: string): string {
  if (!name || name === "Unknown User") return "??";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Issue #8: expanded field list to match the full mobile KYC onboarding flow
// Also handles both legacy flat schema and new nested schema (Issue #11)
function computeProfileCompletion(data: any): number {
  // Core identity fields
  const coreFields = [
    () => data.name && data.name !== "",
    () => data.phone && data.phone !== "",
    () => data.gender && data.gender !== "",
    () => data.city && data.city !== "",
    () => data.zone && data.zone !== "",
    () => data.address && data.address !== "",
    // email is optional — only counts if provided
    () => data.email && data.email !== "",
    // emergency contact — field name differs between mobile (emergencyPhone) and admin (emergencyContact)
    () => (data.emergencyPhone && data.emergencyPhone !== "") || (data.emergencyContact && data.emergencyContact !== ""),
  ];

  // KYC fields
  const kycFields = [
    () => data.kycStatus && data.kycStatus !== "" && data.kycStatus !== "unsubmitted",
    () => {
      // kycDocuments can be an array or a nested object
      if (!data.kycDocuments) return false;
      if (Array.isArray(data.kycDocuments)) return data.kycDocuments.length > 0;
      return Object.keys(data.kycDocuments).length > 0;
    },
  ];

  // Professional / banking fields — handle both old flat schema and new nested schema (Issue #11)
  const professionalFields = [
    // Cuisines: new schema uses array `cuisines`, old uses string `cuisineType`
    () => {
      if (Array.isArray(data.cuisines) && data.cuisines.length > 0) return true;
      if (data.cuisineType && data.cuisineType !== "") return true;
      return false;
    },
    // Experience: new schema uses array `experience`, old uses string `workExperience`
    () => {
      if (Array.isArray(data.experience) && data.experience.length > 0) return true;
      if (Array.isArray(data.workExperience) && data.workExperience.length > 0) return true;
      if (data.experience && data.experience !== "") return true;
      return false;
    },
    // Bank details: new schema uses nested `bankDetails`, old uses flat fields
    () => {
      if (data.bankDetails?.accountNumber) return true;
      if (data.bankAccount && data.bankAccount !== "") return true;
      return false;
    },
    // PAN
    () => (data.panNumber && data.panNumber !== "") || (data.bankDetails?.pan && data.bankDetails.pan !== ""),
    // Aadhar
    () => data.aadharNumber && data.aadharNumber !== "",
  ];

  const allChecks = [...coreFields, ...kycFields, ...professionalFields];
  const filled = allChecks.filter((check) => {
    try { return check(); } catch { return false; }
  }).length;

  return Math.round((filled / allChecks.length) * 100);
}

// Issue #7: fixed dead-code bug — "suspended" was caught by "hold" condition first
function mapStatus(data: any): ChefRow["status"] {
  if (data.status === "hold") return "Hold";             // FIX #7: was "hold" || "suspended"
  if (data.status === "suspended") return "Suspended";   // FIX #7: now reachable
  if (data.status === "inactive") return "Inactive";
  if (data.kycStatus === "pending_verification") return "Pending";
  if (data.kycStatus === "approved" || data.kycStatus === "verified") return "Active";
  return "Inactive";
}

// Issue #4 (admin side): normalize zone value from Firestore for display
// Handles "North zone", "north", "North Zone" → canonical "north"
// NOTE: not exported — "use server" files can only export async functions
function normalizeZone(raw: string = ""): string {
  return raw.toLowerCase().replace(/\s*zone\s*/i, "").trim();
}

export async function getChefsList(
  filter: "all" | "active" | "pending" | "suspended" | "inactive" = "all"
): Promise<{ success: boolean; data?: ChefsListResult; error?: string }> {
  try {
    // ── Fetch all users ──
    const usersSnap = await adminDb.collection("users").get();
    const allUsers = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

    // ── Fetch bookings for per-chef aggregation ──
    const bookingsSnap = await adminDb.collection("bookings").get();
    const allBookings = bookingsSnap.docs.map((d) => d.data()) as any[];

    // Build per-partner aggregates
    const bookingsByPartner: Record<string, { count: number; totalAmount: number }> = {};
    for (const b of allBookings) {
      const pid = b.partnerId;
      // Skip generic-booking entries — they don't belong to a real chef
      if (!pid || pid === "generic-booking") continue;
      if (!bookingsByPartner[pid]) bookingsByPartner[pid] = { count: 0, totalAmount: 0 };
      bookingsByPartner[pid].count += 1;
      bookingsByPartner[pid].totalAmount += Number(b.amount) || 0;
    }

    // Stats counters
    const stats: ChefStats = { total: 0, active: 0, pending: 0, suspended: 0, inactive: 0 };
    const chefs: ChefRow[] = [];

    for (const user of allUsers) {
      const status = mapStatus(user);
      stats.total++;

      switch (status) {
        case "Active":    stats.active++;    break;
        case "Pending":   stats.pending++;   break;
        case "Hold":
        case "Suspended": stats.suspended++; break;
        case "Inactive":  stats.inactive++;  break;
      }

      // Apply tab filter
      if (filter !== "all") {
        const filterMap: Record<string, string[]> = {
          active:    ["Active"],
          pending:   ["Pending"],
          suspended: ["Hold", "Suspended"],
          inactive:  ["Inactive"],
        };
        if (!filterMap[filter]?.includes(status)) continue;
      }

      const partnerAgg = bookingsByPartner[user.id] || { count: 0, totalAmount: 0 };
      const docsApproved = user.kycStatus === "approved" || user.kycStatus === "verified";

      // Issue #11: read zone from either schema variant and normalize it
      const rawZone = user.zone || "";

      chefs.push({
        uid: user.id,
        name: user.name || "Unknown User",
        initials: getInitials(user.name || ""),
        city: user.city || "Unknown City",
        zone: normalizeZone(rawZone),
        profilePct: computeProfileCompletion(user),
        bookings: partnerAgg.count,
        ratings: Number(user.ratings) || 0,
        earnings: partnerAgg.totalAmount,
        docsStatus: docsApproved ? "Approved" : "Pending",
        status,
        createdAt: user.createdAt || user.kycSubmittedAt || "",
        cuisines: Array.isArray(user.cuisines) ? user.cuisines : (user.cuisineType ? [user.cuisineType] : []),
        serviceType: user.serviceType || "",
      });
    }

    // Sort descending by registration date (newest first); fall back to name for undated entries
    chefs.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : -Infinity;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : -Infinity;
      if (da !== db) return db - da;
      return a.name.localeCompare(b.name);
    });

    return { success: true, data: { stats, chefs } };
  } catch (error: any) {
    console.error("Error fetching chefs list:", error);
    return { success: false, error: error.message || "Failed to fetch chefs." };
  }
}

async function uploadFile(file: File) {
  const bucket = admin.storage().bucket("tfh-partner-app.firebasestorage.app");
  const fileName = `kycdocuments/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const fileRef = bucket.file(fileName);
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fileRef.save(buffer, {
    metadata: {
      contentType: file.type,
      cacheControl: "public, max-age=31536000",
    },
  });
  await fileRef.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

export async function onboardChef(formData: FormData) {
  try {
    getAdminDb(); // initialize admin
    
    // extract string fields
    const payload: any = {
       name: formData.get("fullName"),
       phone: formData.get("mobile"),
       // Issue #19: use consistent field name "emergencyPhone" (matches mobile app)
       emergencyPhone: formData.get("emergencyContact"),
       email: formData.get("email") || "",
       gender: formData.get("gender"),
       experience: formData.get("experience"),
       city: formData.get("city"),
       // Issue #4: normalize zone before saving to Firestore
       zone: normalizeZone((formData.get("zone") as string) || ""),
       address: formData.get("address"),
       bio: formData.get("bio"),
       cuisines: formData.getAll("cuisines"),
       serviceType: formData.get("serviceType"),
       aadharNumber: formData.get("aadhar"),
       panNumber: formData.get("pan"),
       // Issue #11: use new nested bankDetails schema consistently
       bankDetails: {
         accountNumber: formData.get("bankAccount"),
         ifsc: formData.get("ifsc"),
         bankName: formData.get("bankName"),
       },
       // Keep flat fields for backward compat with old admin views
       bankAccount: formData.get("bankAccount"),
       ifsc: formData.get("ifsc"),
       bankName: formData.get("bankName"),
       createdAt: new Date().toISOString(),
       role: "partner",
       kycStatus: "pending_verification",
       status: "Pending",
    };

    // upload Aadhar
    const aadharFile = formData.get("aadharFile") as File | null;
    if (aadharFile && aadharFile.size > 0) {
      payload.aadharUrl = await uploadFile(aadharFile);
    }
    
    // upload PAN
    const panFile = formData.get("panFile") as File | null;
    if (panFile && panFile.size > 0) {
      payload.panUrl = await uploadFile(panFile);
    }

    const docRef = await adminDb.collection("users").add(payload);
    // update document with its own ID (common pattern)
    await docRef.update({ id: docRef.id });

    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.error("Error onboarding chef:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteChef(uid: string) {
  try {
    getAdminDb();
    await adminDb.collection("users").doc(uid).delete();
    // Note: We might want to delete from Firebase Auth too, 
    // but the users collection is the main display.
    await admin.auth().deleteUser(uid).catch(() => console.log("User not found in Auth, or already deleted."));
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting chef:", err);
    return { success: false, error: err.message };
  }
}

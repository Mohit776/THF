"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  // Hardcoded credentials for now
  const VALID_PHONE = "1234567890";
  const VALID_PASSWORD = "admin123";

  if (phone === VALID_PHONE && password === VALID_PASSWORD) {
    // Set a session cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    
    return { success: true };
  }

  return { 
    success: false, 
    error: "Invalid phone number or password. Please try again." 
  };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_session");
  redirect("/");
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.has("auth_session");
}

/**
 * src/utils/profileUtils.ts
 *
 * Single source of truth for profile completion checks.
 * Replaces the 3 inconsistent local definitions in MobileLogin, OTP, and password screens.
 *
 * We check that all mandatory fields from the KYC onboarding flow are filled.
 * This prevents the user from landing on the Dashboard if they signed up
 * (e.g. via OTP) but closed the app before completing all required steps.
 *
 * Mandatory fields: name, gender, city, address, experience (non-empty array).
 * Optional fields (email, emergencyPhone, zone) are NOT required for completion.
 */

import type { UserProfile } from '@/src/services/userService';

/**
 * Returns `true` when the user's Firestore profile indicates they have
 * completed the initial onboarding flow and should land on the Dashboard.
 *
 * A `null` profile means the user has never started onboarding.
 * A partial profile (missing mandatory fields) means they started but
 * haven't finished — they should be sent back to the KYC flow.
 */
export function hasCompletedProfile(
  profile: UserProfile | null | undefined,
): boolean {
  if (!profile) return false;

  // All mandatory fields must be filled
  const hasName = typeof profile.name === 'string' && profile.name.trim().length > 0;
  const hasGender = typeof profile.gender === 'string' && profile.gender.trim().length > 0;
  const hasCity = typeof profile.city === 'string' && profile.city.trim().length > 0;
  const hasAddress = typeof profile.address === 'string' && profile.address.trim().length > 0;
  const hasExperience = Array.isArray(profile.experience) && profile.experience.length > 0;

  return hasName && hasGender && hasCity && hasAddress && hasExperience;
}

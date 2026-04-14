/**
 * src/services/bookingService.ts
 *
 * Firestore service layer for the `bookings` collection.
 * Uses @react-native-firebase/firestore (Native SDK).
 *
 * Collection:
 *   - bookings  (Document ID = auto-generated bookingId)
 */

import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import firestore from '@react-native-firebase/firestore';
import { auth, db } from './firebaseConfig';

// ---------------------------------------------------------------------------
// TypeScript Interface
// ---------------------------------------------------------------------------

export interface Booking {
  /** Auto-generated Firestore document ID */
  bookingId: string;
  /** Firebase Auth UID of the partner */
  partnerId: string;
  clientName: string;
  phone?: string;
  eventType: string;
  /** Date/time of the event */
  date: FirebaseFirestoreTypes.Timestamp;
  location: string;
  address?: string;
  guests: number;
  /** Booking fee in INR */
  amount: number;
  status: 'broadcasted' | 'pending' | 'accepted' | 'active' | 'completed' | 'cancelled';
}

// ---------------------------------------------------------------------------
// Booking helpers
// ---------------------------------------------------------------------------

/**
 * Create a new booking document in the `bookings` collection.
 * Returns the auto-generated Firestore document ID (bookingId).
 */
export async function createBooking(
  data: Omit<Booking, 'bookingId' | 'status'>,
): Promise<string> {
  try {
    const ref = await db.collection('bookings').add({
      ...data,
      status: 'pending',
    });
    return ref.id;
  } catch (error) {
    console.error('[bookingService] createBooking error:', error);
    throw error;
  }
}

/**
 * Fetch a single booking by its document ID.
 * Returns `null` when no document is found.
 */
export async function getBooking(bookingId: string): Promise<Booking | null> {
  try {
    const snap = await db.collection('bookings').doc(bookingId).get();
    if (!snap.exists) return null;
    return { bookingId: snap.id, ...snap.data() } as Booking;
  } catch (error) {
    console.error('[bookingService] getBooking error:', error);
    throw error;
  }
}

/**
 * Fetch all bookings for a given partner, ordered by date descending.
 */
export async function getPartnerBookings(partnerId: string): Promise<Booking[]> {
  try {
    const snap = await db
      .collection('bookings')
      .where('partnerId', '==', partnerId)
      .orderBy('date', 'desc')
      .get();
    return snap.docs.map((d) => ({
      bookingId: d.id,
      ...d.data(),
    })) as Booking[];
  } catch (error) {
    console.error('[bookingService] getPartnerBookings error:', error);
    throw error;
  }
}

/**
 * Update the status (and optionally other fields) of an existing booking.
 */
export async function updateBookingStatus(
  bookingId: string,
  status: Booking['status'],
  extra?: Partial<Omit<Booking, 'bookingId' | 'status'>>,
): Promise<void> {
  try {
    await db.collection('bookings').doc(bookingId).update({
      status,
      ...(extra ?? {}),
    });
  } catch (error) {
    console.error('[bookingService] updateBookingStatus error:', error);
    throw error;
  }
}

/**
 * Listen to broadcasted bookings (status: 'broadcasted')
 * Only starts the listener if a user is currently authenticated.
 */
export function listenToBroadcastedBookings(callback: (bookings: Booking[]) => void): () => void {
  const uid = auth.currentUser?.uid;
  console.log('[bookingService] Setting up broadcast listener, uid:', uid);

  if (!uid) {
    console.warn('[bookingService] No authenticated user — skipping broadcast listener');
    return () => { }; // no-op unsubscribe
  }

  return db
    .collection('bookings')
    .where('status', '==', 'broadcasted')
    .onSnapshot(
      (snap) => {
        const bookings = snap.docs.map((d) => ({
          bookingId: d.id,
          ...d.data(),
        })) as Booking[];
        console.log('[bookingService] Broadcast bookings received:', bookings.length);
        callback(bookings);
      },
      (error) => {
        console.error('[bookingService] broadcast listener error:', error);
      },
    );
}

/**
 * Try to accept a broadcasted booking via transaction to ensure only one partner succeeds.
 * @throws Error if already accepted by someone else.
 */
export async function acceptBroadcastedBooking(bookingId: string, partnerId: string): Promise<void> {
  try {
    const ref = db.collection('bookings').doc(bookingId);
    await firestore().runTransaction(async (transaction) => {
      const sfDoc = await transaction.get(ref);
      if (!sfDoc.exists) {
        throw new Error("Booking does not exist!");
      }
      const data = sfDoc.data() as Booking;
      if (data.status !== "broadcasted") {
        throw new Error("This booking has already been claimed.");
      }
      transaction.update(ref, { status: "active", partnerId });
    });
  } catch (error) {
    console.error('[bookingService] acceptBroadcastedBooking error:', error);
    throw error;
  }
}

import AsyncStorage from '@react-native-async-storage/async-storage';

const key = (bookingId: string, field: string) =>
  `timer_${field}_${bookingId}`;

/** Key that stores which bookingId (if any) has an active timer. */
const ACTIVE_TIMER_KEY = 'active_timer_bookingId';

export interface TimerState {
  /** Wall-clock timestamp (ms) when the timer last started. null = not running. */
  startMs: number | null;
  /** Accumulated seconds from previous running segments (before current run). */
  pausedElapsed: number;
  /** Whether the timer was actively running when the state was last saved. */
  running: boolean;
}

export interface TimerJobParams {
  bookingId: string;
  title: string;
  time: string;
  location: string;
  guests: string;
  cuisine: string;
  occasion?: string;
}

/** Persist timer state to AsyncStorage (keyed per bookingId). */
export async function saveTimerState(
  bookingId: string,
  opts: TimerState,
): Promise<void> {
  const pairs: [string, string][] = [
    [key(bookingId, 'startMs'), opts.startMs !== null ? String(opts.startMs) : ''],
    [key(bookingId, 'pausedElapsed'), String(opts.pausedElapsed)],
    [key(bookingId, 'running'), opts.running ? 'true' : 'false'],
  ];

  // Track which booking is the currently active timer
  if (opts.running) {
    pairs.push([ACTIVE_TIMER_KEY, bookingId]);
  }

  await AsyncStorage.multiSet(pairs);

  // If paused / stopped, only clear the global key if it pointed to this booking
  if (!opts.running) {
    const current = await AsyncStorage.getItem(ACTIVE_TIMER_KEY);
    if (current === bookingId) {
      await AsyncStorage.removeItem(ACTIVE_TIMER_KEY);
    }
  }
}

/** Persist the job display params so they survive app kills. */
export async function saveTimerJobParams(params: TimerJobParams): Promise<void> {
  await AsyncStorage.setItem(
    key(params.bookingId, 'jobParams'),
    JSON.stringify(params),
  );
}

/** Load job params saved alongside a timer. */
export async function loadTimerJobParams(
  bookingId: string,
): Promise<TimerJobParams | null> {
  const raw = await AsyncStorage.getItem(key(bookingId, 'jobParams'));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TimerJobParams;
  } catch {
    return null;
  }
}

/** Load persisted timer state from AsyncStorage. Returns defaults if nothing saved. */
export async function loadTimerState(bookingId: string): Promise<TimerState> {
  const [[, startMs], [, pausedElapsed], [, running]] =
    await AsyncStorage.multiGet([
      key(bookingId, 'startMs'),
      key(bookingId, 'pausedElapsed'),
      key(bookingId, 'running'),
    ]);

  return {
    startMs: startMs ? Number(startMs) : null,
    pausedElapsed: pausedElapsed ? Number(pausedElapsed) : 0,
    running: running === 'true',
  };
}

/**
 * Returns the bookingId of the timer that is currently running (if any).
 * Use this at app startup to decide whether to redirect to JobTimer.
 */
export async function getActiveTimerBookingId(): Promise<string | null> {
  const bookingId = await AsyncStorage.getItem(ACTIVE_TIMER_KEY);
  if (!bookingId) return null;

  // Double-check the persisted state still says running
  const state = await loadTimerState(bookingId);
  return state.running ? bookingId : null;
}

/** Remove all timer keys for a booking (call when job is ended/completed). */
export async function clearTimerState(bookingId: string): Promise<void> {
  await AsyncStorage.multiRemove([
    key(bookingId, 'startMs'),
    key(bookingId, 'pausedElapsed'),
    key(bookingId, 'running'),
    key(bookingId, 'jobParams'),
  ]);

  // Also clear the global pointer if it was this booking
  const current = await AsyncStorage.getItem(ACTIVE_TIMER_KEY);
  if (current === bookingId) {
    await AsyncStorage.removeItem(ACTIVE_TIMER_KEY);
  }
}

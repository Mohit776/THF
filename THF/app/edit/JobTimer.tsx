import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, StatusBar, Alert, BackHandler } from 'react-native';
import Navbar from '@/components/Navbar';
import { updateBookingStatus } from '@/src/services/bookingService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/src/hooks/useLanguage';
import type { TranslationKey } from '@/src/i18n/translations';
import { CustomText as Text } from '../../components/CustomText';
import {
  saveTimerState,
  saveTimerJobParams,
  loadTimerState,
  clearTimerState,
} from '@/src/utils/timerStorage';

// ─── Types ────────────────────────────────────────────────────────────────────
interface JobDetails {
  title: string;
  time: string;
  location: string;
  guests: number;
  cuisine: string;
  occasion?: string;
}

// ─── Job Row ──────────────────────────────────────────────────────────────────
const JobRow = ({ label, value }: { label: string; value: string | number }) => (
  <View style={styles.jobRow}>
    <Text style={styles.jobRowLabel}>{label}: </Text>
    <Text style={styles.jobRowValue}>{value}</Text>
  </View>
);

// ─── Job Card ─────────────────────────────────────────────────────────────────
const JobCard = ({ job, t }: { job: JobDetails; t: (key: TranslationKey) => string }) => (
  <View style={styles.jobCard}>
    <Text style={styles.currentJobLabel}>Current job</Text>
    <Text style={styles.jobTitle}>{job.title}</Text>
    <View style={styles.jobMeta}>
      <JobRow label="Occasion" value={job.occasion || "Celebration"} />
      <JobRow label="Time" value={job.time} />
      <JobRow label="Location" value={job.location} />
      <JobRow label="No. of People" value={`${job.guests} guests`} />
      <JobRow label="Cuisine Type" value={job.cuisine} />
    </View>
  </View>
);

// ─── Timer Display ────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0');

interface TimerDisplayProps {
  seconds: number;
  running: boolean;
  t: (key: TranslationKey) => string;
}

const TimerDisplay = ({ seconds, running, t }: TimerDisplayProps) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const TimerUnit = ({
    value,
    label,
  }: {
    value: string;
    label: string;
  }) => (
    <View style={styles.timerUnit}>
      <Text style={styles.timerDigits}>{value}</Text>
      <Text style={styles.timerLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.timerRow}>
      <TimerUnit value={pad(h)} label={t('hours')} />
      <Text style={styles.timerColon}>:</Text>
      <TimerUnit value={pad(m)} label={t('minutes')} />
      <Text style={styles.timerColon}>:</Text>
      <TimerUnit value={pad(s)} label={t('seconds')} />
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function JobTimerScreen() {
  const { t } = useLanguage();
  const params = useLocalSearchParams<{
    bookingId?: string;
    title?: string;
    time?: string;
    location?: string;
    guests?: string;
    cuisine?: string;
    occasion?: string;
  }>();

  const JOB: JobDetails = {
    title: params.title || 'Ongoing Job',
    time: params.time || 'N/A',
    location: params.location || 'N/A',
    guests: parseInt(params.guests || '0', 10),
    cuisine: params.cuisine || 'N/A',
    occasion: params.occasion || 'Celebration',
  };

  const { bookingId } = params;

  const navigation = useNavigation();

  // Disable back navigation
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Return true to stop default back behavior
        return true;
      };

      const backSub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      navigation.setOptions({
        gestureEnabled: false,
      });

      return () => {
        backSub.remove();
        navigation.setOptions({
          gestureEnabled: true,
        });
      };
    }, [navigation])
  );
  const router = useRouter();

  // ── Timer state (UI display) ──
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  // ── Persistent refs (survive re-renders, no stale closures) ──
  // Wall-clock ms when this running segment started
  const startMsRef = useRef<number | null>(null);
  // Accumulated seconds from all previous running segments
  const pausedElapsedRef = useRef<number>(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load persisted state on mount ────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;

    (async () => {
      const saved = await loadTimerState(bookingId);
      pausedElapsedRef.current = saved.pausedElapsed;

      if (saved.running && saved.startMs !== null) {
        // Timer was running when app was killed — resume with accurate elapsed
        startMsRef.current = saved.startMs;
        const wallElapsed = Math.floor((Date.now() - saved.startMs) / 1000);
        const total = saved.pausedElapsed + wallElapsed;
        setElapsed(total);
        setRunning(true);
      } else {
        // Was paused or never started
        setElapsed(saved.pausedElapsed);
        setRunning(false);
      }
    })();
  }, [bookingId]);

  // ── Interval — uses wall-clock diff (drift-proof) ─────────────────────────
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        if (startMsRef.current !== null) {
          const wallElapsed = Math.floor((Date.now() - startMsRef.current) / 1000);
          setElapsed(pausedElapsedRef.current + wallElapsed);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStart = async () => {
    startMsRef.current = Date.now();
    setRunning(true);
    if (bookingId) {
      await saveTimerState(bookingId, {
        startMs: startMsRef.current,
        pausedElapsed: pausedElapsedRef.current,
        running: true,
      });
      // Save job display params so they survive app kills
      await saveTimerJobParams({
        bookingId,
        title: JOB.title,
        time: JOB.time,
        location: JOB.location,
        guests: String(JOB.guests),
        cuisine: JOB.cuisine,
        occasion: JOB.occasion,
      });
    }
  };


  const handlePause = async () => {
    // Accumulate elapsed up to this moment before pausing
    if (startMsRef.current !== null) {
      pausedElapsedRef.current += Math.floor(
        (Date.now() - startMsRef.current) / 1000,
      );
    }
    startMsRef.current = null;
    setRunning(false);
    if (bookingId) {
      await saveTimerState(bookingId, {
        startMs: null,
        pausedElapsed: pausedElapsedRef.current,
        running: false,
      });
    }
  };

  const handleEnd = () => {
    Alert.alert(t('quitConfirmTitle'), t('quitConfirmMsg'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('yes'),
        style: 'destructive',
        onPress: async () => {
          setRunning(false);
          if (bookingId) {
            // Clear persisted timer state before navigating away
            await clearTimerState(bookingId);
            try {
              await updateBookingStatus(bookingId, 'completed');
            } catch (err) {
              console.error('[JobTimer] error marking completed:', err);
            }
          }
          router.replace('/(tabs)/Dashboard');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <View style={styles.screen}>
        <Navbar />
        <JobCard job={JOB} t={t} />

        <View style={{ height: 50 }} />

        {/* Timer area */}
        <View style={styles.timerArea}>
          {/* Status badge */}
          {running ? (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>{t('live')}</Text>
            </View>
          ) : (
            <View style={styles.void} />
          )}
          <TimerDisplay seconds={elapsed} running={running} t={t} />
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaArea}>
          {/* Initial State: Only Start Button */}
          {!running && elapsed === 0 && (
            <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.88}>
              <Text style={styles.startBtnText}>{t('startJobTimer')}</Text>
            </TouchableOpacity>
          )}

          {/* Running State: Stop and Pause Buttons */}
          {running && (
            <View style={styles.runningBtns}>
              <TouchableOpacity style={styles.endBtn} onPress={handleEnd} activeOpacity={0.85}>
                <Text style={styles.endBtnText}>{t('stopBtn')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pauseBtn} onPress={handlePause} activeOpacity={0.85}>
                <Text style={styles.pauseBtnText}>{t('pauseLabel')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Paused State: Resume and Stop Buttons */}
          {!running && elapsed > 0 && (
            <View style={styles.runningBtns}>
              <TouchableOpacity style={styles.endBtn} onPress={handleEnd} activeOpacity={0.85}>
                <Text style={styles.endBtnText}>{t('stopBtn')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.startBtn, { flex: 1, height: 54 }]}
                onPress={handleStart}
                activeOpacity={0.88}
              >
                <Text style={styles.startBtnText}>{t('resumeLabel')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const RED = '#E53935';
const TEXT = '#1A1A1A';
const MUTED = '#6B7280';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  screen: { flex: 1, backgroundColor: '#F5F5F5' },
  jobCard: {
    backgroundColor: '#ebedf0',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCDC',

  },
  currentJobLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#212529',
    lineHeight: 28,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  jobMeta: { gap: 4 },
  jobRow: { flexDirection: 'row', alignItems: 'flex-start' },
  jobRowLabel: { fontSize: 14, color: '#6c757d', fontWeight: '500' },
  jobRowValue: { flex: 1, fontSize: 14, color: '#343a40', fontWeight: '700', paddingLeft: 5 },
  timerArea: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 30,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RED,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 20,
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
  liveBadgeText: { color: '#FFFFFF', fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  timerUnit: { alignItems: 'center', minWidth: 70 },
  timerDigits: {
    fontSize: 58,
    fontWeight: '800',
    color: TEXT,
    letterSpacing: -2,
    lineHeight: 66,
    fontVariant: ['tabular-nums'],
  },
  void: {
    height: 46,
  },
  timerLabel: {
    fontSize: 10,
    color: MUTED,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  timerColon: {
    fontSize: 48,
    fontWeight: '300',
    color: '#BDBDBD',
    marginBottom: 16,
    lineHeight: 56,
  },
  ctaArea: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
  },
  startBtn: {
    height: 54,
    borderRadius: 12,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  runningBtns: {
    flexDirection: 'row',
    gap: 16,
    marginHorizontal: 40,
  },
  pauseBtn: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#4591E8',
    borderWidth: 2,
    borderColor: '#4591E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  endBtn: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#e2e5e6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#d3dbe2',
  },
  endBtnText: { fontSize: 15, fontWeight: '800', color: '#36394a' },
});

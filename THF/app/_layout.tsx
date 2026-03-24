import { Stack, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import type { EventSubscription } from "expo-modules-core";

// ── Configure how notifications appear when app is in the FOREGROUND ──
// This MUST be at the top level so it runs as soon as the app loads,
// regardless of which screen the user is on.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const router = useRouter();
  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  useEffect(() => {
    // When a notification is received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[layout] Notification received:', notification.request.content);
      }
    );

    // When user taps a notification, navigate to Dashboard
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log('[layout] Notification tapped, data:', data);
        router.push("/(tabs)/Dashboard");
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome/LanguageSelect" />
      <Stack.Screen name="welcome/MobileLogin" />
      <Stack.Screen name="welcome/OTP" />
      <Stack.Screen name="welcome/password" />
      <Stack.Screen name="kyc/Details" />
      <Stack.Screen name="kyc/Experience" />
      <Stack.Screen name="kyc/Aadhar" />
      <Stack.Screen name="kyc/Selfie" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

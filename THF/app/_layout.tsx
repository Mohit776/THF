import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome/LanguageSelectScreen" />
      <Stack.Screen name="welcome/MobileLoginScreen" />
      <Stack.Screen name="welcome/OTPScreen" />
      <Stack.Screen name="kyc/DetailsScreen" />
      <Stack.Screen name="kyc/ExperienceScreen" />
      <Stack.Screen name="kyc/AadharScreen" />
      <Stack.Screen name="kyc/SelfieScreen" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

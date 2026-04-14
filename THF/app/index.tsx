import { onAuthChange } from '@/lib/auth';
import { auth } from '@/src/services/firebaseConfig';
import { clearSession, getSession } from '@/src/services/sessionStorage';
import { getUserProfile } from '@/src/services/userService';
import { hasCompletedProfile } from '@/src/utils/profileUtils';
import { useRouter } from 'expo-router';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import React, { useEffect, useRef } from 'react';

import {
  Animated,
  Dimensions,
 
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;


  useEffect(() => {
    let mounted = true;

    const waitForAuthUser = async () => {
      if (auth.currentUser) return auth.currentUser;

      return await new Promise<FirebaseAuthTypes.User | null>((resolve) => {
        let settled = false;
        const unsubscribe = onAuthChange((user) => {
          if (!settled) {
            settled = true;
            unsubscribe();
            resolve(user);
          }
        });

        setTimeout(() => {
          if (!settled) {
            settled = true;
            unsubscribe();
            resolve(auth.currentUser);
          }
        }, 1500);
      });
    };

    const resolveNextRoute = async () => {
      try {
        const session = await getSession();
        if (!session?.isLoggedIn) {
          router.replace('/welcome/LanguageSelect');
          return;
        }

        const user = await waitForAuthUser();
        if (!user || user.uid !== session.uid) {
          await clearSession();
          router.replace('/welcome/LanguageSelect');
          return;
        }

        const profile = await getUserProfile(user.uid);
        // Only route to Dashboard when ALL mandatory onboarding fields are filled.
        // Otherwise send the user back into the KYC flow.
        if (hasCompletedProfile(profile)) {
          router.replace('/(tabs)/Dashboard');
        } else {
          router.replace('/kyc/Experience');
        }
      } catch {
        await clearSession();
        router.replace('/welcome/LanguageSelect');
      }
    };

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (!mounted) return;
      resolveNextRoute();
    }, 1500);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111" />

      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/THF/top - Copy.svg')}
          style={styles.heroImage}
          contentFit="cover"
        />
      </View>

      {/* Bottom Curved Card */}
      <Image
        source={require('../assets/THF/bottom.svg')}
        style={styles.bottomCard}
      />
      
      {/* Brand Row */}
      <View style={styles.brandRow}>
        <Image
          source={require('../assets/THF/Layer_1.svg')}
          style={styles.logoImage}
          contentFit="contain"
        />
        <Text style={styles.tagline}>
          Welcome to TFH partner app,{'\n'}complete your detail & join our family
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EA243F', // Matches the red curve so safe-area extension below looks seamless
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.75, 
    backgroundColor: '#111',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  bottomCard: {
    position: 'absolute',
    bottom: -5, // Avoid any gaps at the bottom
    left: 0,
    right: 0,
    width: width,
    height: height * 0.4,
    resizeMode: 'stretch',
  },
  brandRow: {
    position: 'absolute',
    bottom: height * 0.08,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoImage: {
    width: 140,
    height: 50,
    marginBottom: 24,
  },
  tagline: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.3,
    fontWeight: '500',
  },
});

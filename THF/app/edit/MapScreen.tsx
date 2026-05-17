import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, TouchableOpacity, View, Animated, PanResponder } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomText as Text } from '../../components/CustomText';

const GEOCODE_TIMEOUT_MS = 10000;
const GOOGLE_MAPS_APIKEY = "AIzaSyCctEGlkUkIMBepdzLf60eqtrgxxt_E3JE"; // Using the API key from android manifest

export default function MapScreen() {
  const router = useRouter();
  const { address, bookingId, title, time, location: locationParam, guests, cuisine, occasion } =
    useLocalSearchParams<{
      address: string;
      bookingId?: string;
      title?: string;
      time?: string;
      location?: string;
      guests?: string;
      cuisine?: string;
      occasion?: string;
    }>();
  const insets = useSafeAreaInsets();
  const addressText = Array.isArray(address) ? address[0] : address;
  const [coordinates, setCoordinates] = useState<{ latitude: number, longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [showMapHint, setShowMapHint] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const mapRef = React.useRef<MapView>(null);
  // Ref to avoid stale closure inside PanResponder (created once)
  const isRoutingRef = useRef(false);
  const startTripRef = useRef<() => void>(() => { });

  // Second slider — "Reached Location"
  const [showReachedSlider, setShowReachedSlider] = useState(false);
  const isReachedRef = useRef(false);
  const confirmReachedRef = useRef<() => void>(() => { });
  const translateX2 = useRef(new Animated.Value(0)).current;

  // Slider dimensions — must be above both PanResponders
  const SLIDER_WIDTH = 320;
  const THUMB_SIZE = 56;
  const MAX_TRANSLATION_X = SLIDER_WIDTH - THUMB_SIZE - 4;

  const panResponder2 = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (isReachedRef.current) return;
        translateX2.stopAnimation();
        translateX2.setOffset(0);
        translateX2.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (isReachedRef.current) return;
        let newValue = gestureState.dx;
        if (newValue < 0) newValue = 0;
        if (newValue > MAX_TRANSLATION_X) newValue = MAX_TRANSLATION_X;
        translateX2.setValue(newValue);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (isReachedRef.current) return;
        if (gestureState.dx > MAX_TRANSLATION_X * 0.75) {
          Animated.spring(translateX2, {
            toValue: MAX_TRANSLATION_X,
            useNativeDriver: false,
          }).start(() => {
            confirmReachedRef.current();
          });
        } else {
          Animated.spring(translateX2, { toValue: 0, useNativeDriver: false }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX2, { toValue: 0, useNativeDriver: false }).start();
      },
    })
  ).current;

  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (isRoutingRef.current) return;
        translateX.stopAnimation();
        translateX.setOffset(0);
        translateX.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (isRoutingRef.current) return;
        let newValue = gestureState.dx;
        if (newValue < 0) newValue = 0;
        if (newValue > MAX_TRANSLATION_X) newValue = MAX_TRANSLATION_X;
        translateX.setValue(newValue);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (isRoutingRef.current) return;
        if (gestureState.dx > MAX_TRANSLATION_X * 0.75) {
          Animated.spring(translateX, {
            toValue: MAX_TRANSLATION_X,
            useNativeDriver: false,
          }).start(() => {
            startTripRef.current();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        // Snap back if gesture is interrupted
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setErrorMessage(null);
        setCoordinates(null);
        setMapReady(false);
        setShowMapHint(false);

        if (!addressText) {
          setErrorMessage('No address provided.');
          if (mounted) setLoading(false);
          return;
        }

        if (Platform.OS !== 'web') {
          const servicesEnabled = await Location.hasServicesEnabledAsync();
          if (!servicesEnabled) {
            if (mounted) {
              setErrorMessage('Please turn on location services to show this address on the map.');
            }
            return;
          }

          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            if (mounted) {
              setErrorMessage('Location permission is required to show this address on the map.');
            }
            return;
          }
        }

        const geocodedLocation = await Promise.race([
          Location.geocodeAsync(addressText),
          new Promise<Location.LocationGeocodedLocation[]>((_, reject) =>
            setTimeout(() => reject(new Error('Geocoding timed out')), GEOCODE_TIMEOUT_MS)
          ),
        ]);

        if (!mounted) return;

        if (geocodedLocation.length > 0) {
          setCoordinates({
            latitude: geocodedLocation[0].latitude,
            longitude: geocodedLocation[0].longitude,
          });
          setShowMapHint(true);
        } else {
          setErrorMessage('Could not find location coordinates for this address.');
        }
      } catch (error) {
        console.error("Geocoding Error:", error);
        if (mounted) {
          setErrorMessage('Could not load the map for this address.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [addressText]);

  useEffect(() => {
    if (!showMapHint || mapReady) return;

    const timer = setTimeout(() => {
      setShowMapHint(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [mapReady, showMapHint]);

  const startTrip = async () => {
    if (!coordinates) return;
    try {
      isRoutingRef.current = true;
      setIsRouting(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('Location permission is required for navigation.');
        isRoutingRef.current = false;
        setIsRouting(false);
        Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start();
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Show the second "Reached Location" slider
      setShowReachedSlider(true);
    } catch (error) {
      console.warn('Could not get user current location:', error);
      isRoutingRef.current = false;
      setIsRouting(false);
      Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start();
    }
  };

  const confirmReached = () => {
    isReachedRef.current = true;
    Alert.alert(
      'Reached Location?',
      'Have you arrived at the job location?',
      [
        {
          text: 'No',
          style: 'cancel',
          onPress: () => {
            isReachedRef.current = false;
            Animated.spring(translateX2, { toValue: 0, useNativeDriver: false }).start();
          },
        },
        {
          text: 'Yes',
          onPress: () => {
            router.replace({
              pathname: '/edit/JobTimer',
              params: {
                bookingId: bookingId ?? '',
                title: title ?? '',
                time: time ?? '',
                location: locationParam ?? addressText ?? '',
                guests: guests ?? '0',
                cuisine: cuisine ?? '',
                occasion: occasion ?? '',
              },
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  // Keep refs in sync so PanResponders can call latest versions
  useEffect(() => {
    startTripRef.current = startTrip;
    confirmReachedRef.current = confirmReached;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Location</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.addressBar}>
        <Ionicons name="location" size={20} color="#EA243F" />
        <Text style={styles.addressText} numberOfLines={2}>{addressText || 'No address provided'}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA243F" />
        </View>
      ) : coordinates ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={styles.map}
            showsUserLocation={isRouting}
            initialRegion={{
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onMapReady={() => {
              setMapReady(true);
              setShowMapHint(false);
            }}
            toolbarEnabled
            zoomControlEnabled
          >
            <Marker coordinate={coordinates} title={addressText || "Location"} />

            {userLocation && coordinates && (
              <MapViewDirections
                origin={userLocation}
                destination={coordinates}
                apikey={GOOGLE_MAPS_APIKEY}
                strokeWidth={5}
                strokeColor="#0066FF"
                onError={(errorMessage) => {
                  console.error('MapViewDirections Error:', errorMessage);
                  setErrorMessage('Failed to load directions. Please check API Key or network.');
                  setIsRouting(false);
                }}
                onReady={(result) => {
                  mapRef.current?.fitToCoordinates(result.coordinates, {
                    edgePadding: {
                      right: 50,
                      bottom: 150, // accommodate bottom button
                      left: 50,
                      top: 50,
                    },
                    animated: true
                  });
                }}
              />
            )}
          </MapView>
          {showMapHint && !mapReady && (
            <View pointerEvents="none" style={styles.mapHint}>
              <ActivityIndicator size="small" color="#EA243F" />
              <Text style={styles.mapHintText}>Loading map</Text>
            </View>
          )}
          <View style={{
            position: 'absolute',
            backgroundColor: 'white',
            width: '100%',
            height: 180,
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: insets.bottom + 12
          }}>
            {/* ── Slider 1: Start Trip ── */}
            {!showReachedSlider && (
              <View style={[styles.sliderContainer, { backgroundColor: isRouting && !userLocation ? '#aaa' : '#EA243F', width: SLIDER_WIDTH }]}>
                <Text style={styles.sliderText}>
                  {isRouting && !userLocation ? 'Loading...' : 'Swipe to Start Trip'}
                </Text>
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[styles.sliderThumb, { transform: [{ translateX }] }]}
                >
                  {isRouting && !userLocation ? (
                    <ActivityIndicator size="small" color="#EA243F" />
                  ) : (
                    <Ionicons name="navigate" size={24} color="#EA243F" />
                  )}
                </Animated.View>
              </View>
            )}

            {/* ── Slider 2: Reached Location (appears after trip starts) ── */}
            {showReachedSlider && (
              <View style={[styles.sliderContainer, { backgroundColor: '#22A06B', width: SLIDER_WIDTH }]}>
                <Text style={styles.sliderText}>Swipe — Reached Location</Text>
                <Animated.View
                  {...panResponder2.panHandlers}
                  style={[styles.sliderThumb, { transform: [{ translateX: translateX2 }] }]}
                >
                  <Ionicons name="checkmark" size={26} color="#22A06B" />
                </Animated.View>
              </View>
            )}

          </View>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{errorMessage || 'Map view not available for this address.'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    flex: 1,
    textAlign: 'center',
  },
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  mapContainer: {
    flex: 1,
    minHeight: 320,
    overflow: 'hidden',
    backgroundColor: '#eef2f5',
  },
  map: {
    flex: 1,
  },
  mapHint: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  mapHintText: {
    color: '#333',
    fontSize: 13,
    fontWeight: '600',
  },
  directionsButton: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EA243F',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  directionsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  fallbackButton: {
    marginTop: 14,
    backgroundColor: '#EA243F',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  fallbackButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sliderContainer: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    padding: 2,
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  sliderText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    paddingLeft: 30,
    zIndex: -1,
  },
  sliderThumb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  }
});

import PantryMap from '@/components/PantryMap';
import { supabase } from '@/lib/Supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Pantry = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  current_status: 'green' | 'orange' | 'red' | 'unknown';
};

type PantryWithDistance = Pantry & { distance: number };

const FAVORITES_KEY = '@favorite_pantries';

// Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const getStatus = (status: string) => {
    switch (status) {
      case 'green':
        return { color: '#2e7d32', label: 'Stocked', bg: '#e8f5e9' };
      case 'orange':
        return { color: '#e65100', label: 'Low Stock', bg: '#fff3e0' };
      case 'red':
        return { color: '#c62828', label: 'Empty', bg: '#ffebee' };
      default:
        return { color: '#616161', label: 'Unknown', bg: '#f5f5f5' }; // For unknown status
    }
};

export default function HomeListScreen() {
    const router = useRouter();
    const [pantries, setPantries] = useState<PantryWithDistance[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [location, setLocation] = useState<Location.LocationObject>();
    const [permissionGranted, setPermissionGranted] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let subscription: Location.LocationSubscription;

      async function startLocationWatch() {
        try {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission to access location was denied');
            setLoading(false);
            return;
          }

          setPermissionGranted(true);

          subscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 5000,   // Updates every 5s
              distanceInterval: 10, // Or every 10m moved
            },
            (newLocation) => {
              setLocation(newLocation);
              setLoading(false);
            }
          );
        } catch (error) {
          console.error(error);
          setLoading(false);
        }
      }

      startLocationWatch();

      return () => {
        if (subscription) {
          subscription.remove();
        }
      };
    }, []);

    useEffect(() => {
      if (location) {
        fetchPantryData();
      }
    }, [location]);
    
    const USER_LAT = permissionGranted && location ? location.coords.latitude : 38.8048;
    const USER_LON = permissionGranted && location ? location.coords.longitude : -77.0469;

    useEffect(() => {
        fetchPantryData();
    }, []);

    const fetchPantryData = async () => {
        try {
            const { data, error } = await supabase
                .from('pantries')
                .select('id, name, address, latitude, longitude, current_status');
            
            if (error) throw error;
            
            if (data) {
                const pantriesWithDistance = (data as Pantry[]).map(pantry => ({
                    ...pantry,
                    distance: calculateDistance(USER_LAT, USER_LON, pantry.latitude, pantry.longitude)
                })).sort((a, b) => a.distance - b.distance);

                setPantries(pantriesWithDistance);
            }
        } catch (error: any) {
            console.error('Fetch error:', error.message);
            Alert.alert('Error', 'Could not load pantry data.');
        } finally {
            setLoading(false);
        }
    };

    const loadFavorites = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
            if (storedFavorites) {
                setFavoriteIds(JSON.parse(storedFavorites));
            } else {
                setFavoriteIds([]);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
            fetchPantryData();
        }, [location])
    );

    const renderPantryCard = (pantry: PantryWithDistance) => {
        const status = getStatus(pantry.current_status);
        const isFav = favoriteIds.includes(pantry.id);

        return (
            <TouchableOpacity 
                key={pantry.id} 
                style={styles.card}
                onPress={() => router.push(`/pantry/${pantry.id}`)}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {isFav ? '★ ' : ''}{pantry.name}
                    </Text>
                </View>
                
                <View style={styles.cardBody}>
                    <Text style={styles.distanceText}>{pantry.distance.toFixed(1)} miles away</Text>
                    <View style={[styles.badge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.badgeText, { color: status.color }]}>
                            {status.label}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <Text style={styles.loadingText}>Loading...</Text>
                <ActivityIndicator size="large" color="#2e7d32" />
            </View>
        );
    }

    const favoritedPantries = pantries.filter(p => favoriteIds.includes(p.id));

    const nearbyPantries = pantries;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerBlock}>
                    <View style={styles.logoPlaceholder}>
                        {/* wip logo */}
                        <Text style={styles.logo}>🥫</Text> 
                    </View>
                    <Text style={styles.mainTitle}>Shelf Help</Text>
                    <Text style={styles.subtitle}>Community Pantry Tracker</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Favorites</Text>
                    {favoritedPantries.length > 0 ? (
                        favoritedPantries.map(renderPantryCard)
                    ) : (
                        <Text style={styles.emptyText}>No favorited pantries yet. Tap the star on any pantry to favorite it!</Text>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nearby Pantries</Text>
                    {nearbyPantries.map(renderPantryCard)}
                </View>

                <View style={styles.embeddedMapWrapper}>
                    <PantryMap
                        pantries={pantries as any}
                        userLocation={location ? location.coords : null}
                        permissionGranted={permissionGranted}
                    />
                </View>

                <TouchableOpacity style={styles.mapButton} onPress={() => router.push('/map')}>
                    <Text style={styles.mapButtonText}>Full Map View</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        color: '#2e7d32',
        margin: 24,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerBlock: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 10,
    },
    logoPlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: '#e8f5e9',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    logo: {
        fontSize: 32,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    mapButton: {
        position: 'absolute',
        bottom: 35,
        left: 27,
        right: 27,
        backgroundColor: '#2e7d32',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 5,
    },
    mapButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12,
        marginLeft: 4,
    },
    emptyText: {
        fontSize: 14,
        color: '#757575',
        fontStyle: 'italic',
        marginBottom: 8,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        flex: 1,
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    distanceText: {
        fontSize: 13,
        color: '#646464',
        fontWeight: '500',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        fontStyle: 'italic',
        textTransform: 'uppercase',
    },
    embeddedMapWrapper: {
        height: 300,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        position: 'relative',
    }
});
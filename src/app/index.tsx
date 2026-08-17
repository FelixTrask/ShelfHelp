import { supabase } from '@/lib/Supabase';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';

type Pantry = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  current_status: 'green' | 'orange' | 'red' | 'unknown';
  lastStatusTime: number;
}

// Mock data for pantries before updates in Supabase
// const SAMPLE_PANTRIES = [
//   {id: '1', name: 'Old Town Pantry', latitude: 38.8048, longitude: -77.0469, status: 'empty'},
//   {id: '2', name: 'Del Ray Pantry', latitude: 38.8250, longitude: -77.0580, status: 'full'},
//   {id: '3', name: 'West End Pantry', latitude: 38.8120, longitude: -77.1100, status: 'almost_empty'}
// ]

export default function HomeScreen() {
  const router = useRouter();
  const [pantries, setPantries] = useState<Pantry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPantryData();
  }, []);

  const fetchPantryData = async () => {
    try {
      const { data, error } = await supabase
        .from('pantries')
        .select('id, name, address, latitude, longitude, current_status, last_status_time');
      if (error) throw error;
      if (data) setPantries(data as unknown as Pantry[]);
    } catch (error: any) {
      console.error('Fetch error:', error.message);
      Alert.alert('Error', 'Error: Could not load pantry data.');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 38.8048,
          longitude: -77.0469,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        {pantries.map((pantry) => {
          const status = getStatus(pantry.current_status);
          return (
            <Marker
              key={pantry.id}
              coordinate={{
                latitude: Number(pantry.latitude),
                longitude: Number(pantry.longitude),
              }}
              pinColor={status.color}
            >
              <Callout tooltip onPress={() => router.push(`/pantry/${pantry.id}`)}>
                <View style={styles.calloutContainer}>
                  <View style={styles.headerRow}>
                    <Text style={styles.calloutTitle}>
                      {pantry.name}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.badgeText, { color: status.color }]}>
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.calloutAddress} numberOfLines={2}>
                    {pantry.address}
                  </Text>

                  <Text style={styles.actionPrompt}>Tap to view pantry details</Text>
                </View>
              </Callout>
            </Marker>
          );
      })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  calloutContainer: {
    backgroundColor: '#ffffff',
    padding: 12,
    width: 220,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4.5,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  calloutAddress: {
    fontSize: 12,
    color: '#646464',
    marginBottom: 8,
    lineHeight: 16,
  },
  actionPrompt: {
    fontSize: 11,
    fontWeight: '600',
    color: '#007aff',
  },
});

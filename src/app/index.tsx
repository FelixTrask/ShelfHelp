import { RelativePathString, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';

// Mock data for pantries before updates in Supabase
const SAMPLE_PANTRIES = [
  {id: '1', name: 'Old Town Pantry', latitude: 38.8048, longitude: -77.0469, status: 'empty'},
  {id: '2', name: 'Del Ray Pantry', latitude: 38.8250, longitude: -77.0580, status: 'full'},
  {id: '3', name: 'West End Pantry', latitude: 38.8120, longitude: -77.1100, status: 'almost_empty'}
]

export default function HomeScreen() {
  const router = useRouter();
  const getPinColor = (status: string) => {
    switch (status) {
      case 'full':
        return 'green';
      case 'almost_empty':
        return 'orange';
      case 'empty':
        return 'red';
      default:
        return 'gray';
    }
};

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
        {SAMPLE_PANTRIES.map((pantry) => (
          <Marker
            key={pantry.id}
            coordinate={{
              latitude: pantry.latitude,
              longitude: pantry.longitude
            }}
            pinColor={getPinColor(pantry.status)}
          >
            <Callout
              tooltip={true}
              onPress={() => router.push(`/pantry/${pantry.id}` as RelativePathString)}
            >
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{pantry.name}</Text>
                <Text style={[styles.calloutStatus, { color: getPinColor(pantry.status) }, {textTransform: 'capitalize'}]}>
                  {pantry.status.replace('_', ' ')}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  calloutContainer: {
    backgroundColor: 'white',
    padding: 10,
    minWidth: 140,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  calloutStatus: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

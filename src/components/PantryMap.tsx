import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_DEFAULT } from 'react-native-maps';

type Pantry = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  current_status: 'green' | 'orange' | 'red' | 'unknown';
  lastStatusTime: number;
};

type PantryMapProps = {
  pantries: Pantry[];
  userLocation?: { latitude: number; longitude: number } | null;
  permissionGranted: boolean;
  style?: ViewStyle;
};

const getStatusConfig = (status: string) => {
    switch (status) {
        case 'green':
            return { color: '#2e7d32', label: 'Stocked', bg: '#e8f5e9', pinColor: 'green' };
        case 'orange':
            return { color: '#e65100', label: 'Low Stock', bg: '#fff3e0', pinColor: 'orange' };
        case 'red':
            return { color: '#c62828', label: 'Empty', bg: '#ffebee', pinColor: 'red' };
        default:
            return { color: '#616161', label: 'Unknown', bg: '#f5f5f5', pinColor: 'gray' };
    }
};

export default function PantryMap({
    pantries,
    userLocation,
    permissionGranted,
    style,
}: PantryMapProps) {
    const router = useRouter();

    const initialRegion = {
        latitude: userLocation ? userLocation.latitude : 38.8048,
        longitude: userLocation ? userLocation.longitude : -77.0469,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
    };

    return (
        <View style={[styles.mapContainer, style]}>
            <MapView
                provider={PROVIDER_DEFAULT}
                style={styles.map}
                showsUserLocation={permissionGranted}
                showsMyLocationButton={permissionGranted}
                initialRegion={initialRegion}
            >
                {pantries.map((pantry) => {
                    const status = getStatusConfig(pantry.current_status);
                    return (
                        <Marker
                            key={pantry.id}
                            coordinate={{
                                latitude: Number(pantry.latitude),
                                longitude: Number(pantry.longitude),
                            }}
                            pinColor={status.pinColor}
                        >
                          <Callout tooltip onPress={() => router.push(`/pantry/${pantry.id}` as any)}>
                                <View style={styles.calloutContainer}>
                                <View style={styles.headerRow}>
                                    <Text style={styles.calloutTitle} numberOfLines={1}>
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

                                <Text style={styles.actionPrompt}>Tap to view details →</Text>
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
    mapContainer: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    calloutContainer: {
        width: 220,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    calloutTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#222',
        flex: 1,
        marginRight: 6,
    },
    calloutAddress: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    actionPrompt: {
        fontSize: 11,
        fontWeight: '600',
        color: '#2e7d32',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
});
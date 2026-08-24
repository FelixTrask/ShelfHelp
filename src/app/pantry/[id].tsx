import { supabase } from '@/lib/Supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PantryDetail = {
    id: string;
    name: string;
    address: string;
    current_status: 'green' | 'orange' | 'red' | 'unknown';
}

const getStatus = (status: string | undefined) => {
  switch (status) {
    case 'green':
      return { color: '#2e7d32', label: 'Stocked', bg: '#e8f5e9' };
    case 'orange':
      return { color: '#e65100', label: 'Low Stock', bg: '#fff3e0' };
    case 'red':
      return { color: '#c62828', label: 'Empty', bg: '#ffebee' };
    default:
      return { color: '#616161', label: 'Unknown', bg: '#f5f5f5' };
  }
};

const FAVORITES_KEY = '@favorite_pantries';

export default function PantryDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [pantry, setPantry] = useState<PantryDetail | null>(null);
    const[loading, setLoading] = useState(true);
    const[isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if (id) {
            fetchPantry();
            checkIfFavorite();
        }
    }, [id]);

    const fetchPantry = async () => {
        try {
            const { data, error } = await supabase
                .from('pantries')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) setPantry(data as PantryDetail);
        } catch (err: any) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const checkIfFavorite = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
            if (storedFavorites) {
                const favoritesList: string[] = JSON.parse(storedFavorites);
                setIsFavorite(favoritesList.includes(id as string));
            }
        } catch (error) {
            console.error('Error checking favorites:', error);
        }
    };

    const toggleFavorite = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
            let favoritesList: string[] = storedFavorites ? JSON.parse(storedFavorites) : [];

            if (isFavorite) {
                favoritesList = favoritesList.filter((favID) => favID != id);
            } else {
                favoritesList.push(id as string);
            }

            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesList));
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error updating favorites:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2e7d32" />
            </View>
        );
    }

    if (pantry == null) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Pantry not found.</Text>
            </View>
        );
    }
    
    return (
    <View style={styles.overlay}>
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>
                        {pantry?.name}
                    </Text>
                    <TouchableOpacity onPress={toggleFavorite} style={styles.favoritesButton}>
                        <Text style={[styles.starText, isFavorite && styles.starActive]}>
                            {isFavorite ? '★' : '☆'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
            </View>

            {/* Body Details */}
            <Text style={styles.address} numberOfLines={2}>
                {pantry?.address}
            </Text>

            <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status:</Text>
                <Text style={[styles.statusValue, { color: getStatus(pantry?.current_status).color }]}>
                    {getStatus(pantry?.current_status).label}
                </Text>
            </View>

            {/* Compact Action Button */}
            <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
                <Text style={styles.doneButtonText}>Close</Text>
            </TouchableOpacity>
        </View>
    </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        //backgroundColor: 'rgba(0, 0, 0, 0.4)', // Uncomment if we want a dark background
        justifyContent: 'flex-end', // Puts card at bottom
    },
    card: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 36,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    titleRow: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        marginRight: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        flex: 1,
        marginRight: 8,
    },
    closeButton: {
        padding: 4,
    },
    closeText: {
        fontSize: 16,
        color: '#888',
        fontWeight: '600',
    },
    address: {
        fontSize: 13,
        color: '#666',
        marginBottom: 12,
        lineHeight: 18,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#444',
        marginRight: 6,
    },
    statusValue: {
        fontSize: 13,
        fontWeight: '700',
    },
    doneButton: {
        backgroundColor: '#2e7d32',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#646464',
    },
    favoritesButton: {
        padding: 4,
    },
    starText: {
        fontSize: 22,
        color: '#b0bec5',
    },
    starActive: {
        color: '#fbc53c'
    }
});
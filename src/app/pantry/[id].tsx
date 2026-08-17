import { supabase } from '@/lib/Supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PantryDetail = {
    id: string;
    name: string;
    address: string;
    current_status: 'green' | 'orange' | 'red' | 'unknown';
}

export default function PantryDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [pantry, setPantry] = useState<PantryDetail | null>(null);
    const[loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchPantry();
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
                <Text style={styles.title} numberOfLines={1}>
                    {pantry?.name}
                </Text>
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
                <Text style={[styles.statusValue, { color: getStatusColor(pantry?.current_status) }]}>
                    {pantry?.current_status?.toUpperCase() ?? 'UNKNOWN'}
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'green': return '#2e7d32';
    case 'orange': return '#e65100';
    case 'red': return '#c62828';
    default: return '#757575';
  }
};

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
});
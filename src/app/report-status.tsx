import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Stocked':
      return { color: '#2e7d32', backgroundColor: '#e8f5e9' };
    case 'Almost Empty':
    case 'Low Stock':
      return { color: '#e65100', backgroundColor: '#fff3e0' };
    case 'Empty':
      return { color: '#c62828', backgroundColor: '#ffebee' };
    default:
      return { color: '#616161', backgroundColor: '#f5f5f5' };
  }
};

export default function ReportStatus() {
  const router = useRouter();
  const { pantryName: pantryNameParam, currentStatus: currentStatusParam } = useLocalSearchParams<{
    pantryName?: string;
    currentStatus?: string;
  }>();
  const pantryName = pantryNameParam ?? 'Old Town Pantry';
  const currentStatus = currentStatusParam ?? 'Almost Empty';
  const currentStatusStyle = getStatusStyle(currentStatus);

  const [selectedStatus, setSelectedStatus] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Report Pantry Status</Text>
        <Text style={styles.subtitle}>
          A quick update helps neighbors know when this pantry needs support.
        </Text>
      </View>

      <View style={styles.pantryCard}>
        <Text style={styles.pantryName}>{pantryName}</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Current status</Text>
          <View style={[styles.currentStatusBadge, { backgroundColor: currentStatusStyle.backgroundColor }]}>
            <Text style={[styles.currentStatusText, { color: currentStatusStyle.color }]}>
              {currentStatus}
            </Text>
          </View>
        </View>
        <Text style={styles.lastUpdated}>You can help keep this information current.</Text>
      </View>

      <Text style={styles.question}>How stocked is this pantry right now?</Text>
      <Text style={styles.helperText}>Choose the option that best matches what you see.</Text>

      <View style={styles.options}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: selectedStatus === 'Stocked' }}
          style={[styles.option, styles.stockedOption, selectedStatus === 'Stocked' && styles.stockedSelected]}
          onPress={() => setSelectedStatus('Stocked')}
        >
          <Text style={[styles.optionTitle, styles.stockedText]}>Stocked</Text>
          <Text style={styles.optionDescription}>There is plenty available.</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: selectedStatus === 'Almost Empty' }}
          style={[styles.option, styles.lowOption, selectedStatus === 'Almost Empty' && styles.lowSelected]}
          onPress={() => setSelectedStatus('Almost Empty')}
        >
          <Text style={[styles.optionTitle, styles.lowText]}>Almost Empty</Text>
          <Text style={styles.optionDescription}>Only a few items are left.</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: selectedStatus === 'Empty' }}
          style={[styles.option, styles.emptyOption, selectedStatus === 'Empty' && styles.emptySelected]}
          onPress={() => setSelectedStatus('Empty')}
        >
          <Text style={[styles.optionTitle, styles.emptyText]}>Empty</Text>
          <Text style={styles.optionDescription}>The shelf needs a refill.</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!selectedStatus}
        style={[styles.submitButton, !selectedStatus && styles.submitButtonDisabled]}
        onPress={() => router.back()}
      >
        <Text style={styles.submitButtonText}>Submit report</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: '#1a1a1a',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  pantryCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    padding: 16,
  },
  pantryName: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusLabel: {
    color: '#444',
    fontSize: 13,
    fontWeight: '600',
  },
  currentStatusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  currentStatusText: {
    fontSize: 11,
    fontWeight: '700',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  lastUpdated: {
    color: '#646464',
    fontSize: 13,
  },
  question: {
    color: '#333',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  helperText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  options: {
    gap: 12,
  },
  option: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stockedOption: {
    borderColor: '#c8e6c9',
  },
  lowOption: {
    borderColor: '#ffe0b2',
  },
  emptyOption: {
    borderColor: '#ffcdd2',
  },
  stockedSelected: {
    backgroundColor: '#e8f5e9',
    borderColor: '#2e7d32',
  },
  lowSelected: {
    backgroundColor: '#fff3e0',
    borderColor: '#e65100',
  },
  emptySelected: {
    backgroundColor: '#ffebee',
    borderColor: '#c62828',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  stockedText: {
    color: '#2e7d32',
  },
  lowText: {
    color: '#e65100',
  },
  emptyText: {
    color: '#c62828',
  },
  optionDescription: {
    color: '#646464',
    fontSize: 14,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#2e7d32',
    borderRadius: 12,
    marginTop: 'auto',
    minHeight: 54,
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#a9c8ab',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});

import { supabase } from '@/lib/Supabase';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// TODO: Make status to db value lookup table function

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Stocked':
    case 'green':
      return { color: '#2e7d32', backgroundColor: '#e8f5e9' };
    case 'Almost Empty':
    case 'Low Stock':
    case 'orange':
      return { color: '#e65100', backgroundColor: '#fff3e0' };
    case 'Empty':
    case 'red':
      return { color: '#c62828', backgroundColor: '#ffebee' };
    default:
      return { color: '#616161', backgroundColor: '#f5f5f5' };
  }
};

const STATUS_TO_DB_VALUE: Record<string, 'green' | 'orange' | 'red'> = {
  "Stocked": 'green',
  "Almost Empty": 'orange',
  "Empty": 'red'
};

export default function ReportStatus() {
  const router = useRouter();
  const { pantryId, pantryName: pantryNameParam, currentStatus: currentStatusParam } = useLocalSearchParams<{
    pantryId?: string;
    pantryName?: string;
    currentStatus?: string;
  }>();
  const pantryName = pantryNameParam ?? 'Old Town Pantry';
  const currentStatus = currentStatusParam ?? 'Almost Empty';
  const currentStatusStyle = getStatusStyle(currentStatus);

  const [selectedStatus, setSelectedStatus] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Camera access is required to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStatus) return;
    if (!pantryId) {
      Alert.alert('Error', 'Pantry ID is missing. Cannot submit update.');
      return;
    }

    if(!photoUri) {
      Alert.alert('Error', 'Please take a verification photo before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(photoUri);
      const arrayBuffer = await response.arrayBuffer(); // Changed to an ArrayBuffer for fixed length + specifing file type
      const fileName = `pantry_${pantryId}_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('pantry-photos')
        .upload(fileName, arrayBuffer, { contentType: 'image/jpeg' });

      if (uploadError) throw new Error(`Photo upload: ${uploadError.message}`); // Changed to specify whether it's an upload error or report error

      const { data: publicUrlData } = supabase.storage
        .from('pantry-photos')
        .getPublicUrl(fileName);

      const photoUrl = publicUrlData.publicUrl;

      const { error: reportError } = await supabase
        .from('pantry_reports') // Changed to new pantry-reports table
        .insert({
          pantry_id: pantryId,
          reported_status: STATUS_TO_DB_VALUE[selectedStatus],
          photo_url: photoUrl,
          status: 'pending',
        });

      if  (reportError) throw new Error(`Saving report: ${reportError.message}`); // Changed to specify whether it's an upload error or report error

      Alert.alert(
        'Submitted for Review',
        'Thank you for your report! It will be reviewed by our team shortly. Once reviewed, the pantry status will update automatically.'
      );
      router.back();
    } catch (error: any) {
      Alert.alert('Submission Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView   
    style={{ flex: 1, backgroundColor: '#f8f9fa' }}
    contentContainerStyle={styles.container}>
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

      <Text style={styles.question}>1. Take Verification Photo</Text>
      <View style={styles.privacyWarningBox}>
        <Text style={styles.privacyWarningText}>
          Privacy Notice: Photos must be strictly of the pantry shelf. Never take photos of people.
        </Text>
      </View>

      {photoUri ? (
        <View style={styles.photoPreviewContainer}>
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          <Pressable style={styles.retakeButton} onPress={takePhoto}>
            <Text style={styles.retakeButtonText}>Retake Photo</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.cameraButton} onPress={takePhoto}>
          <Text style={styles.cameraButtonText}>Take Photo</Text>
        </Pressable>
      )}

      <Text style={styles.question}>2. How stocked is this pantry right now?</Text>
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
        disabled={!selectedStatus || !photoUri || submitting}
        style={[styles.submitButton, (!selectedStatus || !photoUri || submitting) && styles.submitButtonDisabled]}
        onPress={handleSubmit}
      >
        {submitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit for Approval</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    marginBottom: 16,
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
    marginTop: 24,
    marginBottom: 16,
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
  privacyWarningBox: {
    backgroundColor: '#fff3e0',
    borderColor: '#ffeeba',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
  },
  privacyWarningText: {
    color: '#856404',
    fontSize: 12,
    lineHeight: 16,
  },
  cameraButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
  },
  cameraButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '700',
  },
  photoPreviewContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 8,
  },
  retakeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#6c757d',
    borderRadius: 6,
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  }
});

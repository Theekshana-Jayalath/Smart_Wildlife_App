import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TextInput, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { AppTheme } from '../../theme';
import { IncidentType, LocationData } from '../../types/incident';
import { IncidentTypeSelect } from '../../components/incident/IncidentTypeSelect';
import { PhotoCaptureCard } from '../../components/incident/PhotoCaptureCard';
import { LocationCard } from '../../components/incident/LocationCard';
import { Button } from '../../components/ui/Button';
import { useCamera } from '../../hooks/useCamera';

export default function ReportIncidentScreen() {
  const [type, setType] = useState<IncidentType | null>(null);
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locating, setLocating] = useState(false);
  const { takePhoto, loading: cameraLoading } = useCamera();

  // Validation: description must not be empty, type must be selected
  const isValid = type !== null && description.trim().length > 0;

  const handleTakePhoto = async () => {
    const uri = await takePhoto();
    if (uri) {
      setPhotoUri(uri);
    }
  };

  const handleGetLocation = () => {
    // TODO: Integrate actual GPS logic
    setLocating(true);
    setTimeout(() => {
      setLocation({ latitude: -1.2921, longitude: 36.8219, accuracy: 5 });
      setLocating(false);
    }, 1200);
  };

  const handleContinue = () => {
    if (!isValid) return;
    
    // Not actually submitting to Firebase yet per instructions.
    Alert.alert(
      "Review Incident", 
      "Data is valid. Ready to review and submit.",
      [
        { text: "OK", onPress: () => router.back() }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageDescription}>
          Please provide accurate details. Your reports are critical for conservation efforts.
        </Text>

        {/* 1. Incident Type */}
        <IncidentTypeSelect 
          selectedType={type} 
          onSelect={setType} 
        />

        {/* 2. Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[
              styles.textArea,
              description.trim().length === 0 && styles.textAreaInvalid
            ]}
            placeholder="Describe what you observed..."
            placeholderTextColor={AppTheme.colors.textSecondary}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
          {description.trim().length === 0 && (
             <Text style={styles.errorText}>* Description is required</Text>
          )}
        </View>

        {/* 3. Photo Evidence */}
        <PhotoCaptureCard 
          photoUri={photoUri} 
          loading={cameraLoading}
          onTake={handleTakePhoto} 
          onClear={() => setPhotoUri(null)} 
        />

        {/* 4. GPS Location */}
        <LocationCard 
          location={location} 
          loading={locating} 
          onGetLocation={handleGetLocation} 
        />

        {/* 5. Submit Action */}
        <View style={styles.footer}>
          <Button 
            title="Continue" 
            onPress={handleContinue} 
            disabled={!isValid} 
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA', // Slightly distinct from pure white cards for depth
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: AppTheme.spacing.md,
    paddingBottom: AppTheme.spacing.xxl,
  },
  pageDescription: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textSecondary,
    marginBottom: AppTheme.spacing.lg,
  },
  inputContainer: {
    marginBottom: AppTheme.spacing.lg,
  },
  label: {
    ...AppTheme.typography.h3,
    color: AppTheme.colors.header,
    marginBottom: AppTheme.spacing.sm,
  },
  required: {
    color: AppTheme.colors.danger,
  },
  textArea: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: AppTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E1E6',
    padding: AppTheme.spacing.md,
    minHeight: 120,
    ...AppTheme.typography.body,
    color: AppTheme.colors.header,
  },
  textAreaInvalid: {
    borderColor: AppTheme.colors.danger,
  },
  errorText: {
    ...AppTheme.typography.caption,
    color: AppTheme.colors.danger,
    marginTop: AppTheme.spacing.xs,
  },
  footer: {
    marginTop: AppTheme.spacing.md,
  },
});

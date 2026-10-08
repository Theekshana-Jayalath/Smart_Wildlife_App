import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { INCIDENT_TYPES } from '../../constants/incidents';

export default function IncidentReviewScreen() {
  const params = useLocalSearchParams();
  
  const { type, description, photoUri, latitude, longitude } = params;

  // Resolve the full incident object from the ID
  const incidentOption = INCIDENT_TYPES.find(t => t.id === type);

  const handleSubmit = () => {
    // We do not upload to Firebase yet.
    // Placeholder for submission logic.
    Alert.alert(
      "Report Submitted", 
      "The incident report was submitted successfully. (Firebase upload not implemented yet).",
      [
        { text: "OK", onPress: () => router.replace('/(ranger)') }
      ]
    );
  };

  const handleEdit = () => {
    // Navigate back to the incident form so the user can modify the details
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        <View style={styles.headerAlert}>
          <Ionicons name="information-circle" size={24} color={AppTheme.colors.primary} />
          <Text style={styles.headerAlertText}>
            This is the information that will be submitted.
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Incident Type</Text>
          <View style={styles.row}>
            {incidentOption && (
              <Ionicons name={incidentOption.icon as any} size={24} color={AppTheme.colors.primary} />
            )}
            <Text style={styles.valueText}>{incidentOption?.label || type}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{description}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.row}>
            <Ionicons name="location" size={24} color={AppTheme.colors.success} />
            <Text style={styles.valueText}>
              Lat: {Number(latitude).toFixed(5)}, Lng: {Number(longitude).toFixed(5)}
            </Text>
          </View>
        </View>

        {/* Photo Evidence Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Photo Evidence</Text>
          {photoUri ? (
            <Image 
              source={{ uri: photoUri as string }} 
              style={styles.imagePreview} 
              resizeMode="cover" 
            />
          ) : (
            <Text style={styles.noPhotoText}>No photo provided.</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button 
            title="Edit" 
            variant="outline" 
            onPress={handleEdit} 
            style={styles.editButton} 
          />
          <Button 
            title="Submit Report" 
            onPress={handleSubmit} 
            style={styles.submitButton} 
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: AppTheme.spacing.md,
    paddingBottom: AppTheme.spacing.xxl,
  },
  headerAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.selected,
    padding: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.md,
    marginBottom: AppTheme.spacing.lg,
  },
  headerAlertText: {
    ...AppTheme.typography.bodySmall,
    color: AppTheme.colors.primary,
    marginLeft: AppTheme.spacing.sm,
    fontWeight: AppTheme.fontWeights.medium,
    flex: 1,
  },
  card: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.lg,
    marginBottom: AppTheme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E0E1E6',
    ...AppTheme.shadows.sm,
  },
  sectionTitle: {
    ...AppTheme.typography.caption,
    color: AppTheme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: AppTheme.spacing.sm,
    fontWeight: AppTheme.fontWeights.bold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.header,
    marginLeft: AppTheme.spacing.sm,
    fontWeight: AppTheme.fontWeights.medium,
  },
  descriptionText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.header,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E1E6',
    marginVertical: AppTheme.spacing.md,
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: AppTheme.borderRadius.sm,
    backgroundColor: AppTheme.colors.selected,
  },
  noPhotoText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textSecondary,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: AppTheme.spacing.md,
    marginTop: AppTheme.spacing.sm,
  },
  editButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

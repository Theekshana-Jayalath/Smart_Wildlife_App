import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../../theme';

interface Props {
  photoUri: string | null;
  onTake: () => void;
  onClear: () => void;
}

export const PhotoCaptureCard = ({ photoUri, onTake, onClear }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Photo Evidence</Text>
      
      {photoUri ? (
        <View style={styles.photoContainer}>
          <View style={styles.placeholderImage}>
            <Ionicons name="image" size={48} color={AppTheme.colors.success} />
            <Text style={styles.successText}>Photo Captured</Text>
          </View>
          <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
            <Text style={styles.clearBtnText}>Retake Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.captureBtn} onPress={onTake} activeOpacity={0.8}>
          <Ionicons name="camera-outline" size={32} color={AppTheme.colors.primary} />
          <Text style={styles.captureText}>Take Photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: AppTheme.spacing.lg,
  },
  label: {
    ...AppTheme.typography.h3,
    color: AppTheme.colors.header,
    marginBottom: AppTheme.spacing.sm,
  },
  captureBtn: {
    backgroundColor: AppTheme.colors.selected,
    borderRadius: AppTheme.borderRadius.md,
    borderWidth: 2,
    borderColor: AppTheme.colors.primary,
    borderStyle: 'dashed',
    padding: AppTheme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: AppTheme.spacing.sm,
  },
  captureText: {
    ...AppTheme.typography.buttonText,
    color: AppTheme.colors.primary,
  },
  photoContainer: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: AppTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.success,
    padding: AppTheme.spacing.md,
    alignItems: 'center',
  },
  placeholderImage: {
    alignItems: 'center',
    marginBottom: AppTheme.spacing.md,
  },
  successText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.success,
    marginTop: AppTheme.spacing.xs,
    fontWeight: AppTheme.fontWeights.medium,
  },
  clearBtn: {
    paddingVertical: AppTheme.spacing.xs,
    paddingHorizontal: AppTheme.spacing.md,
  },
  clearBtnText: {
    ...AppTheme.typography.bodySmall,
    color: AppTheme.colors.danger,
    fontWeight: AppTheme.fontWeights.semibold,
  },
});

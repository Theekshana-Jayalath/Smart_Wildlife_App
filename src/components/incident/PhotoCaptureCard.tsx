import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../../theme';

interface Props {
  photoUri: string | null;
  loading?: boolean;
  onTake: () => void;
  onClear: () => void;
}

export const PhotoCaptureCard = ({ photoUri, loading, onTake, onClear }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Photo Evidence</Text>
      
      {photoUri ? (
        <View style={styles.photoContainer}>
          <Image source={{ uri: photoUri }} style={styles.imagePreview} resizeMode="cover" />
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
              <Ionicons name="trash-outline" size={20} color={AppTheme.colors.danger} />
              <Text style={styles.clearBtnText}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retakeBtn} onPress={onTake} disabled={loading}>
              <Ionicons name="camera-outline" size={20} color={AppTheme.colors.primary} />
              <Text style={styles.retakeBtnText}>Retake Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.captureBtn} 
          onPress={onTake} 
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="large" color={AppTheme.colors.primary} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={32} color={AppTheme.colors.primary} />
              <Text style={styles.captureText}>Take Photo</Text>
            </>
          )}
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
    minHeight: 120,
  },
  captureText: {
    ...AppTheme.typography.buttonText,
    color: AppTheme.colors.primary,
  },
  photoContainer: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: AppTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E1E6',
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    backgroundColor: AppTheme.colors.selected,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: AppTheme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E0E1E6',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: AppTheme.spacing.sm,
    gap: AppTheme.spacing.xs,
  },
  clearBtnText: {
    ...AppTheme.typography.bodySmall,
    color: AppTheme.colors.danger,
    fontWeight: AppTheme.fontWeights.semibold,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: AppTheme.spacing.sm,
    gap: AppTheme.spacing.xs,
  },
  retakeBtnText: {
    ...AppTheme.typography.bodySmall,
    color: AppTheme.colors.primary,
    fontWeight: AppTheme.fontWeights.semibold,
  }
});

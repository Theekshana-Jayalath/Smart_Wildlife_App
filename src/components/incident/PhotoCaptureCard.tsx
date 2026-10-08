import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  photoUri: string | null;
  loading?: boolean;
  onTake: () => void;
  onClear: () => void;
}

export const PhotoCaptureCard = ({ photoUri, loading, onTake, onClear }: Props) => {
  const { theme, isDarkMode } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textPrimary }]}>Photo Evidence</Text>
      
      {photoUri ? (
        <View style={[styles.photoContainer, { backgroundColor: theme.cardBg, borderColor: theme.inputBorder }]}>
          <Image source={{ uri: photoUri }} style={styles.imagePreview} resizeMode="cover" />
          <View style={[styles.actionRow, { borderTopColor: theme.inputBorder }]}>
            <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
              <Ionicons name="trash-outline" size={20} color={AppTheme.colors.danger} />
              <Text style={styles.clearBtnText}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retakeBtn} onPress={onTake} disabled={loading}>
              <Ionicons name="camera-outline" size={20} color={theme.primary} />
              <Text style={[styles.retakeBtnText, { color: theme.primary }]}>Retake Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          style={[
            styles.captureBtn, 
            { 
              backgroundColor: isDarkMode ? '#1E293B' : AppTheme.colors.selected, 
              borderColor: theme.primary 
            }
          ]} 
          onPress={onTake} 
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={32} color={theme.primary} />
              <Text style={[styles.captureText, { color: theme.primary }]}>Take Photo</Text>
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
    marginBottom: AppTheme.spacing.sm,
  },
  captureBtn: {
    borderRadius: AppTheme.borderRadius.md,
    borderWidth: 2,
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
  },
  photoContainer: {
    borderRadius: AppTheme.borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#000000',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: AppTheme.spacing.sm,
    borderTopWidth: 1,
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
    fontWeight: AppTheme.fontWeights.semibold,
  }
});

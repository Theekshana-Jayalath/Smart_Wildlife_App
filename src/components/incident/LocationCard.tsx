import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../../theme';
import { LocationData } from '../../types/incident';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  location: LocationData | null;
  loading: boolean;
  error?: string | null;
  onGetLocation: () => void;
}

export const LocationCard = ({ location, loading, error, onGetLocation }: Props) => {
  const { theme, isDarkMode } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textPrimary }]}>Location Details</Text>
      
      {error ? (
        <View style={[styles.errorContainer, { backgroundColor: isDarkMode ? '#422006' : '#FFFDE7' }]}>
          <Ionicons name="warning" size={24} color={AppTheme.colors.warning} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: error ? AppTheme.colors.warning : theme.inputBorder }]}>
        <View style={styles.infoRow}>
          <Ionicons 
            name="location-outline" 
            size={24} 
            color={location ? AppTheme.colors.success : theme.textSecondary} 
          />
          <View style={styles.textContainer}>
            {location ? (
              <>
                <Text style={styles.titleSuccess}>Location Captured</Text>
                <Text style={[styles.coords, { color: theme.textSecondary }]}>
                  Lat: {location.latitude.toFixed(5)}{'\n'}Lng: {location.longitude.toFixed(5)}
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Current Location</Text>
                <Text style={[styles.status, { color: theme.textSecondary }]}>Not recorded yet</Text>
              </>
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: isDarkMode ? '#334155' : AppTheme.colors.selected }]} 
          onPress={onGetLocation}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Text style={[styles.actionBtnText, { color: theme.primary }]}>
              {error ? 'Retry' : (location ? 'Update' : 'Get Location')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: AppTheme.spacing.xl,
  },
  label: {
    ...AppTheme.typography.h3,
    marginBottom: AppTheme.spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: AppTheme.spacing.sm,
    borderRadius: AppTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.warning,
    marginBottom: AppTheme.spacing.sm,
    gap: AppTheme.spacing.sm,
  },
  errorText: {
    ...AppTheme.typography.bodySmall,
    color: AppTheme.colors.warning,
    flex: 1,
    fontWeight: AppTheme.fontWeights.medium,
  },
  card: {
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: AppTheme.spacing.sm,
  },
  title: {
    ...AppTheme.typography.body,
    fontWeight: AppTheme.fontWeights.medium,
  },
  titleSuccess: {
    ...AppTheme.typography.body,
    fontWeight: AppTheme.fontWeights.bold,
    color: AppTheme.colors.success,
  },
  status: {
    ...AppTheme.typography.bodySmall,
    marginTop: 2,
  },
  coords: {
    ...AppTheme.typography.bodySmall,
    marginTop: 2,
  },
  actionBtn: {
    paddingVertical: AppTheme.spacing.sm,
    paddingHorizontal: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.md,
    marginLeft: AppTheme.spacing.sm,
  },
  actionBtnText: {
    ...AppTheme.typography.bodySmall,
    fontWeight: AppTheme.fontWeights.semibold,
  }
});

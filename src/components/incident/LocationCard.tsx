import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../../theme';
import { LocationData } from '../../types/incident';

interface Props {
  location: LocationData | null;
  loading: boolean;
  error?: string | null;
  onGetLocation: () => void;
}

export const LocationCard = ({ location, loading, error, onGetLocation }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Location Details</Text>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={24} color={AppTheme.colors.warning} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={[styles.card, error && styles.cardWithError]}>
        <View style={styles.infoRow}>
          <Ionicons 
            name="location-outline" 
            size={24} 
            color={location ? AppTheme.colors.success : AppTheme.colors.textSecondary} 
          />
          <View style={styles.textContainer}>
            {location ? (
              <>
                <Text style={styles.titleSuccess}>Location Captured</Text>
                <Text style={styles.coords}>
                  Lat: {location.latitude.toFixed(5)}{'\n'}Lng: {location.longitude.toFixed(5)}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.title}>Current Location</Text>
                <Text style={styles.status}>Not recorded yet</Text>
              </>
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={onGetLocation}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color={AppTheme.colors.primary} />
          ) : (
            <Text style={styles.actionBtnText}>
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
    color: AppTheme.colors.header,
    marginBottom: AppTheme.spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDE7', // very light background for warning contrast
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
    backgroundColor: AppTheme.colors.background,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: '#E0E1E6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardWithError: {
    borderColor: AppTheme.colors.warning,
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
    color: AppTheme.colors.header,
  },
  titleSuccess: {
    ...AppTheme.typography.body,
    fontWeight: AppTheme.fontWeights.bold,
    color: AppTheme.colors.success,
  },
  status: {
    ...AppTheme.typography.bodySmall,
    color: AppTheme.colors.textSecondary, // Uses Slate Gray as requested
    marginTop: 2,
  },
  coords: {
    ...AppTheme.typography.bodySmall,
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  actionBtn: {
    paddingVertical: AppTheme.spacing.sm,
    paddingHorizontal: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.selected,
    borderRadius: AppTheme.borderRadius.md,
    marginLeft: AppTheme.spacing.sm,
  },
  actionBtnText: {
    ...AppTheme.typography.bodySmall,
    color: AppTheme.colors.primary,
    fontWeight: AppTheme.fontWeights.semibold,
  }
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../../theme';
import { LocationData } from '../../types/incident';

interface Props {
  location: LocationData | null;
  loading: boolean;
  onGetLocation: () => void;
}

export const LocationCard = ({ location, loading, onGetLocation }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Location Details</Text>
      
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Ionicons 
            name="location-outline" 
            size={24} 
            color={location ? AppTheme.colors.success : AppTheme.colors.textSecondary} 
          />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Current Location</Text>
            {location ? (
              <Text style={styles.coords}>
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </Text>
            ) : (
              <Text style={styles.status}>Not recorded yet</Text>
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
              {location ? 'Update' : 'Get Location'}
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
  status: {
    ...AppTheme.typography.bodySmall,
    color: AppTheme.colors.warning,
    marginTop: 2,
  },
  coords: {
    ...AppTheme.typography.bodySmall,
    color: AppTheme.colors.success,
    marginTop: 2,
  },
  actionBtn: {
    paddingVertical: AppTheme.spacing.sm,
    paddingHorizontal: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.selected,
    borderRadius: AppTheme.borderRadius.md,
  },
  actionBtnText: {
    ...AppTheme.typography.bodySmall,
    color: AppTheme.colors.primary,
    fontWeight: AppTheme.fontWeights.semibold,
  }
});

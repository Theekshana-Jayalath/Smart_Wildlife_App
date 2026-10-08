import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { INCIDENT_TYPES } from '../../constants/incidents';
import { IncidentType } from '../../types/incident';
import { AppTheme } from '../../theme';

interface Props {
  selectedType: IncidentType | null;
  onSelect: (type: IncidentType) => void;
}

export const IncidentTypeSelect = ({ selectedType, onSelect }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Incident Type <Text style={styles.required}>*</Text></Text>
      <View style={styles.grid}>
        {INCIDENT_TYPES.map((type) => {
          const isSelected = selectedType === type.id;
          return (
            <TouchableOpacity
              key={type.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => onSelect(type.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={isSelected ? AppTheme.colors.primary : AppTheme.colors.textSecondary}
                />
              </View>
              <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
    marginBottom: AppTheme.spacing.md,
  },
  required: {
    color: AppTheme.colors.danger,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppTheme.spacing.sm,
  },
  card: {
    width: '48%',
    backgroundColor: AppTheme.colors.background,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: '#E0E1E6', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSelected: {
    borderColor: AppTheme.colors.primary,
    backgroundColor: AppTheme.colors.selected,
  },
  iconContainer: {
    marginBottom: AppTheme.spacing.sm,
  },
  iconContainerSelected: {
  },
  cardLabel: {
    ...AppTheme.typography.bodySmall,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: AppTheme.colors.primary,
    fontWeight: AppTheme.fontWeights.semibold,
  },
});

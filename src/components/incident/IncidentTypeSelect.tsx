import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { INCIDENT_TYPES } from '../../constants/incidents';
import { IncidentType } from '../../types/incident';
import { AppTheme } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  selectedType: IncidentType | null;
  onSelect: (type: IncidentType) => void;
}

export const IncidentTypeSelect = ({ selectedType, onSelect }: Props) => {
  const { theme, isDarkMode } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textPrimary }]}>
        Incident Type <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.grid}>
        {INCIDENT_TYPES.map((type) => {
          const isSelected = selectedType === type.id;
          return (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.card,
                {
                  backgroundColor: isSelected
                    ? isDarkMode ? '#1E3A8A' : AppTheme.colors.selected
                    : theme.cardBg,
                  borderColor: isSelected ? theme.primary : theme.inputBorder,
                },
              ]}
              onPress={() => onSelect(type.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={isSelected ? theme.primary : theme.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.cardLabel,
                  {
                    color: isSelected ? theme.primary : theme.textSecondary,
                    fontWeight: isSelected ? '700' : '400',
                  },
                ]}
              >
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
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: AppTheme.spacing.sm,
  },
  cardLabel: {
    ...AppTheme.typography.bodySmall,
    textAlign: 'center',
  },
});

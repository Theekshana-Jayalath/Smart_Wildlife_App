import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../../theme';

export default function RangerDashboard() {
  const handleReportIncident = () => {
    router.push('/(ranger)/incident');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Ranger Dashboard</Text>
          <Text style={styles.welcomeSubtitle}>Stay alert, stay safe.</Text>
        </View>

        {/* Main Action Card */}
        <TouchableOpacity 
          style={styles.actionCard} 
          activeOpacity={0.8}
          onPress={handleReportIncident}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="warning-outline" size={32} color={AppTheme.colors.background} />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Report Wildlife Incident</Text>
            <Text style={styles.actionDescription}>
              Report wildlife, poaching or other suspicious incidents encountered during patrol.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Recent Incidents Section */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Incidents</Text>
          
          <View style={styles.emptyStateContainer}>
            <Ionicons name="document-text-outline" size={48} color={AppTheme.colors.textSecondary} />
            <Text style={styles.emptyStateText}>No incidents reported yet</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: AppTheme.spacing.md,
  },
  welcomeSection: {
    marginBottom: AppTheme.spacing.lg,
    marginTop: AppTheme.spacing.md,
  },
  welcomeTitle: {
    ...AppTheme.typography.h2,
    color: AppTheme.colors.header,
    marginBottom: AppTheme.spacing.xs,
  },
  welcomeSubtitle: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textSecondary,
  },
  actionCard: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: AppTheme.borderRadius.lg,
    padding: AppTheme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.xl,
    ...AppTheme.shadows.md,
  },
  actionIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: AppTheme.spacing.sm,
    borderRadius: AppTheme.borderRadius.pill,
    marginRight: AppTheme.spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    ...AppTheme.typography.h3,
    color: AppTheme.colors.background,
    marginBottom: AppTheme.spacing.xs,
  },
  actionDescription: {
    ...AppTheme.typography.bodySmall,
    color: AppTheme.colors.background,
    opacity: 0.9,
  },
  recentSection: {
    flex: 1,
  },
  sectionTitle: {
    ...AppTheme.typography.h3,
    color: AppTheme.colors.header,
    marginBottom: AppTheme.spacing.md,
  },
  emptyStateContainer: {
    padding: AppTheme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.selected,
    borderRadius: AppTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.textSecondary,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textSecondary,
    marginTop: AppTheme.spacing.sm,
    fontWeight: AppTheme.fontWeights.medium,
  },
});

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../../theme';
import { auth } from '../../services/firebase';
import { signOut } from 'firebase/auth';
import { useTheme } from '../../context/ThemeContext';
import { IncidentService } from '../../services/incidentService';
import { IncidentRecord } from '../../types/incident';

const bannerImage = require('../../assets/banner.jpg');

export default function RangerDashboard() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('Ranger');
  const [recentIncidents, setRecentIncidents] = useState<IncidentRecord[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState<boolean>(true);
  const { isDarkMode, toggleTheme, theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      const user = auth.currentUser;
      if (!user) {
        setLoadingIncidents(false);
        return;
      }

      setPhotoUrl(user.photoURL);
      setDisplayName(user.displayName || 'Ranger');
      setLoadingIncidents(true);

      // 1. First fetch directly
      IncidentService.getIncidentsByRanger(user.uid)
        .then((list) => {
          setRecentIncidents(list);
        })
        .catch((err) => {
          console.error("Error loading ranger incidents:", err);
        })
        .finally(() => {
          setLoadingIncidents(false);
        });
    }, [])
  );

  const handleReportIncident = () => {
    router.push('/(ranger)/incident');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? theme.header : AppTheme.colors.header }]} edges={['top', 'left', 'right']}>
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
        
        {/* Cover Header Banner */}
        <View style={styles.bannerContainer}>
          <Image source={bannerImage} style={styles.bannerImage} resizeMode="cover" />
          <View style={styles.bannerOverlay}>
            <View style={styles.bannerHeaderRow}>
              <View style={styles.bannerBrandContainer}>
                <View style={styles.shieldIconContainer}>
                  <Ionicons name="shield-checkmark" size={22} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.bannerTitle}>Wildlife Ranger</Text>
                  <Text style={styles.bannerSubtitle}>Conservation & Protection</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {/* Dark Mode Toggle Button */}
                <TouchableOpacity 
                  style={styles.darkToggleBtn} 
                  onPress={toggleTheme}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name={isDarkMode ? "sunny" : "moon"} 
                    size={20} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>

                {/* Logout Button */}
                <TouchableOpacity 
                  style={styles.darkToggleBtn} 
                  onPress={async () => {
                    await signOut(auth);
                    router.replace('/');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name="log-out-outline" 
                    size={20} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.contentBody}>

          {/* Welcome Bar */}
          <View style={styles.welcomeBar}>
            <View style={styles.welcomeTextGroup}>
              <Text style={[styles.welcomeTitle, { color: theme.textPrimary }]}>
                Welcome back, {displayName} 👋
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>Stay alert, stay safe.</Text>
            </View>

            {/* Profile Avatar */}
            <TouchableOpacity 
              style={styles.avatarWrapper} 
              onPress={() => router.navigate('/(ranger)/profile')}
              activeOpacity={0.8}
            >
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: isDarkMode ? '#334155' : '#E3F2FD' }]}>
                  <Ionicons name="person" size={24} color={isDarkMode ? '#94A3B8' : '#546E7A'} />
                </View>
              )}
              <Text style={[styles.avatarLabel, { color: theme.textSecondary }]}>Ranger</Text>
            </TouchableOpacity>
          </View>

          {/* Action Card */}
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: theme.primary }]} 
            activeOpacity={0.85}
            onPress={handleReportIncident}
          >
            <View style={styles.actionIconBadge}>
              <Ionicons name="warning-outline" size={26} color="#FFFFFF" />
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Report Wildlife Incident</Text>
              <Text style={styles.actionDescription}>
                Report wildlife, poaching or other suspicious incidents encountered during patrol.
              </Text>
            </View>

            <View style={styles.arrowBadge}>
              <Ionicons name="arrow-forward" size={18} color={theme.primary} />
            </View>
          </TouchableOpacity>

          {/* Recent Incidents Section */}
          <View style={styles.recentSection}>
            <View style={styles.recentHeaderRow}>
              <View style={styles.recentTitleGroup}>
                <Ionicons name="document-text" size={20} color={theme.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.recentSectionTitle, { color: theme.textPrimary }]}>Recent Incidents</Text>
              </View>
              <TouchableOpacity style={styles.viewAllBtn}>
                <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
                <Ionicons name="arrow-forward" size={14} color={theme.primary} style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>

            {/* Recent Incidents List or Empty State */}
            {recentIncidents.length > 0 ? (
              <View style={styles.recentCardsList}>
                {recentIncidents.slice(0, 3).map((item) => (
                  <View 
                    key={item.id} 
                    style={[styles.incidentCard, { backgroundColor: theme.cardBg, borderColor: isDarkMode ? '#334155' : '#E2E8F0' }]}
                  >
                    <View style={styles.incidentCardHeader}>
                      <View style={styles.incidentTypeBadge}>
                        <Ionicons name="alert-circle" size={14} color={theme.primary} />
                        <Text style={[styles.incidentTypeBadgeText, { color: theme.primary }]}>
                          {item.incidentType?.toUpperCase()}
                        </Text>
                      </View>
                      <View style={[
                        styles.incidentStatusPill, 
                        { backgroundColor: item.status === 'RESOLVED' ? '#DCFCE7' : item.status === 'ACTION_TAKEN' ? '#EDE9FE' : '#FEF3C7' }
                      ]}>
                        <Text style={[
                          styles.incidentStatusPillText,
                          { color: item.status === 'RESOLVED' ? '#15803D' : item.status === 'ACTION_TAKEN' ? '#6D28D9' : '#B45309' }
                        ]}>
                          {item.status || 'SUBMITTED'}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.incidentCardDesc, { color: theme.textPrimary }]} numberOfLines={2}>
                      {item.description}
                    </Text>

                    <View style={styles.incidentCardFooter}>
                      <View style={styles.incidentCoordGroup}>
                        <Ionicons name="location-outline" size={13} color={theme.textSecondary} />
                        <Text style={[styles.incidentCoordText, { color: theme.textSecondary }]}>
                          {Number(item.latitude).toFixed(3)}, {Number(item.longitude).toFixed(3)}
                        </Text>
                      </View>
                      {item.photoUrl && (
                        <View style={styles.hasPhotoTag}>
                          <Ionicons name="image-outline" size={12} color="#059669" />
                          <Text style={styles.hasPhotoText}>Photo attached</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              /* Empty State Box */
              <View style={[styles.emptyCard, { backgroundColor: theme.emptyCardBg, borderColor: isDarkMode ? '#334155' : '#B0BEC5' }]}>
                <View style={[styles.emptyIconBg, { backgroundColor: isDarkMode ? '#334155' : '#E3F2FD' }]}>
                  <Ionicons name="document-text-outline" size={32} color={isDarkMode ? '#94A3B8' : '#546E7A'} />
                </View>
                <Text style={[styles.emptyStateTitle, { color: theme.textPrimary }]}>No incidents reported yet</Text>
                <Text style={[styles.emptyStateSubtitle, { color: theme.textSecondary }]}>
                  Once you report an incident, it will appear here for easy tracking and management.
                </Text>
              </View>
            )}
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  bannerContainer: {
    height: 105,
    width: '100%',
    position: 'relative',
    backgroundColor: AppTheme.colors.header,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.92,
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: AppTheme.spacing.md,
    paddingBottom: 10,
    paddingTop: 8,
    backgroundColor: 'rgba(13, 71, 161, 0.45)',
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },
  darkToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentBody: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingTop: 12,
    paddingBottom: AppTheme.spacing.lg,
  },
  welcomeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  welcomeTextGroup: {
    flex: 1,
    marginRight: 8,
  },
  welcomeTitle: {
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 24,
  },
  welcomeSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  avatarWrapper: {
    alignItems: 'center',
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#E3F2FD',
  },
  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  actionCard: {
    borderRadius: 14,
    padding: AppTheme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  actionIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 12,
  },
  actionTextContainer: {
    flex: 1,
    marginRight: 6,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 15,
  },
  arrowBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentSection: {
    marginTop: 2,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  recentTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    paddingVertical: AppTheme.spacing.lg,
    paddingHorizontal: AppTheme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 17,
  },
  recentCardsList: {
    gap: 10,
  },
  incidentCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  incidentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  incidentTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  incidentTypeBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  incidentStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  incidentStatusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  incidentCardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  incidentCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incidentCoordGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  incidentCoordText: {
    fontSize: 11.5,
  },
  hasPhotoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  hasPhotoText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
});

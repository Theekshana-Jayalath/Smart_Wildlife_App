import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { IncidentAlert, subscribeToIncidents } from '../../services/incidentService';

// Using exact colors from the Reports screen for consistency!
const bannerImage = require('../../assets/banner.jpg');

const COLORS = {
  primary: '#1565C0',
  darkBlue: '#0D47A1',
  lightBlue: '#E3F2FD',
  white: '#FFFFFF',
  slate: '#546E7A',
  red: '#D32F2F',
  green: '#2E7D32',
  yellow: '#F57F17',
  border: '#D9E5EF',
};

export default function MonitorScreen() {
  const [activeTab, setActiveTab] = useState('animals');
  const [broadcastingIds, setBroadcastingIds] = React.useState<Record<string, boolean>>({});
  const [broadcastedIds, setBroadcastedIds] = React.useState<Record<string, boolean>>({});
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [incidents, setIncidents] = React.useState<IncidentAlert[]>([]);
  
  React.useEffect(() => {
    return subscribeToIncidents(setIncidents);
  }, []);

  const handleBroadcastSMS = (alertId: string, zoneName: string) => {
    setBroadcastingIds(prev => ({...prev, [alertId]: true}));
    setTimeout(() => {
      setBroadcastingIds(prev => ({...prev, [alertId]: false}));
      setBroadcastedIds(prev => ({...prev, [alertId]: true}));
      Alert.alert(
        "Twilio Gateway Success", 
        "\u2705 Broadcast complete!\n\nWarning SMS successfully sent to registered villagers in " + zoneName + " zone."
      );
    }, 2000);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Banner Image matching Manage screen */}
        <View style={styles.bannerContainer}>
          <Image source={bannerImage} style={styles.bannerImage} resizeMode="cover" />
          <View style={styles.bannerOverlay}>
            <View style={styles.headerIcon}>
              <Ionicons name="map-outline" size={26} color={COLORS.white} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.headerEyebrow}>LIVE TRACKING � MANAGER</Text>
              <Text style={styles.headerTitle}>System Monitor</Text>
              <Text style={styles.headerSubtitle}>View real-time locations and alerts</Text>
            </View>
            <TouchableOpacity style={styles.darkToggleBtn} onPress={toggleTheme} activeOpacity={0.8}>
              <Ionicons name={isDarkMode ? "sunny" : "moon"} size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Switcher matching the flat styling */}
        <View style={[styles.filterSection, { backgroundColor: theme.cardBg, borderWidth: 1, borderColor: theme.border }]}>
          <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Monitor target</Text>
          <View style={styles.periodOptions}>
            <TouchableOpacity
              onPress={() => setActiveTab('rangers')}
              style={[styles.periodOption, activeTab === 'rangers' && styles.periodOptionSelected]}
              activeOpacity={0.8}
            >
              <Text style={[styles.periodText, activeTab === 'rangers' && styles.periodTextSelected]}>Rangers</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveTab('animals')}
              style={[styles.periodOption, activeTab === 'animals' && styles.periodOptionSelected]}
              activeOpacity={0.8}
            >
              <Text style={[styles.periodText, activeTab === 'animals' && styles.periodTextSelected]}>Animals</Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === 'rangers' ? (
          <View style={[styles.stateCard, { backgroundColor: theme.cardBg, borderWidth: 1, borderColor: theme.border }]}>
            <View style={styles.stateIcon}>
              <Ionicons name="people-outline" size={25} color={COLORS.slate} />
            </View>
            <Text style={[styles.stateTitle, { color: theme.textPrimary }]}>Ranger Tracking</Text>
            <Text style={styles.stateText}>Live ranger tracking map will appear here.</Text>
          </View>
        ) : (
          <View style={{ paddingBottom: 30 }}>
            
            <View style={styles.resultHeading}>
              <View style={styles.resultHeadingText}>
                <Text style={[styles.resultTitle, { color: theme.textPrimary }]}>Live Alerts Inbox</Text>
                <Text style={styles.resultRange}>Showing high-risk notifications</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(manager)/all-alerts')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            
            {incidents.length === 0 ? (
              <View style={[styles.stateCard, { backgroundColor: theme.cardBg }]}>
                <Ionicons name="checkmark-circle-outline" size={40} color={theme.primary} />
                <Text style={{color: theme.textSecondary, marginTop: 10}}>No active alerts today.</Text>
              </View>
            ) : incidents.map(alert => (
              <View key={alert.id} style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderWidth: 1, borderColor: theme.border, borderLeftColor: COLORS.red, borderLeftWidth: 4 }]}>
                <View style={styles.alertHeader}>
                  <Ionicons name="warning" size={20} color={COLORS.red} />
                  <Text style={[styles.cardTitle, { color: COLORS.red, marginLeft: 8 }]}>SYSTEM WARNING: {alert.species.toUpperCase()}</Text>
                </View>
                <Text style={[styles.alertDesc, { color: theme.textPrimary }]}>{alert.animalName} breached {alert.zoneName}!</Text>
                
                <Text style={styles.alertTime}>{alert.time}</Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/(manager)/assign')}>
                    <Text style={styles.btnPrimaryText}>Assign Patrol</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                      style={[styles.btnSecondary, broadcastedIds[alert.id] && { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' }]} 
                      onPress={() => handleBroadcastSMS(alert.id, alert.zoneName)} 
                      disabled={broadcastingIds[alert.id] || broadcastedIds[alert.id]}
                    >
                      {broadcastingIds[alert.id] ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                      ) : broadcastedIds[alert.id] ? (
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Ionicons name="checkmark-circle" size={16} color="#2E7D32" style={{marginRight: 4}} />
                          <Text style={[styles.btnSecondaryText, { color: '#2E7D32' }]}>Sent</Text>
                        </View>
                      ) : (
                        <Text style={styles.btnSecondaryText}>Broadcast SMS</Text>
                      )}
                    </TouchableOpacity>
                </View>
              </View>
            ))}
</View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 30 },
  
  bannerContainer: { width: '100%', height: 160, borderRadius: 16, overflow: 'hidden', marginBottom: 20, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  bannerImage: { width: '100%', height: '100%', position: 'absolute' },
  bannerOverlay: { flex: 1, backgroundColor: 'rgba(13, 71, 161, 0.75)', padding: 18, flexDirection: 'row', alignItems: 'center' },
  
  darkToggleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  headerCopy: { flex: 1, justifyContent: 'center' },
  headerEyebrow: { color: '#BBDEFB', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  headerTitle: { color: COLORS.white, fontSize: 24, fontWeight: '800', marginTop: 4, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  headerSubtitle: { color: '#E3F2FD', fontSize: 13, marginTop: 4, fontWeight: '500' },
  
  filterSection: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 15, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  fieldLabel: { fontSize: 14, fontWeight: '700', marginBottom: 9, color: '#000' },
  periodOptions: { flexDirection: 'row', gap: 8 },
  periodOption: { flex: 1, minHeight: 39, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F8FB', borderWidth: 1, borderColor: COLORS.border },
  periodOptionSelected: { backgroundColor: COLORS.lightBlue, borderColor: COLORS.primary },
  periodText: { color: COLORS.slate, fontSize: 12, fontWeight: '600' },
  periodTextSelected: { color: COLORS.darkBlue },

  stateCard: { minHeight: 190, alignItems: 'center', justifyContent: 'center', padding: 22, borderRadius: 12, backgroundColor: '#FFFFFF', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  stateIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.lightBlue, alignItems: 'center', justifyContent: 'center', marginBottom: 11 },
  stateTitle: { fontSize: 15, fontWeight: '700', textAlign: 'center', color: '#000' },
  stateText: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 5, color: COLORS.slate },

  resultHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, marginBottom: 5 },
  resultHeadingText: { flex: 1 },
  resultTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  resultRange: { fontSize: 11, marginTop: 3, color: COLORS.slate },
  viewAllText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },

  sectionCard: { borderRadius: 12, padding: 16, marginBottom: 14, backgroundColor: '#FFFFFF', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  alertDesc: { fontSize: 13, color: '#333', marginBottom: 12, lineHeight: 20 },
  alertTime: { fontSize: 11, color: COLORS.slate, marginBottom: 15 },
  
  actionRow: { flexDirection: 'row', gap: 8 },
  btnPrimary: { flex: 1, minHeight: 40, borderRadius: 6, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  btnSecondary: { flex: 1, minHeight: 40, borderRadius: 6, backgroundColor: '#F5F8FB', borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  btnSecondaryText: { color: COLORS.darkBlue, fontSize: 13, fontWeight: '700' },
});










import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { IncidentRecord, IncidentStatus } from '../../types/incident';
import { IncidentService } from '../../services/incidentService';

export default function ManagerReportsScreen() {
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'RANGER' | 'COMMUNITY'>('ALL');

  // Modal State for Action
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchIncidents = useCallback(async () => {
    try {
      const records = await IncidentService.getIncidents();
      setIncidents(records);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch incident reports.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchIncidents();
  };

  const filteredIncidents = incidents.filter((item) => {
    if (filter === 'ALL') return true;
    if (filter === 'COMMUNITY') {
      return item.reporterType === 'COMMUNITY' || !item.rangerId;
    }
    if (filter === 'RANGER') {
      return item.reporterType === 'RANGER' || (item.rangerId && item.reporterType !== 'COMMUNITY');
    }
    return true;
  });

  const handleOpenActionModal = (item: IncidentRecord) => {
    setSelectedIncident(item);
    setActionNotes(item.actionTakenNotes || '');
  };

  const handleUpdateStatus = async (newStatus: IncidentStatus) => {
    if (!selectedIncident) return;
    setUpdatingStatus(true);
    try {
      await IncidentService.updateIncidentStatus(
        selectedIncident.id,
        newStatus,
        actionNotes.trim() || undefined
      );

      // Update local state
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === selectedIncident.id
            ? {
                ...inc,
                status: newStatus,
                actionTakenNotes: actionNotes.trim() || inc.actionTakenNotes,
              }
            : inc
        )
      );

      Alert.alert('Success', `Incident status updated to ${newStatus}`);
      setSelectedIncident(null);
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadgeColor = (status: IncidentStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return { bg: '#FEF3C7', text: '#B45309' };
      case 'UNDER_REVIEW':
        return { bg: '#E0F2FE', text: '#0369A1' };
      case 'ACTION_TAKEN':
        return { bg: '#EDE9FE', text: '#6D28D9' };
      case 'RESOLVED':
        return { bg: '#DCFCE7', text: '#15803D' };
      case 'DISMISSED':
        return { bg: '#F1F5F9', text: '#64748B' };
      default:
        return { bg: '#E2E8F0', text: '#334155' };
    }
  };

  const renderIncidentCard = ({ item }: { item: IncidentRecord }) => {
    const isCommunity = item.reporterType === 'COMMUNITY' || !item.rangerId;
    const statusColors = getStatusBadgeColor(item.status);

    const formattedDate = item.createdAt?.seconds
      ? new Date(item.createdAt.seconds * 1000).toLocaleString()
      : 'Just now';

    return (
      <View style={styles.card}>
        {/* Top Badges: Reporter Type & Status */}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.reporterBadge,
              isCommunity ? styles.communityBadge : styles.rangerBadge,
            ]}
          >
            <Ionicons
              name={isCommunity ? 'people' : 'shield-checkmark'}
              size={14}
              color={isCommunity ? '#9A3412' : '#047857'}
            />
            <Text
              style={[
                styles.reporterBadgeText,
                { color: isCommunity ? '#9A3412' : '#047857' },
              ]}
            >
              {isCommunity ? 'Villager / Community' : 'Ranger Patrol'}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
              {item.status || 'SUBMITTED'}
            </Text>
          </View>
        </View>

        {/* Incident Type & Title */}
        <View style={styles.typeRow}>
          <Text style={styles.typeText}>{item.incidentType?.toUpperCase()}</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        {/* Reporter Extra details if Villager */}
        {isCommunity && (item.villagerName || item.villagerContact) && (
          <View style={styles.villagerInfoBox}>
            <Ionicons name="person-outline" size={14} color="#64748B" />
            <Text style={styles.villagerInfoText}>
              Reported by: <Text style={{ fontWeight: '600' }}>{item.villagerName || 'Villager'}</Text>
              {item.villagerContact ? ` (${item.villagerContact})` : ''}
            </Text>
          </View>
        )}

        {/* Description */}
        <Text style={styles.descriptionText} numberOfLines={3}>
          {item.description}
        </Text>

        {/* Photo thumbnail if present */}
        {item.photoUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.photoUrl }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Location Coordinates */}
        <View style={styles.coordsRow}>
          <Ionicons name="location-sharp" size={14} color="#64748B" />
          <Text style={styles.coordsText}>
            Lat: {Number(item.latitude).toFixed(4)}, Long: {Number(item.longitude).toFixed(4)}
          </Text>
        </View>

        {/* Existing Action Taken Notes if any */}
        {item.actionTakenNotes && (
          <View style={styles.actionNotesPreview}>
            <Text style={styles.actionNotesLabel}>Action Notes:</Text>
            <Text style={styles.actionNotesContent}>{item.actionTakenNotes}</Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => handleOpenActionModal(item)}
        >
          <Ionicons name="create-outline" size={16} color="#059669" />
          <Text style={styles.manageButtonText}>Manage / Take Action</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'ALL' && styles.filterTabActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterTabText, filter === 'ALL' && styles.filterTabTextActive]}>
            All ({incidents.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'COMMUNITY' && styles.filterTabActive]}
          onPress={() => setFilter('COMMUNITY')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'COMMUNITY' && styles.filterTabTextActive,
            ]}
          >
            Villagers ({incidents.filter((i) => i.reporterType === 'COMMUNITY' || !i.rangerId).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'RANGER' && styles.filterTabActive]}
          onPress={() => setFilter('RANGER')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'RANGER' && styles.filterTabTextActive,
            ]}
          >
            Rangers ({incidents.filter((i) => i.reporterType === 'RANGER' || (i.rangerId && i.reporterType !== 'COMMUNITY')).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Loading Incident Reports...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredIncidents}
          keyExtractor={(item) => item.id}
          renderItem={renderIncidentCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#059669']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="file-tray-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No incidents found</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'ALL'
                  ? 'No reports have been submitted yet.'
                  : `No ${filter.toLowerCase()} reports found.`}
              </Text>
            </View>
          }
        />
      )}

      {/* Action / Status Modal */}
      <Modal
        visible={!!selectedIncident}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedIncident(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Incident Report</Text>
              <TouchableOpacity onPress={() => setSelectedIncident(null)}>
                <Ionicons name="close-circle" size={26} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalIncidentInfo}>
              Type: <Text style={{ fontWeight: '700' }}>{selectedIncident?.incidentType}</Text> | From:{' '}
              <Text style={{ fontWeight: '700' }}>
                {selectedIncident?.reporterType === 'COMMUNITY' || !selectedIncident?.rangerId
                  ? 'Villager'
                  : 'Ranger'}
              </Text>
            </Text>

            <Text style={styles.modalLabel}>Action / Resolution Notes:</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="e.g. Dispatched Patrol Team A to secure wire snare..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={actionNotes}
              onChangeText={setActionNotes}
            />

            <Text style={styles.modalLabel}>Update Status:</Text>
            {updatingStatus ? (
              <ActivityIndicator size="small" color="#059669" style={{ marginVertical: 15 }} />
            ) : (
              <View style={styles.statusActionGrid}>
                <TouchableOpacity
                  style={[styles.statusButton, { backgroundColor: '#E0F2FE' }]}
                  onPress={() => handleUpdateStatus('UNDER_REVIEW')}
                >
                  <Text style={[styles.statusButtonText, { color: '#0369A1' }]}>Under Review</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statusButton, { backgroundColor: '#EDE9FE' }]}
                  onPress={() => handleUpdateStatus('ACTION_TAKEN')}
                >
                  <Text style={[styles.statusButtonText, { color: '#6D28D9' }]}>Assign / Take Action</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statusButton, { backgroundColor: '#DCFCE7' }]}
                  onPress={() => handleUpdateStatus('RESOLVED')}
                >
                  <Text style={[styles.statusButtonText, { color: '#15803D' }]}>Mark Resolved</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statusButton, { backgroundColor: '#FEE2E2' }]}
                  onPress={() => handleUpdateStatus('DISMISSED')}
                >
                  <Text style={[styles.statusButtonText, { color: '#B91C1C' }]}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterTabActive: {
    backgroundColor: '#059669',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reporterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  rangerBadge: {
    backgroundColor: '#D1FAE5',
  },
  communityBadge: {
    backgroundColor: '#FFEDD5',
  },
  reporterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  typeText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  villagerInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  villagerInfoText: {
    fontSize: 12,
    color: '#9A3412',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
    marginBottom: 12,
  },
  imageContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  coordsText: {
    fontSize: 12,
    color: '#64748B',
  },
  actionNotesPreview: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  actionNotesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 2,
  },
  actionNotesContent: {
    fontSize: 12,
    color: '#334155',
  },
  manageButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
    gap: 6,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalIncidentInfo: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  statusActionGrid: {
    gap: 10,
  },
  statusButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

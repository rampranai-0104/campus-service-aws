import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { NetworkStatusBar } from '../../components/NetworkStatusBar';
import { KeycardModal } from '../../components/KeycardModal';
import { CampusColors } from '../../constants/theme';
import { Booking } from '../../types';

type FilterTab = 'ALL' | 'UPCOMING' | 'PAST' | 'CANCELLED';

export default function BookingsScreen() {
  const { myBookings, cancelBooking, refreshData, isLoadingData, isOnline } = useApp();

  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedKeycardBooking, setSelectedKeycardBooking] = useState<Booking | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleCancel = (booking: Booking) => {
    const isOfflineItem = booking.syncState === 'PENDING_SYNC';
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your reservation for ${booking.roomName || 'this room'} on ${booking.date}?`,
      [
        { text: 'Keep Reservation', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(booking.id);
            try {
              const res = await cancelBooking(booking.id);
              if (res.success) {
                Alert.alert(
                  'Booking Cancelled',
                  res.isOffline
                    ? 'Cancellation queued locally. It will sync with the university server when reconnected.'
                    : 'Your booking has been cancelled successfully.'
                );
              } else {
                Alert.alert('Cancellation Error', res.error || 'Failed to cancel reservation.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel reservation.');
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = useMemo(() => {
    return myBookings
      .filter((b) => {
        if (activeTab === 'UPCOMING') {
          return (
            (b.status === 'CONFIRMED' || b.status === 'PENDING' || b.syncState === 'PENDING_SYNC') &&
            b.date >= todayStr
          );
        }
        if (activeTab === 'PAST') {
          return b.date < todayStr && b.status !== 'CANCELLED';
        }
        if (activeTab === 'CANCELLED') {
          return b.status === 'CANCELLED' || b.status === 'REJECTED';
        }
        return true;
      })
      .sort((a, b) => new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime());
  }, [myBookings, activeTab, todayStr]);

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const isPendingSync = item.syncState === 'PENDING_SYNC';
    const isConfirmed = item.status === 'CONFIRMED' && !isPendingSync;
    const isPending = item.status === 'PENDING' && !isPendingSync;
    const isCancelled = item.status === 'CANCELLED' || item.status === 'REJECTED';
    const isBusyCancelling = cancellingId === item.id;

    return (
      <View
        style={[
          styles.card,
          isPendingSync && styles.cardPendingSync,
          isCancelled && styles.cardCancelled,
        ]}>
        {/* Top Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.roomName}>{item.roomName || `Room #${item.roomId}`}</Text>
            <Text style={styles.purposeText} numberOfLines={2}>
              {item.purpose || 'Campus Space Booking'}
            </Text>
          </View>

          {/* Status Badge */}
          {isPendingSync ? (
            <View style={styles.pendingSyncBadge}>
              <MaterialIcons name="cloud-queue" size={12} color="#b45309" />
              <Text style={styles.pendingSyncText}>Pending Sync</Text>
            </View>
          ) : (
            <View
              style={[
                styles.statusBadge,
                isConfirmed && styles.statusBadgeConfirmed,
                isPending && styles.statusBadgePending,
                isCancelled && styles.statusBadgeCancelled,
              ]}>
              <Text
                style={[
                  styles.statusBadgeText,
                  isConfirmed && styles.statusTextConfirmed,
                  isPending && styles.statusTextPending,
                  isCancelled && styles.statusTextCancelled,
                ]}>
                {item.status}
              </Text>
            </View>
          )}
        </View>

        {/* Offline Warning Notice */}
        {isPendingSync && (
          <View style={styles.offlineNoticeBanner}>
            <MaterialIcons name="info-outline" size={14} color="#b45309" />
            <Text style={styles.offlineNoticeText}>
              Stored offline. Server validation will verify space availability when online.
            </Text>
          </View>
        )}

        {/* Info Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <MaterialIcons name="calendar-today" size={14} color={CampusColors.textSecondary} />
            <Text style={styles.detailText}>{item.date}</Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialIcons name="schedule" size={14} color={CampusColors.textSecondary} />
            <Text style={styles.detailText}>
              {item.startTime} - {item.endTime}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialIcons name="people" size={14} color={CampusColors.textSecondary} />
            <Text style={styles.detailText}>{item.userRole || 'User'}</Text>
          </View>
        </View>

        {/* Card Actions */}
        <View style={styles.cardActions}>
          {isConfirmed && (
            <TouchableOpacity
              style={styles.keycardBtn}
              onPress={() => setSelectedKeycardBooking(item)}
              activeOpacity={0.8}>
              <MaterialIcons name="vpn-key" size={16} color={CampusColors.primary} />
              <Text style={styles.keycardBtnText}>Access Pass</Text>
            </TouchableOpacity>
          )}

          {!isCancelled && (
            <TouchableOpacity
              style={[styles.cancelBtn, isBusyCancelling && styles.cancelBtnDisabled]}
              onPress={() => handleCancel(item)}
              disabled={isBusyCancelling}
              activeOpacity={0.8}>
              <MaterialIcons
                name="cancel"
                size={16}
                color={isBusyCancelling ? CampusColors.textMuted : CampusColors.danger}
              />
              <Text
                style={[
                  styles.cancelBtnText,
                  isBusyCancelling && styles.cancelBtnTextDisabled,
                ]}>
                {isBusyCancelling ? 'Cancelling...' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NetworkStatusBar />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSubtitle}>
            Track scheduled reservations, approval status, and digital door PINs
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabsContainer}>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'UPCOMING', label: 'Upcoming' },
            { id: 'PAST', label: 'Past' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.id as FilterTab)}>
                <Text style={[styles.tabButtonText, isSelected && styles.tabButtonTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bookings List */}
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderBookingCard}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isLoadingData}
              onRefresh={handleRefresh}
              colors={[CampusColors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-busy" size={48} color={CampusColors.textMuted} />
              <Text style={styles.emptyTitle}>No bookings found</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'UPCOMING'
                  ? "You don't have any upcoming room reservations."
                  : activeTab === 'PAST'
                  ? 'No past reservations on record.'
                  : activeTab === 'CANCELLED'
                  ? 'No cancelled reservations.'
                  : "You haven't made any room reservations yet."}
              </Text>
            </View>
          }
        />
      </View>

      {/* Access Pass / Keycard PIN Modal */}
      <KeycardModal
        visible={!!selectedKeycardBooking}
        booking={selectedKeycardBooking}
        onClose={() => setSelectedKeycardBooking(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: CampusColors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: CampusColors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: CampusColors.textSecondary,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: CampusColors.border,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: CampusColors.primary,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: CampusColors.textSecondary,
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CampusColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardPendingSync: {
    borderColor: '#f59e0b',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    backgroundColor: '#fffdfa',
  },
  cardCancelled: {
    opacity: 0.7,
    backgroundColor: '#f8fafc',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  roomName: {
    fontSize: 17,
    fontWeight: '800',
    color: CampusColors.textPrimary,
  },
  purposeText: {
    fontSize: 13,
    color: CampusColors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeConfirmed: {
    backgroundColor: '#dcfce7',
  },
  statusBadgePending: {
    backgroundColor: '#fef3c7',
  },
  statusBadgeCancelled: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusTextConfirmed: {
    color: '#15803d',
  },
  statusTextPending: {
    color: '#b45309',
  },
  statusTextCancelled: {
    color: '#b91c1c',
  },
  pendingSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  pendingSyncText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b45309',
  },
  offlineNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    gap: 6,
  },
  offlineNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#92400e',
    lineHeight: 15,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginVertical: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: CampusColors.textSecondary,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  keycardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: CampusColors.primaryLight,
    gap: 4,
  },
  keycardBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: CampusColors.primary,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    gap: 4,
  },
  cancelBtnDisabled: {
    opacity: 0.5,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: CampusColors.danger,
  },
  cancelBtnTextDisabled: {
    color: CampusColors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CampusColors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: CampusColors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});

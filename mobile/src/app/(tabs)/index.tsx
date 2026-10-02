import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { NetworkStatusBar } from '../../components/NetworkStatusBar';
import { RoomCard } from '../../components/RoomCard';
import { BookingModal } from '../../components/BookingModal';
import { SupportTicketModal } from '../../components/SupportTicketModal';
import { KeycardModal } from '../../components/KeycardModal';
import { CampusColors } from '../../constants/theme';
import { Room, Booking } from '../../types';

export default function HomeScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const {
    rooms,
    myBookings,
    unreadNotificationCount,
    myTickets,
    refreshData,
    isLoadingData,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [isSupportModalVisible, setIsSupportModalVisible] = useState(false);
  const [selectedKeycardBooking, setSelectedKeycardBooking] = useState<Booking | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsBookingModalVisible(true);
  };

  // Find next upcoming confirmed or pending booking
  const upcomingBookings = myBookings
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING' || b.syncState === 'PENDING_SYNC')
    .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
  const nextBooking = upcomingBookings[0];

  const availableRooms = rooms.filter((r) => r.status === 'AVAILABLE');

  return (
    <SafeAreaView style={styles.safeArea}>
      <NetworkStatusBar />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoadingData}
            onRefresh={handleRefresh}
            colors={[CampusColors.primary]}
          />
        }>
        {/* Header Greeting */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.appName}>CAMPUS ROOM</Text>
            <Text style={styles.welcomeText}>
              Welcome, {currentUser?.name?.split(' ')[0] || 'User'}
            </Text>
            <Text style={styles.subGreeting}>
              {currentUser?.email}
            </Text>
          </View>
          <View style={styles.roleBadgeContainer}>
            <View
              style={[
                styles.roleBadge,
                currentUser?.role === 'Faculty'
                  ? styles.roleFaculty
                  : currentUser?.role === 'Admin'
                  ? styles.roleAdmin
                  : styles.roleStudent,
              ]}>
              <MaterialIcons
                name={
                  currentUser?.role === 'Faculty'
                    ? 'school'
                    : currentUser?.role === 'Admin'
                    ? 'admin-panel-settings'
                    : 'person'
                }
                size={14}
                color="#ffffff"
              />
              <Text style={styles.roleText}>{currentUser?.role || 'Student'}</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(tabs)/rooms')}
            activeOpacity={0.7}>
            <View style={[styles.statIconBox, { backgroundColor: '#eff6ff' }]}>
              <MaterialIcons name="meeting-room" size={20} color={CampusColors.primary} />
            </View>
            <Text style={styles.statValue}>{availableRooms.length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(tabs)/bookings')}
            activeOpacity={0.7}>
            <View style={[styles.statIconBox, { backgroundColor: '#f0fdf4' }]}>
              <MaterialIcons name="bookmark" size={20} color={CampusColors.success} />
            </View>
            <Text style={styles.statValue}>{upcomingBookings.length}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(tabs)/notifications')}
            activeOpacity={0.7}>
            <View style={[styles.statIconBox, { backgroundColor: '#fef2f2' }]}>
              <MaterialIcons name="notifications" size={20} color={CampusColors.danger} />
            </View>
            <Text style={styles.statValue}>{unreadNotificationCount}</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.7}>
            <View style={[styles.statIconBox, { backgroundColor: '#fffbeb' }]}>
              <MaterialIcons name="confirmation-number" size={20} color={CampusColors.warning} />
            </View>
            <Text style={styles.statValue}>{myTickets.length}</Text>
            <Text style={styles.statLabel}>Tickets</Text>
          </TouchableOpacity>
        </View>

        {/* Next Upcoming Reservation Banner */}
        {nextBooking && (
          <View style={styles.nextBookingSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Next Reservation</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/bookings')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.nextBookingCard}>
              <View style={styles.nextBookingTop}>
                <View>
                  <Text style={styles.nextBookingRoomName}>{nextBooking.roomName}</Text>
                  <Text style={styles.nextBookingPurpose} numberOfLines={1}>
                    {nextBooking.purpose}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    nextBooking.status === 'CONFIRMED'
                      ? styles.statusConfirmed
                      : styles.statusPending,
                  ]}>
                  <Text style={styles.statusPillText}>
                    {nextBooking.syncState === 'PENDING_SYNC'
                      ? 'PENDING SYNC'
                      : nextBooking.status}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingDetailsRow}>
                <View style={styles.detailItem}>
                  <MaterialIcons name="calendar-today" size={14} color={CampusColors.textSecondary} />
                  <Text style={styles.detailText}>{nextBooking.date}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="schedule" size={14} color={CampusColors.textSecondary} />
                  <Text style={styles.detailText}>
                    {nextBooking.startTime} - {nextBooking.endTime}
                  </Text>
                </View>
              </View>

              {nextBooking.status === 'CONFIRMED' && (
                <TouchableOpacity
                  style={styles.keycardButton}
                  onPress={() => setSelectedKeycardBooking(nextBooking)}
                  activeOpacity={0.8}>
                  <MaterialIcons name="vpn-key" size={16} color="#ffffff" />
                  <Text style={styles.keycardButtonText}>View Digital Access Pass</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Quick Actions Bar */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.actionButtonPrimary}
            onPress={() => router.push('/(tabs)/rooms')}
            activeOpacity={0.8}>
            <MaterialIcons name="search" size={18} color="#ffffff" />
            <Text style={styles.actionButtonText}>Browse & Book Room</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => setIsSupportModalVisible(true)}
            activeOpacity={0.8}>
            <MaterialIcons name="support-agent" size={18} color={CampusColors.primary} />
            <Text style={styles.actionButtonSecondaryText}>Request Support</Text>
          </TouchableOpacity>
        </View>

        {/* Recommended Rooms Section */}
        <View style={styles.roomsSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Featured Spaces</Text>
              <Text style={styles.sectionSubtitle}>
                Instant capacity and real-time room availability
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/rooms')}>
              <Text style={styles.viewAllText}>All ({rooms.length})</Text>
            </TouchableOpacity>
          </View>

          {rooms.slice(0, 4).map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onBook={handleSelectRoom}
              disabled={room.status === 'MAINTENANCE'}
            />
          ))}
        </View>
      </ScrollView>

      {/* Booking Modal */}
      <BookingModal
        visible={isBookingModalVisible}
        room={selectedRoom}
        onClose={() => {
          setIsBookingModalVisible(false);
          setSelectedRoom(null);
        }}
      />

      {/* Support Ticket Modal */}
      <SupportTicketModal
        visible={isSupportModalVisible}
        onClose={() => setIsSupportModalVisible(false)}
      />

      {/* Keycard Modal */}
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
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  appName: {
    fontSize: 11,
    fontWeight: '800',
    color: CampusColors.primary,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '800',
    color: CampusColors.textPrimary,
  },
  subGreeting: {
    fontSize: 13,
    color: CampusColors.textSecondary,
    marginTop: 2,
  },
  roleBadgeContainer: {
    marginLeft: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  roleStudent: {
    backgroundColor: CampusColors.primary,
  },
  roleFaculty: {
    backgroundColor: '#059669',
  },
  roleAdmin: {
    backgroundColor: '#7c3aed',
  },
  roleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CampusColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: CampusColors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: CampusColors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  nextBookingSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: CampusColors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: CampusColors.textMuted,
    marginTop: 1,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: CampusColors.primary,
  },
  nextBookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderLeftWidth: 5,
    borderLeftColor: CampusColors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  nextBookingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  nextBookingRoomName: {
    fontSize: 17,
    fontWeight: '800',
    color: CampusColors.textPrimary,
  },
  nextBookingPurpose: {
    fontSize: 13,
    color: CampusColors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusConfirmed: {
    backgroundColor: '#dcfce7',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1f2937',
  },
  bookingDetailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
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
  keycardButton: {
    backgroundColor: CampusColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  keycardButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  actionButtonPrimary: {
    flex: 1,
    backgroundColor: CampusColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CampusColors.border,
    gap: 6,
  },
  actionButtonSecondaryText: {
    color: CampusColors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  roomsSection: {
    marginTop: 4,
  },
});

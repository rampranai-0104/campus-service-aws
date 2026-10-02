import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { NetworkStatusBar } from '../../components/NetworkStatusBar';
import { SupportTicketModal } from '../../components/SupportTicketModal';
import { CampusColors } from '../../constants/theme';
import { SupportTicket } from '../../types';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const {
    myTickets,
    networkState,
    isOnline,
    queueCount,
    lastSyncTime,
    syncOfflineQueue,
    refreshData,
  } = useApp();

  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Campus Room?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline',
        'Device is currently offline. Connect to Wi-Fi or cellular network to synchronize.'
      );
      return;
    }
    setIsSyncing(true);
    try {
      await syncOfflineQueue();
      Alert.alert('Sync Complete', 'Offline queue processed and campus data updated.');
    } catch (err: any) {
      Alert.alert('Sync Error', err.message || 'Failed to sync queue.');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatTimestamp = (isoString?: string | null) => {
    if (!isoString) return 'Not yet synced';
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NetworkStatusBar />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>

          <Text style={styles.profileName}>{currentUser?.name || 'Campus Member'}</Text>
          <Text style={styles.profileEmail}>{currentUser?.email}</Text>

          {/* Role Pill */}
          <View
            style={[
              styles.rolePill,
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
            <Text style={styles.rolePillText}>{currentUser?.role || 'Student'}</Text>
          </View>

          {/* User Details Grid */}
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Department</Text>
              <Text style={styles.metaValue}>{currentUser?.department || 'General Campus'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Campus ID</Text>
              <Text style={styles.metaValue}>
                {currentUser?.id ? currentUser.id.substring(0, 10).toUpperCase() : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Sync & Connectivity Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AWS Connectivity & Cache</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <MaterialIcons
                  name={isOnline ? 'wifi' : 'wifi-off'}
                  size={18}
                  color={isOnline ? CampusColors.success : CampusColors.danger}
                />
                <Text style={styles.infoLabel}>Network Status</Text>
              </View>
              <Text
                style={[
                  styles.infoStatusText,
                  { color: isOnline ? CampusColors.success : CampusColors.danger },
                ]}>
                {networkState}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <MaterialIcons name="cloud-queue" size={18} color={CampusColors.warning} />
                <Text style={styles.infoLabel}>Offline Queue</Text>
              </View>
              <Text style={styles.infoValue}>
                {queueCount} {queueCount === 1 ? 'action pending' : 'actions pending'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <MaterialIcons name="access-time" size={18} color={CampusColors.textMuted} />
                <Text style={styles.infoLabel}>Last Synced</Text>
              </View>
              <Text style={styles.infoValue}>{formatTimestamp(lastSyncTime)}</Text>
            </View>

            {queueCount > 0 && isOnline && (
              <TouchableOpacity
                style={styles.syncBtn}
                onPress={handleManualSync}
                disabled={isSyncing}
                activeOpacity={0.8}>
                {isSyncing ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <MaterialIcons name="sync" size={18} color="#ffffff" />
                    <Text style={styles.syncBtnText}>Sync Pending Actions Now</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Support Tickets Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Facilities Support</Text>
              <Text style={styles.sectionSubtitle}>
                Equipment issues, maintenance, and facility requests
              </Text>
            </View>
            <TouchableOpacity
              style={styles.newTicketBtn}
              onPress={() => setIsSupportModalOpen(true)}>
              <MaterialIcons name="add" size={16} color="#ffffff" />
              <Text style={styles.newTicketText}>New</Text>
            </TouchableOpacity>
          </View>

          {myTickets.length === 0 ? (
            <View style={styles.emptyTicketsBox}>
              <MaterialIcons name="support-agent" size={32} color={CampusColors.textMuted} />
              <Text style={styles.emptyTicketsText}>No support tickets filed</Text>
              <Text style={styles.emptyTicketsSubtext}>
                Report room or hardware issues for rapid resolution.
              </Text>
            </View>
          ) : (
            myTickets.map((ticket) => {
              const isPendingSync = ticket.syncState === 'PENDING_SYNC';
              const isOpen = ticket.status === 'OPEN';
              const isResolved = ticket.status === 'RESOLVED';

              return (
                <View
                  key={ticket.id}
                  style={[styles.ticketCard, isPendingSync && styles.ticketCardPending]}>
                  <View style={styles.ticketTopRow}>
                    <Text style={styles.ticketSubject} numberOfLines={1}>
                      {ticket.subject}
                    </Text>
                    {isPendingSync ? (
                      <View style={styles.pendingPill}>
                        <Text style={styles.pendingPillText}>PENDING SYNC</Text>
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.ticketStatusPill,
                          isOpen ? styles.ticketStatusOpen : styles.ticketStatusResolved,
                        ]}>
                        <Text
                          style={[
                            styles.ticketStatusText,
                            isOpen ? styles.ticketTextOpen : styles.ticketTextResolved,
                          ]}>
                          {ticket.status}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.ticketDescription} numberOfLines={2}>
                    {ticket.description}
                  </Text>

                  {/* Category & Priority Badge Row */}
                  <View style={styles.ticketMetaRow}>
                    <Text style={styles.ticketMetaTag}>{ticket.category}</Text>
                    <Text style={styles.ticketMetaTag}>Priority: {ticket.priority}</Text>
                  </View>

                  {/* Admin Response if available */}
                  {ticket.adminResponse && (
                    <View style={styles.adminResponseBox}>
                      <Text style={styles.adminResponseLabel}>Admin Note:</Text>
                      <Text style={styles.adminResponseText}>{ticket.adminResponse}</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <MaterialIcons name="logout" size={18} color={CampusColors.danger} />
          <Text style={styles.logoutBtnText}>Sign Out of Campus Room</Text>
        </TouchableOpacity>

        {/* Footer Build Details */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Campus Room Mobile • AWS Amplify Gen 2</Text>
          <Text style={styles.footerSubtext}>Region: ap-south-1 • AppSync GraphQL</Text>
        </View>
      </ScrollView>

      {/* Support Ticket Modal */}
      <SupportTicketModal
        visible={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
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
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: CampusColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: CampusColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 19,
    fontWeight: '800',
    color: CampusColors.textPrimary,
  },
  profileEmail: {
    fontSize: 13,
    color: CampusColors.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    marginBottom: 16,
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
  rolePillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  metaGrid: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 14,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: CampusColors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: CampusColors.textPrimary,
  },
  section: {
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
  newTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CampusColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  newTicketText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: CampusColors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: CampusColors.textSecondary,
    fontWeight: '500',
  },
  infoStatusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: CampusColors.textPrimary,
  },
  syncBtn: {
    marginTop: 12,
    backgroundColor: CampusColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  syncBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyTicketsBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CampusColors.border,
  },
  emptyTicketsText: {
    fontSize: 14,
    fontWeight: '700',
    color: CampusColors.textPrimary,
    marginTop: 8,
  },
  emptyTicketsSubtext: {
    fontSize: 12,
    color: CampusColors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  ticketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CampusColors.border,
  },
  ticketCardPending: {
    borderColor: '#f59e0b',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    backgroundColor: '#fffdfa',
  },
  ticketTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ticketSubject: {
    fontSize: 14,
    fontWeight: '700',
    color: CampusColors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  pendingPill: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pendingPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#b45309',
  },
  ticketStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ticketStatusOpen: {
    backgroundColor: '#eff6ff',
  },
  ticketStatusResolved: {
    backgroundColor: '#dcfce7',
  },
  ticketStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  ticketTextOpen: {
    color: CampusColors.primary,
  },
  ticketTextResolved: {
    color: '#15803d',
  },
  ticketDescription: {
    fontSize: 12,
    color: CampusColors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  ticketMetaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ticketMetaTag: {
    fontSize: 11,
    color: CampusColors.textMuted,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminResponseBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  adminResponseLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 2,
  },
  adminResponseText: {
    fontSize: 12,
    color: '#14532d',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
    gap: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: CampusColors.danger,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: CampusColors.textMuted,
  },
  footerSubtext: {
    fontSize: 10,
    color: CampusColors.textMuted,
    marginTop: 2,
  },
});

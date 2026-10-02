import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { notificationService } from '../../services/notificationService';
import { NetworkStatusBar } from '../../components/NetworkStatusBar';
import { CampusColors } from '../../constants/theme';
import { NotificationItem } from '../../types';

export default function NotificationsScreen() {
  const { notifications, unreadNotificationCount, refreshData, isLoadingData } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (item: NotificationItem) => {
    if (item.isRead) return;
    await notificationService.markAsRead(item.id);
    await refreshData();
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead(notifications);
    await refreshData();
  };

  const getNotificationIcon = (type?: string, title?: string) => {
    const combined = `${type || ''} ${title || ''}`.toUpperCase();
    if (combined.includes('APPROVED') || combined.includes('CONFIRMED')) {
      return { name: 'check-circle' as const, color: CampusColors.success, bg: '#dcfce7' };
    }
    if (combined.includes('REJECTED') || combined.includes('CANCELLED')) {
      return { name: 'cancel' as const, color: CampusColors.danger, bg: '#fee2e2' };
    }
    if (combined.includes('REASSIGNED') || combined.includes('CONFLICT')) {
      return { name: 'swap-horiz' as const, color: CampusColors.warning, bg: '#fef3c7' };
    }
    return { name: 'notifications' as const, color: CampusColors.primary, bg: '#eff6ff' };
  };

  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NetworkStatusBar />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Alerts & Notices</Text>
            <Text style={styles.headerSubtitle}>
              Live updates on reservations, room access, and approvals
            </Text>
          </View>

          {unreadNotificationCount > 0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications List */}
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isLoadingData}
              onRefresh={handleRefresh}
              colors={[CampusColors.primary]}
            />
          }
          renderItem={({ item }) => {
            const iconConfig = getNotificationIcon(item.type, item.title);
            return (
              <TouchableOpacity
                style={[styles.card, !item.isRead && styles.cardUnread]}
                onPress={() => handleMarkAsRead(item)}
                activeOpacity={0.7}>
                {/* Icon box */}
                <View style={[styles.iconBox, { backgroundColor: iconConfig.bg }]}>
                  <MaterialIcons name={iconConfig.name} size={22} color={iconConfig.color} />
                </View>

                {/* Content */}
                <View style={styles.contentBox}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.title, !item.isRead && styles.titleUnread]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={styles.messageText}>{item.message}</Text>

                  {item.createdAt && (
                    <Text style={styles.timeText}>{formatTimestamp(item.createdAt)}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="notifications-none" size={48} color={CampusColors.textMuted} />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtitle}>
                You will receive updates here whenever your booking requests are approved, rejected, or updated.
              </Text>
            </View>
          }
        />
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: CampusColors.border,
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
  markAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: CampusColors.primary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CampusColors.border,
    alignItems: 'flex-start',
  },
  cardUnread: {
    backgroundColor: '#f8fafc',
    borderColor: '#c7d2fe',
    borderLeftWidth: 4,
    borderLeftColor: CampusColors.primary,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentBox: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: CampusColors.textPrimary,
    flex: 1,
  },
  titleUnread: {
    fontWeight: '800',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CampusColors.primary,
    marginLeft: 6,
  },
  messageText: {
    fontSize: 13,
    color: CampusColors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  timeText: {
    fontSize: 11,
    color: CampusColors.textMuted,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
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

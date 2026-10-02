import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { CampusColors } from '../constants/theme';

export const NetworkStatusBar: React.FC = () => {
  const { networkState, queueCount, syncOfflineQueue, isOnline } = useApp();

  return (
    <View
      style={[
        styles.container,
        networkState === 'OFFLINE'
          ? styles.offlineBg
          : networkState === 'SYNCING'
          ? styles.syncingBg
          : styles.onlineBg,
      ]}>
      <View style={styles.left}>
        {networkState === 'SYNCING' ? (
          <ActivityIndicator size="small" color={CampusColors.primary} />
        ) : (
          <MaterialIcons
            name={networkState === 'ONLINE' ? 'wifi' : 'wifi-off'}
            size={16}
            color={networkState === 'ONLINE' ? CampusColors.success : CampusColors.warning}
          />
        )}
        <Text style={styles.statusText}>
          {networkState === 'ONLINE'
            ? 'ONLINE • SYNCED'
            : networkState === 'SYNCING'
            ? 'SYNCING WITH AWS...'
            : 'OFFLINE MODE'}
        </Text>
      </View>

      {queueCount > 0 && (
        <View style={styles.right}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {queueCount} queued
            </Text>
          </View>
          {isOnline && networkState !== 'SYNCING' && (
            <TouchableOpacity onPress={syncOfflineQueue} style={styles.syncButton}>
              <MaterialIcons name="sync" size={14} color="#ffffff" />
              <Text style={styles.syncButtonText}>Sync</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  onlineBg: {
    backgroundColor: '#f0fdf4',
    borderBottomColor: '#bbf7d0',
  },
  offlineBg: {
    backgroundColor: CampusColors.warningContainer,
    borderBottomColor: '#fde68a',
  },
  syncingBg: {
    backgroundColor: CampusColors.secondaryContainer,
    borderBottomColor: '#bae6fd',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: CampusColors.text,
    letterSpacing: 0.3,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: CampusColors.warning,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CampusColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  syncButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});

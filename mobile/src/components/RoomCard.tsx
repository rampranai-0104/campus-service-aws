import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Room } from '../types';
import { CampusColors } from '../constants/theme';

interface RoomCardProps {
  room: Room;
  onPressReserve?: (room: Room) => void;
  onBook?: (room: Room) => void;
  onPressDetails?: (room: Room) => void;
  disabled?: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onPressReserve,
  onBook,
  onPressDetails,
  disabled = false,
}) => {
  const isMaintenance = room.status === 'MAINTENANCE' || disabled;
  const handleReserve = () => {
    if (onBook) onBook(room);
    else if (onPressReserve) onPressReserve(room);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPressDetails?.(room)}
        style={styles.imageContainer}>
        <Image source={{ uri: room.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.badgeOverlay}>
          <View
            style={[
              styles.statusPill,
              isMaintenance ? styles.statusMaint : styles.statusAvail,
            ]}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isMaintenance ? CampusColors.warning : CampusColors.success },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isMaintenance ? CampusColors.warning : CampusColors.success },
              ]}>
              {room.status}
            </Text>
          </View>
        </View>

        <View style={styles.codeTag}>
          <Text style={styles.codeTagText}>{room.code}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.roomName} numberOfLines={1}>
            {room.name}
          </Text>
          <View style={styles.capacityBadge}>
            <MaterialIcons name="people" size={14} color={CampusColors.primary} />
            <Text style={styles.capacityText}>{room.capacity}</Text>
          </View>
        </View>

        <Text style={styles.locationText} numberOfLines={1}>
          {room.building} • {room.floor}
        </Text>

        <View style={styles.typeRow}>
          <Text style={styles.typeLabel}>{room.typeLabel}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.sectorText}>{room.campusSector || 'Campus Area'}</Text>
        </View>

        {/* Facilities Chips */}
        <View style={styles.facilitiesRow}>
          {room.facilities.slice(0, 3).map((f, idx) => (
            <View key={idx} style={styles.facilityChip}>
              <Text style={styles.facilityText} numberOfLines={1}>
                {f}
              </Text>
            </View>
          ))}
          {room.facilities.length > 3 && (
            <View style={styles.facilityChip}>
              <Text style={styles.facilityText}>+{room.facilities.length - 3}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.reserveBtn, isMaintenance && styles.reserveBtnDisabled]}
            disabled={isMaintenance}
            onPress={handleReserve}>
            <MaterialIcons
              name={isMaintenance ? 'build' : 'add-circle-outline'}
              size={18}
              color="#ffffff"
            />
            <Text style={styles.reserveBtnText}>
              {isMaintenance ? 'Under Maintenance' : 'Reserve Space'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#cbd5e1',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusAvail: {},
  statusMaint: {},
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  codeTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  codeTagText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  content: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  roomName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: CampusColors.text,
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CampusColors.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  capacityText: {
    fontSize: 12,
    fontWeight: '700',
    color: CampusColors.onPrimaryFixed,
  },
  locationText: {
    fontSize: 13,
    color: CampusColors.textMuted,
    marginTop: 2,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: CampusColors.primary,
  },
  dot: {
    fontSize: 12,
    color: CampusColors.textSubtle,
  },
  sectorText: {
    fontSize: 12,
    color: CampusColors.textMuted,
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  facilityChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  facilityText: {
    fontSize: 11,
    color: CampusColors.textMuted,
    fontWeight: '500',
  },
  actionsRow: {
    marginTop: 14,
  },
  reserveBtn: {
    backgroundColor: CampusColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  reserveBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  reserveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

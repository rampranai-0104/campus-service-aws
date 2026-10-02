import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Booking } from '../types';
import { CampusColors } from '../constants/theme';

interface KeycardModalProps {
  visible: boolean;
  booking: Booking | null;
  onClose: () => void;
}

export const KeycardModal: React.FC<KeycardModalProps> = ({ visible, booking, onClose }) => {
  if (!booking) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.cardContainer}>
          {/* Header Pass */}
          <View style={styles.passHeader}>
            <View>
              <Text style={styles.passSub}>Digital Access Pass</Text>
              <Text style={styles.passTitle}>{booking.roomName}</Text>
              <Text style={styles.passBuilding}>{booking.building}</Text>
            </View>
            <View style={styles.codePill}>
              <Text style={styles.codeText}>{booking.roomCode || 'RM'}</Text>
            </View>
          </View>

          {/* Time & Date */}
          <View style={styles.scheduleRow}>
            <View>
              <Text style={styles.scheduleLabel}>Date</Text>
              <Text style={styles.scheduleVal}>{booking.date}</Text>
            </View>
            <View>
              <Text style={styles.scheduleLabel}>Time Window</Text>
              <Text style={styles.scheduleVal}>
                {booking.startTime} – {booking.endTime}
              </Text>
            </View>
          </View>

          {/* PIN Card */}
          <View style={styles.pinBox}>
            <Text style={styles.pinLabel}>Electronic Door Keypad PIN</Text>
            <Text style={styles.pinValue}>{booking.keycardPin || '8492'}</Text>
            <View style={styles.pinFooter}>
              <MaterialIcons name="nfc" size={16} color={CampusColors.success} />
              <Text style={styles.pinHelp}>Active for Door Reader & Keypad (#)</Text>
            </View>
          </View>

          {/* Details */}
          <View style={styles.detailsRow}>
            <Text style={styles.detailText}>Host: {booking.userName}</Text>
            <Text style={styles.detailText}>{booking.attendeeCount} persons</Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  passHeader: {
    backgroundColor: CampusColors.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  passSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  passTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  passBuilding: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 2,
  },
  codePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  codeText: {
    color: '#ffffff',
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  scheduleLabel: {
    fontSize: 10,
    color: CampusColors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  scheduleVal: {
    fontSize: 13,
    fontWeight: '700',
    color: CampusColors.text,
    marginTop: 2,
  },
  pinBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  pinLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: CampusColors.primary,
    textTransform: 'uppercase',
  },
  pinValue: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 8,
    color: CampusColors.primary,
    fontFamily: 'monospace',
    marginVertical: 4,
  },
  pinFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  pinHelp: {
    fontSize: 11,
    color: CampusColors.success,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  detailText: {
    fontSize: 12,
    color: CampusColors.textMuted,
  },
  closeBtn: {
    backgroundColor: CampusColors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

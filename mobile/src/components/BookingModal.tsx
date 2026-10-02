import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Room } from '../types';
import { CampusColors } from '../constants/theme';

interface BookingModalProps {
  visible: boolean;
  room: Room | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

export const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  room,
  onClose,
  onSuccess,
}) => {
  const { createBooking, checkAvailability, isOnline } = useApp();

  const todayIso = new Date().toISOString().split('T')[0];
  const tomorrowIso = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [date, setDate] = useState<string>(todayIso);
  const [startTime, setStartTime] = useState<string>('14:00');
  const [endTime, setEndTime] = useState<string>('15:30');
  const [purpose, setPurpose] = useState<string>('Academic Collaboration');
  const [attendeeCount, setAttendeeCount] = useState<string>('4');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validation, setValidation] = useState<{ isAvailable: boolean; message: string }>({
    isAvailable: true,
    message: '',
  });

  // Re-run availability check when parameters change
  useEffect(() => {
    if (room && date && startTime && endTime) {
      const res = checkAvailability(room.id, date, startTime, endTime);
      setValidation(res);
    }
  }, [room, date, startTime, endTime, checkAvailability]);

  if (!room) return null;

  const handleSubmit = async () => {
    if (!validation.isAvailable) {
      Alert.alert('Time Conflict', validation.message);
      return;
    }

    const count = parseInt(attendeeCount, 10) || 1;
    if (count > room.capacity) {
      Alert.alert(
        'Capacity Exceeded',
        `Room accommodates at most ${room.capacity} persons.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createBooking({
        roomId: room.id,
        roomName: room.name,
        roomCode: room.code,
        building: room.building,
        date,
        startTime,
        endTime,
        purpose: purpose.trim() || 'Academic Reservation',
        attendeeCount: count,
      });

      if (res.success) {
        if (res.isOffline) {
          Alert.alert(
            'Offline Booking Queued',
            'Your reservation request has been saved locally as "Pending Sync". It will be submitted to AWS AppSync automatically when internet connection is restored.',
            [{ text: 'OK', onPress: () => { onClose(); onSuccess?.(); } }]
          );
        } else {
          Alert.alert(
            'Reservation Request Submitted',
            `Your request for ${room.name} has been submitted for Facilities review (Status: PENDING). You can view it under Bookings.`,
            [{ text: 'OK', onPress: () => { onClose(); onSuccess?.(); } }]
          );
        }
      } else {
        Alert.alert('Booking Error', res.error || 'Could not submit booking.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Reserve Space</Text>
              <Text style={styles.subtitle}>{room.name} ({room.code})</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color={CampusColors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Offline Alert Banner if offline */}
            {!isOnline && (
              <View style={styles.offlineNotice}>
                <MaterialIcons name="wifi-off" size={18} color={CampusColors.warning} />
                <Text style={styles.offlineNoticeText}>
                  Offline Mode: This request will be queued locally and synced when you reconnect.
                </Text>
              </View>
            )}

            {/* Room Info Strip */}
            <View style={styles.roomStrip}>
              <View style={styles.stripCol}>
                <Text style={styles.stripLabel}>Building</Text>
                <Text style={styles.stripVal}>{room.building}</Text>
              </View>
              <View style={styles.stripCol}>
                <Text style={styles.stripLabel}>Floor</Text>
                <Text style={styles.stripVal}>{room.floor}</Text>
              </View>
              <View style={styles.stripCol}>
                <Text style={styles.stripLabel}>Max Capacity</Text>
                <Text style={styles.stripVal}>{room.capacity} seats</Text>
              </View>
            </View>

            {/* Date Selection */}
            <Text style={styles.sectionLabel}>Date</Text>
            <View style={styles.presetDates}>
              <TouchableOpacity
                onPress={() => setDate(todayIso)}
                style={[styles.dateChip, date === todayIso && styles.dateChipActive]}>
                <Text style={[styles.dateChipText, date === todayIso && styles.dateChipTextActive]}>
                  Today ({todayIso.slice(5)})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDate(tomorrowIso)}
                style={[styles.dateChip, date === tomorrowIso && styles.dateChipActive]}>
                <Text style={[styles.dateChipText, date === tomorrowIso && styles.dateChipTextActive]}>
                  Tomorrow ({tomorrowIso.slice(5)})
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
            />

            {/* Time Selectors */}
            <Text style={styles.sectionLabel}>Time Window</Text>
            <View style={styles.timeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subLabel}>Start Time</Text>
                <TextInput
                  style={styles.input}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="HH:MM (e.g. 14:00)"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subLabel}>End Time</Text>
                <TextInput
                  style={styles.input}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="HH:MM (e.g. 15:30)"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {/* Quick time slots */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotScroll}>
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  onPress={() => {
                    setStartTime(slot);
                    const [h] = slot.split(':');
                    const nextH = (parseInt(h, 10) + 1).toString().padStart(2, '0');
                    setEndTime(`${nextH}:00`);
                  }}
                  style={[styles.slotChip, startTime === slot && styles.slotChipActive]}>
                  <Text style={[styles.slotText, startTime === slot && styles.slotTextActive]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Conflict / Availability Status */}
            <View
              style={[
                styles.validationBox,
                validation.isAvailable ? styles.validBox : styles.invalidBox,
              ]}>
              <MaterialIcons
                name={validation.isAvailable ? 'check-circle' : 'error'}
                size={18}
                color={validation.isAvailable ? CampusColors.success : CampusColors.danger}
              />
              <Text
                style={[
                  styles.validationText,
                  { color: validation.isAvailable ? CampusColors.success : CampusColors.danger },
                ]}>
                {validation.message || (validation.isAvailable ? 'Slot available: No collisions.' : 'Conflict detected.')}
              </Text>
            </View>

            {/* Purpose */}
            <Text style={styles.sectionLabel}>Stated Purpose</Text>
            <TextInput
              style={styles.input}
              value={purpose}
              onChangeText={setPurpose}
              placeholder="e.g. Senior Capstone Sprint / Lab Work"
              placeholderTextColor="#94a3b8"
            />

            {/* Attendees */}
            <Text style={styles.sectionLabel}>Expected Attendees</Text>
            <TextInput
              style={styles.input}
              value={attendeeCount}
              onChangeText={setAttendeeCount}
              keyboardType="number-pad"
              placeholder={`1 - ${room.capacity}`}
              placeholderTextColor="#94a3b8"
            />

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Footer Submit */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!validation.isAvailable || isSubmitting) && styles.submitBtnDisabled,
              ]}
              disabled={!validation.isAvailable || isSubmitting}
              onPress={handleSubmit}>
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <MaterialIcons
                    name={isOnline ? 'send' : 'cloud-queue'}
                    size={20}
                    color="#ffffff"
                  />
                  <Text style={styles.submitBtnText}>
                    {isOnline ? 'Submit Reservation Request' : 'Queue Offline (Pending Sync)'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: CampusColors.text,
  },
  subtitle: {
    fontSize: 13,
    color: CampusColors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: CampusColors.warningContainer,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  offlineNoticeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  roomStrip: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  stripCol: {
    flex: 1,
  },
  stripLabel: {
    fontSize: 11,
    color: CampusColors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  stripVal: {
    fontSize: 13,
    fontWeight: '700',
    color: CampusColors.text,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: CampusColors.text,
    marginTop: 10,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: CampusColors.textMuted,
    marginBottom: 4,
  },
  presetDates: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  dateChipActive: {
    backgroundColor: CampusColors.primaryFixed,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: CampusColors.textMuted,
  },
  dateChipTextActive: {
    color: CampusColors.onPrimaryFixed,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: CampusColors.text,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  slotScroll: {
    marginVertical: 8,
  },
  slotChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  slotChipActive: {
    backgroundColor: CampusColors.primary,
  },
  slotText: {
    fontSize: 12,
    fontWeight: '600',
    color: CampusColors.textMuted,
  },
  slotTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  validationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  validBox: {
    backgroundColor: CampusColors.successContainer,
  },
  invalidBox: {
    backgroundColor: CampusColors.dangerContainer,
  },
  validationText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  submitBtn: {
    backgroundColor: CampusColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});

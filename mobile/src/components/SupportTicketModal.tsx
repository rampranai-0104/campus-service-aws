import React, { useState } from 'react';
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
import { TicketCategory, TicketPriority, Room } from '../types';
import { CampusColors } from '../constants/theme';

interface SupportTicketModalProps {
  visible: boolean;
  preselectedRoom?: Room | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES: TicketCategory[] = [
  'Facilities',
  'Equipment',
  'Maintenance',
  'Cleaning',
  'Electrical',
  'Network',
  'Other',
];

const PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const SupportTicketModal: React.FC<SupportTicketModalProps> = ({
  visible,
  preselectedRoom,
  onClose,
  onSuccess,
}) => {
  const { createTicket, rooms, isOnline } = useApp();

  const [category, setCategory] = useState<TicketCategory>('Facilities');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(preselectedRoom?.id || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert('Validation Error', 'Please enter a ticket subject.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a detailed description.');
      return;
    }

    const room = rooms.find((r) => r.id === selectedRoomId) || preselectedRoom || undefined;

    setIsSubmitting(true);
    try {
      const res = await createTicket({
        category,
        priority,
        subject: subject.trim(),
        description: description.trim(),
        roomId: room?.id,
        roomName: room?.name,
      });

      if (res.success) {
        if (res.isOffline) {
          Alert.alert(
            'Ticket Saved Offline',
            'Your support ticket has been queued locally and will automatically submit when internet is restored.',
            [{ text: 'OK', onPress: () => { onClose(); onSuccess?.(); } }]
          );
        } else {
          Alert.alert(
            'Support Ticket Submitted',
            'Your ticket has been sent to Campus Facilities. Track progress in the Support tab.',
            [{ text: 'OK', onPress: () => { onClose(); onSuccess?.(); } }]
          );
        }
      } else {
        Alert.alert('Submission Error', res.error || 'Could not submit ticket.');
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
              <Text style={styles.title}>Submit Support Ticket</Text>
              <Text style={styles.subtitle}>Report facility, equipment, or network issues</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color={CampusColors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {!isOnline && (
              <View style={styles.offlineNotice}>
                <MaterialIcons name="wifi-off" size={18} color={CampusColors.warning} />
                <Text style={styles.offlineNoticeText}>
                  Offline: Your ticket will be stored locally and synced when you reconnect.
                </Text>
              </View>
            )}

            {/* Category Selector */}
            <Text style={styles.sectionLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.chip, category === cat && styles.chipActive]}>
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Priority Selector */}
            <Text style={styles.sectionLabel}>Priority</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((p) => {
                const isActive = priority === p;
                const isUrgent = p === 'URGENT' || p === 'HIGH';
                return (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPriority(p)}
                    style={[
                      styles.priorityChip,
                      isActive && (isUrgent ? styles.priorityUrgentActive : styles.priorityActive),
                    ]}>
                    <Text
                      style={[
                        styles.priorityText,
                        isActive && styles.priorityTextActive,
                      ]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Room Selector (Optional) */}
            <Text style={styles.sectionLabel}>Associated Room (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              <TouchableOpacity
                onPress={() => setSelectedRoomId('')}
                style={[styles.chip, !selectedRoomId && styles.chipActive]}>
                <Text style={[styles.chipText, !selectedRoomId && styles.chipTextActive]}>
                  No specific room
                </Text>
              </TouchableOpacity>
              {rooms.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => setSelectedRoomId(r.id)}
                  style={[styles.chip, selectedRoomId === r.id && styles.chipActive]}>
                  <Text style={[styles.chipText, selectedRoomId === r.id && styles.chipTextActive]}>
                    {r.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Subject */}
            <Text style={styles.sectionLabel}>Subject</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g. HDMI projector signal drops intermittently"
              placeholderTextColor="#94a3b8"
            />

            {/* Description */}
            <Text style={styles.sectionLabel}>Detailed Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the issue, location, or equipment details in full..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Footer Submit */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              disabled={isSubmitting}
              onPress={handleSubmit}>
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <MaterialIcons name="send" size={20} color="#ffffff" />
                  <Text style={styles.submitBtnText}>
                    {isOnline ? 'Submit Support Ticket' : 'Save Offline (Pending Sync)'}
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: CampusColors.text,
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: CampusColors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: CampusColors.textMuted,
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  priorityActive: {
    backgroundColor: CampusColors.primary,
  },
  priorityUrgentActive: {
    backgroundColor: CampusColors.danger,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: CampusColors.textMuted,
  },
  priorityTextActive: {
    color: '#ffffff',
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
  textArea: {
    height: 90,
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

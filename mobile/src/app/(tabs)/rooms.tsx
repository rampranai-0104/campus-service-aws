import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { NetworkStatusBar } from '../../components/NetworkStatusBar';
import { RoomCard } from '../../components/RoomCard';
import { BookingModal } from '../../components/BookingModal';
import { CampusColors } from '../../constants/theme';
import { Room } from '../../types';

export default function RoomsScreen() {
  const { rooms, refreshData, isLoadingData } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('ALL');
  const [selectedCapacityFilter, setSelectedCapacityFilter] = useState<string>('ALL');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Derive unique buildings
  const buildings = useMemo(() => {
    const list = Array.from(new Set(rooms.map((r) => r.building).filter(Boolean)));
    return ['ALL', ...list];
  }, [rooms]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Search query match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = room.name?.toLowerCase().includes(query);
        const matchesNumber = room.roomNumber?.toLowerCase().includes(query);
        const matchesBuilding = room.building?.toLowerCase().includes(query);
        const matchesFacilities = room.facilities?.some((f) => f.toLowerCase().includes(query));
        if (!matchesName && !matchesNumber && !matchesBuilding && !matchesFacilities) {
          return false;
        }
      }

      // Building filter
      if (selectedBuilding !== 'ALL' && room.building !== selectedBuilding) {
        return false;
      }

      // Capacity filter
      if (selectedCapacityFilter === 'SMALL' && (room.capacity || 0) > 10) return false;
      if (
        selectedCapacityFilter === 'MEDIUM' &&
        ((room.capacity || 0) <= 10 || (room.capacity || 0) > 30)
      )
        return false;
      if (selectedCapacityFilter === 'LARGE' && (room.capacity || 0) <= 30) return false;

      return true;
    });
  }, [rooms, searchQuery, selectedBuilding, selectedCapacityFilter]);

  const handleBook = (room: Room) => {
    setSelectedRoom(room);
    setIsBookingModalOpen(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NetworkStatusBar />

      <View style={styles.container}>
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Campus Rooms</Text>
          <Text style={styles.headerSubtitle}>
            Browse, filter, and schedule study spaces and lecture halls
          </Text>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={CampusColors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search room name, number, equipment..."
            placeholderTextColor={CampusColors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={18} color={CampusColors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills Horizontal Scroll */}
        <View style={styles.filterSection}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={buildings}
            keyExtractor={(item) => `bldg-${item}`}
            contentContainerStyle={styles.filterScroll}
            renderItem={({ item }) => {
              const isSelected = selectedBuilding === item;
              return (
                <TouchableOpacity
                  style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                  onPress={() => setSelectedBuilding(item)}
                  activeOpacity={0.7}>
                  <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
                    {item === 'ALL' ? 'All Buildings' : item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          {/* Capacity Filter Row */}
          <View style={styles.capacityFilterRow}>
            {[
              { id: 'ALL', label: 'Any Size' },
              { id: 'SMALL', label: '1-10 ppl' },
              { id: 'MEDIUM', label: '11-30 ppl' },
              { id: 'LARGE', label: '30+ ppl' },
            ].map((cap) => {
              const isSelected = selectedCapacityFilter === cap.id;
              return (
                <TouchableOpacity
                  key={cap.id}
                  style={[styles.capChip, isSelected && styles.capChipSelected]}
                  onPress={() => setSelectedCapacityFilter(cap.id)}>
                  <Text style={[styles.capChipText, isSelected && styles.capChipTextSelected]}>
                    {cap.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Results Counter */}
        <View style={styles.resultsCountBar}>
          <Text style={styles.resultsCountText}>
            Showing {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'}
          </Text>
        </View>

        {/* Room List */}
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isLoadingData}
              onRefresh={handleRefresh}
              colors={[CampusColors.primary]}
            />
          }
          renderItem={({ item }) => (
            <RoomCard
              room={item}
              onBook={handleBook}
              disabled={item.status === 'MAINTENANCE'}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={48} color={CampusColors.textMuted} />
              <Text style={styles.emptyTitle}>No matching rooms found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search query or building/capacity filters.
              </Text>
              {(searchQuery || selectedBuilding !== 'ALL' || selectedCapacityFilter !== 'ALL') && (
                <TouchableOpacity
                  style={styles.clearFilterButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedBuilding('ALL');
                    setSelectedCapacityFilter('ALL');
                  }}>
                  <Text style={styles.clearFilterText}>Reset Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>

      {/* Booking Modal */}
      <BookingModal
        visible={isBookingModalOpen}
        room={selectedRoom}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedRoom(null);
        }}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: CampusColors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: CampusColors.textPrimary,
    height: '100%',
  },
  filterSection: {
    backgroundColor: '#ffffff',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: CampusColors.border,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipSelected: {
    backgroundColor: CampusColors.primary,
    borderColor: CampusColors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: CampusColors.textSecondary,
  },
  filterChipTextSelected: {
    color: '#ffffff',
  },
  capacityFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 6,
  },
  capChip: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  capChipSelected: {
    backgroundColor: '#eff6ff',
    borderColor: CampusColors.primary,
  },
  capChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: CampusColors.textMuted,
  },
  capChipTextSelected: {
    color: CampusColors.primary,
  },
  resultsCountBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsCountText: {
    fontSize: 12,
    color: CampusColors.textMuted,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
  clearFilterButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: CampusColors.primaryLight,
  },
  clearFilterText: {
    fontSize: 13,
    fontWeight: '700',
    color: CampusColors.primary,
  },
});

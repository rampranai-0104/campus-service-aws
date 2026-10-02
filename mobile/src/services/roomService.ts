import { getUrl } from 'aws-amplify/storage';
import { getApiClient } from './amplifyService';
import { storageService } from './storageService';
import { networkService } from './networkService';
import { Room } from '../types';

export const resolveRoomImageUrl = async (imageRef?: string | null): Promise<string> => {
  if (!imageRef) {
    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';
  }
  if (imageRef.startsWith('room-images/')) {
    try {
      const res = await getUrl({ path: imageRef });
      return res.url.toString();
    } catch {
      return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';
    }
  }
  return imageRef;
};

export const formatRoomForUI = async (item: any): Promise<Room> => {
  const resolvedImage = await resolveRoomImageUrl(item.image);
  const capacity = Number(item.capacity) || 16;

  let roomType: Room['roomType'] = 'LAB';
  let typeLabel = 'Computing Lab';
  if (capacity >= 100) {
    roomType = 'AUDITORIUM';
    typeLabel = 'Lecture Auditorium';
  } else if (capacity >= 30) {
    roomType = 'SEMINAR';
    typeLabel = 'Seminar Hall';
  } else if (capacity <= 8) {
    roomType = 'STUDY_POD';
    typeLabel = 'Study Pod';
  }

  return {
    id: item.id,
    code: item.roomNumber || `RM-${item.id.slice(-4)}`,
    roomNumber: item.roomNumber || `RM-${item.id.slice(-4)}`,
    name: item.name || `Room ${item.roomNumber || ''}`,
    building: item.building || 'Campus Main Complex',
    campusSector: item.building?.includes('Science') ? 'North Campus' : 'Central Campus',
    floor: item.floor || 'Floor 2',
    capacity,
    roomType,
    typeLabel,
    facilities:
      Array.isArray(item.facilities) && item.facilities.length > 0
        ? item.facilities
        : ['High-Speed Wi-Fi 6E', 'Digital Display', 'Whiteboard'],
    status: item.status || 'AVAILABLE',
    image: resolvedImage,
    description: item.description || 'Modern university learning and collaboration space.',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

export const roomService = {
  /**
   * Fetch rooms: attempts live AppSync query; if offline or fails, falls back to local cache
   */
  async getRooms(forceRefresh = false): Promise<Room[]> {
    const isOnline = networkService.getIsOnline();

    if (!isOnline && !forceRefresh) {
      console.log('[RoomService] Offline detected: returning cached rooms.');
      return await storageService.getCachedRooms();
    }

    try {
      const client = getApiClient();
      let allItems: any[] = [];
      let nextToken: string | null | undefined = null;

      do {
        const res: any = await (client.models as any).Room.list({
          nextToken: nextToken || undefined,
        });

        if (Array.isArray(res?.data)) {
          allItems = allItems.concat(res.data);
        }
        nextToken = res?.nextToken;
      } while (nextToken);

      if (allItems.length > 0) {
        const formatted = await Promise.all(allItems.map(formatRoomForUI));
        await storageService.setCachedRooms(formatted);
        return formatted;
      }

      // If empty on server, check cache
      const cached = await storageService.getCachedRooms();
      return cached;
    } catch (err) {
      console.warn('[RoomService] Live query failed, falling back to cache:', err);
      const cached = await storageService.getCachedRooms();
      return cached;
    }
  },

  async getRoomById(id: string): Promise<Room | null> {
    const rooms = await this.getRooms();
    return rooms.find((r) => r.id === id) || null;
  },
};

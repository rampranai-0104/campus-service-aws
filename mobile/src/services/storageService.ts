import AsyncStorage from '@react-native-async-storage/async-storage';
import { Room, Booking, SupportTicket, NotificationItem, QueuedAction } from '../types';

const STORAGE_KEYS = {
  ROOMS: '@campus_rooms_cache',
  BOOKINGS: '@campus_bookings_cache',
  NOTIFICATIONS: '@campus_notifications_cache',
  TICKETS: '@campus_tickets_cache',
  OFFLINE_QUEUE: '@campus_offline_queue',
  LAST_SYNC: '@campus_last_sync_timestamp',
};

// In-memory cache ensures zero crashes if native bridge is momentarily initializing
const memoryStore: Record<string, string> = {};

const safeGetItem = async (key: string): Promise<string | null> => {
  try {
    if (typeof AsyncStorage?.getItem === 'function') {
      const val = await AsyncStorage.getItem(key);
      if (val !== null) {
        memoryStore[key] = val;
        return val;
      }
    }
    return memoryStore[key] ?? null;
  } catch {
    return memoryStore[key] ?? null;
  }
};

const safeSetItem = async (key: string, val: string): Promise<void> => {
  memoryStore[key] = val;
  try {
    if (typeof AsyncStorage?.setItem === 'function') {
      await AsyncStorage.setItem(key, val);
    }
  } catch {
    // In-memory store retains value safely
  }
};

const safeRemoveItem = async (key: string): Promise<void> => {
  delete memoryStore[key];
  try {
    if (typeof AsyncStorage?.removeItem === 'function') {
      await AsyncStorage.removeItem(key);
    }
  } catch {
    // In-memory store cleared
  }
};

export const storageService = {
  // Rooms Cache
  async getCachedRooms(): Promise<Room[]> {
    try {
      const data = await safeGetItem(STORAGE_KEYS.ROOMS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setCachedRooms(rooms: Room[]): Promise<void> {
    try {
      await safeSetItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    } catch {
      // safe fallback
    }
  },

  // Bookings Cache
  async getCachedBookings(): Promise<Booking[]> {
    try {
      const data = await safeGetItem(STORAGE_KEYS.BOOKINGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setCachedBookings(bookings: Booking[]): Promise<void> {
    try {
      await safeSetItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    } catch {
      // safe fallback
    }
  },

  // Support Tickets Cache
  async getCachedTickets(): Promise<SupportTicket[]> {
    try {
      const data = await safeGetItem(STORAGE_KEYS.TICKETS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setCachedTickets(tickets: SupportTicket[]): Promise<void> {
    try {
      await safeSetItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    } catch {
      // safe fallback
    }
  },

  // Notifications Cache
  async getCachedNotifications(): Promise<NotificationItem[]> {
    try {
      const data = await safeGetItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setCachedNotifications(notifications: NotificationItem[]): Promise<void> {
    try {
      await safeSetItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch {
      // safe fallback
    }
  },

  // Offline Actions Queue
  async getOfflineQueue(): Promise<QueuedAction[]> {
    try {
      const data = await safeGetItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setOfflineQueue(queue: QueuedAction[]): Promise<void> {
    try {
      await safeSetItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    } catch {
      // safe fallback
    }
  },

  async enqueueAction(action: Omit<QueuedAction, 'id' | 'createdAt' | 'attempts'>): Promise<QueuedAction> {
    const queue = await this.getOfflineQueue();
    const newAction: QueuedAction = {
      ...action,
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      attempts: 0,
    };
    queue.push(newAction);
    await this.setOfflineQueue(queue);
    return newAction;
  },

  async removeQueuedAction(id: string): Promise<void> {
    const queue = await this.getOfflineQueue();
    const updated = queue.filter((item) => item.id !== id);
    await this.setOfflineQueue(updated);
  },

  // Timestamp
  async getLastSyncTime(): Promise<string | null> {
    try {
      return await safeGetItem(STORAGE_KEYS.LAST_SYNC);
    } catch {
      return null;
    }
  },

  async setLastSyncTime(timeIso: string): Promise<void> {
    try {
      await safeSetItem(STORAGE_KEYS.LAST_SYNC, timeIso);
    } catch {
      // safe fallback
    }
  },

  async clearAllCaches(): Promise<void> {
    try {
      const keys = [
        STORAGE_KEYS.ROOMS,
        STORAGE_KEYS.BOOKINGS,
        STORAGE_KEYS.NOTIFICATIONS,
        STORAGE_KEYS.TICKETS,
        STORAGE_KEYS.OFFLINE_QUEUE,
        STORAGE_KEYS.LAST_SYNC,
      ];
      await Promise.all(keys.map((k) => safeRemoveItem(k)));
    } catch {
      // safe fallback
    }
  },
};

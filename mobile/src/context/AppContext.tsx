import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { networkService } from '../services/networkService';
import { storageService } from '../services/storageService';
import { roomService } from '../services/roomService';
import { bookingService, CreateBookingInput } from '../services/bookingService';
import { notificationService } from '../services/notificationService';
import { supportTicketService, CreateTicketInput } from '../services/supportTicketService';
import { offlineQueueService, SyncReport } from '../services/offlineQueueService';
import { useAuth } from './AuthContext';
import { Room, Booking, SupportTicket, NotificationItem, NetworkState } from '../types';

interface AppContextType {
  rooms: Room[];
  bookings: Booking[];
  myBookings: Booking[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  tickets: SupportTicket[];
  myTickets: SupportTicket[];
  networkState: NetworkState;
  isOnline: boolean;
  queueCount: number;
  lastSyncTime: string | null;
  isLoadingData: boolean;
  syncReport: SyncReport | null;
  refreshData: () => Promise<void>;
  syncOfflineQueue: () => Promise<void>;
  createBooking: (input: Omit<CreateBookingInput, 'userId' | 'userName' | 'userRole'>) => Promise<{
    success: boolean;
    booking?: Booking;
    error?: string;
    isOffline?: boolean;
  }>;
  cancelBooking: (bookingId: string) => Promise<{ success: boolean; error?: string; isOffline?: boolean }>;
  createTicket: (input: Omit<CreateTicketInput, 'userId' | 'userName' | 'userRole'>) => Promise<{
    success: boolean;
    ticket?: SupportTicket;
    error?: string;
    isOffline?: boolean;
  }>;
  checkAvailability: (
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string | null
  ) => { isAvailable: boolean; message: string; conflictingBooking?: Booking | null };
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const [isOnline, setIsOnline] = useState<boolean>(networkService.getIsOnline());
  const [networkState, setNetworkState] = useState<NetworkState>(
    networkService.getIsOnline() ? 'ONLINE' : 'OFFLINE'
  );
  const [queueCount, setQueueCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [syncReport, setSyncReport] = useState<SyncReport | null>(null);

  const isMountedRef = useRef(true);

  const updateQueueCount = useCallback(async () => {
    try {
      const queue = await storageService.getOfflineQueue();
      if (isMountedRef.current) {
        setQueueCount(queue.length);
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Main unified data loader
  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    try {
      const cachedTime = await storageService.getLastSyncTime();
      setLastSyncTime(cachedTime);
      await updateQueueCount();

      // 1. Rooms
      const loadedRooms = await roomService.getRooms();
      if (isMountedRef.current) setRooms(loadedRooms);

      // 2. Bookings
      const loadedBookings = await bookingService.getBookings(loadedRooms);
      if (isMountedRef.current) setBookings(loadedBookings);

      // 3. User-specific data (notifications & tickets)
      if (currentUser?.userId || currentUser?.id) {
        const uid = currentUser.userId || currentUser.id;
        const [loadedNotifications, loadedTickets] = await Promise.all([
          notificationService.getNotifications(uid),
          supportTicketService.getTickets(uid),
        ]);
        if (isMountedRef.current) {
          setNotifications(loadedNotifications);
          setTickets(loadedTickets);
        }
      }
    } catch (err) {
      console.warn('[AppContext] Error loading data:', err);
    } finally {
      if (isMountedRef.current) {
        setIsLoadingData(false);
      }
    }
  }, [currentUser, isAuthenticated, updateQueueCount]);

  // Synchronize offline queue
  const syncOfflineQueue = useCallback(async () => {
    if (!isAuthenticated || !networkService.getIsOnline()) return;

    setNetworkState('SYNCING');
    try {
      const report = await offlineQueueService.processQueue((msg) => {
        console.log('[AppContext Sync Progress]', msg);
      });
      setSyncReport(report);
      const now = new Date().toISOString();
      await storageService.setLastSyncTime(now);
      setLastSyncTime(now);
      await updateQueueCount();
      await loadData();
    } catch (err) {
      console.warn('[AppContext] Sync queue error:', err);
    } finally {
      setNetworkState(networkService.getIsOnline() ? 'ONLINE' : 'OFFLINE');
    }
  }, [isAuthenticated, loadData, updateQueueCount]);

  // Monitor network status
  useEffect(() => {
    isMountedRef.current = true;
    const unsubscribe = networkService.subscribe(async (online) => {
      if (!isMountedRef.current) return;
      setIsOnline(online);
      setNetworkState(online ? 'ONLINE' : 'OFFLINE');

      if (online && isAuthenticated) {
        console.log('[AppContext] Reconnected: Auto-syncing offline queue...');
        await syncOfflineQueue();
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [isAuthenticated, syncOfflineQueue]);

  // Initial data load when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setRooms([]);
      setBookings([]);
      setNotifications([]);
      setTickets([]);
      setIsLoadingData(false);
    }
  }, [isAuthenticated, loadData]);

  // Create booking action
  const createBooking = async (input: Omit<CreateBookingInput, 'userId' | 'userName' | 'userRole'>) => {
    if (!currentUser) return { success: false, error: 'User is not authenticated.' };

    const fullInput: CreateBookingInput = {
      ...input,
      userId: currentUser.userId || currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
    };

    const result = await bookingService.createBooking(fullInput, rooms);
    await updateQueueCount();
    await loadData();
    return result;
  };

  // Cancel booking action
  const cancelBooking = async (bookingId: string) => {
    const result = await bookingService.cancelBooking(bookingId);
    await updateQueueCount();
    await loadData();
    return result;
  };

  // Create support ticket action
  const createTicket = async (input: Omit<CreateTicketInput, 'userId' | 'userName' | 'userRole'>) => {
    if (!currentUser) return { success: false, error: 'User is not authenticated.' };

    const fullInput: CreateTicketInput = {
      ...input,
      userId: currentUser.userId || currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
    };

    const result = await supportTicketService.createTicket(fullInput);
    await updateQueueCount();
    await loadData();
    return result;
  };

  // Client-side availability check
  const checkAvailability = (
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId: string | null = null
  ) => {
    return bookingService.checkAvailability(roomId, date, startTime, endTime, bookings, excludeBookingId);
  };

  // User-filtered lists
  const myBookings = bookings.filter(
    (b) =>
      b.userId === currentUser?.userId ||
      b.userId === currentUser?.id ||
      b.userId === currentUser?.username
  );

  const myTickets = tickets.filter(
    (t) =>
      t.userId === currentUser?.userId ||
      t.userId === currentUser?.id ||
      t.userId === currentUser?.username
  );

  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        rooms,
        bookings,
        myBookings,
        notifications,
        unreadNotificationCount,
        tickets,
        myTickets,
        networkState,
        isOnline,
        queueCount,
        lastSyncTime,
        isLoadingData,
        syncReport,
        refreshData: loadData,
        syncOfflineQueue,
        createBooking,
        cancelBooking,
        createTicket,
        checkAvailability,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

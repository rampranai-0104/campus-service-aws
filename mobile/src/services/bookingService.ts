import { getApiClient } from './amplifyService';
import { storageService } from './storageService';
import { networkService } from './networkService';
import { Booking, Room } from '../types';

export interface CreateBookingInput {
  roomId: string;
  roomName: string;
  roomCode?: string;
  building: string;
  userId: string;
  userName: string;
  userRole: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendeeCount: number;
}

export const formatBookingForUI = (item: any, roomCatalog: Room[] = []): Booking => {
  const room = roomCatalog.find((r) => r.id === item.roomId);
  return {
    id: item.id,
    roomId: item.roomId,
    roomName: item.roomName || room?.name || 'Campus Room',
    roomCode: item.roomCode || room?.code || room?.roomNumber,
    building: item.building || room?.building || 'Main Campus',
    userId: item.userId,
    userName: item.userName || 'University Member',
    userRole: item.userRole || 'STUDENT',
    date: item.date,
    startTime: item.startTime,
    endTime: item.endTime,
    purpose: item.purpose || 'Academic Session',
    attendeeCount: Number(item.attendeeCount) || 1,
    status: item.status || 'PENDING',
    keycardPin: item.keycardPin,
    adminNotes: item.adminNotes,
    syncState: item.syncState || 'SYNCED',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

export const bookingService = {
  /**
   * Client-side availability check
   */
  checkAvailability(
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    bookings: Booking[] = [],
    excludeBookingId: string | null = null
  ) {
    const conflicts = bookings.filter((b) => {
      if (b.roomId !== roomId) return false;
      if (b.date !== date) return false;
      if (b.status === 'CANCELLED' || b.status === 'REJECTED') return false;
      if (excludeBookingId && b.id === excludeBookingId) return false;

      // Interval overlap check: startA < endB && endA > startB
      return b.startTime < endTime && b.endTime > startTime;
    });

    if (conflicts.length > 0) {
      return {
        isAvailable: false,
        conflictingBooking: conflicts[0],
        message: `Collision: Room is already booked for "${conflicts[0].purpose}" (${conflicts[0].startTime} - ${conflicts[0].endTime}).`,
      };
    }

    return {
      isAvailable: true,
      conflictingBooking: null,
      message: 'Slot Available: No collision detected.',
    };
  },

  /**
   * Fetch all bookings from AppSync or local cache
   */
  async getBookings(roomCatalog: Room[] = []): Promise<Booking[]> {
    const isOnline = networkService.getIsOnline();

    if (!isOnline) {
      console.log('[BookingService] Offline detected: returning cached bookings.');
      return await storageService.getCachedBookings();
    }

    try {
      const client = getApiClient();
      let allItems: any[] = [];
      let nextToken: string | null | undefined = null;

      do {
        const res: any = await (client.models as any).Booking.list({
          nextToken: nextToken || undefined,
        });

        if (Array.isArray(res?.data)) {
          allItems = allItems.concat(res.data);
        }
        nextToken = res?.nextToken;
      } while (nextToken);

      const formatted = allItems.map((b) => formatBookingForUI(b, roomCatalog));

      // Merge with any local offline queue items that are PENDING_SYNC
      const queue = await storageService.getOfflineQueue();
      const localPendingBookings = queue
        .filter((q) => q.type === 'CREATE_BOOKING')
        .map((q) => ({
          ...q.payload,
          id: q.id,
          syncState: 'PENDING_SYNC' as const,
          status: 'PENDING' as const,
        }));

      const merged = [...localPendingBookings, ...formatted];
      await storageService.setCachedBookings(merged);
      return merged;
    } catch (err) {
      console.warn('[BookingService] Query failed, falling back to cache:', err);
      return await storageService.getCachedBookings();
    }
  },

  /**
   * Create booking: live AppSync create or offline queue
   */
  async createBooking(
    input: CreateBookingInput,
    roomCatalog: Room[] = []
  ): Promise<{ success: boolean; booking?: Booking; error?: string; isOffline?: boolean }> {
    const isOnline = networkService.getIsOnline();

    // Verify room maintenance
    const targetRoom = roomCatalog.find((r) => r.id === input.roomId);
    if (targetRoom && targetRoom.status === 'MAINTENANCE') {
      return {
        success: false,
        error: `Space Unavailable: "${targetRoom.name}" is currently under maintenance.`,
      };
    }

    // Verify capacity
    if (targetRoom && targetRoom.capacity < input.attendeeCount) {
      return {
        success: false,
        error: `Capacity Exceeded: Room holds ${targetRoom.capacity}, but requested ${input.attendeeCount}.`,
      };
    }

    // OFFLINE QUEUEING PATH
    if (!isOnline) {
      console.log('[BookingService] Device is offline. Enqueueing booking action.');
      const localBooking: Booking = {
        id: `offline-bk-${Date.now()}`,
        roomId: input.roomId,
        roomName: input.roomName,
        roomCode: input.roomCode,
        building: input.building,
        userId: input.userId,
        userName: input.userName,
        userRole: input.userRole,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        purpose: input.purpose,
        attendeeCount: input.attendeeCount,
        status: 'PENDING',
        syncState: 'PENDING_SYNC',
        createdAt: new Date().toISOString(),
      };

      await storageService.enqueueAction({
        type: 'CREATE_BOOKING',
        payload: localBooking,
      });

      // Update cached bookings list
      const cached = await storageService.getCachedBookings();
      await storageService.setCachedBookings([localBooking, ...cached]);

      return {
        success: true,
        booking: localBooking,
        isOffline: true,
      };
    }

    // LIVE APPSYNC PATH
    try {
      const client = getApiClient();
      const status = input.userRole?.toUpperCase() === 'ADMIN' ? 'CONFIRMED' : 'PENDING';

      // Live conflict check against current bookings
      try {
        const existingRes: any = await (client.models as any).Booking.list({
          filter: {
            roomId: { eq: input.roomId },
            date: { eq: input.date },
          },
        });
        const existing = existingRes?.data || [];
        const conflict = existing.find((b: any) => {
          if (b.status === 'CANCELLED' || b.status === 'REJECTED') return false;
          return b.startTime < input.endTime && b.endTime > input.startTime;
        });

        if (conflict) {
          return {
            success: false,
            error: `Booking Conflict: Room is already reserved for "${conflict.purpose || 'Session'}" (${conflict.startTime} - ${conflict.endTime}).`,
          };
        }
      } catch (checkErr) {
        console.warn('[BookingService] Pre-flight conflict check warning:', checkErr);
      }

      // AppSync CreateBookingInput payload: strictly valid model fields
      const res: any = await (client.models as any).Booking.create({
        roomId: input.roomId,
        userId: input.userId,
        userName: input.userName,
        userRole: input.userRole,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        purpose: input.purpose || 'Academic Reservation',
        status,
      });

      if (res?.data) {
        const newBooking = formatBookingForUI(
          { ...res.data, attendeeCount: input.attendeeCount },
          roomCatalog
        );
        const cached = await storageService.getCachedBookings();
        await storageService.setCachedBookings([newBooking, ...cached]);

        return {
          success: true,
          booking: newBooking,
        };
      }

      throw new Error(res?.errors?.[0]?.message || 'Failed to create booking in AppSync.');
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Booking creation failed.',
      };
    }
  },

  /**
   * Cancel an existing booking
   */
  async cancelBooking(
    bookingId: string
  ): Promise<{ success: boolean; error?: string; isOffline?: boolean }> {
    const isOnline = networkService.getIsOnline();

    if (!isOnline) {
      // Enqueue cancellation
      await storageService.enqueueAction({
        type: 'CANCEL_BOOKING',
        payload: { id: bookingId },
      });

      // Update local cache
      const cached = await storageService.getCachedBookings();
      const updated = cached.map((b) =>
        b.id === bookingId ? { ...b, status: 'CANCELLED' as const, syncState: 'PENDING_SYNC' as const } : b
      );
      await storageService.setCachedBookings(updated);

      return { success: true, isOffline: true };
    }

    try {
      const client = getApiClient();
      await (client.models as any).Booking.update({
        id: bookingId,
        status: 'CANCELLED',
      });

      const cached = await storageService.getCachedBookings();
      const updated = cached.map((b) =>
        b.id === bookingId ? { ...b, status: 'CANCELLED' as const, syncState: 'SYNCED' as const } : b
      );
      await storageService.setCachedBookings(updated);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to cancel booking.' };
    }
  },
};

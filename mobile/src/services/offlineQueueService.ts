import { storageService } from './storageService';
import { networkService } from './networkService';
import { getApiClient } from './amplifyService';
import { Booking, SupportTicket, QueuedAction } from '../types';

export interface SyncReport {
  syncedBookings: number;
  failedBookings: number;
  syncedTickets: number;
  syncedCancellations: number;
  errors: string[];
}

export const offlineQueueService = {
  isSyncing: false,

  /**
   * Process all queued actions when device reconnects
   */
  async processQueue(onProgress?: (msg: string) => void): Promise<SyncReport> {
    if (this.isSyncing) {
      console.log('[OfflineQueue] Sync already in progress.');
      return { syncedBookings: 0, failedBookings: 0, syncedTickets: 0, syncedCancellations: 0, errors: [] };
    }

    const isOnline = await networkService.checkOnlineAsync();
    if (!isOnline) {
      console.log('[OfflineQueue] Device is offline. Cannot process queue.');
      return { syncedBookings: 0, failedBookings: 0, syncedTickets: 0, syncedCancellations: 0, errors: [] };
    }

    this.isSyncing = true;
    const report: SyncReport = {
      syncedBookings: 0,
      failedBookings: 0,
      syncedTickets: 0,
      syncedCancellations: 0,
      errors: [],
    };

    try {
      const queue = await storageService.getOfflineQueue();
      if (queue.length === 0) {
        this.isSyncing = false;
        return report;
      }

      console.log(`[OfflineQueue] Processing ${queue.length} queued action(s)...`);
      const client = getApiClient();
      const remainingQueue: QueuedAction[] = [];

      for (const item of queue) {
        try {
          if (item.type === 'CREATE_BOOKING') {
            const booking: Booking = item.payload;
            onProgress?.(`Syncing booking for ${booking.roomName}...`);

            // Verify live conflicts first on server
            const existingBookingsRes: any = await (client.models as any).Booking.list({
              filter: {
                roomId: { eq: booking.roomId },
                date: { eq: booking.date },
              },
            });

            const existingBookings: any[] = existingBookingsRes?.data || [];
            const hasConflict = existingBookings.some((b) => {
              if (b.status === 'CANCELLED' || b.status === 'REJECTED') return false;
              return b.startTime < booking.endTime && b.endTime > booking.startTime;
            });

            if (hasConflict) {
              console.warn('[OfflineQueue] Server conflict detected for queued booking:', booking.id);
              // Mark local booking as CONFLICT
              const cached = await storageService.getCachedBookings();
              const updated = cached.map((b) =>
                b.id === booking.id
                  ? {
                      ...b,
                      status: 'REJECTED' as const,
                      syncState: 'CONFLICT' as const,
                      syncError: 'Schedule conflict occurred while offline. Room was already reserved.',
                    }
                  : b
              );
              await storageService.setCachedBookings(updated);
              report.failedBookings++;
              report.errors.push(`Conflict: ${booking.roomName} on ${booking.date} (${booking.startTime}-${booking.endTime}) was booked by another user.`);
              continue;
            }

            // Create booking on AppSync
            const res: any = await (client.models as any).Booking.create({
              roomId: booking.roomId,
              userId: booking.userId,
              userName: booking.userName,
              userRole: booking.userRole,
              date: booking.date,
              startTime: booking.startTime,
              endTime: booking.endTime,
              purpose: booking.purpose,
              status: 'PENDING',
            });

            if (res?.data) {
              const serverBooking = res.data;
              // Replace temporary local offline booking with server booking
              const cached = await storageService.getCachedBookings();
              const updated = cached.map((b) =>
                b.id === booking.id
                  ? {
                      ...b,
                      id: serverBooking.id,
                      status: serverBooking.status || 'PENDING',
                      syncState: 'SYNCED' as const,
                    }
                  : b
              );
              await storageService.setCachedBookings(updated);
              report.syncedBookings++;
            } else {
              throw new Error('Server returned empty data on booking creation.');
            }
          } else if (item.type === 'CANCEL_BOOKING') {
            onProgress?.('Syncing booking cancellation...');
            await (client.models as any).Booking.update({
              id: item.payload.id,
              status: 'CANCELLED',
            });
            report.syncedCancellations++;
          } else if (item.type === 'CREATE_TICKET') {
            const ticket: SupportTicket = item.payload;
            onProgress?.(`Syncing ticket: ${ticket.subject}...`);
            const res: any = await (client.models as any).SupportTicket.create({
              userId: ticket.userId,
              userName: ticket.userName,
              userRole: ticket.userRole,
              roomId: ticket.roomId,
              roomName: ticket.roomName,
              category: ticket.category,
              subject: ticket.subject,
              description: ticket.description,
              priority: ticket.priority,
              status: 'OPEN',
            });

            if (res?.data) {
              const serverTicket = res.data;
              const cached = await storageService.getCachedTickets();
              const updated = cached.map((t) =>
                t.id === ticket.id
                  ? {
                      ...t,
                      id: serverTicket.id,
                      syncState: 'SYNCED' as const,
                    }
                  : t
              );
              await storageService.setCachedTickets(updated);
              report.syncedTickets++;
            }
          }
        } catch (actionErr: any) {
          console.error('[OfflineQueue] Error processing item:', item, actionErr);
          item.attempts += 1;
          item.error = actionErr.message;
          if (item.attempts < 3) {
            remainingQueue.push(item);
          } else {
            report.errors.push(`Action failed permanently: ${actionErr.message}`);
          }
        }
      }

      await storageService.setOfflineQueue(remainingQueue);
      await storageService.setLastSyncTime(new Date().toISOString());
    } finally {
      this.isSyncing = false;
    }

    return report;
  },
};

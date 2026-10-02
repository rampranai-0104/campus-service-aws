import { getApiClient } from './amplifyService';
import { storageService } from './storageService';
import { networkService } from './networkService';
import { SupportTicket, TicketCategory, TicketPriority } from '../types';

export interface CreateTicketInput {
  userId: string;
  userName: string;
  userRole: string;
  roomId?: string;
  roomName?: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
}

export const formatTicketForUI = (item: any): SupportTicket => {
  return {
    id: item.id,
    userId: item.userId,
    userName: item.userName || 'University Member',
    userRole: item.userRole || 'STUDENT',
    roomId: item.roomId,
    roomName: item.roomName,
    category: item.category || 'Facilities',
    subject: item.subject,
    description: item.description,
    priority: item.priority || 'MEDIUM',
    status: item.status || 'OPEN',
    adminResponse: item.adminResponse,
    syncState: item.syncState || 'SYNCED',
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
};

export const supportTicketService = {
  /**
   * Fetch tickets for current user (or all if admin)
   */
  async getTickets(userId?: string): Promise<SupportTicket[]> {
    const isOnline = networkService.getIsOnline();

    if (!isOnline) {
      console.log('[SupportTicketService] Offline: returning cached tickets.');
      return await storageService.getCachedTickets();
    }

    try {
      const client = getApiClient();
      let res: any;

      if (userId) {
        res = await (client.models as any).SupportTicket.list({
          filter: { userId: { eq: userId } },
        });
      } else {
        res = await (client.models as any).SupportTicket.list();
      }

      const items: any[] = res?.data || [];
      const formatted = items.map(formatTicketForUI);

      // Merge with offline queued tickets
      const queue = await storageService.getOfflineQueue();
      const localQueuedTickets = queue
        .filter((q) => q.type === 'CREATE_TICKET')
        .map((q) => ({
          ...q.payload,
          id: q.id,
          syncState: 'PENDING_SYNC' as const,
        }));

      const merged = [...localQueuedTickets, ...formatted];
      merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      await storageService.setCachedTickets(merged);
      return merged;
    } catch (err) {
      console.warn('[SupportTicketService] Failed to query live tickets:', err);
      return await storageService.getCachedTickets();
    }
  },

  /**
   * Submit a new support ticket
   */
  async createTicket(
    input: CreateTicketInput
  ): Promise<{ success: boolean; ticket?: SupportTicket; error?: string; isOffline?: boolean }> {
    const isOnline = networkService.getIsOnline();

    if (!isOnline) {
      console.log('[SupportTicketService] Offline: queueing ticket submission.');
      const localTicket: SupportTicket = {
        id: `offline-ticket-${Date.now()}`,
        userId: input.userId,
        userName: input.userName,
        userRole: input.userRole,
        roomId: input.roomId,
        roomName: input.roomName,
        category: input.category,
        subject: input.subject,
        description: input.description,
        priority: input.priority,
        status: 'OPEN',
        syncState: 'PENDING_SYNC',
        createdAt: new Date().toISOString(),
      };

      await storageService.enqueueAction({
        type: 'CREATE_TICKET',
        payload: localTicket,
      });

      const cached = await storageService.getCachedTickets();
      await storageService.setCachedTickets([localTicket, ...cached]);

      return {
        success: true,
        ticket: localTicket,
        isOffline: true,
      };
    }

    try {
      const client = getApiClient();
      const res: any = await (client.models as any).SupportTicket.create({
        userId: input.userId,
        userName: input.userName,
        userRole: input.userRole,
        roomId: input.roomId,
        roomName: input.roomName,
        category: input.category,
        subject: input.subject,
        description: input.description,
        priority: input.priority,
        status: 'OPEN',
      });

      if (res?.data) {
        const newTicket = formatTicketForUI(res.data);
        const cached = await storageService.getCachedTickets();
        await storageService.setCachedTickets([newTicket, ...cached]);

        return {
          success: true,
          ticket: newTicket,
        };
      }

      throw new Error(res?.errors?.[0]?.message || 'Failed to submit ticket.');
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Ticket submission failed.',
      };
    }
  },
};

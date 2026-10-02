import { getApiClient } from './amplifyService';
import { storageService } from './storageService';
import { networkService } from './networkService';
import { NotificationItem } from '../types';

export const notificationService = {
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    if (!userId) {
      return await storageService.getCachedNotifications();
    }

    const isOnline = networkService.getIsOnline();
    if (!isOnline) {
      console.log('[NotificationService] Offline: returning cached notifications.');
      return await storageService.getCachedNotifications();
    }

    try {
      const client = getApiClient();
      const res: any = await (client.models as any).Notification.list({
        filter: { userId: { eq: userId } },
      });

      const items: any[] = res?.data || [];
      const formatted: NotificationItem[] = items.map((n) => ({
        id: n.id,
        userId: n.userId,
        title: n.title || 'Campus Alert',
        message: n.message || '',
        type: n.type || 'INFO',
        isRead: Boolean(n.isRead),
        createdAt: n.createdAt || new Date().toISOString(),
      }));

      // Sort newest first
      formatted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      await storageService.setCachedNotifications(formatted);
      return formatted;
    } catch (err) {
      console.warn('[NotificationService] Failed to fetch live notifications:', err);
      return await storageService.getCachedNotifications();
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    const cached = await storageService.getCachedNotifications();
    const updated = cached.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n));
    await storageService.setCachedNotifications(updated);

    if (networkService.getIsOnline()) {
      try {
        const client = getApiClient();
        await (client.models as any).Notification.update({
          id: notificationId,
          isRead: true,
        }).catch(() => null);
      } catch (err) {
        console.warn('[NotificationService] Error syncing markAsRead to AppSync:', err);
      }
    }
  },

  async markAllRead(notifications: NotificationItem[]): Promise<void> {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    await storageService.setCachedNotifications(updated);

    if (networkService.getIsOnline()) {
      try {
        const client = getApiClient();
        await Promise.all(
          notifications
            .filter((n) => !n.isRead)
            .map((n) =>
              (client.models as any).Notification.update({
                id: n.id,
                isRead: true,
              }).catch(() => null)
            )
        );
      } catch (err) {
        console.warn('[NotificationService] Error syncing markAllRead to AppSync:', err);
      }
    }
  },

  async markAllAsRead(notifications: NotificationItem[]): Promise<void> {
    await this.markAllRead(notifications);
  },
};

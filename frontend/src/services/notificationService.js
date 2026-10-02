import { generateClient } from "aws-amplify/api";
import { initialNotifications } from "../aws/mockData.js";

let apiClient = null;
const getClient = () => {
  if (!apiClient) {
    apiClient = generateClient();
  }
  return apiClient;
};

const formatNotification = (item) => ({
  id: item.id,
  userId: item.userId,
  title: item.title,
  message: item.message,
  type: item.type || "INFO",
  isRead: Boolean(item.read),
  timestamp: item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
  createdAt: item.createdAt || new Date().toISOString(),
});

export const notificationService = {
  /**
   * Fetch notifications for a given user from AppSync
   */
  async getNotifications(userId) {
    if (!userId) return [];

    try {
      const client = getClient();
      const res = await client.models.Notification.list();
      const items = (res?.data || []).filter((n) => !n.userId || n.userId === userId);

      if (items.length > 0) {
        return items.map(formatNotification);
      }

      // Fallback to initial seed notifications filtered by user if any
      return initialNotifications.filter((n) => !n.userId || n.userId === userId);
    } catch (e) {
      console.warn("AppSync Notification.list() failed, using fallback:", e);
      return initialNotifications.filter((n) => !n.userId || n.userId === userId);
    }
  },

  /**
   * Create a new notification in AppSync
   */
  async createNotification({ userId, title, message, type = "INFO" }) {
    try {
      const client = getClient();
      const res = await client.models.Notification.create({
        userId,
        title,
        message,
        type,
        read: false,
      });
      if (res?.data) {
        return formatNotification(res.data);
      }
    } catch (e) {
      console.warn("Failed to create AppSync notification:", e);
    }

    return {
      id: `notif-${Date.now()}`,
      userId,
      title,
      message,
      type,
      isRead: false,
      timestamp: "Just now",
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Mark all notifications as read for current user
   */
  async markAllRead(notifications = []) {
    try {
      const client = getClient();
      const unread = notifications.filter((n) => !n.isRead && n.id);
      await Promise.all(
        unread.map((n) =>
          client.models.Notification.update({
            id: n.id,
            read: true,
          }).catch((err) => console.warn("Failed to update notification", n.id, err))
        )
      );
    } catch (e) {
      console.warn("markAllRead failed on AppSync:", e);
    }
  },
};

export default notificationService;

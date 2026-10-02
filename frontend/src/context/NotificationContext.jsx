import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { notificationService } from "../services/notificationService";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  const refreshNotifications = useCallback(async () => {
    const userId = currentUser?.id || currentUser?.userId;
    const list = await notificationService.getNotifications(userId);
    setNotifications(list);
  }, [currentUser]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const showToast = (message, type = "success", duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markAllRead = async () => {
    await notificationService.markAllRead(notifications);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        showToast,
        removeToast,
        markAllRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};

export default NotificationContext;

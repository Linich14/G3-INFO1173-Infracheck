import { useState, useEffect, useCallback } from 'react';
import {
  getNotifications,
  markAsRead as markNotificationAsRead,
  markAllAsRead as markAllNotificationsAsRead,
  Notification,
  NotificationsResponse,
} from '~/services/notificationService';

const POLLING_INTERVAL = 30000; // 30 segundos

export const useNotifications = (enablePolling: boolean = true) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (unreadOnly: boolean = false, isRefreshing: boolean = false) => {
    try {
      
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response: NotificationsResponse = await getNotifications(unreadOnly);
      
      setNotifications(response.data);
      setUnreadCount(response.unread_count);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar las notificaciones';
      
      if (errorMessage.includes('Session expired') || errorMessage.includes('permisos')) {
        console.warn('Usuario no autenticado, las notificaciones no están disponibles');
        setNotifications([]);
        setUnreadCount(0);
      } else {
        setError(errorMessage);
        console.error('Error fetching notifications:', err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response: NotificationsResponse = await getNotifications(true);
      setUnreadCount(response.unread_count);
    } catch (err: any) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);
      
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? { ...notif, leida: true, fecha_lectura: new Date().toISOString() }
            : notif
        )
      );
      
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      
      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.leida ? notif : { ...notif, leida: true, fecha_lectura: now }
        )
      );
      
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, []);

  const refreshNotifications = useCallback(() => {
    return fetchNotifications(false, true);
  }, [fetchNotifications]);

  // Polling para actualizar contador en tiempo real
  useEffect(() => {
    if (!enablePolling) return;

    fetchUnreadCount();
    
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchUnreadCount, enablePolling]);

  // Carga inicial
  useEffect(() => {
    fetchNotifications(false, false);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    refreshing,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
};

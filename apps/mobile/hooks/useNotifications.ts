import { useState, useEffect, useCallback } from 'react';
import {
  getNotifications,
  markAsRead as markNotificationAsRead,
  markAllAsRead as markAllNotificationsAsRead,
  Notification,
  NotificationsResponse,
} from '~/services/notificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (unreadOnly: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: NotificationsResponse = await getNotifications(unreadOnly);
      
      setNotifications(response.data);
      setUnreadCount(response.unread_count);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar las notificaciones';
      
      // Si es error de autenticación, no mostrarlo en el estado de error
      // para que no aparezca un mensaje de error permanente
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
    return fetchNotifications(false);
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
};

import { API_CONFIG } from '~/constants/config';
import { authenticatedFetch } from '~/features/auth/services/authService';

export interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  leida: boolean;
  denuncia_id: number | null;
  fecha_creacion: string;
  fecha_lectura: string | null;
  tiempo_transcurrido: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  unread_count: number;
  total: number;
}

export const getNotifications = async (unreadOnly: boolean = false): Promise<NotificationsResponse> => {
  try {
    const url = `${API_CONFIG.BASE_URL}/api/notifications/${unreadOnly ? '?unread=true' : ''}`;
    
    const response = await authenticatedFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('No tienes permisos para acceder a las notificaciones. Por favor, inicia sesión nuevamente.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    
    if (error.message?.includes('Session expired') || error.message?.includes('permisos')) {
      throw error;
    }
    
    throw new Error(error.message || 'Error al obtener las notificaciones');
  }
};

export const markAsRead = async (notificationId: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await authenticatedFetch(
      `${API_CONFIG.BASE_URL}/api/notifications/${notificationId}/mark-read/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    
    if (error.message?.includes('Session expired')) {
      throw error;
    }
    
    throw new Error(error.message || 'Error al marcar la notificación como leída');
  }
};

export const markAllAsRead = async (): Promise<{ success: boolean; message: string; count: number }> => {
  try {
    const response = await authenticatedFetch(
      `${API_CONFIG.BASE_URL}/api/notifications/mark-all-read/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    
    if (error.message?.includes('Session expired')) {
      throw error;
    }
    
    throw new Error(error.message || 'Error al marcar todas las notificaciones como leídas');
  }
};

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { API_CONFIG } from '~/constants/config';
import { authenticatedFetch } from '~/features/auth/services/authService';

// Configurar cómo se manejan las notificaciones cuando la app está en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushToken {
  token: string;
  type: 'ios' | 'android';
}

/**
 * Registrar el token de push en el backend
 */
export const registerPushToken = async (pushToken: string): Promise<boolean> => {
  try {
    const response = await authenticatedFetch(
      `${API_CONFIG.BASE_URL}/api/notifications/register-token/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          push_token: pushToken,
          platform: Platform.OS,
        }),
      }
    );

    if (!response.ok) {
      console.error('Error registering push token:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error registering push token:', error);
    return false;
  }
};

/**
 * Obtener el token de Expo Push Notifications
 */
export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  let token: string | null = null;

  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    // Obtener el token de Expo
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;

    console.log('Push token obtained:', token);

    // Configuración específica de Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#537CF2',
      });
    }

    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

/**
 * Configurar listeners para notificaciones
 */
export const setupNotificationListeners = () => {
  // Listener para cuando se recibe una notificación mientras la app está abierta
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
  });

  // Listener para cuando el usuario toca una notificación
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification tapped:', response);
    
    // Aquí puedes navegar a la pantalla correspondiente
    const data = response.notification.request.content.data;
    if (data.reportId) {
      // Navegar al detalle del reporte
      // router.push(`/(tabs)/report/${data.reportId}`);
    }
  });

  // Retornar función de cleanup
  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
};

/**
 * Mostrar una notificación local (para testing)
 */
export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data?: any
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // null = inmediato
  });
};

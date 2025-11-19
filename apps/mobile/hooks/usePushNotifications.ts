import { useEffect, useState } from 'react';
import {
  registerForPushNotificationsAsync,
  registerPushToken,
  setupNotificationListeners,
} from '~/services/pushNotificationService';

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const initializePushNotifications = async () => {
      try {
        // Obtener el token de Expo
        const token = await registerForPushNotificationsAsync();
        
        if (token) {
          setExpoPushToken(token);
          
          // Registrar el token en el backend
          const registered = await registerPushToken(token);
          setIsRegistered(registered);
          
          if (registered) {
            console.log('Push notifications registered successfully');
          }
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    initializePushNotifications();

    // Configurar listeners
    const cleanup = setupNotificationListeners();

    return cleanup;
  }, []);

  return {
    expoPushToken,
    isRegistered,
  };
};

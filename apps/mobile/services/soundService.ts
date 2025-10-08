import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const SOUND_SETTINGS_KEY = '@sound_settings';

export type SoundType = 'success' | 'error' | 'warning' | 'info' | 'notification';

class SoundService {
  private isEnabled: boolean = true;

  async initialize() {
    try {
      const enabled = await this.getSoundEnabled();
      this.isEnabled = enabled;
    } catch (error) {
      console.error('Error initializing sound service:', error);
    }
  }

  async play(type: SoundType) {
    if (!this.isEnabled) {
      return;
    }

    try {
      // Solo usar feedback háptico según el tipo
      switch (type) {
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'info':
        case 'notification':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
      }
    } catch (error) {
      console.error(`Error playing haptic feedback ${type}:`, error);
    }
  }

  async setSoundEnabled(enabled: boolean) {
    try {
      this.isEnabled = enabled;
      await AsyncStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify({ enabled }));
    } catch (error) {
      console.error('Error saving sound settings:', error);
    }
  }

  async getSoundEnabled(): Promise<boolean> {
    try {
      const settings = await AsyncStorage.getItem(SOUND_SETTINGS_KEY);
      if (settings) {
        const { enabled } = JSON.parse(settings);
        return enabled;
      }
      return true;
    } catch (error) {
      console.error('Error loading sound settings:', error);
      return true;
    }
  }
}

export const soundService = new SoundService();

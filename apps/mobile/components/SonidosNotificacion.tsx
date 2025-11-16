import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Volume2, VolumeX, Bell, AlertCircle, CheckCircle, Info } from 'lucide-react-native';
import { soundService } from '~/services/soundService';
import { useLanguage } from '~/contexts/LanguageContext';

export const SonidosNotificacion: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const enabled = await soundService.getSoundEnabled();
      setSoundEnabled(enabled);
    } catch (error) {
      console.error('Error loading sound settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSound = async (value: boolean) => {
    setSoundEnabled(value);
    await soundService.setSoundEnabled(value);
    
    if (value) {
      await soundService.play('success');
    }
  };

  const testSound = async (type: 'success' | 'error' | 'warning' | 'info' | 'notification') => {
    await soundService.play(type);
  };

  if (loading) {
    return null;
  }

  return (
    <View className="rounded-lg bg-secondary p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          {soundEnabled ? (
            <Volume2 size={24} color="#537CF2" />
          ) : (
            <VolumeX size={24} color="#9CA3AF" />
          )}
          <View className="ml-3">
            <Text className="text-lg font-semibold text-white">{t('soundNotificationTitle')}</Text>
            <Text className="text-sm text-gray-400">
              {soundEnabled ? t('soundEnabled') : t('soundDisabled')}
            </Text>
          </View>
        </View>
        
        <Switch
          value={soundEnabled}
          onValueChange={handleToggleSound}
          trackColor={{ false: '#4B5563', true: '#537CF2' }}
          thumbColor={soundEnabled ? '#FFFFFF' : '#9CA3AF'}
        />
      </View>

      {soundEnabled && (
        <>
          <View className="mb-3 border-t border-gray-700 pt-3">
            <Text className="mb-3 text-sm font-medium text-gray-400">{t('soundTestTitle')}</Text>
          </View>

          <View className="space-y-2">
            <TouchableOpacity
              onPress={() => testSound('success')}
              className="flex-row items-center rounded-lg bg-green-500/10 border border-green-500/30 p-3"
            >
              <CheckCircle size={20} color="#10B981" />
              <Text className="ml-3 flex-1 text-white">{t('soundSuccess')}</Text>
              <Text className="text-xs text-gray-400">{t('soundPlay')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => testSound('error')}
              className="flex-row items-center rounded-lg bg-red-500/10 border border-red-500/30 p-3"
            >
              <AlertCircle size={20} color="#EF4444" />
              <Text className="ml-3 flex-1 text-white">{t('soundError')}</Text>
              <Text className="text-xs text-gray-400">{t('soundPlay')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => testSound('warning')}
              className="flex-row items-center rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3"
            >
              <AlertCircle size={20} color="#F59E0B" />
              <Text className="ml-3 flex-1 text-white">{t('soundWarning')}</Text>
              <Text className="text-xs text-gray-400">{t('soundPlay')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => testSound('info')}
              className="flex-row items-center rounded-lg bg-blue-500/10 border border-blue-500/30 p-3"
            >
              <Info size={20} color="#3B82F6" />
              <Text className="ml-3 flex-1 text-white">{t('soundInfo')}</Text>
              <Text className="text-xs text-gray-400">{t('soundPlay')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => testSound('notification')}
              className="flex-row items-center rounded-lg bg-purple-500/10 border border-purple-500/30 p-3"
            >
              <Bell size={20} color="#A855F7" />
              <Text className="ml-3 flex-1 text-white">{t('soundNotification')}</Text>
              <Text className="text-xs text-gray-400">{t('soundPlay')}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

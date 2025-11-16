import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MapPin, Navigation } from 'lucide-react-native';
import { useLanguage } from '~/contexts/LanguageContext';

interface GPSPermissionModalProps {
  visible: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export const GPSPermissionModal: React.FC<GPSPermissionModalProps> = ({ visible, onAccept, onCancel }) => {
  const { t } = useLanguage();
  
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl p-6 mx-6 max-w-md">
          {/* Ícono */}
          <View className="items-center mb-4">
            <View className="bg-blue-100 rounded-full p-4">
              <MapPin size={48} color="#537CF2" />
            </View>
          </View>

          {/* Título */}
          <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
            {t('gpsPermissionTitle')}
          </Text>

          {/* Explicación */}
          <Text className="text-base text-gray-700 text-center mb-6 leading-6">
            {t('gpsPermissionDescription')}
          </Text>

          {/* Lista de beneficios */}
          <View className="mb-6 space-y-3">
            <View className="flex-row items-start">
              <View className="mt-1 mr-3">
                <Navigation size={20} color="#537CF2" />
              </View>
              <Text className="flex-1 text-gray-700 leading-5">
                <Text className="font-semibold">{t('gpsLocateReports')}</Text> {t('gpsLocateReportsDesc')}
              </Text>
            </View>

            <View className="flex-row items-start">
              <View className="mt-1 mr-3">
                <MapPin size={20} color="#537CF2" />
              </View>
              <Text className="flex-1 text-gray-700 leading-5">
                <Text className="font-semibold">{t('gpsAutoRegister')}</Text> {t('gpsAutoRegisterDesc')}
              </Text>
            </View>

            <View className="flex-row items-start">
              <View className="mt-1 mr-3">
                <MapPin size={20} color="#537CF2" />
              </View>
              <Text className="flex-1 text-gray-700 leading-5">
                <Text className="font-semibold">{t('gpsShowNearby')}</Text> {t('gpsShowNearbyDesc')}
              </Text>
            </View>
          </View>

          {/* Nota de privacidad */}
          <View className="bg-blue-50 rounded-lg p-3 mb-6">
            <Text className="text-xs text-gray-600 text-center">
              {t('gpsPrivacyNote')}
            </Text>
          </View>

          {/* Botones */}
          <View className="space-y-3">
            <TouchableOpacity
              onPress={onAccept}
              className="bg-[#537CF2] rounded-xl py-4 items-center"
            >
              <Text className="text-white font-semibold text-base">
                {t('gpsAllowAccess')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onCancel}
              className="bg-gray-100 rounded-xl py-4 items-center"
            >
              <Text className="text-gray-700 font-semibold text-base">
                {t('gpsNotNow')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

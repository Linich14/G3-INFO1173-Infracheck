import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { QrCode, Share, X } from 'lucide-react-native';
import { useLanguage } from '~/contexts/LanguageContext';

interface QRSectionProps {
  visible: boolean;
  onClose: () => void;
  userId: number;
}

export const QRSection: React.FC<QRSectionProps> = ({ visible, onClose, userId }) => {
  const { t } = useLanguage();
  
  const handleShare = () => {
    console.log('Compartir QR del usuario:', userId);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/70 px-4">
        <View className="bg-[#13161E] rounded-2xl p-6 w-full max-w-sm">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-2xl font-bold">{t('profileQRTitle')}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View className="justify-center items-center bg-white rounded-xl p-6 mb-6">
            <QrCode size={200} color="#000000" />
            <Text className="text-gray-700 text-sm mt-4">{t('profileQRUserLabel')} #{userId}</Text>
          </View>

          <TouchableOpacity 
            onPress={handleShare}
            className="bg-[#537CF2] py-3 rounded-xl flex-row justify-center items-center"
            activeOpacity={0.8}
          >
            <Share size={20} color="white" />
            <Text className="text-white font-semibold text-base ml-2">
              {t('profileQRShare')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

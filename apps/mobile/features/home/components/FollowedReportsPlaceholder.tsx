import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Heart, RefreshCw } from 'lucide-react-native';
import { useLanguage } from '~/contexts/LanguageContext';

interface FollowedReportsPlaceholderProps {
  onRetry?: () => void;
}

const FollowedReportsPlaceholder: React.FC<FollowedReportsPlaceholderProps> = ({ onRetry }) => {
  const { t } = useLanguage();
  
  return (
    <View className="flex-1 items-center justify-center bg-[#13161E] px-8">
      {/* Icono circular */}
      <View className="h-32 w-32 rounded-full bg-[#1D212D] items-center justify-center mb-6">
        <Heart size={60} color="#537CF2" />
      </View>

      {/* Texto principal */}
      <Text className="text-white text-2xl font-bold text-center mb-3">
        {t('homePlaceholderTitle')}
      </Text>

      {/* Texto descriptivo */}
      <Text className="text-gray-400 text-center text-base mb-8 leading-6">
        {t('homePlaceholderMessage')}
      </Text>

      {/* Botón de acción */}
      <TouchableOpacity
        className="bg-[#537CF2] px-8 py-4 rounded-full flex-row items-center gap-2 active:opacity-80"
        onPress={onRetry}
      >
        <RefreshCw size={20} color="white" />
        <Text className="text-white text-base font-semibold">
          {t('homePlaceholderButton')}
        </Text>
      </TouchableOpacity>

      {/* Información adicional */}
      <View className="mt-8 p-4 bg-[#1D212D] rounded-xl">
        <Text className="text-gray-400 text-sm text-center">
          {t('homePlaceholderTip')}
        </Text>
      </View>
    </View>
  );
};

export default FollowedReportsPlaceholder;

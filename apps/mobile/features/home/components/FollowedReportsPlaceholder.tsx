import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Heart, RefreshCw } from 'lucide-react-native';

interface FollowedReportsPlaceholderProps {
  onRetry?: () => void;
}

const FollowedReportsPlaceholder: React.FC<FollowedReportsPlaceholderProps> = ({ onRetry }) => {
  return (
    <View className="flex-1 items-center justify-center bg-[#13161E] px-8">
      {/* Icono circular */}
      <View className="h-32 w-32 rounded-full bg-[#1D212D] items-center justify-center mb-6">
        <Heart size={60} color="#537CF2" />
      </View>

      {/* Texto principal */}
      <Text className="text-white text-2xl font-bold text-center mb-3">
        Reportes Seguidos
      </Text>

      {/* Texto descriptivo */}
      <Text className="text-gray-400 text-center text-base mb-8 leading-6">
        Aquí aparecerán los reportes que decidas seguir.{'\n'}
        Mantente al tanto de su progreso y actualizaciones.
      </Text>

      {/* Botón de acción */}
      <TouchableOpacity
        className="bg-[#537CF2] px-8 py-4 rounded-full flex-row items-center gap-2 active:opacity-80"
        onPress={onRetry}
      >
        <RefreshCw size={20} color="white" />
        <Text className="text-white text-base font-semibold">
          Cargar Seguimientos
        </Text>
      </TouchableOpacity>

      {/* Información adicional */}
      <View className="mt-8 p-4 bg-[#1D212D] rounded-xl">
        <Text className="text-gray-400 text-sm text-center">
          💡 Toca el botón "Seguir" en cualquier reporte{'\n'}
          para agregarlo a tu lista de seguimiento
        </Text>
      </View>
    </View>
  );
};

export default FollowedReportsPlaceholder;

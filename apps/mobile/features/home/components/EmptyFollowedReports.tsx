import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FileText } from 'lucide-react-native';

interface EmptyFollowedReportsProps {
  onExplore?: () => void;
}

export default function EmptyFollowedReports({ onExplore }: EmptyFollowedReportsProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      {/* Ilustración */}
      <View className="mb-6 items-center justify-center rounded-full bg-[#1D212D] p-8">
        <FileText size={80} color="#537CF2" strokeWidth={1.5} />
      </View>

      {/* Texto */}
      <Text className="mb-2 text-center text-2xl font-bold text-white">
        No sigues ningún reporte aún
      </Text>
      <Text className="mb-8 text-center text-base text-gray-400">
        Explora los reportes disponibles y comienza a seguir los que te interesen para recibir actualizaciones
      </Text>

      {/* Botón */}
      <TouchableOpacity
        onPress={onExplore}
        className="w-full max-w-xs rounded-xl bg-[#537CF2] py-4"
      >
        <Text className="text-center text-base font-semibold text-white">
          Explorar Reportes
        </Text>
      </TouchableOpacity>
    </View>
  );
}

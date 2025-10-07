import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Placeholder - implementaremos las estadísticas
export default function StatisticsScreen() {
  return (
    <View className="flex-1 bg-black px-4 pt-10">
      {/* Header */}
      <View className="mb-6 flex-row items-center">
        <TouchableOpacity 
          className="rounded-xl bg-[#537CF2] p-2"
          onPress={() => router.push('/(tabs)/home')}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="ml-4 text-xl font-bold text-white">Estadísticas de Proyectos</Text>
      </View>

      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-xl">Estadísticas de Proyectos</Text>
        <Text className="text-gray-400 mt-2">Por implementar</Text>
      </View>
    </View>
  );
}

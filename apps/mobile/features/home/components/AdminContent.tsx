import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Users2, BarChart3 } from "lucide-react-native";
import { router } from "expo-router";
import { SystemMetrics } from "~/components/SystemMetrics";

export default function AdminContent() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="px-4 mt-4"
      contentContainerStyle={{
        gap: 16,
        paddingBottom: insets.bottom + 12,
      }}
    >
      {/* Métricas del Sistema */}
      <SystemMetrics title="Estado del Sistema" />

      {/* Gestión de Usuarios */}
      <View className="bg-[#13161E] rounded-[12px] p-4">
        <Text className="text-white text-xl font-bold mb-4">Gestión de Usuarios</Text>
        
        <View className="bg-[#1D212D] rounded-lg p-3 mb-3">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white font-bold">Nuevos Registros Hoy</Text>
              <Text className="text-gray-400">23 usuarios nuevos</Text>
            </View>
            <View className="bg-green-500 px-3 py-1 rounded-full">
              <Text className="text-white text-xs">+15%</Text>
            </View>
          </View>
        </View>

        <View className="bg-[#1D212D] rounded-lg p-3 mb-3">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white font-bold">Usuarios Activos</Text>
              <Text className="text-gray-400">892 en las últimas 24h</Text>
            </View>
            <View className="bg-blue-500 px-3 py-1 rounded-full">
              <Text className="text-white text-xs">Estable</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Panel de Control */}
      <View className="bg-[#13161E] rounded-[12px] p-4">
        <Text className="text-white text-xl font-bold mb-4">Panel de Control</Text>
        
        <View className="flex-row flex-wrap gap-3 justify-center">
          <TouchableOpacity 
            onPress={() => router.push('/users')}
            className="bg-[#537CF2] rounded-lg p-4 items-center justify-center"
            style={{ width: '47%', height: 120 }}
          >
            <Users2 size={24} color="white" />
            <Text className="text-white mt-2 text-center">Gestionar Usuarios</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push('/analytics')}
            className="bg-[#537CF2] rounded-lg p-4 items-center justify-center"
            style={{ width: '47%', height: 120 }}
          >
            <BarChart3 size={24} color="white" />
            <Text className="text-white mt-2 text-center">Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
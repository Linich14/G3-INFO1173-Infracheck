import React from "react";
import { router} from "expo-router";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarChart3, FileText, AlertTriangle, FolderOpen, Plus } from "lucide-react-native";

export default function AuthContent() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="px-4 mt-4"
      contentContainerStyle={{
        gap: 16,
        paddingBottom: insets.bottom + 12,
      }}
    >
      {/* Estadísticas Rápidas */}
      <View className="bg-[#13161E] rounded-[12px] p-4">
        <Text className="text-white text-xl font-bold mb-4">Reportes del Día</Text>
        
        <View className="flex-row justify-between mb-4">
          <View className="items-center">
            <AlertTriangle size={32} color="#FF6B6B" />
            <Text className="text-white text-lg font-bold mt-2">12</Text>
            <Text className="text-gray-400">Urgentes</Text>
          </View>
          
          <View className="items-center">
            <FileText size={32} color="#4ECDC4" />
            <Text className="text-white text-lg font-bold mt-2">45</Text>
            <Text className="text-gray-400">Pendientes</Text>
          </View>
          
          <View className="items-center">
            <BarChart3 size={32} color="#45B7D1" />
            <Text className="text-white text-lg font-bold mt-2">23</Text>
            <Text className="text-gray-400">Resueltos</Text>
          </View>
        </View>
      </View>

      {/* Reportes Críticos */}
      <View className="bg-[#13161E] rounded-[12px] p-4">
        <Text className="text-white text-xl font-bold mb-4">Reportes Críticos</Text>
        
        <View className="bg-[#1D212D] rounded-lg p-3 mb-3">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white font-bold">Semáforo Principal Caído</Text>
              <Text className="text-gray-400">Av. Alemania con Prat</Text>
              <Text className="text-red-400 text-sm">Hace 15 min</Text>
            </View>
            <View className="bg-red-500 w-3 h-3 rounded-full" />
          </View>
        </View>

        <View className="bg-[#1D212D] rounded-lg p-3 mb-3">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white font-bold">Fuga de Agua Mayor</Text>
              <Text className="text-gray-400">Calle Bulnes 123</Text>
              <Text className="text-orange-400 text-sm">Hace 1 hora</Text>
            </View>
            <View className="bg-orange-500 w-3 h-3 rounded-full" />
          </View>
        </View>
      </View>

      {/* Acciones Rápidas */}
      <View className="bg-[#13161E] rounded-[12px] p-4">
        <Text className="text-white text-xl font-bold mb-4">Acciones Rápidas</Text>
        
        <View className="flex-row flex-wrap gap-3 justify-center">
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/proyect')}
            className="bg-[#537CF2] rounded-lg p-4 items-center justify-center"
            style={{ width: '47%', height: 120 }}
          >
            <FolderOpen size={24} color="white" />
            <Text className="text-white text-sm mt-2 text-center">Lista Proyectos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/proyect/create')}
            className="bg-[#537CF2] rounded-lg p-4 items-center justify-center"
            style={{ width: '47%', height: 120 }}
          >
            <Plus size={24} color="white" />
            <Text className="text-white text-sm mt-2 text-center">Crear Proyecto</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/proyect/reports')}
            className="bg-[#537CF2] rounded-lg p-4 items-center justify-center"
            style={{ width: '47%', height: 120 }}
          >
            <FileText size={24} color="white" />
            <Text className="text-white text-sm mt-2 text-center">Lista Reportes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/proyect/statistics')}
            className="bg-[#537CF2] rounded-lg p-4 items-center justify-center"
            style={{ width: '47%', height: 120 }}
          >
            <BarChart3 size={24} color="white" />
            <Text className="text-white text-sm mt-2 text-center">Ver Estadísticas</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
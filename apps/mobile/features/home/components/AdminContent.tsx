import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Users2, BarChart3, Bell } from "lucide-react-native";
import { router } from "expo-router";
import { SystemMetrics } from "~/components/SystemMetrics";
import { useLanguage } from "~/contexts/LanguageContext";

export default function AdminContent() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  return (
    <ScrollView
      className="px-4 mt-4"
      contentContainerStyle={{
        gap: 16,
        paddingBottom: insets.bottom + 12,
      }}
    >
      {/* Métricas del Sistema */}
      <SystemMetrics title={t('adminSystemStatus')} />

      {/* Gestión de Usuarios */}
      <View className="bg-[#13161E] rounded-[12px] p-4">
        <Text className="text-white text-xl font-bold mb-4">{t('adminUserManagement')}</Text>
        
        <View className="bg-[#1D212D] rounded-lg p-3 mb-3">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white font-bold">{t('adminNewRegistrationsToday')}</Text>
              <Text className="text-gray-400">{t('adminNewUsers')}</Text>
            </View>
            <View className="bg-green-500 px-3 py-1 rounded-full">
              <Text className="text-white text-xs">+15%</Text>
            </View>
          </View>
        </View>

        <View className="bg-[#1D212D] rounded-lg p-3 mb-3">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white font-bold">{t('adminActiveUsers')}</Text>
              <Text className="text-gray-400">{t('adminActiveUsersLast24h')}</Text>
            </View>
            <View className="bg-blue-500 px-3 py-1 rounded-full">
              <Text className="text-white text-xs">{t('adminStable')}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Panel de Control */}
      <View className="bg-[#13161E] rounded-[12px] p-4">
        <Text className="text-white text-xl font-bold mb-4">{t('adminControlPanel')}</Text>
        
        <View className="flex-row flex-wrap gap-3 justify-center">
          <TouchableOpacity 
            onPress={() => router.push('/users')}
            className="bg-[#537CF2] rounded-lg p-4 items-center justify-center"
            style={{ width: '47%', height: 120 }}
          >
            <Users2 size={24} color="white" />
            <Text className="text-white mt-2 text-center">{t('adminManageUsers')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push('/analytics')}
            className="bg-[#537CF2] rounded-lg p-4 items-center justify-center"
            style={{ width: '47%', height: 120 }}
          >
            <BarChart3 size={24} color="white" />
            <Text className="text-white mt-2 text-center">{t('adminAnalytics')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/notifications/create')}
            className="bg-[#537CF2] rounded-lg p-4 items-center justify-center"
            style={{ width: '47%', height: 120 }}
          >
            <Bell size={24} color="white" />
            <Text className="text-white mt-2 text-center">{t('adminCreateNotification')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
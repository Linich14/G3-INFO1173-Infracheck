import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Users2, BarChart3, Bell, FileText } from "lucide-react-native";
import { router } from "expo-router";
import { SystemMetrics } from "~/components/SystemMetrics";
import { useLanguage } from "~/contexts/LanguageContext";
import { getAdminStats, AdminStats } from "~/services/adminService";

export default function AdminContent() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

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
        
        {loading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#537CF2" />
          </View>
        ) : (
          <>
            <View className="bg-[#1D212D] rounded-lg p-3 mb-3">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-white font-bold">{t('adminNewRegistrationsToday')}</Text>
                  <Text className="text-gray-400">{t('adminNewUsers')}</Text>
                </View>
                <View className="bg-green-500 px-4 py-2 rounded-full">
                  <Text className="text-white font-bold text-lg">
                    {stats?.new_users_today || 0}
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-[#1D212D] rounded-lg p-3 mb-3">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-white font-bold">{t('adminActiveUsers')}</Text>
                  <Text className="text-gray-400">Total de usuarios activos</Text>
                </View>
                <View className="bg-blue-500 px-4 py-2 rounded-full">
                  <Text className="text-white font-bold text-lg">
                    {stats?.total_users?.toLocaleString() || 0}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
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

          <TouchableOpacity 
            onPress={() => router.push('/admin/reports-view')}
            className="bg-[#537CF2] rounded-lg p-4 items-center justify-center"
            style={{ width: '47%', height: 120 }}
          >
            <FileText size={24} color="white" />
            <Text className="text-white mt-2 text-center">{t('adminViewReports')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
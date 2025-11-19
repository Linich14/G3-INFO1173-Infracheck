import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, BarChart3, Activity, TrendingUp, Database, Calendar, AlertCircle } from 'lucide-react-native';
import { SystemMetrics } from '~/components/SystemMetrics';
import { LineChart } from '~/features/analytics/components/LineChart';
import { useLanguage } from '~/contexts/LanguageContext';
import { analyticsApi, AnalyticsStatsResponse } from '~/services/api/analyticsApi';

function AnalyticsScreen() {
  const { t } = useLanguage();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsApi.getAnalyticsStats();
      setAnalyticsData(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#090A0D' }}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#537CF2" />
          <Text className="mt-4 text-gray-400">Cargando estadísticas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !analyticsData) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#090A0D' }}>
        <View className="flex-1 justify-center items-center px-6">
          <AlertCircle size={48} color="#EF4444" />
          <Text className="mt-4 text-red-500 text-center">{error || 'No se pudieron cargar las estadísticas'}</Text>
          <TouchableOpacity 
            onPress={loadAnalyticsData}
            className="mt-6 bg-[#537CF2] px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Preparar datos para el gráfico
  const chartData = [
    { label: t('dayMon'), value: analyticsData.reports_by_day[0] || 0, color: '#4ECDC4' },
    { label: t('dayTue'), value: analyticsData.reports_by_day[1] || 0, color: '#4ECDC4' },
    { label: t('dayWed'), value: analyticsData.reports_by_day[2] || 0, color: '#4ECDC4' },
    { label: t('dayThu'), value: analyticsData.reports_by_day[3] || 0, color: '#4ECDC4' },
    { label: t('dayFri'), value: analyticsData.reports_by_day[4] || 0, color: '#4ECDC4' },
    { label: t('daySat'), value: analyticsData.reports_by_day[5] || 0, color: '#4ECDC4' },
    { label: t('daySun'), value: analyticsData.reports_by_day[6] || 0, color: '#4ECDC4' }
  ];
  
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#090A0D' }}>
      {/* Header */}
      <View className="px-4 pt-3 pb-4">
        <View className="bg-[#14161F] rounded-[10px] p-4 flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/home')}
            className="w-8 h-8 items-center justify-center"
          >
            <ArrowLeft size={24} color="#537CF2" />
          </TouchableOpacity>
          
          <Text className="text-2xl font-bold flex-1 text-center" style={{ color: '#537CF2' }}>{t('analyticsTitle')}</Text>
          
          <View className="w-8 h-8 items-center justify-center">
            <BarChart3 size={24} color="#537CF2" />
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Tendencia de Reportes */}
        <View className="bg-[#13161E] rounded-[12px] p-4 mb-4">
          <Text className="text-white text-xl font-bold mb-4">{t('analyticsReportTrend')}</Text>
          
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 80}
            height={220}
          />
          
          {/* Estadísticas rápidas */}
          <View className="flex-row justify-around mt-6 pt-4 border-t border-gray-700">
            <View className="items-center">
              <Text className={`text-2xl font-bold ${analyticsData.week_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {analyticsData.week_change_percent >= 0 ? '+' : ''}{analyticsData.week_change_percent}%
              </Text>
              <Text className="text-gray-400 text-sm">{t('analyticsVsLastWeek')}</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-500">{analyticsData.reports_this_week}</Text>
              <Text className="text-gray-400 text-sm">{t('analyticsTotalThisWeek')}</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-purple-500">{analyticsData.peak_max}</Text>
              <Text className="text-gray-400 text-sm">{t('analyticsPeakMax')}</Text>
            </View>
          </View>
        </View>

        {/* Métricas Principales */}
        <SystemMetrics title={t('analyticsMainMetrics')} marginBottom={true} />

        {/* Tendencias */}
        <View className="bg-[#13161E] rounded-[12px] p-4 mb-4">
          <Text className="text-white text-xl font-bold mb-4">{t('analyticsTrends')}</Text>
          
          <View className="bg-[#1D212D] rounded-lg p-4 mb-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white font-bold">{t('analyticsActiveUsers')}</Text>
            </View>
            <Text className="text-gray-400 mb-3">{analyticsData.active_users_24h} {t('analyticsUsersLast24h')}</Text>
            <View className="bg-green-500/20 h-2 rounded-full">
              <View className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
            </View>
          </View>

          <View className="bg-[#1D212D] rounded-lg p-4 mb-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white font-bold">{t('analyticsNewReports')}</Text>
            </View>
            <Text className="text-gray-400 mb-3">{analyticsData.new_reports_week} {t('analyticsReportsThisWeek')}</Text>
            <View className="bg-blue-500/20 h-2 rounded-full">
              <View className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }} />
            </View>
          </View>
        </View>

        {/* Estadísticas por Categoría */}
        <View className="bg-[#13161E] rounded-[12px] p-4 mb-8">
          <Text className="text-white text-xl font-bold mb-4">{t('analyticsByCategory')}</Text>
          
          <View className="flex-row flex-wrap gap-3">
            <View className="bg-[#1D212D] rounded-lg p-4 flex-1 min-w-[45%]">
              <View className="flex-row items-center mb-2">
                <TrendingUp size={20} color="#4ECDC4" />
                <Text className="text-white font-bold ml-2">{t('analyticsCategoryInfra')}</Text>
              </View>
              <Text className="text-2xl font-bold text-white mb-1">
                {(analyticsData.categories['Infraestructura'] || 0).toLocaleString()}
              </Text>
              <Text className="text-gray-400 text-sm">{t('analyticsReportsLabel')}</Text>
            </View>

            <View className="bg-[#1D212D] rounded-lg p-4 flex-1 min-w-[45%]">
              <View className="flex-row items-center mb-2">
                <Calendar size={20} color="#45B7D1" />
                <Text className="text-white font-bold ml-2">{t('analyticsCategorySecurity')}</Text>
              </View>
              <Text className="text-2xl font-bold text-white mb-1">
                {(analyticsData.categories['Seguridad'] || 0).toLocaleString()}
              </Text>
              <Text className="text-gray-400 text-sm">{t('analyticsReportsLabel')}</Text>
            </View>

            <View className="bg-[#1D212D] rounded-lg p-4 flex-1 min-w-[45%]">
              <View className="flex-row items-center mb-2">
                <Activity size={20} color="#96CEB4" />
                <Text className="text-white font-bold ml-2">{t('analyticsCategoryMaintenance')}</Text>
              </View>
              <Text className="text-2xl font-bold text-white mb-1">
                {(analyticsData.categories['Mantenimiento'] || 0).toLocaleString()}
              </Text>
              <Text className="text-gray-400 text-sm">{t('analyticsReportsLabel')}</Text>
            </View>

            <View className="bg-[#1D212D] rounded-lg p-4 flex-1 min-w-[45%]">
              <View className="flex-row items-center mb-2">
                <Database size={20} color="#F39C12" />
                <Text className="text-white font-bold ml-2">{t('analyticsCategoryOther')}</Text>
              </View>
              <Text className="text-2xl font-bold text-white mb-1">
                {(analyticsData.categories['Otro'] || 0).toLocaleString()}
              </Text>
              <Text className="text-gray-400 text-sm">{t('analyticsReportsLabel')}</Text>
            </View>
          </View>
        </View>


      </ScrollView>
    </SafeAreaView>
  );
}

export default AnalyticsScreen;
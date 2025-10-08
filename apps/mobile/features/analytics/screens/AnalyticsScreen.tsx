import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, BarChart3, Activity, TrendingUp, Database, Calendar } from 'lucide-react-native';
import { SystemMetrics } from '~/components/SystemMetrics';
import { LineChart } from '~/features/analytics/components/LineChart';

function AnalyticsScreen() {
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
          
          <Text className="text-2xl font-bold flex-1 text-center" style={{ color: '#537CF2' }}>Analytics</Text>
          
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
          <Text className="text-white text-xl font-bold mb-4">Tendencia de Reportes</Text>
          
          <LineChart
            data={[
              { label: 'Lun', value: 45, color: '#4ECDC4' },
              { label: 'Mar', value: 52, color: '#4ECDC4' },
              { label: 'Mié', value: 38, color: '#4ECDC4' },
              { label: 'Jue', value: 67, color: '#4ECDC4' },
              { label: 'Vie', value: 71, color: '#4ECDC4' },
              { label: 'Sáb', value: 29, color: '#4ECDC4' },
              { label: 'Dom', value: 23, color: '#4ECDC4' }
            ]}
            width={Dimensions.get('window').width - 80}
            height={220}
          />
          
          {/* Estadísticas rápidas */}
          <View className="flex-row justify-around mt-6 pt-4 border-t border-gray-700">
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-500">+15%</Text>
              <Text className="text-gray-400 text-sm">vs Semana anterior</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-500">325</Text>
              <Text className="text-gray-400 text-sm">Total esta semana</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-purple-500">71</Text>
              <Text className="text-gray-400 text-sm">Pico máximo</Text>
            </View>
          </View>
        </View>

        {/* Métricas Principales */}
        <SystemMetrics title="Métricas Principales" marginBottom={true} />

        {/* Tendencias */}
        <View className="bg-[#13161E] rounded-[12px] p-4 mb-4">
          <Text className="text-white text-xl font-bold mb-4">Tendencias</Text>
          
          <View className="bg-[#1D212D] rounded-lg p-4 mb-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white font-bold">Usuarios Activos</Text>
              <View className="bg-green-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs">+15%</Text>
              </View>
            </View>
            <Text className="text-gray-400 mb-3">892 usuarios en las últimas 24h</Text>
            <View className="bg-green-500/20 h-2 rounded-full">
              <View className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
            </View>
          </View>

          <View className="bg-[#1D212D] rounded-lg p-4 mb-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white font-bold">Reportes Nuevos</Text>
              <View className="bg-blue-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs">+8%</Text>
              </View>
            </View>
            <Text className="text-gray-400 mb-3">156 reportes esta semana</Text>
            <View className="bg-blue-500/20 h-2 rounded-full">
              <View className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }} />
            </View>
          </View>

          <View className="bg-[#1D212D] rounded-lg p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white font-bold">Engagement Rate</Text>
              <View className="bg-purple-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs">+22%</Text>
              </View>
            </View>
            <Text className="text-gray-400 mb-3">87% de engagement promedio</Text>
            <View className="bg-purple-500/20 h-2 rounded-full">
              <View className="bg-purple-500 h-2 rounded-full" style={{ width: '87%' }} />
            </View>
          </View>
        </View>

        {/* Estadísticas por Categoría */}
        <View className="bg-[#13161E] rounded-[12px] p-4 mb-8">
          <Text className="text-white text-xl font-bold mb-4">Por Categoría</Text>
          
          <View className="flex-row flex-wrap gap-3">
            <View className="bg-[#1D212D] rounded-lg p-4 flex-1 min-w-[45%]">
              <View className="flex-row items-center mb-2">
                <TrendingUp size={20} color="#4ECDC4" />
                <Text className="text-white font-bold ml-2">Infraestructura</Text>
              </View>
              <Text className="text-2xl font-bold text-white mb-1">2,341</Text>
              <Text className="text-gray-400 text-sm">Reportes</Text>
            </View>

            <View className="bg-[#1D212D] rounded-lg p-4 flex-1 min-w-[45%]">
              <View className="flex-row items-center mb-2">
                <Calendar size={20} color="#45B7D1" />
                <Text className="text-white font-bold ml-2">Seguridad</Text>
              </View>
              <Text className="text-2xl font-bold text-white mb-1">1,892</Text>
              <Text className="text-gray-400 text-sm">Reportes</Text>
            </View>

            <View className="bg-[#1D212D] rounded-lg p-4 flex-1 min-w-[45%]">
              <View className="flex-row items-center mb-2">
                <Activity size={20} color="#96CEB4" />
                <Text className="text-white font-bold ml-2">Mantenimiento</Text>
              </View>
              <Text className="text-2xl font-bold text-white mb-1">1,399</Text>
              <Text className="text-gray-400 text-sm">Reportes</Text>
            </View>

            <View className="bg-[#1D212D] rounded-lg p-4 flex-1 min-w-[45%]">
              <View className="flex-row items-center mb-2">
                <Database size={20} color="#F39C12" />
                <Text className="text-white font-bold ml-2">Otros</Text>
              </View>
              <Text className="text-2xl font-bold text-white mb-1">892</Text>
              <Text className="text-gray-400 text-sm">Reportes</Text>
            </View>
          </View>
        </View>


      </ScrollView>
    </SafeAreaView>
  );
}

export default AnalyticsScreen;
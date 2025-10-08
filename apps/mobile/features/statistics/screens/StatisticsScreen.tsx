import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LineChart, BarChart } from 'react-native-chart-kit';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import InsightCard from '../components/InsightCard';
import {
  GlobalStatistics,
  TypeDistribution,
  StatusDistribution,
  UrgencyDistribution,
  TemporalData,
  TopProject,
  Insight,
} from '../types';
import {
  calculatePercentage,
  calculateTrend,
  generateInsights,
  getStatusColor,
  getUrgencyColor,
  formatRelativeTime,
} from '../utils';

/**
 * Pantalla principal de estadísticas globales
 * Muestra métricas generales de todos los reportes y proyectos del sistema
 */
export default function StatisticsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Dimensiones para gráficos responsivos
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64; // Padding de 32px a cada lado

  // Estado - Datos mock (en producción vendrían de la API)
  const [stats] = useState<GlobalStatistics>({
    totalReports: 156,
    newReports: 23,
    inProgressReports: 45,
    resolvedReports: 78,
    rejectedReports: 8,
    canceledReports: 2,

    totalProjects: 12,
    activeProjects: 8,
    completedProjects: 4,

    totalUsers: 234,
    totalVotes: 1567,
    totalComments: 432,
    averageVotesPerReport: 10.0,

    reportsThisMonth: 28,
    reportsLastMonth: 24,
    growthPercentage: 17,
    projectsThisMonth: 3,
    projectsLastMonth: 2,
  });

  // Distribución por estado
  const [statusDistribution] = useState<StatusDistribution[]>([
    {
      status: 'Nuevo',
      count: stats.newReports,
      percentage: calculatePercentage(stats.newReports, stats.totalReports),
      color: '#60A5FA',
    },
    {
      status: 'En proceso',
      count: stats.inProgressReports,
      percentage: calculatePercentage(stats.inProgressReports, stats.totalReports),
      color: '#F59E0B',
    },
    {
      status: 'Resuelto',
      count: stats.resolvedReports,
      percentage: calculatePercentage(stats.resolvedReports, stats.totalReports),
      color: '#10B981',
    },
    {
      status: 'Rechazado',
      count: stats.rejectedReports,
      percentage: calculatePercentage(stats.rejectedReports, stats.totalReports),
      color: '#EF4444',
    },
  ]);

  // Distribución por urgencia
  const [urgencyDistribution] = useState<UrgencyDistribution[]>([
    { urgency: 'Crítico', count: 12, percentage: 8, color: '#EF4444' },
    { urgency: 'Alto', count: 45, percentage: 29, color: '#F59E0B' },
    { urgency: 'Medio', count: 67, percentage: 43, color: '#3B82F6' },
    { urgency: 'Bajo', count: 32, percentage: 20, color: '#10B981' },
  ]);

  // Top 5 tipos de problemas
  const [typeDistribution] = useState<TypeDistribution[]>([
    { type: 'Infraestructura Vial', count: 45, percentage: 29, color: '#3B82F6' },
    { type: 'Alumbrado Público', count: 32, percentage: 21, color: '#F59E0B' },
    { type: 'Limpieza', count: 28, percentage: 18, color: '#10B981' },
    { type: 'Seguridad Vial', count: 25, percentage: 16, color: '#EF4444' },
    { type: 'Señalización', count: 18, percentage: 12, color: '#8B5CF6' },
  ]);

  // Evolución temporal (últimos 6 meses)
  const [temporalData] = useState<TemporalData[]>([
    { period: 'May', reports: 18, projects: 2, month: 5, year: 2024 },
    { period: 'Jun', reports: 22, projects: 2, month: 6, year: 2024 },
    { period: 'Jul', reports: 25, projects: 3, month: 7, year: 2024 },
    { period: 'Ago', reports: 28, projects: 2, month: 8, year: 2024 },
    { period: 'Sep', reports: 24, projects: 3, month: 9, year: 2024 },
    { period: 'Oct', reports: 28, projects: 3, month: 10, year: 2024 },
  ]);

  // Top 5 proyectos
  const [topProjects] = useState<TopProject[]>([
    {
      id: '1',
      name: 'Mejoramiento Av. Alemania',
      reportsCount: 32,
      location: 'Centro',
      percentage: 21,
    },
    {
      id: '2',
      name: 'Reparación Calles Sector Norte',
      reportsCount: 28,
      location: 'Norte',
      percentage: 18,
    },
    {
      id: '3',
      name: 'Alumbrado Público Sur',
      reportsCount: 24,
      location: 'Sur',
      percentage: 15,
    },
    {
      id: '4',
      name: 'Señalización Vial Centro',
      reportsCount: 18,
      location: 'Centro',
      percentage: 12,
    },
    {
      id: '5',
      name: 'Limpieza Sectores Periféricos',
      reportsCount: 15,
      location: 'Periferia',
      percentage: 10,
    },
  ]);

  // Insights generados
  const [insights, setInsights] = useState<Insight[]>([]);

  // Simular carga de datos
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generar insights
      const generatedInsights = generateInsights(stats);
      setInsights(generatedInsights);

      setIsLoading(false);
      setLastUpdated(new Date());
    };

    loadData();
  }, []);

  // Manejar refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  // Configuración de gráficos
  const chartConfig = {
    backgroundColor: '#13161E',
    backgroundGradientFrom: '#13161E',
    backgroundGradientTo: '#1D212D',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(83, 124, 242, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 11,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
    },
  };

  // Calcular tendencias
  const reportsTrend = calculateTrend(stats.reportsThisMonth, stats.reportsLastMonth);
  const resolutionRate = calculatePercentage(stats.resolvedReports, stats.totalReports);

  // Convertir trend para StatCard (que espera 'value' en lugar de 'percentage')
  const reportsTrendForCard = {
    value: reportsTrend.percentage,
    isPositive: reportsTrend.isPositive,
    arrow: reportsTrend.arrow,
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-black pt-10">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-white">Cargando estadísticas...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black pt-10">
      {/* Header */}
      <View className="flex-row items-center justify-between bg-[#13161E] px-4 py-3">
        <TouchableOpacity
          className="rounded-xl bg-[#537CF2] p-2"
          onPress={() => router.push('/(tabs)/home')}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold text-white">
          Estadísticas Globales
        </Text>
        <View className="w-10" /> {/* Espaciador para centrar título */}
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#537CF2" />
        }
      >
        {/* Última actualización */}
        <View className="mt-4 mb-2">
          <Text className="text-center text-xs text-gray-500">
            Última actualización: {formatRelativeTime(lastUpdated)}
          </Text>
        </View>

        {/* Sección 1: Resumen General */}
        <View className="mb-4">
          <View className="mb-3 flex-row items-center">
            <Ionicons name="bar-chart" size={20} color="#537CF2" />
            <Text className="ml-2 text-lg font-bold text-blue-400">Resumen General</Text>
          </View>
          <View className="flex-row flex-wrap justify-between">
            <View className="mb-3 w-[48%]">
              <StatCard
                title="Total Reportes"
                value={stats.totalReports}
                icon="document-text"
                iconColor="#3B82F6"
                trend={reportsTrendForCard}
              />
            </View>
            <View className="mb-3 w-[48%]">
              <StatCard
                title="Total Proyectos"
                value={stats.totalProjects}
                icon="construct"
                iconColor="#10B981"
                subtitle={`${stats.activeProjects} activos`}
              />
            </View>
            <View className="mb-3 w-[48%]">
              <StatCard
                title="Usuarios Activos"
                value={stats.totalUsers}
                icon="people"
                iconColor="#F59E0B"
              />
            </View>
            <View className="mb-3 w-[48%]">
              <StatCard
                title="Tasa Resolución"
                value={`${resolutionRate}%`}
                icon="checkmark-circle"
                iconColor="#10B981"
                subtitle={`${stats.resolvedReports} resueltos`}
              />
            </View>
          </View>
        </View>

        {/* Sección 2: Distribución por Estado */}
        <View className="mb-4">
          <ChartCard title="Distribución por Estado" subtitle="Estado actual de todos los reportes">
            <View>
              {statusDistribution.map((item, index) => (
                <View key={index} className="mb-3">
                  <View className="mb-1 flex-row items-center justify-between">
                    <Text className="text-sm font-medium text-gray-300">{item.status}</Text>
                    <Text className="text-sm font-bold text-white">
                      {item.count} ({item.percentage}%)
                    </Text>
                  </View>
                  <View className="h-2 overflow-hidden rounded-full bg-[#1D212D]">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </ChartCard>
        </View>

        {/* Sección 3: Distribución por Urgencia */}
        <View className="mb-4">
          <ChartCard
            title="Distribución por Urgencia"
            subtitle="Nivel de urgencia de los reportes"
          >
            <BarChart
              data={{
                labels: urgencyDistribution.map((item) => item.urgency),
                datasets: [
                  {
                    data: urgencyDistribution.map((item) => item.count),
                    colors: urgencyDistribution.map((item) => () => item.color),
                  },
                ],
              }}
              width={chartWidth}
              height={220}
              chartConfig={chartConfig}
              withInnerLines={false}
              showBarTops={true}
              showValuesOnTopOfBars={true}
              fromZero
              yAxisLabel=""
              yAxisSuffix=""
              style={{
                borderRadius: 12,
              }}
            />
          </ChartCard>
        </View>

        {/* Sección 4: Top 5 Tipos de Problemas */}
        <View className="mb-4">
          <ChartCard
            title="Top 5 Tipos de Problemas"
            subtitle="Problemas más reportados en el sistema"
          >
            <View>
              {typeDistribution.map((item, index) => (
                <View key={index} className="mb-3">
                  <View className="mb-2 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View
                        className="mr-2 h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <Text className="text-sm font-medium text-gray-300">{item.type}</Text>
                    </View>
                    <Text className="text-sm font-bold text-white">
                      {item.count} ({item.percentage}%)
                    </Text>
                  </View>
                  <View className="h-2 overflow-hidden rounded-full bg-[#1D212D]">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </ChartCard>
        </View>

        {/* Sección 5: Evolución Temporal */}
        <View className="mb-4">
          <ChartCard
            title="Evolución Temporal"
            subtitle="Reportes creados en los últimos 6 meses"
            scrollable={true}
          >
            <LineChart
              data={{
                labels: temporalData.map((item) => item.period),
                datasets: [
                  {
                    data: temporalData.map((item) => item.reports),
                    strokeWidth: 3,
                  },
                ],
              }}
              width={Math.max(chartWidth, temporalData.length * 80)}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{
                borderRadius: 12,
              }}
              withDots={true}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
            />
          </ChartCard>
        </View>

        {/* Sección 6: Top Proyectos */}
        <View className="mb-4">
          <ChartCard
            title="Top 5 Proyectos con Más Reportes"
            subtitle="Proyectos con mayor cantidad de reportes asociados"
          >
            <View>
              {topProjects.map((project, index) => (
                <TouchableOpacity
                  key={project.id}
                  className="mb-2 flex-row items-center rounded-lg bg-[#1D212D] p-3"
                  activeOpacity={0.7}
                >
                  {/* Posición */}
                  <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-[#537CF2]">
                    <Text className="font-bold text-white">{index + 1}</Text>
                  </View>

                  {/* Información */}
                  <View className="flex-1">
                    <Text className="mb-1 font-semibold text-white">{project.name}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="location" size={12} color="#9CA3AF" />
                      <Text className="ml-1 text-xs text-gray-400">{project.location}</Text>
                    </View>
                  </View>

                  {/* Contador */}
                  <View className="items-end">
                    <Text className="text-lg font-bold text-blue-400">{project.reportsCount}</Text>
                    <Text className="text-xs text-gray-500">{project.percentage}%</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ChartCard>
        </View>

        {/* Sección 7: Insights Automáticos */}
        {insights.length > 0 && (
          <View className="mb-4">
            <ChartCard title="Insights Clave" subtitle="Análisis automático de las estadísticas">
              <View>
                {insights.map((insight) => (
                  <View key={insight.id} className="mb-2">
                    <InsightCard icon={insight.icon} text={insight.text} type={insight.type} />
                  </View>
                ))}
              </View>
            </ChartCard>
          </View>
        )}

        {/* Sección 8: Acciones */}
        <View className="mb-6">
          <ChartCard title="Acciones Rápidas">
            <TouchableOpacity
              className="mb-3 flex-row items-center rounded-lg bg-[#537CF2] p-4"
              activeOpacity={0.8}
            >
              <Ionicons name="download" size={20} color="white" />
              <Text className="ml-3 font-semibold text-white">Exportar Estadísticas (PDF)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mb-3 flex-row items-center rounded-lg bg-[#537CF2] p-4"
              activeOpacity={0.8}
            >
              <Ionicons name="document-text" size={20} color="white" />
              <Text className="ml-3 font-semibold text-white">Generar Reporte Completo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center rounded-lg bg-[#537CF2] p-4"
              activeOpacity={0.8}
            >
              <Ionicons name="share-social" size={20} color="white" />
              <Text className="ml-3 font-semibold text-white">Compartir Estadísticas</Text>
            </TouchableOpacity>
          </ChartCard>
        </View>
      </ScrollView>
    </View>
  );
}

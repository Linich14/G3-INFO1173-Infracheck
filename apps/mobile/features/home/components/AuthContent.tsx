import React, { useEffect, useState } from "react";
import { router} from "expo-router";
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarChart3, FileText, AlertTriangle, FolderOpen, Plus } from "lucide-react-native";
import ReportsService from "../../listreport/services/ReportsService";

interface DashboardStats {
  urgentes: number;
  pendientes: number;
  resueltos: number;
}

interface CriticalReport {
  id: string;
  titulo: string;
  ubicacion: string;
  tiempoRelativo: string;
  urgencia: 'Alto' | 'Crítico' | 'Medio';
}

export default function AuthContent() {
  const insets = useSafeAreaInsets();
  
  const [stats, setStats] = useState<DashboardStats>({ urgentes: 0, pendientes: 0, resueltos: 0 });
  const [criticalReports, setCriticalReports] = useState<CriticalReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar todos los reportes
      const response = await ReportsService.fetchAll({ limit: 100 });
      const allReports = response.results;

      // Calcular estadísticas
      const urgentesCount = allReports.filter(r => 
        r.nivelUrgencia === 'Alto' || r.nivelUrgencia === 'Crítico'
      ).length;
      
      const pendientesCount = allReports.filter(r => 
        r.estado === 'Nuevo' || r.estado === 'En proceso'
      ).length;
      
      const resueltosCount = allReports.filter(r => 
        r.estado === 'Resuelto'
      ).length;

      setStats({
        urgentes: urgentesCount,
        pendientes: pendientesCount,
        resueltos: resueltosCount,
      });

      // Obtener reportes críticos (ordenados por urgencia y fecha)
      const critical = allReports
        .filter(r => r.nivelUrgencia === 'Crítico' || r.nivelUrgencia === 'Alto')
        .filter(r => r.estado !== 'Resuelto' && r.estado !== 'Rechazado')
        .sort((a, b) => {
          // Primero por urgencia
          const urgenciaOrder = { 'Crítico': 3, 'Alto': 2, 'Medio': 1, 'Bajo': 0 };
          const urgenciaDiff = urgenciaOrder[b.nivelUrgencia] - urgenciaOrder[a.nivelUrgencia];
          if (urgenciaDiff !== 0) return urgenciaDiff;
          
          // Luego por fecha (más recientes primero)
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        })
        .slice(0, 3) // Solo los 3 más críticos
        .map(r => ({
          id: r.id,
          titulo: r.titulo,
          ubicacion: r.ubicacion,
          tiempoRelativo: r.fechaRelativa,
          urgencia: r.nivelUrgencia as 'Alto' | 'Crítico' | 'Medio',
        }));

      setCriticalReports(critical);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgencia: string) => {
    switch (urgencia) {
      case 'Crítico':
        return 'bg-red-500';
      case 'Alto':
        return 'bg-orange-500';
      case 'Medio':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getUrgencyTextColor = (urgencia: string) => {
    switch (urgencia) {
      case 'Crítico':
        return 'text-red-400';
      case 'Alto':
        return 'text-orange-400';
      case 'Medio':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
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
      {loading ? (
        <View className="bg-[#13161E] rounded-[12px] p-8 items-center">
          <ActivityIndicator size="large" color="#537CF2" />
          <Text className="text-gray-400 mt-4">Cargando datos...</Text>
        </View>
      ) : (
        <>
          {/* Estadísticas Rápidas */}
          <View className="bg-[#13161E] rounded-[12px] p-4">
            <Text className="text-white text-xl font-bold mb-4">Reportes del Día</Text>
            
            <View className="flex-row justify-between mb-4">
              <View className="items-center">
                <AlertTriangle size={32} color="#FF6B6B" />
                <Text className="text-white text-lg font-bold mt-2">{stats.urgentes}</Text>
                <Text className="text-gray-400">Urgentes</Text>
              </View>
              
              <View className="items-center">
                <FileText size={32} color="#4ECDC4" />
                <Text className="text-white text-lg font-bold mt-2">{stats.pendientes}</Text>
                <Text className="text-gray-400">Pendientes</Text>
              </View>
              
              <View className="items-center">
                <BarChart3 size={32} color="#45B7D1" />
                <Text className="text-white text-lg font-bold mt-2">{stats.resueltos}</Text>
                <Text className="text-gray-400">Resueltos</Text>
              </View>
            </View>
          </View>

          {/* Reportes Críticos */}
          <View className="bg-[#13161E] rounded-[12px] p-4">
            <Text className="text-white text-xl font-bold mb-4">Reportes Críticos</Text>
            
            {criticalReports.length === 0 ? (
              <View className="bg-[#1D212D] rounded-lg p-4 items-center">
                <Text className="text-gray-400">No hay reportes críticos pendientes</Text>
              </View>
            ) : (
              criticalReports.map((report) => (
                <View key={report.id} className="bg-[#1D212D] rounded-lg p-3 mb-3">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1 pr-2">
                      <Text className="text-white font-bold">{report.titulo}</Text>
                      <Text className="text-gray-400">{report.ubicacion}</Text>
                      <Text className={`${getUrgencyTextColor(report.urgencia)} text-sm`}>
                        {report.tiempoRelativo}
                      </Text>
                    </View>
                    <View className={`${getUrgencyColor(report.urgencia)} w-3 h-3 rounded-full`} />
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      )}

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
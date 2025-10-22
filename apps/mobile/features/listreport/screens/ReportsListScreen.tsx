import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, TextInput, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReportListItem from '../components/ReportListItem';
import { ReportListItem as ReportListItemType, ReportsListFilters, ReportStatus, UrgencyLevel } from '../types';

// Mock data - En producción vendría de la API
const mockReports: ReportListItemType[] = [
  {
    id: '1',
    titulo: 'Calle en mal estado con baches profundos',
    descripcion: 'La calle presenta múltiples baches y grietas que dificultan el tránsito vehicular y peatonal. La situación se ha agravado después de las últimas lluvias.',
    descripcionCorta: 'La calle presenta múltiples baches y grietas que dificultan el tránsito...',
    autor: 'Juan Gomez',
    fecha: '2024-10-07T10:30:00Z',
    fechaRelativa: 'hace 2h',
    estado: 'En proceso',
    tipoDenuncia: 'Infraestructura Vial',
    nivelUrgencia: 'Alto',
    imagenPreview: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    ubicacion: 'Av. Alemania 1234, Temuco',
    votos: 23,
    comentarios: 5,
  },
  {
    id: '2',
    titulo: 'Semáforo completamente apagado en intersección',
    descripcion: 'El semáforo del cruce principal lleva 3 días sin funcionar, causando problemas de tráfico y riesgo de accidentes.',
    descripcionCorta: 'El semáforo del cruce principal lleva 3 días sin funcionar...',
    autor: 'Ana Pérez',
    fecha: '2024-10-06T08:15:00Z',
    fechaRelativa: 'ayer',
    estado: 'Nuevo',
    tipoDenuncia: 'Seguridad Vial',
    nivelUrgencia: 'Crítico',
    imagenPreview: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
    ubicacion: 'Cruce Av. Balmaceda con Bulnes',
    votos: 42,
    comentarios: 12,
  },
  {
    id: '3',
    titulo: 'Basura acumulada en esquina residencial',
    descripcion: 'Se ha acumulado basura en la esquina durante más de una semana. El mal olor y presencia de roedores afecta a los vecinos.',
    descripcionCorta: 'Se ha acumulado basura en la esquina durante más de una semana...',
    autor: 'Carlos Mendez',
    fecha: '2024-10-05T16:45:00Z',
    fechaRelativa: 'hace 2d',
    estado: 'En proceso',
    tipoDenuncia: 'Limpieza',
    nivelUrgencia: 'Medio',
    ubicacion: 'Calle Portales 567, Temuco',
    votos: 18,
    comentarios: 3,
  },
  {
    id: '4',
    titulo: 'Luminaria pública quemada en zona oscura',
    descripcion: 'La luminaria está quemada hace 2 semanas, zona muy oscura de noche representando riesgo para peatones.',
    descripcionCorta: 'La luminaria está quemada hace 2 semanas, zona muy oscura...',
    autor: 'María González',
    fecha: '2024-10-04T20:30:00Z',
    fechaRelativa: 'hace 3d',
    estado: 'Nuevo',
    tipoDenuncia: 'Iluminación Pública',
    nivelUrgencia: 'Alto',
    ubicacion: 'Poste 142, Av. Alemania altura 800',
    votos: 31,
    comentarios: 7,
  },
  {
    id: '5',
    titulo: 'Vereda completamente destruida',
    descripcion: 'La vereda está rota y presenta peligro para caminar. Impide el acceso a personas con movilidad reducida.',
    descripcionCorta: 'La vereda está rota y presenta peligro para caminar...',
    autor: 'Pedro Martínez',
    fecha: '2024-10-03T14:20:00Z',
    fechaRelativa: 'hace 4d',
    estado: 'Resuelto',
    tipoDenuncia: 'Accesibilidad',
    nivelUrgencia: 'Medio',
    ubicacion: 'Vereda norte, Av. Alemania cuadra 7',
    votos: 15,
    comentarios: 2,
  },
];

const ITEMS_PER_PAGE = 10;

export default function ReportsListScreen() {
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<ReportsListFilters>({
    searchQuery: '',
    status: 'todos',
    type: 'todos',
    urgency: 'todos',
    sortBy: 'fecha',
    sortOrder: 'desc',
  });

  // Obtener valores únicos para filtros
  const uniqueStatuses: ReportStatus[] = ['Nuevo', 'En proceso', 'Resuelto', 'Rechazado', 'Cancelado'];
  const uniqueTypes: string[] = Array.from(new Set(mockReports.map(r => r.tipoDenuncia)));
  const uniqueUrgencies: UrgencyLevel[] = ['Bajo', 'Medio', 'Alto', 'Crítico'];

  // Filtrar y ordenar reportes
  const filteredAndSortedReports = useMemo(() => {
    let filtered = [...mockReports];

    // Aplicar búsqueda
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(report =>
        report.titulo.toLowerCase().includes(query) ||
        report.descripcion.toLowerCase().includes(query) ||
        report.autor.toLowerCase().includes(query) ||
        report.ubicacion.toLowerCase().includes(query) ||
        report.tipoDenuncia.toLowerCase().includes(query)
      );
    }

    // Aplicar filtros
    if (filters.status !== 'todos') {
      filtered = filtered.filter(report => report.estado === filters.status);
    }
    if (filters.type !== 'todos') {
      filtered = filtered.filter(report => report.tipoDenuncia === filters.type);
    }
    if (filters.urgency !== 'todos') {
      filtered = filtered.filter(report => report.nivelUrgencia === filters.urgency);
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'fecha':
          comparison = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
          break;
        case 'urgencia':
          const urgencyOrder = { 'Crítico': 4, 'Alto': 3, 'Medio': 2, 'Bajo': 1 };
          comparison = urgencyOrder[b.nivelUrgencia] - urgencyOrder[a.nivelUrgencia];
          break;
        case 'votos':
          comparison = (b.votos || 0) - (a.votos || 0);
          break;
        case 'estado':
          comparison = a.estado.localeCompare(b.estado);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [filters]);

  // Paginación
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedReports, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedReports.length / ITEMS_PER_PAGE);

  // Handlers
  const handleRefresh = () => {
    setRefreshing(true);
    // Aquí iría la lógica para recargar datos de la API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleReportPress = (report: ReportListItemType) => {
    // Navegar al detalle del reporte
    router.push(`/report/${report.id}`);
  };

  const handleShareReport = (report: ReportListItemType) => {
    // Lógica para compartir reporte
    console.log('Compartir reporte:', report.id);
  };

  const handleFilterChange = (key: keyof ReportsListFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      status: 'todos',
      type: 'todos',
      urgency: 'todos',
      sortBy: 'fecha',
      sortOrder: 'desc',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return filters.searchQuery.trim() !== '' ||
           filters.status !== 'todos' ||
           filters.type !== 'todos' ||
           filters.urgency !== 'todos' ||
           filters.sortBy !== 'fecha' ||
           filters.sortOrder !== 'desc';
  };

  // Componente de botón de filtro
  const FilterButton = ({
    title,
    isActive,
    onPress
  }: {
    title: string;
    isActive: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      className={`mr-2 rounded-lg px-3 py-2 ${isActive ? 'bg-[#537CF2]' : 'bg-[#1D212D]'}`}
      onPress={onPress}
    >
      <Text className={`text-sm ${isActive ? 'text-white' : 'text-gray-300'}`}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between bg-[#13161E] px-4 py-3">
        <TouchableOpacity
          className="rounded-xl bg-[#537CF2] p-2"
          onPress={() => router.push('/(tabs)/home')}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold text-white">
          Lista de Reportes
        </Text>
        {/* Espaciador para centrar título */}
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#537CF2"
          />
        }
      >
        {/* Barra de búsqueda */}
        <View className="mb-4 rounded-xl bg-[#13161E] p-4">
          <View className="flex-row items-center rounded-lg bg-[#1D212D] px-3 py-2">
            <Ionicons name="search" size={20} color="gray" />
            <TextInput
              className="ml-3 flex-1 text-white"
              placeholder="Buscar reportes..."
              placeholderTextColor="gray"
              value={filters.searchQuery}
              onChangeText={(text) => handleFilterChange('searchQuery', text)}
              returnKeyType="search"
            />
            {filters.searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => handleFilterChange('searchQuery', '')}
                className="ml-2"
              >
                <Ionicons name="close-circle" size={20} color="gray" />
              </TouchableOpacity>
            )}
          </View>
          {filters.searchQuery.length > 0 && (
            <Text className="mt-2 text-xs text-blue-400">
              Buscando: "{filters.searchQuery}" - {filteredAndSortedReports.length} resultado{filteredAndSortedReports.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Filtros */}
        <View className="mb-4 rounded-xl bg-[#13161E] p-4">
          <View className="mb-3">
            <Text className="mb-2 text-sm font-bold text-blue-400">Filtrar por estado:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <FilterButton
                title="Todos"
                isActive={filters.status === 'todos'}
                onPress={() => handleFilterChange('status', 'todos')}
              />
              {uniqueStatuses.map(status => (
                <FilterButton
                  key={status}
                  title={status}
                  isActive={filters.status === status}
                  onPress={() => handleFilterChange('status', status)}
                />
              ))}
            </ScrollView>
          </View>

          <View className="mb-3">
            <Text className="mb-2 text-sm font-bold text-blue-400">Tipo de denuncia:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <FilterButton
                title="Todos"
                isActive={filters.type === 'todos'}
                onPress={() => handleFilterChange('type', 'todos')}
              />
              {uniqueTypes.map(type => (
                <FilterButton
                  key={type}
                  title={type}
                  isActive={filters.type === type}
                  onPress={() => handleFilterChange('type', type)}
                />
              ))}
            </ScrollView>
          </View>

          <View className="mb-3">
            <Text className="mb-2 text-sm font-bold text-blue-400">Nivel de urgencia:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <FilterButton
                title="Todos"
                isActive={filters.urgency === 'todos'}
                onPress={() => handleFilterChange('urgency', 'todos')}
              />
              {uniqueUrgencies.map(urgency => (
                <FilterButton
                  key={urgency}
                  title={urgency}
                  isActive={filters.urgency === urgency}
                  onPress={() => handleFilterChange('urgency', urgency)}
                />
              ))}
            </ScrollView>
          </View>

          <View>
            <Text className="mb-2 text-sm font-bold text-blue-400">Ordenar por:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <FilterButton
                title="Más recientes"
                isActive={filters.sortBy === 'fecha' && filters.sortOrder === 'desc'}
                onPress={() => {
                  handleFilterChange('sortBy', 'fecha');
                  handleFilterChange('sortOrder', 'desc');
                }}
              />
              <FilterButton
                title="Más antiguos"
                isActive={filters.sortBy === 'fecha' && filters.sortOrder === 'asc'}
                onPress={() => {
                  handleFilterChange('sortBy', 'fecha');
                  handleFilterChange('sortOrder', 'asc');
                }}
              />
              <FilterButton
                title="Más urgentes"
                isActive={filters.sortBy === 'urgencia'}
                onPress={() => handleFilterChange('sortBy', 'urgencia')}
              />
              <FilterButton
                title="Más votados"
                isActive={filters.sortBy === 'votos'}
                onPress={() => handleFilterChange('sortBy', 'votos')}
              />
              {hasActiveFilters() && (
                <TouchableOpacity
                  className="mr-2 rounded-lg bg-[#537CF2] px-3 py-2"
                  onPress={clearFilters}
                >
                  <Text className="text-sm text-white">Limpiar filtros</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Lista de reportes */}
        <View className="mb-4 rounded-xl bg-[#13161E] p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-blue-400">
              Reportes ({filteredAndSortedReports.length})
            </Text>
            <Text className="text-sm text-gray-400">
              Página {currentPage} de {totalPages}
            </Text>
          </View>

          {paginatedReports.length > 0 ? (
            <FlatList
              data={paginatedReports}
              renderItem={({ item }) => (
                <ReportListItem
                  report={item}
                  onPress={handleReportPress}
                  onShare={handleShareReport}
                />
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="items-center py-8">
              <Ionicons name="document-text-outline" size={48} color="gray" />
              <Text className="mt-2 text-center text-gray-400">
                No se encontraron reportes con los filtros aplicados
              </Text>
            </View>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <View className="mt-4 flex-row items-center justify-between">
              <TouchableOpacity
                className={`flex-row items-center rounded-lg px-3 py-2 ${
                  currentPage === 1 ? 'bg-[#1D212D]' : 'bg-[#537CF2]'
                }`}
                onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <Ionicons name="chevron-back" size={16} color={currentPage === 1 ? 'gray' : 'white'} />
                <Text className={`ml-1 text-sm ${currentPage === 1 ? 'text-gray-400' : 'text-white'}`}>
                  Anterior
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-row items-center rounded-lg px-3 py-2 ${
                  currentPage === totalPages ? 'bg-[#1D212D]' : 'bg-[#537CF2]'
                }`}
                onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <Text className={`mr-1 text-sm ${currentPage === totalPages ? 'text-gray-400' : 'text-white'}`}>
                  Siguiente
                </Text>
                <Ionicons name="chevron-forward" size={16} color={currentPage === totalPages ? 'gray' : 'white'} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
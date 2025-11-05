import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReportListItem from '../components/ReportListItem';
import { ReportListItem as ReportListItemType, ReportsListFilters, ReportStatus, UrgencyLevel } from '../types';
import { useReports } from '../hooks/useReports';

const ITEMS_PER_PAGE = 10;

export default function ReportsListScreen() {
  // Estados UI locales
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ReportsListFilters>({
    searchQuery: '',
    status: 'todos',
    type: 'todos',
    urgency: 'todos',
    sortBy: 'fecha',
    sortOrder: 'desc',
  });

  // Hook para obtener datos de la API
  const {
    allResults,
    loading,
    error,
    setFilters: setApiFilters,
    refresh,
    loadMore,
    hasMore,
  } = useReports({ 
    limit: 50,
    debounceMs: 500,
  });

  // Mapear urgencia a número para la API
  const mapUrgencyToNumber = (urgency: UrgencyLevel | 'todos'): number | undefined => {
    if (urgency === 'todos') return undefined;
    const map: Record<UrgencyLevel, number> = {
      'Bajo': 1,
      'Medio': 2,
      'Alto': 3,
      'Crítico': 3, // Mapear Crítico también a 3 (Alta)
    };
    return map[urgency];
  };

  // Obtener valores únicos para filtros desde los datos reales
  const uniqueStatuses: ReportStatus[] = useMemo(() => {
    const statuses = Array.from(new Set(allResults.map(r => r.estado)));
    return ['Nuevo', 'En proceso', 'Resuelto', 'Rechazado', 'Cancelado'].filter(s => 
      statuses.includes(s as ReportStatus)
    ) as ReportStatus[];
  }, [allResults]);

  const uniqueTypes: string[] = useMemo(() => 
    Array.from(new Set(allResults.map(r => r.tipoDenuncia).filter(Boolean))),
    [allResults]
  );

  const uniqueUrgencies: UrgencyLevel[] = useMemo(() => {
    const urgencies = Array.from(new Set(allResults.map(r => r.nivelUrgencia)));
    return ['Bajo', 'Medio', 'Alto', 'Crítico'].filter(u => 
      urgencies.includes(u as UrgencyLevel)
    ) as UrgencyLevel[];
  }, [allResults]);

  // Filtrar y ordenar reportes (client-side)
  const filteredAndSortedReports = useMemo(() => {
    let filtered = [...allResults];

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
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

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
    
    // Actualizar filtros de API cuando sea necesario
    if (key === 'searchQuery') {
      setApiFilters({ search: value || undefined });
    } else if (key === 'urgency' && value !== 'todos') {
      setApiFilters({ urgencia: mapUrgencyToNumber(value) });
    } else if (key === 'urgency' && value === 'todos') {
      setApiFilters({ urgencia: undefined });
    }
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
            refreshing={loading}
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

          {/* Estado de carga */}
          {loading && allResults.length === 0 && (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#537CF2" />
              <Text className="mt-2 text-center text-gray-400">
                Cargando reportes...
              </Text>
            </View>
          )}

          {/* Error state */}
          {error && !loading && (
            <View className="items-center py-8">
              <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
              <Text className="mt-2 text-center text-red-400">
                {error}
              </Text>
              <TouchableOpacity
                className="mt-4 rounded-lg bg-[#537CF2] px-4 py-2"
                onPress={handleRefresh}
              >
                <Text className="text-white">Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Lista de reportes */}
          {!loading && !error && paginatedReports.length > 0 ? (
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
          ) : !loading && !error ? (
            <View className="items-center py-8">
              <Ionicons name="document-text-outline" size={48} color="gray" />
              <Text className="mt-2 text-center text-gray-400">
                No se encontraron reportes con los filtros aplicados
              </Text>
              {hasActiveFilters() && (
                <TouchableOpacity
                  className="mt-4 rounded-lg bg-[#537CF2] px-4 py-2"
                  onPress={clearFilters}
                >
                  <Text className="text-white">Limpiar filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          {/* Indicador de carga al final (load more) */}
          {loading && allResults.length > 0 && (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#537CF2" />
            </View>
          )}

          {/* Botón para cargar más (si hay más datos en el backend) */}
          {hasMore && !loading && allResults.length > 0 && (
            <TouchableOpacity
              className="mt-4 items-center rounded-lg bg-[#537CF2] py-3"
              onPress={loadMore}
            >
              <Text className="text-white font-semibold">Cargar más reportes</Text>
            </TouchableOpacity>
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
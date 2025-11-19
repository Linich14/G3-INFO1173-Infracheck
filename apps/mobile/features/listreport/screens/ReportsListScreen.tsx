import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, TextInput, RefreshControl, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReportListItem from '../components/ReportListItem';
import { ReportListItem as ReportListItemType, ReportsListFilters, ReportStatus, UrgencyLevel } from '../types';
import { useReports } from '../hooks/useReports';
import { useLanguage } from '~/contexts/LanguageContext';

const ITEMS_PER_PAGE = 10;

// Opciones persistentes para filtros
const ALL_STATUSES: (ReportStatus | 'todos')[] = ['todos', 'Nuevo', 'En proceso', 'Resuelto', 'Rechazado', 'Cancelado'];
const ALL_URGENCIES: (UrgencyLevel | 'todos')[] = ['todos', 'Bajo', 'Medio', 'Alto', 'Crítico'];
const ALL_TYPES = ['todos', 'Alumbrado público', 'Baches', 'Limpieza', 'Área verde', 'Seguridad', 'Otro'];

export default function ReportsListScreen() {
  const { t } = useLanguage();
  
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

  // Estados para modales de selección
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showUrgencyModal, setShowUrgencyModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

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
      'Crítico': 3,
    };
    return map[urgency];
  };

  // Obtener etiquetas para mostrar en los selectores
  const getStatusLabel = (status: ReportStatus | 'todos') => 
    status === 'todos' ? t('listReportAllStatuses') : status;
  
  const getTypeLabel = (type: string) => 
    type === 'todos' ? t('listReportAllTypes') : type;
  
  const getUrgencyLabel = (urgency: UrgencyLevel | 'todos') => 
    urgency === 'todos' ? t('listReportAllUrgencies') : urgency;
  
  const getSortLabel = () => {
    if (filters.sortBy === 'fecha' && filters.sortOrder === 'desc') return t('listReportSortByRecent');
    if (filters.sortBy === 'fecha' && filters.sortOrder === 'asc') return t('listReportSortByOldest');
    if (filters.sortBy === 'urgencia') return t('listReportSortByUrgency');
    if (filters.sortBy === 'votos') return t('listReportSortByVotes');
    return t('listReportSortBy');
  };

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
  }, [allResults, filters]);

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

  const handleFilterChange = useCallback((key: keyof ReportsListFilters, value: any) => {
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
  }, [setApiFilters]);

  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      status: 'todos',
      type: 'todos',
      urgency: 'todos',
      sortBy: 'fecha',
      sortOrder: 'desc',
    });
    setCurrentPage(1);
    setApiFilters({});
  }, [setApiFilters]);

  const hasActiveFilters = useCallback(() => {
    return filters.searchQuery.trim() !== '' ||
           filters.status !== 'todos' ||
           filters.type !== 'todos' ||
           filters.urgency !== 'todos' ||
           filters.sortBy !== 'fecha' ||
           filters.sortOrder !== 'desc';
  }, [filters]);

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
          {t('listReportTitle')}
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
              placeholder={t('listReportSearchPlaceholder')}
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
              {t('listReportSearching')} "{filters.searchQuery}" - {filteredAndSortedReports.length} {filteredAndSortedReports.length !== 1 ? t('listReportResults') : t('listReportResult')}
            </Text>
          )}
        </View>

        {/* Filtros en Grid 2x2 */}
        <View className="mb-4 rounded-xl bg-[#13161E] p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm font-bold text-blue-400">{t('listReportFilters')}</Text>
            {hasActiveFilters() && (
              <TouchableOpacity
                className="rounded-lg bg-red-500/20 px-3 py-1"
                onPress={clearFilters}
              >
                <Text className="text-xs text-red-400">{t('listReportClearFilters')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Grid 2x2 de selectores */}
          <View className="gap-3">
            {/* Fila 1 */}
            <View className="flex-row gap-3">
              {/* Estado */}
              <TouchableOpacity
                className="flex-1 rounded-lg bg-[#1D212D] p-3"
                onPress={() => setShowStatusModal(true)}
              >
                <Text className="mb-1 text-xs text-gray-400">{t('listReportStatus')}</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="flex-1 text-sm text-white" numberOfLines={1}>
                    {getStatusLabel(filters.status)}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="gray" />
                </View>
              </TouchableOpacity>

              {/* Tipo */}
              <TouchableOpacity
                className="flex-1 rounded-lg bg-[#1D212D] p-3"
                onPress={() => setShowTypeModal(true)}
              >
                <Text className="mb-1 text-xs text-gray-400">{t('listReportType')}</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="flex-1 text-sm text-white" numberOfLines={1}>
                    {getTypeLabel(filters.type)}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="gray" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Fila 2 */}
            <View className="flex-row gap-3">
              {/* Urgencia */}
              <TouchableOpacity
                className="flex-1 rounded-lg bg-[#1D212D] p-3"
                onPress={() => setShowUrgencyModal(true)}
              >
                <Text className="mb-1 text-xs text-gray-400">{t('listReportUrgency')}</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="flex-1 text-sm text-white" numberOfLines={1}>
                    {getUrgencyLabel(filters.urgency)}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="gray" />
                </View>
              </TouchableOpacity>

              {/* Ordenar */}
              <TouchableOpacity
                className="flex-1 rounded-lg bg-[#1D212D] p-3"
                onPress={() => setShowSortModal(true)}
              >
                <Text className="mb-1 text-xs text-gray-400">{t('listReportSort')}</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="flex-1 text-sm text-white" numberOfLines={1}>
                    {getSortLabel()}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="gray" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Lista de reportes */}
        <View className="mb-4 rounded-xl bg-[#13161E] p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-blue-400">
              {t('listReportReportsCount').replace('{count}', filteredAndSortedReports.length.toString())}
            </Text>
            <Text className="text-sm text-gray-400">
              {t('listReportPage')} {currentPage} {t('listReportOf')} {totalPages}
            </Text>
          </View>

          {/* Estado de carga */}
          {loading && allResults.length === 0 && (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#537CF2" />
              <Text className="mt-2 text-center text-gray-400">
                {t('listReportLoading')}
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
                <Text className="text-white">{t('listReportRetry')}</Text>
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
              ItemSeparatorComponent={() => <View className="h-3" />}
            />
          ) : !loading && !error ? (
            <View className="items-center py-8">
              <Ionicons name="document-text-outline" size={48} color="gray" />
              <Text className="mt-2 text-center text-gray-400">
                {t('listReportNoResults')}
              </Text>
              {hasActiveFilters() && (
                <TouchableOpacity
                  className="mt-4 rounded-lg bg-[#537CF2] px-4 py-2"
                  onPress={clearFilters}
                >
                  <Text className="text-white">{t('listReportClearFiltersButton')}</Text>
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
              <Text className="text-white font-semibold">{t('listReportLoadMore')}</Text>
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
                  {t('listReportPrevious')}
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
                  {t('listReportNext')}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={currentPage === totalPages ? 'gray' : 'white'} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de Estado */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowStatusModal(false)}
        >
          <View className="bg-[#13161E] rounded-t-3xl p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-white">{t('listReportFilterByStatus')}</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView className="max-h-96">
              {ALL_STATUSES.map((status) => (
                <TouchableOpacity
                  key={status}
                  className={`mb-2 rounded-lg p-4 ${
                    filters.status === status ? 'bg-[#537CF2]' : 'bg-[#1D212D]'
                  }`}
                  onPress={() => {
                    handleFilterChange('status', status);
                    setShowStatusModal(false);
                  }}
                >
                  <Text className="text-white">{getStatusLabel(status)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de Tipo */}
      <Modal
        visible={showTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowTypeModal(false)}
        >
          <View className="bg-[#13161E] rounded-t-3xl p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-white">{t('listReportTypeOfComplaint')}</Text>
              <TouchableOpacity onPress={() => setShowTypeModal(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView className="max-h-96">
              {ALL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  className={`mb-2 rounded-lg p-4 ${
                    filters.type === type ? 'bg-[#537CF2]' : 'bg-[#1D212D]'
                  }`}
                  onPress={() => {
                    handleFilterChange('type', type);
                    setShowTypeModal(false);
                  }}
                >
                  <Text className="text-white">{getTypeLabel(type)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de Urgencia */}
      <Modal
        visible={showUrgencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUrgencyModal(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowUrgencyModal(false)}
        >
          <View className="bg-[#13161E] rounded-t-3xl p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-white">{t('listReportUrgencyLevel')}</Text>
              <TouchableOpacity onPress={() => setShowUrgencyModal(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView className="max-h-96">
              {ALL_URGENCIES.map((urgency) => (
                <TouchableOpacity
                  key={urgency}
                  className={`mb-2 rounded-lg p-4 ${
                    filters.urgency === urgency ? 'bg-[#537CF2]' : 'bg-[#1D212D]'
                  }`}
                  onPress={() => {
                    handleFilterChange('urgency', urgency);
                    setShowUrgencyModal(false);
                  }}
                >
                  <Text className="text-white">{getUrgencyLabel(urgency)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de Ordenamiento */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View className="bg-[#13161E] rounded-t-3xl p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-white">{t('listReportSortBy')}</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView className="max-h-96">
              <TouchableOpacity
                className={`mb-2 rounded-lg p-4 ${
                  filters.sortBy === 'fecha' && filters.sortOrder === 'desc' ? 'bg-[#537CF2]' : 'bg-[#1D212D]'
                }`}
                onPress={() => {
                  handleFilterChange('sortBy', 'fecha');
                  handleFilterChange('sortOrder', 'desc');
                  setShowSortModal(false);
                }}
              >
                <Text className="text-white">{t('listReportSortByRecent')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`mb-2 rounded-lg p-4 ${
                  filters.sortBy === 'fecha' && filters.sortOrder === 'asc' ? 'bg-[#537CF2]' : 'bg-[#1D212D]'
                }`}
                onPress={() => {
                  handleFilterChange('sortBy', 'fecha');
                  handleFilterChange('sortOrder', 'asc');
                  setShowSortModal(false);
                }}
              >
                <Text className="text-white">{t('listReportSortByOldest')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`mb-2 rounded-lg p-4 ${
                  filters.sortBy === 'urgencia' ? 'bg-[#537CF2]' : 'bg-[#1D212D]'
                }`}
                onPress={() => {
                  handleFilterChange('sortBy', 'urgencia');
                  setShowSortModal(false);
                }}
              >
                <Text className="text-white">{t('listReportSortByUrgency')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`mb-2 rounded-lg p-4 ${
                  filters.sortBy === 'votos' ? 'bg-[#537CF2]' : 'bg-[#1D212D]'
                }`}
                onPress={() => {
                  handleFilterChange('sortBy', 'votos');
                  setShowSortModal(false);
                }}
              >
                <Text className="text-white">{t('listReportSortByVotes')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
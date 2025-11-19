import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../../../components/ProjectCard';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ProjectItem {
  id: number;
  lugar: string;
  estado: string;
  color: string;
  prioridad: string;
  reportesAsociados?: number;
  votosAFavor?: number;
  tipoDenuncia?: string;
  fechaCreacion: Date;
}

type FilterType = 'todos' | 'prioridad' | 'estado';
type SortOrder = 'recientes' | 'antiguos' | 'prioridad' | 'votos';



export default function App() {
  const { t } = useLanguage();
  
  // UI state for controls
  const [filterType, setFilterType] = useState<FilterType>('todos');
  const [filterValue, setFilterValue] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('recientes');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Configuración de paginación
  const ITEMS_PER_PAGE = 5;

  // Hook: fetches projects (applies server-side filters when possible)
  const {
    items: _ignoredItems,
    allResults,
    total,
    page,
    pageSize,
    loading,
    error,
    filters,
    setFilters,
    sort,
    setSort,
    setPage,
    refresh,
  } = useProjects({ pageSize: ITEMS_PER_PAGE });

  // derive unique filter options from fetched results
  const uniquePriorities = useMemo(() => Array.from(new Set(allResults.map((p) => p.prioridad).filter(Boolean as any))), [allResults]);
  const uniqueStates = useMemo(() => Array.from(new Set(allResults.map((p) => p.estado).filter(Boolean as any))), [allResults]);

  // Client-side filtering & sorting (we still send server filters via setFilters when user chooses)
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = [...allResults];

    // Aplicar búsqueda por texto local (server may also filter)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((project) => {
        const lugar = (project.lugar || project.titulo || '').toLowerCase();
        const tipo = (project.tipoDenuncia || '').toLowerCase();
        const estado = (project.estado || '').toLowerCase();
        const prioridad = (project.prioridad || '').toLowerCase();
        return lugar.includes(query) || tipo.includes(query) || estado.includes(query) || prioridad.includes(query);
      });
    }

    // Aplicar filtros UI
    if (filterType === 'prioridad' && filterValue) {
      filtered = filtered.filter((project) => (project.prioridad || '') === filterValue);
    } else if (filterType === 'estado' && filterValue) {
      filtered = filtered.filter((project) => (project.estado || '') === filterValue);
    }

    // Aplicar ordenamiento local
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'recientes':
          return new Date(b.fechaCreacion || '').getTime() - new Date(a.fechaCreacion || '').getTime();
        case 'antiguos':
          return new Date(a.fechaCreacion || '').getTime() - new Date(b.fechaCreacion || '').getTime();
        case 'prioridad': {
          const priorityOrder: Record<string, number> = { 'Muy Importante': 3, Importante: 2, Normal: 1 };
          return (priorityOrder[b.prioridad || ''] || 0) - (priorityOrder[a.prioridad || ''] || 0);
        }
        case 'votos':
          return (b.votosAFavor || 0) - (a.votosAFavor || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allResults, filterType, filterValue, sortOrder, searchQuery]);

  // Datos paginados
  const paginatedProjects = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedProjects.slice(startIndex, endIndex);
  }, [filteredAndSortedProjects, page]);

  // Cálculo de páginas totales
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedProjects.length / ITEMS_PER_PAGE));

  /**
   * Navega a la pantalla de detalles del proyecto usando router
   * @param project - El proyecto seleccionado
   */
  const handleProjectSelect = (project: ProjectItem) => {
    router.push({
      pathname: '/(tabs)/proyect/[id]',
      params: { id: project.id.toString() }
    });
  };

  // Funciones de filtrado
  const handleFilterChange = (type: FilterType, value: string = '') => {
    setFilterType(type);
    setFilterValue(value);
    setPage(1); // Reset a primera página al cambiar filtro
    // update server-side filters when possible
    if (type === 'prioridad') {
      setFilters({ prioridad: value || undefined });
    } else if (type === 'estado') {
      setFilters({ estado: value || undefined });
    } else {
      setFilters({});
    }
  };

  const handleSortChange = (order: SortOrder) => {
    setSortOrder(order);
    setPage(1); // Reset a primera página al cambiar orden
    // local sort only (backend doesn't support sort currently)
  };

  // Funciones de búsqueda
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setPage(1); // Reset a primera página al buscar
    setFilters({ search: text || undefined });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPage(1);
    setFilters({ search: undefined });
  };

  // Funciones de navegación para paginación
  const goToPreviousPage = () => {
    setPage((prev: number) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPage((prev: number) => Math.min(prev + 1, totalPages));
  };

  const clearFilters = () => {
    setFilterType('todos');
    setFilterValue('');
    setSortOrder('recientes');
    setSearchQuery('');
    setPage(1);
    setFilters({});
  };

  // Función para verificar si hay filtros activos
  const hasActiveFilters = () => {
    return filterType !== 'todos' || sortOrder !== 'recientes' || searchQuery.trim() !== '';
  };

  // Función para obtener el color de prioridad
  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'Muy Importante':
        return 'bg-red-600';
      case 'Importante':
        return 'bg-orange-600';
      case 'Normal':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  // Componente de controles de paginación
  const PaginationControls = ({
    currentPage,
    totalPages,
    onPrevious,
    onNext,
  }: {
    currentPage: number;
    totalPages: number;
    onPrevious: () => void;
    onNext: () => void;
  }) => (
    <View className="mt-3 flex-row items-center justify-between px-2">
      <TouchableOpacity
        className={`flex-row items-center rounded-lg px-3 py-2 ${
          currentPage === 1 ? 'bg-[#1D212D]' : 'bg-[#537CF2]'
        }`}
        onPress={onPrevious}
        disabled={currentPage === 1}>
        <Ionicons name="chevron-back" size={16} color={currentPage === 1 ? 'gray' : 'white'} />
        <Text className={`ml-1 text-sm ${currentPage === 1 ? 'text-gray-400' : 'text-white'}`}>
          {t('projectsListPreviousPage')}
        </Text>
      </TouchableOpacity>

      <View className="flex-row items-center">
        <Text className="text-sm text-white">
          {t('projectsListPage')} {currentPage} {t('projectsListOf')} {totalPages}
        </Text>
      </View>

      <TouchableOpacity
        className={`flex-row items-center rounded-lg px-3 py-2 ${
          currentPage === totalPages ? 'bg-[#1D212D]' : 'bg-[#537CF2]'
        }`}
        onPress={onNext}
        disabled={currentPage === totalPages}>
        <Text
          className={`mr-1 text-sm ${currentPage === totalPages ? 'text-gray-400' : 'text-white'}`}>
          {t('projectsListNextPage')}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={currentPage === totalPages ? 'gray' : 'white'}
        />
      </TouchableOpacity>
    </View>
  );

  // Renderizado de elemento de proyecto con información completa
  const renderProjectItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="mb-3 rounded-lg bg-[#1D212D] p-4"
      onPress={() => handleProjectSelect(item)}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="mb-2 flex-row items-center">
            <Ionicons name="location" size={16} color="white" />
            <Text className="ml-2 flex-1 font-medium text-white">{item.lugar}</Text>
          </View>

          <View className="mb-2 flex-row items-center">
            <View className="mr-4 flex-row items-center">
              <Text className={`rounded-md px-2 py-1 text-xs text-white ${item.color}`}>
                {item.estado}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text
                className={`rounded-md px-2 py-1 text-xs text-white ${getPriorityColor(item.prioridad)}`}>
                {item.prioridad}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-gray-400">{item.tipoDenuncia}</Text>
            <View className="flex-row items-center">
              <Ionicons name="thumbs-up" size={12} color="gray" />
              <Text className="ml-1 text-xs text-gray-400">{item.votosAFavor}</Text>
              <Ionicons name="document-text" size={12} color="gray" className="ml-3" />
              <Text className="ml-1 text-xs text-gray-400">{item.reportesAsociados}</Text>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="gray" />
      </View>
    </TouchableOpacity>
  );

  // Componente de botón de filtro
  const FilterButton = ({
    title,
    isActive,
    onPress,
  }: {
    title: string;
    isActive: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      className={`mr-2 rounded-lg px-3 py-2 ${isActive ? 'bg-[#537CF2]' : 'bg-[#1D212D]'}`}
      onPress={onPress}>
      <Text className={`text-sm ${isActive ? 'text-white' : 'text-gray-300'}`}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-black px-4 pt-10">
      {/* Header */}
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="rounded-xl bg-[#537CF2] p-2"
            onPress={() => router.push('/(tabs)/home')}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-bold text-white">{t('projectsListTitle')}</Text>
        </View>
      </View>

      {/* Barra de Búsqueda */}
      <View className="mb-4 rounded-xl bg-[#13161E] p-4">
        <View className="flex-row items-center rounded-lg bg-[#1D212D] px-3 py-2">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            className="ml-3 flex-1 text-white"
            placeholder={t('projectsListSearchPlaceholder')}
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={handleSearchChange}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} className="ml-2">
              <Ionicons name="close-circle" size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>
        {searchQuery.length > 0 && (
          <Text className="mt-2 text-xs text-blue-400">
            {t('projectsListSearch')}: &quot;{searchQuery}&quot; - {filteredAndSortedProjects.length} resultado{filteredAndSortedProjects.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Controles de Filtro y Ordenamiento */}
        <View className="mb-4 rounded-xl bg-[#13161E] p-4">
          {/* Filtros principales */}
          <View className="mb-3">
            <Text className="mb-2 text-sm font-bold text-blue-400">{t('projectsListFilterAll')}:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <FilterButton
                title={t('projectsListFilterAll')}
                isActive={filterType === 'todos'}
                onPress={() => handleFilterChange('todos')}
              />
              <FilterButton
                title={t('projectsListFilterPriority')}
                isActive={filterType === 'prioridad'}
                onPress={() => handleFilterChange('prioridad')}
              />
              <FilterButton
                title={t('projectsListFilterStatus')}
                isActive={filterType === 'estado'}
                onPress={() => handleFilterChange('estado')}
              />
              {hasActiveFilters() && (
                <TouchableOpacity
                  className="mr-2 rounded-lg bg-[#537CF2] px-3 py-2"
                  onPress={clearFilters}>
                  <Text className="text-sm text-white">{t('projectsListClearFilters')}</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          {/* Filtros específicos */}
          {filterType === 'prioridad' && (
            <View className="mb-3">
              <Text className="mb-2 text-sm text-gray-300">Selecciona prioridad:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {uniquePriorities.map((priority) => (
                  <FilterButton
                    key={String(priority)}
                    title={String(priority || '')}
                    isActive={filterValue === (priority || '')}
                    onPress={() => handleFilterChange('prioridad', String(priority || ''))}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {filterType === 'estado' && (
            <View className="mb-3">
              <Text className="mb-2 text-sm text-gray-300">Selecciona estado:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {uniqueStates.map((state) => (
                  <FilterButton
                    key={String(state)}
                    title={String(state || '')}
                    isActive={filterValue === (state || '')}
                    onPress={() => handleFilterChange('estado', String(state || ''))}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Ordenamiento */}
          <View>
            <Text className="mb-2 text-sm font-bold text-blue-400">{t('projectsListSortRecent')}:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <FilterButton
                title={t('projectsListSortRecent')}
                isActive={sortOrder === 'recientes'}
                onPress={() => handleSortChange('recientes')}
              />
              <FilterButton
                title={t('projectsListSortOldest')}
                isActive={sortOrder === 'antiguos'}
                onPress={() => handleSortChange('antiguos')}
              />
              <FilterButton
                title={t('projectsListSortPriority')}
                isActive={sortOrder === 'prioridad'}
                onPress={() => handleSortChange('prioridad')}
              />
              <FilterButton
                title={t('projectsListSortVotes')}
                isActive={sortOrder === 'votos'}
                onPress={() => handleSortChange('votos')}
              />
            </ScrollView>
          </View>
        </View>

        {/* Lista de Proyectos */}
        <View className="rounded-xl bg-[#13161E] p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-blue-400">
              {searchQuery.length > 0
                ? t('projectsListSearch')
                : filterType === 'todos'
                  ? t('projectsListTitle')
                  : filterType === 'prioridad'
                    ? `${t('projectsListFilterPriority')}: ${filterValue || t('projectsListFilterAll')}`
                    : `${t('projectsListFilterStatus')}: ${filterValue || t('projectsListFilterAll')}`}
            </Text>
            <Text className="text-sm text-gray-400">
              {filteredAndSortedProjects.length} elemento{filteredAndSortedProjects.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {paginatedProjects.length > 0 ? (
            <>
              <FlatList
                data={paginatedProjects as any}
                renderItem={renderProjectItem}
                keyExtractor={(item) => String(item.id)}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />

              {totalPages > 1 && (
                <PaginationControls
                  currentPage={page}
                  totalPages={totalPages}
                  onPrevious={goToPreviousPage}
                  onNext={goToNextPage}
                />
              )}
            </>
          ) : (
            <View className="items-center py-8">
              <Ionicons name="folder-open-outline" size={48} color="gray" />
              <Text className="mt-2 text-center text-gray-400">
                {t('projectsListEmptyDescription')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

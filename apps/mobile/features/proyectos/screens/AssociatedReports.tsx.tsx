import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReportsStatistics from './ReportsStatistics';

interface Report {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  usuario: string;
  votos: number;
  ubicacionEspecifica: string;
  fechaCreacion: Date;
}

type FilterType = 'todos' | 'fecha' | 'votos';
type SortOrder = 'recientes' | 'antiguos' | 'masVotados' | 'menosVotados';

interface ReportsViewProps {
  projectId: number;
  projectName: string;
  onBack: () => void;
}

// Datos falsos de ejemplo - después los reemplazarás con datos reales
const reportesEjemplo: Report[] = [
  {
    id: 1,
    titulo: 'Bache profundo en intersección',
    descripcion: 'Hay un bache muy profundo que puede dañar los vehículos. Es urgente repararlo.',
    fecha: '2024-09-05',
    usuario: 'Juan Pérez',
    votos: 23,
    ubicacionEspecifica: 'Esquina de Av. Alemania con Prat',
    fechaCreacion: new Date('2024-09-05'),
  },
  {
    id: 2,
    titulo: 'Un bache qlo malo weon',
    descripcion: 'La calle presenta irregularidades que dificultan el tránsito de peatones.',
    fecha: '2024-09-03',
    usuario: 'María González',
    votos: 15,
    ubicacionEspecifica: 'Frente al edificio municipal',
    fechaCreacion: new Date('2024-09-03'),
  },
  {
    id: 3,
    titulo: 'Yapo muni pa cuando el bache',
    descripcion: 'Hice mierda el auto por ese bache',
    fecha: '2024-09-01',
    usuario: 'Carlos Silva',
    votos: 8,
    ubicacionEspecifica: 'Cerca del semáforo principal',
    fechaCreacion: new Date('2024-09-01'),
  },
  {
    id: 4,
    titulo: 'Semáforo no funciona',
    descripcion: 'El semáforo está intermitente desde hace una semana, causando confusión.',
    fecha: '2024-08-28',
    usuario: 'Ana Rodríguez',
    votos: 42,
    ubicacionEspecifica: "Intersección Av. Alemania con O'Higgins",
    fechaCreacion: new Date('2024-08-28'),
  },
  {
    id: 5,
    titulo: 'Luminaria quemada',
    descripcion: 'La luminaria está quemada hace 2 semanas, zona muy oscura de noche.',
    fecha: '2024-08-25',
    usuario: 'Pedro Martínez',
    votos: 18,
    ubicacionEspecifica: 'Poste 142, Av. Alemania altura 800',
    fechaCreacion: new Date('2024-08-25'),
  },
  {
    id: 6,
    titulo: 'Vereda destruida',
    descripcion: 'La vereda está completamente rota, imposible caminar.',
    fecha: '2024-08-30',
    usuario: 'Luis López',
    votos: 31,
    ubicacionEspecifica: 'Vereda norte, Av. Alemania cuadra 7',
    fechaCreacion: new Date('2024-08-30'),
  },
  {
    id: 7,
    titulo: 'Basura acumulada',
    descripcion: 'Hay basura acumulada que no ha sido recolectada en días.',
    fecha: '2024-09-07',
    usuario: 'Carmen Flores',
    votos: 12,
    ubicacionEspecifica: 'Contenedores frente al N° 756',
    fechaCreacion: new Date('2024-09-07'),
  },
  {
    id: 8,
    titulo: 'Alcantarilla tapada',
    descripcion: 'Se inunda toda la calle cuando llueve por alcantarilla obstruida.',
    fecha: '2024-09-02',
    usuario: 'Roberto Sánchez',
    votos: 67,
    ubicacionEspecifica: 'Alcantarilla esquina Prat con Alemania',
    fechaCreacion: new Date('2024-09-02'),
  },
];

export default function ReportsView({ projectId, projectName, onBack }: ReportsViewProps) {
  const [showStatistics, setShowStatistics] = useState(false);

  // Estados para búsqueda, filtros y paginación
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterType, setFilterType] = useState<FilterType>('todos');
  const [sortOrder, setSortOrder] = useState<SortOrder>('recientes');

  // Configuración de paginación
  const ITEMS_PER_PAGE = 4;

  // Función de filtrado y ordenamiento
  const filteredAndSortedReports = useMemo(() => {
    let filtered = [...reportesEjemplo];

    // Aplicar búsqueda por texto
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (report) =>
          report.titulo.toLowerCase().includes(query) ||
          report.descripcion.toLowerCase().includes(query) ||
          report.usuario.toLowerCase().includes(query) ||
          report.ubicacionEspecifica.toLowerCase().includes(query)
      );
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'recientes':
          return b.fechaCreacion.getTime() - a.fechaCreacion.getTime();
        case 'antiguos':
          return a.fechaCreacion.getTime() - b.fechaCreacion.getTime();
        case 'masVotados':
          return b.votos - a.votos;
        case 'menosVotados':
          return a.votos - b.votos;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, sortOrder]);

  // Datos paginados
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedReports.slice(startIndex, endIndex);
  }, [filteredAndSortedReports, currentPage]);

  // Cálculos
  const totalPages = Math.ceil(filteredAndSortedReports.length / ITEMS_PER_PAGE);
  const totalVotos = reportesEjemplo.reduce((sum, report) => sum + report.votos, 0);

  // Funciones de manejo
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleSortChange = (order: SortOrder) => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSortOrder('recientes');
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return searchQuery.trim() !== '' || sortOrder !== 'recientes';
  };

  // Componente de renderizado de reporte
  const renderReportItem = ({ item }: { item: Report }) => (
    <TouchableOpacity key={item.id} className="mb-4 rounded-xl bg-neutral-900 p-4">
      {/* Header del reporte */}
      <View className="mb-3 flex-row items-start justify-between">
        <Text className="flex-1 pr-2 text-lg font-semibold text-white">{item.titulo}</Text>
        <View className="flex-row items-center">
          <Ionicons name="arrow-up" size={16} color="#60A5FA" />
          <Text className="ml-1 font-semibold text-blue-400">{item.votos}</Text>
        </View>
      </View>

      {/* Información del reporte */}
      <Text className="mb-3 leading-5 text-gray-300">{item.descripcion}</Text>

      {/* Ubicación específica */}
      <View className="mb-3 flex-row items-center">
        <Ionicons name="location" size={14} color="#9CA3AF" />
        <Text className="ml-2 text-sm text-gray-400">{item.ubicacionEspecifica}</Text>
      </View>

      {/* Footer del reporte */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="person" size={14} color="#9CA3AF" />
          <Text className="ml-1 text-sm text-gray-400">{item.usuario}</Text>
          <Text className="ml-3 text-sm text-gray-400">{item.fecha}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
    <View className="mt-4 flex-row items-center justify-between px-2">
      <TouchableOpacity
        className={`flex-row items-center rounded-lg px-3 py-2 ${
          currentPage === 1 ? 'bg-neutral-700' : 'bg-blue-600'
        }`}
        onPress={onPrevious}
        disabled={currentPage === 1}>
        <Ionicons name="chevron-back" size={16} color={currentPage === 1 ? 'gray' : 'white'} />
        <Text className={`ml-1 text-sm ${currentPage === 1 ? 'text-gray-400' : 'text-white'}`}>
          Anterior
        </Text>
      </TouchableOpacity>

      <View className="flex-row items-center">
        <Text className="text-sm text-white">
          Página {currentPage} de {totalPages}
        </Text>
      </View>

      <TouchableOpacity
        className={`flex-row items-center rounded-lg px-3 py-2 ${
          currentPage === totalPages ? 'bg-neutral-700' : 'bg-blue-600'
        }`}
        onPress={onNext}
        disabled={currentPage === totalPages}>
        <Text
          className={`mr-1 text-sm ${currentPage === totalPages ? 'text-gray-400' : 'text-white'}`}>
          Siguiente
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={currentPage === totalPages ? 'gray' : 'white'}
        />
      </TouchableOpacity>
    </View>
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
      className={`mr-2 rounded-lg px-3 py-2 ${isActive ? 'bg-blue-600' : 'bg-neutral-700'}`}
      onPress={onPress}>
      <Text className={`text-sm ${isActive ? 'text-white' : 'text-gray-300'}`}>{title}</Text>
    </TouchableOpacity>
  );

  // Si está mostrando estadísticas, renderizar la vista de estadísticas
  if (showStatistics) {
    return (
      <ReportsStatistics
        projectId={projectId}
        projectName={projectName}
        onBack={() => setShowStatistics(false)}
      />
    );
  }

  return (
    <View className="flex-1 bg-black px-4 pt-10">
      {/* Header */}
      <View className="mb-4 flex-row items-center">
        <TouchableOpacity className="rounded-xl bg-blue-500 p-2" onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="ml-4 text-xl font-bold text-white">Reportes Asociados</Text>
      </View>

      {/* Barra de Búsqueda */}
      <View className="mb-4 rounded-xl bg-neutral-900 p-4">
        <View className="flex-row items-center rounded-lg bg-neutral-800 px-3 py-2">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            className="ml-3 flex-1 text-white"
            placeholder="Buscar reportes por título, descripción, usuario..."
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
            Buscando: "{searchQuery}" - {filteredAndSortedReports.length} resultado
            {filteredAndSortedReports.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Resumen del Proyecto */}
        <View className="mb-4 rounded-xl bg-neutral-900 p-4">
          <Text className="mb-3 text-lg font-bold text-blue-400">Proyecto: {projectName}</Text>

          <View className="mb-3 flex-row justify-between">
            <View className="mr-2 flex-1 rounded-lg bg-neutral-800 p-3">
              <Text className="text-center text-gray-400">Total Reportes</Text>
              <Text className="text-center text-2xl font-bold text-white">
                {reportesEjemplo.length}
              </Text>
            </View>
            <View className="ml-2 flex-1 rounded-lg bg-neutral-800 p-3">
              <Text className="text-center text-gray-400">Total Votos</Text>
              <Text className="text-center text-2xl font-bold text-white">{totalVotos}</Text>
            </View>
          </View>
        </View>

        {/* Controles de Ordenamiento */}
        <View className="mb-4 rounded-xl bg-neutral-900 p-4">
          <View className="mb-3">
            <Text className="mb-2 text-sm font-bold text-blue-400">Ordenar por:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <FilterButton
                title="Más Recientes"
                isActive={sortOrder === 'recientes'}
                onPress={() => handleSortChange('recientes')}
              />
              <FilterButton
                title="Más Antiguos"
                isActive={sortOrder === 'antiguos'}
                onPress={() => handleSortChange('antiguos')}
              />
              <FilterButton
                title="Más Votados"
                isActive={sortOrder === 'masVotados'}
                onPress={() => handleSortChange('masVotados')}
              />
              <FilterButton
                title="Menos Votados"
                isActive={sortOrder === 'menosVotados'}
                onPress={() => handleSortChange('menosVotados')}
              />
              {hasActiveFilters() && (
                <TouchableOpacity
                  className="mr-2 rounded-lg bg-red-600 px-3 py-2"
                  onPress={clearFilters}>
                  <Text className="text-sm text-white">Limpiar</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Lista de Reportes */}
        <View className="mb-4 rounded-xl bg-neutral-900 p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-blue-400">
              {searchQuery.length > 0 ? 'Resultados de Búsqueda' : 'Reportes Individuales'}
            </Text>
            <Text className="text-sm text-gray-400">
              {filteredAndSortedReports.length} reporte
              {filteredAndSortedReports.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {paginatedReports.length > 0 ? (
            <>
              <FlatList
                data={paginatedReports}
                renderItem={renderReportItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />

              {totalPages > 1 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPrevious={goToPreviousPage}
                  onNext={goToNextPage}
                />
              )}
            </>
          ) : (
            <View className="items-center py-8">
              <Ionicons name="document-text-outline" size={48} color="gray" />
              <Text className="mt-2 text-center text-gray-400">
                No se encontraron reportes con los criterios de búsqueda
              </Text>
            </View>
          )}
        </View>

        {/* Acciones */}
        <View className="mb-6 rounded-xl bg-neutral-900 p-4">
          <Text className="mb-4 text-lg font-bold text-blue-400">Acciones</Text>

          <TouchableOpacity
            className="mb-3 flex-row items-center rounded-lg bg-purple-600 p-4"
            onPress={() => setShowStatistics(true)}>
            <Ionicons name="analytics" size={20} color="white" />
            <Text className="ml-3 font-semibold text-white">Ver Estadísticas</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center rounded-lg bg-orange-600 p-4">
            <Ionicons name="download" size={20} color="white" />
            <Text className="ml-3 font-semibold text-white">Exportar Reportes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

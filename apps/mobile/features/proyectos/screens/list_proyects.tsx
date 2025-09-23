import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProjectDetails from './project_details';
import CreateProject from './create_project';

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

const dataProyectos: ProjectItem[] = [
    {
        id: 1,
        lugar: 'Calle esquina Alemania con Prat',
        estado: 'En Progreso',
        color: 'bg-purple-700',
        prioridad: 'Muy Importante',
        reportesAsociados: 3,
        votosAFavor: 46,
        tipoDenuncia: 'Infraestructura Vial',
        fechaCreacion: new Date('2024-12-20'),
    },
    {
        id: 2,
        lugar: 'Centro Temuco - Proyecto A',
        estado: 'Completado',
        color: 'bg-green-800',
        prioridad: 'Importante',
        reportesAsociados: 5,
        votosAFavor: 82,
        tipoDenuncia: 'Mantenimiento',
        fechaCreacion: new Date('2024-12-18'),
    },
    {
        id: 3,
        lugar: 'Plaza central',
        estado: 'Pendiente',
        color: 'bg-blue-700',
        prioridad: 'Normal',
        reportesAsociados: 2,
        votosAFavor: 15,
        tipoDenuncia: 'Espacios Públicos',
        fechaCreacion: new Date('2024-12-22'),
    },
    {
        id: 4,
        lugar: 'Avenida Siempre Viva',
        estado: 'Aprobado',
        color: 'bg-yellow-700',
        prioridad: 'Importante',
        reportesAsociados: 1,
        votosAFavor: 7,
        tipoDenuncia: 'Iluminación Pública',
        fechaCreacion: new Date('2024-12-15'),
    },
    {
        id: 5,
        lugar: 'Calle Falsa X',
        estado: 'Rechazado',
        color: 'bg-gray-700',
        prioridad: 'Normal',
        reportesAsociados: 4,
        votosAFavor: 23,
        tipoDenuncia: 'Servicios Básicos',
        fechaCreacion: new Date('2024-12-19'),
    },
    {
        id: 6,
        lugar: 'Centro Temuco - Proyecto B',
        estado: 'En Progreso',
        color: 'bg-purple-700',
        prioridad: 'Muy Importante',
        reportesAsociados: 8,
        votosAFavor: 124,
        tipoDenuncia: 'Infraestructura Vial',
        fechaCreacion: new Date('2024-12-21'),
    },
    {
        id: 7,
        lugar: 'Parque Municipal',
        estado: 'Pendiente',
        color: 'bg-blue-700',
        prioridad: 'Normal',
        reportesAsociados: 3,
        votosAFavor: 35,
        tipoDenuncia: 'Espacios Públicos',
        fechaCreacion: new Date('2024-12-17'),
    },
    {
        id: 8,
        lugar: 'Calle Arturo Prat',
        estado: 'Aprobado',
        color: 'bg-yellow-700',
        prioridad: 'Muy Importante',
        reportesAsociados: 6,
        votosAFavor: 89,
        tipoDenuncia: 'Mantenimiento',
        fechaCreacion: new Date('2024-12-23'),
    },
];

export default function App() {
    const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [showCreateProject, setShowCreateProject] = useState<boolean>(false);

    // Estados para filtros y ordenamiento
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [filterType, setFilterType] = useState<FilterType>('todos');
    const [filterValue, setFilterValue] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('recientes');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Configuración de paginación
    const ITEMS_PER_PAGE = 5;

    // Obtener valores únicos para filtros
    const uniquePriorities = Array.from(new Set(dataProyectos.map((p) => p.prioridad)));
    const uniqueStates = Array.from(new Set(dataProyectos.map((p) => p.estado)));

    // Función de filtrado y ordenamiento
    const filteredAndSortedProjects = useMemo(() => {
        let filtered = [...dataProyectos];

        // Aplicar búsqueda por texto
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(
                (project) =>
                    project.lugar.toLowerCase().includes(query) ||
                    project.tipoDenuncia?.toLowerCase().includes(query) ||
                    project.estado.toLowerCase().includes(query) ||
                    project.prioridad.toLowerCase().includes(query)
            );
        }

        // Aplicar filtros
        if (filterType === 'prioridad' && filterValue) {
            filtered = filtered.filter((project) => project.prioridad === filterValue);
        } else if (filterType === 'estado' && filterValue) {
            filtered = filtered.filter((project) => project.estado === filterValue);
        }

        // Aplicar ordenamiento
        filtered.sort((a, b) => {
            switch (sortOrder) {
                case 'recientes':
                    return b.fechaCreacion.getTime() - a.fechaCreacion.getTime();
                case 'antiguos':
                    return a.fechaCreacion.getTime() - b.fechaCreacion.getTime();
                case 'prioridad':
                    const priorityOrder = { 'Muy Importante': 3, Importante: 2, Normal: 1 };
                    return (
                        (priorityOrder[b.prioridad as keyof typeof priorityOrder] || 0) -
                        (priorityOrder[a.prioridad as keyof typeof priorityOrder] || 0)
                    );
                case 'votos':
                    return (b.votosAFavor || 0) - (a.votosAFavor || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [filterType, filterValue, sortOrder, searchQuery]);

    // Datos paginados
    const paginatedProjects = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredAndSortedProjects.slice(startIndex, endIndex);
    }, [filteredAndSortedProjects, currentPage]);

    // Cálculo de páginas totales
    const totalPages = Math.ceil(filteredAndSortedProjects.length / ITEMS_PER_PAGE);

    const handleProjectSelect = (project: ProjectItem) => {
        setSelectedProject(project);
        setShowDetails(true);
    };

    const handleBackToList = () => {
        setShowDetails(false);
        setSelectedProject(null);
    };

    const handleShowCreateProject = () => {
        setShowCreateProject(true);
    };

    const handleBackFromCreateProject = () => {
        setShowCreateProject(false);
    };

    const handleProjectCreated = (newProject: any) => {
        // Aquí podrías agregar el nuevo proyecto a la lista
        console.log('Nuevo proyecto creado:', newProject);
        setShowCreateProject(false);
    };

    // Funciones de filtrado
    const handleFilterChange = (type: FilterType, value: string = '') => {
        setFilterType(type);
        setFilterValue(value);
        setCurrentPage(1); // Reset a primera página al cambiar filtro
    };

    const handleSortChange = (order: SortOrder) => {
        setSortOrder(order);
        setCurrentPage(1); // Reset a primera página al cambiar orden
    };

    // Funciones de búsqueda
    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        setCurrentPage(1); // Reset a primera página al buscar
    };

    const clearSearch = () => {
        setSearchQuery('');
        setCurrentPage(1);
    };

    // Funciones de navegación para paginación
    const goToPreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const clearFilters = () => {
        setFilterType('todos');
        setFilterValue('');
        setSortOrder('recientes');
        setSearchQuery('');
        setCurrentPage(1);
    };

    // Función para verificar si hay filtros activos
    const hasActiveFilters = () => {
        return filterType !== 'todos' || sortOrder !== 'recientes' || searchQuery.trim() !== '';
    };

    // Función para obtener el color de prioridad
    const getPriorityColor = (prioridad: string) => {
        switch (prioridad) {
            case 'Muy Importante':
                return 'bg-red-800';
            case 'Importante':
                return 'bg-yellow-700';
            case 'Normal':
                return 'bg-blue-700';
            default:
                return 'bg-gray-700';
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
                    currentPage === 1 ? 'bg-neutral-700' : 'bg-blue-600'
                }`}
                onPress={onPrevious}
                disabled={currentPage === 1}>
                <Ionicons
                    name="chevron-back"
                    size={16}
                    color={currentPage === 1 ? 'gray' : 'white'}
                />
                <Text
                    className={`ml-1 text-sm ${
                        currentPage === 1 ? 'text-gray-400' : 'text-white'
                    }`}>
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
                    className={`mr-1 text-sm ${
                        currentPage === totalPages ? 'text-gray-400' : 'text-white'
                    }`}>
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

    // Renderizado de elemento de proyecto con información completa
    const renderProjectItem = ({ item }: { item: ProjectItem }) => (
        <TouchableOpacity
            className="mb-3 rounded-lg bg-neutral-800 p-4"
            onPress={() => handleProjectSelect(item)}>
            <View className="flex-row items-start justify-between">
                <View className="flex-1">
                    <View className="mb-2 flex-row items-center">
                        <Ionicons name="location" size={16} color="white" />
                        <Text className="ml-2 flex-1 font-medium text-white">{item.lugar}</Text>
                    </View>

                    <View className="mb-2 flex-row items-center">
                        <View className="mr-4 flex-row items-center">
                            <Text
                                className={`rounded-md px-2 py-1 text-xs text-white ${item.color}`}>
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
                            <Ionicons
                                name="document-text"
                                size={12}
                                color="gray"
                                className="ml-3"
                            />
                            <Text className="ml-1 text-xs text-gray-400">
                                {item.reportesAsociados}
                            </Text>
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
            className={`mr-2 rounded-lg px-3 py-2 ${isActive ? 'bg-blue-600' : 'bg-neutral-700'}`}
            onPress={onPress}>
            <Text className={`text-sm ${isActive ? 'text-white' : 'text-gray-300'}`}>{title}</Text>
        </TouchableOpacity>
    );

    if (showCreateProject) {
        return (
            <CreateProject
                onBack={handleBackFromCreateProject}
                onProjectCreated={handleProjectCreated}
            />
        );
    }

    if (showDetails && selectedProject) {
        return <ProjectDetails project={selectedProject} onBack={handleBackToList} />;
    }

    return (
        <View className="flex-1 bg-black px-4 pt-10">
            {/* Header */}
            <View className="mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity className="rounded-xl bg-blue-500 p-2">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="ml-4 text-xl font-bold text-white">Proyectos</Text>
                </View>

                <View className="flex-row gap-2">
                    <TouchableOpacity
                        className="rounded-xl bg-green-600 p-2"
                        onPress={handleShowCreateProject}>
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Barra de Búsqueda */}
            <View className="mb-4 rounded-xl bg-neutral-900 p-4">
                <View className="flex-row items-center rounded-lg bg-neutral-800 px-3 py-2">
                    <Ionicons name="search" size={20} color="gray" />
                    <TextInput
                        className="ml-3 flex-1 text-white"
                        placeholder="Buscar por ubicación, tipo de denuncia, estado..."
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
                        Buscando: "{searchQuery}" - {filteredAndSortedProjects.length} resultado
                        {filteredAndSortedProjects.length !== 1 ? 's' : ''}
                    </Text>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Controles de Filtro y Ordenamiento */}
                <View className="mb-4 rounded-xl bg-neutral-900 p-4">
                    {/* Filtros principales */}
                    <View className="mb-3">
                        <Text className="mb-2 text-sm font-bold text-blue-400">Filtrar por:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <FilterButton
                                title="Todos"
                                isActive={filterType === 'todos'}
                                onPress={() => handleFilterChange('todos')}
                            />
                            <FilterButton
                                title="Por Prioridad"
                                isActive={filterType === 'prioridad'}
                                onPress={() => handleFilterChange('prioridad')}
                            />
                            <FilterButton
                                title="Por Estado"
                                isActive={filterType === 'estado'}
                                onPress={() => handleFilterChange('estado')}
                            />
                            {hasActiveFilters() && (
                                <TouchableOpacity
                                    className="mr-2 rounded-lg bg-red-600 px-3 py-2"
                                    onPress={clearFilters}>
                                    <Text className="text-sm text-white">Limpiar Todo</Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>
                    </View>

                    {/* Filtros específicos */}
                    {filterType === 'prioridad' && (
                        <View className="mb-3">
                            <Text className="mb-2 text-sm text-gray-300">
                                Selecciona prioridad:
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {uniquePriorities.map((priority) => (
                                    <FilterButton
                                        key={priority}
                                        title={priority}
                                        isActive={filterValue === priority}
                                        onPress={() => handleFilterChange('prioridad', priority)}
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
                                        key={state}
                                        title={state}
                                        isActive={filterValue === state}
                                        onPress={() => handleFilterChange('estado', state)}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Ordenamiento */}
                    <View>
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
                                title="Por Prioridad"
                                isActive={sortOrder === 'prioridad'}
                                onPress={() => handleSortChange('prioridad')}
                            />
                            <FilterButton
                                title="Más Votados"
                                isActive={sortOrder === 'votos'}
                                onPress={() => handleSortChange('votos')}
                            />
                        </ScrollView>
                    </View>
                </View>

                {/* Lista de Proyectos */}
                <View className="rounded-xl bg-neutral-900 p-4">
                    <View className="mb-3 flex-row items-center justify-between">
                        <Text className="text-lg font-bold text-blue-400">
                            {searchQuery.length > 0
                                ? 'Resultados de Búsqueda'
                                : filterType === 'todos'
                                  ? 'Todos los Proyectos'
                                  : filterType === 'prioridad'
                                    ? `Prioridad: ${filterValue || 'Todas'}`
                                    : `Estado: ${filterValue || 'Todos'}`}
                        </Text>
                        <Text className="text-sm text-gray-400">
                            {filteredAndSortedProjects.length} elemento
                            {filteredAndSortedProjects.length !== 1 ? 's' : ''}
                        </Text>
                    </View>

                    {paginatedProjects.length > 0 ? (
                        <>
                            <FlatList
                                data={paginatedProjects}
                                renderItem={renderProjectItem}
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
                            <Ionicons name="folder-open-outline" size={48} color="gray" />
                            <Text className="mt-2 text-center text-gray-400">
                                No se encontraron proyectos con los filtros aplicados
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

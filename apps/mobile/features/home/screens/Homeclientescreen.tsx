import React, { useRef, useState, useEffect, useMemo } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    Easing,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '~/contexts/AuthContext';
import { Comment, Report } from '~/features/comments';
import ClientHeader from '~/features/home/components/ClientHeader';
import ClientContent from '~/features/home/components/ClientContent';
import FloatingButton from '~/features/home/components/Floatingbutton';
import ClientDrawerMenu from '~/features/home/components/ClientDrawerMenu';
import FiltersModal from '~/features/home/components/FiltersModal';
import { useReportsList } from '~/features/report/hooks/useReportsList';
import { triggerGlobalVotesRefresh } from '~/features/posts/hooks/useReportVotes';

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const { logout } = useAuth();

    // Mapeo de categorías a tipos (valores del 1 al 7)
    const categoryToTypeMap: Record<string, number> = {
        'Calles y Veredas en Mal Estado': 1,
        'Luz o Alumbrado Público Dañado': 2,
        'Drenaje o Aguas Estancadas': 3,
        'Parques, Plazas o Árboles con Problemas': 4,
        'Basura, Escombros o Espacios Sucios': 5,
        'Emergencias o Situaciones de Riesgo': 6,
        'Infraestructura o Mobiliario Público Dañado': 7,
    };

    // Convertir filtro de categoría a tipo
    const getTypeFromCategory = (categoria: string | null): number | undefined => {
        if (!categoria || categoria === 'Todas') return undefined;
        return categoryToTypeMap[categoria];
    };

    // Usar el hook para manejar los reportes con filtros
    const {
        reports,
        loading,
        refreshing,
        hasNext,
        error,
        loadMore,
        refresh,
        setReports,
        initialLoad,
        isLoadingMore,
        loadMoreError,
        retryLoadMore,
        updateFilters,
    } = useReportsList();

    const [open, setOpen] = useState(false);
    const [commentsModalVisible, setCommentsModalVisible] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [filtersModalVisible, setFiltersModalVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        categoria: 'Todas' as string | null,
        estado: 'Todos' as string | null,
        urgencia: 0,
    });

    // Animaciones Drawer
    const drawerX = useRef(new Animated.Value(-Dimensions.get('window').width * 0.75)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const DRAWER_W = Math.min(280, Dimensions.get('window').width * 0.65);

    // Aplicar filtros locales (estado y urgencia) - Los filtros de tipo se envían al backend
    const displayedReports = useMemo(() => {
        let filtered = reports;

        // Filtrar por urgencia (local)
        if (activeFilters.urgencia && activeFilters.urgencia !== 0) {
            filtered = filtered.filter(
                (report) => Number(report.urgencia) === Number(activeFilters.urgencia)
            );
        }

        // Filtrar por estado (local)
        if (activeFilters.estado && activeFilters.estado !== 'Todos') {
            filtered = filtered.filter((report) => report.estado === activeFilters.estado);
        }

        return filtered;
    }, [reports, activeFilters]);

    // Función para obtener nombre corto de categoría
    const getShortCategoryName = (categoria: string | null): string => {
        if (!categoria || categoria === 'Todas') return '';
        const map: Record<string, string> = {
            'Calles y Veredas en Mal Estado': 'Calles y Veredas',
            'Luz o Alumbrado Público Dañado': 'Alumbrado',
            'Drenaje o Aguas Estancadas': 'Drenaje',
            'Parques, Plazas o Árboles con Problemas': 'Parques',
            'Basura, Escombros o Espacios Sucios': 'Limpieza',
            'Emergencias o Situaciones de Riesgo': 'Emergencias',
            'Infraestructura o Mobiliario Público Dañado': 'Infraestructura',
        };
        return map[categoria] || categoria;
    };

    // Verificar si hay filtros activos
    const hasActiveFilters =
        activeFilters.categoria !== 'Todas' ||
        activeFilters.estado !== 'Todos' ||
        activeFilters.urgencia !== 0;

    // Log para debug de errores
    useEffect(() => {
        if (error) {
            console.error('Error in reports:', error);
        }
    }, [error]);

    // Función para manejar refresh (reportes y votos)
    const handleRefresh = async () => {
        // Disparar refresh global de votos
        triggerGlobalVotesRefresh();
        // Refrescar reportes
        await refresh();
    };

    // Función para agregar comentario
    const addComment = async (content: string): Promise<void> => {
        try {
            console.log('Adding comment:', content);
            // Aquí iría la lógica para agregar el comentario
            // Por ahora solo simular
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    };

    const openMenu = () => {
        setOpen(true);
        Animated.parallel([
            Animated.timing(drawerX, {
                toValue: 0,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0.45,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeMenu = () => {
        Animated.parallel([
            Animated.timing(drawerX, {
                toValue: -DRAWER_W,
                duration: 200,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 200,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (finished) setOpen(false);
        });
    };

    const handleLogout = async () => {
        closeMenu();
        await logout();
        router.replace('/(auth)/sign-in');
    };

    const openCommentsModal = (report: Report) => {
        setSelectedReport(report);
        setCommentsModalVisible(true);
    };

    const closeCommentsModal = () => {
        setCommentsModalVisible(false);
        setSelectedReport(null);
    };

    const handleApplyFilters = (newFilters: {
        categoria: string | null;
        estado: string | null;
        urgencia: number;
    }) => {
        setActiveFilters(newFilters);

        // Convertir categoría a tipo para enviar al backend
        const tipoFilter = getTypeFromCategory(newFilters.categoria);

        // Actualizar filtros en el hook (esto recargará los datos del backend)
        updateFilters({ tipo: tipoFilter });

        setFiltersModalVisible(false);
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            categoria: 'Todas',
            estado: 'Todos',
            urgencia: 0,
        };
        setActiveFilters(clearedFilters);

        // Limpiar filtros en el backend también
        updateFilters({});
    };

    // Función para manejar cambio individual de filtro de categoría
    const handleCategoryFilterChange = (categoria: string | null) => {
        const newFilters = { ...activeFilters, categoria };
        setActiveFilters(newFilters);

        // Convertir categoría a tipo para enviar al backend
        const tipoFilter = getTypeFromCategory(categoria);
        updateFilters({ tipo: tipoFilter });
    };

    // Handler mejorado para loadMore
    const handleLoadMore = () => {
        if (hasNext && !loading && !refreshing) {
            loadMore();
        }
    };

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#090A0D' }}>
            <ClientHeader
                onMenuPress={openMenu}
                onSearchPress={() => setSearchModalVisible(true)}
            />

            {/* Chips de filtros activos */}
            {hasActiveFilters && (
                <View className="border-b border-gray-800 bg-[#13161E] px-4 py-2">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row gap-2">
                            {activeFilters.categoria !== 'Todas' && (
                                <View className="flex-row items-center rounded-full bg-[#537CF2] px-3 py-1.5">
                                    <Text className="mr-1 text-xs font-semibold text-white">
                                        {getShortCategoryName(activeFilters.categoria)}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => handleCategoryFilterChange('Todas')}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                        <X size={14} color="white" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {activeFilters.estado !== 'Todos' && (
                                <View className="flex-row items-center rounded-full bg-[#537CF2] px-3 py-1.5">
                                    <Text className="mr-1 text-xs font-semibold text-white">
                                        {activeFilters.estado}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() =>
                                            setActiveFilters({ ...activeFilters, estado: 'Todos' })
                                        }
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                        <X size={14} color="white" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {activeFilters.urgencia !== 0 && (
                                <View className="flex-row items-center rounded-full bg-[#537CF2] px-3 py-1.5">
                                    <Text className="mr-1 text-xs font-semibold text-white">
                                        Urgencia {activeFilters.urgencia}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() =>
                                            setActiveFilters({ ...activeFilters, urgencia: 0 })
                                        }
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                        <X size={14} color="white" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            <TouchableOpacity
                                onPress={handleClearFilters}
                                className="rounded-full bg-[#1D212D] px-3 py-1.5">
                                <Text className="text-xs font-semibold text-gray-400">
                                    Limpiar todo
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            )}

            <ClientContent
                reports={displayedReports}
                onCommentPress={openCommentsModal}
                insets={insets}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                selectedReport={selectedReport}
                commentsModalVisible={commentsModalVisible}
                onCloseCommentsModal={closeCommentsModal}
                onAddComment={addComment}
                searchModalVisible={searchModalVisible}
                onCloseSearchModal={() => setSearchModalVisible(false)}
                onSelectReport={(report: Report) => {
                    router.push(`/report/${report.id}`);
                }}
                onLoadMore={handleLoadMore}
                hasNext={hasNext}
                loading={loading || initialLoad}
                error={error}
                isLoadingMore={isLoadingMore}
                loadMoreError={loadMoreError}
                retryLoadMore={retryLoadMore}
            />

            <FloatingButton onPress={() => router.push('/(tabs)/(map)/create_report')} />

            {open && (
                <>
                    <TouchableWithoutFeedback onPress={closeMenu}>
                        <Animated.View
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: 0,
                                backgroundColor: '#000',
                                opacity: backdropOpacity,
                            }}
                        />
                    </TouchableWithoutFeedback>

                    <ClientDrawerMenu
                        drawerX={drawerX}
                        DRAWER_W={DRAWER_W}
                        insets={insets}
                        onClose={closeMenu}
                        onLogout={handleLogout}
                        onOpenFilters={() => setFiltersModalVisible(true)}
                    />
                </>
            )}

            {/* Modal de Filtros Avanzados */}
            <FiltersModal
                visible={filtersModalVisible}
                onClose={() => setFiltersModalVisible(false)}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
                initialFilters={activeFilters}
            />
        </SafeAreaView>
    );
}

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Animated, Dimensions, TouchableWithoutFeedback, Easing, View, Text, TouchableOpacity, ScrollView } from 'react-native';
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

    // Usar el hook para manejar los reportes con cursor pagination
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

    // Función para aplicar todos los filtros activos (usando useMemo para evitar recalcular constantemente)
    const displayedReports = useMemo(() => {
        let filtered = reports;

        // Filtrar por categoría
        if (activeFilters.categoria && activeFilters.categoria !== 'Todas') {
            filtered = filtered.filter((report) => report.categoria === activeFilters.categoria);
        }

        // Filtrar por urgencia
        if (activeFilters.urgencia && activeFilters.urgencia !== 0) {
            filtered = filtered.filter((report) => Number(report.urgencia) === Number(activeFilters.urgencia));
        }

        // Filtrar por estado
        if (activeFilters.estado && activeFilters.estado !== 'Todos') {
            filtered = filtered.filter((report) => report.estado === activeFilters.estado);
        }

        return filtered;
    }, [reports, activeFilters]); // Solo recalcular cuando cambien reports o activeFilters

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
            'Infraestructura o Mobiliario Público Dañado': 'Infraestructura'
        };
        return map[categoria] || categoria;
    };

    // Verificar si hay filtros activos
    const hasActiveFilters = activeFilters.categoria !== 'Todas' || 
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
        setFiltersModalVisible(false);
    };

    const handleClearFilters = () => {
        setActiveFilters({
            categoria: 'Todas',
            estado: 'Todos',
            urgencia: 0,
        });
    };

    const addComment = async (content: string) => {
        if (!selectedReport) return;

        // El comentario se maneja dentro del CommentsModal
        // Esta función ahora es solo un placeholder para compatibilidad
        // El modal se encarga de actualizar la lista de comentarios
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
                <View className="bg-[#13161E] px-4 py-2 border-b border-gray-800">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row gap-2">
                            {activeFilters.categoria !== 'Todas' && (
                                <View className="flex-row items-center bg-[#537CF2] rounded-full px-3 py-1.5">
                                    <Text className="text-white text-xs font-semibold mr-1">
                                        {getShortCategoryName(activeFilters.categoria)}
                                    </Text>
                                    <TouchableOpacity 
                                        onPress={() => setActiveFilters({...activeFilters, categoria: 'Todas'})}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <X size={14} color="white" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {activeFilters.estado !== 'Todos' && (
                                <View className="flex-row items-center bg-[#537CF2] rounded-full px-3 py-1.5">
                                    <Text className="text-white text-xs font-semibold mr-1">
                                        {activeFilters.estado}
                                    </Text>
                                    <TouchableOpacity 
                                        onPress={() => setActiveFilters({...activeFilters, estado: 'Todos'})}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <X size={14} color="white" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {activeFilters.urgencia !== 0 && (
                                <View className="flex-row items-center bg-[#537CF2] rounded-full px-3 py-1.5">
                                    <Text className="text-white text-xs font-semibold mr-1">
                                        Urgencia {activeFilters.urgencia}
                                    </Text>
                                    <TouchableOpacity 
                                        onPress={() => setActiveFilters({...activeFilters, urgencia: 0})}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <X size={14} color="white" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            <TouchableOpacity 
                                onPress={handleClearFilters}
                                className="bg-[#1D212D] rounded-full px-3 py-1.5"
                            >
                                <Text className="text-gray-400 text-xs font-semibold">
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

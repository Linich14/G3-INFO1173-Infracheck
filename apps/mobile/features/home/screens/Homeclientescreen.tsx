import React, { useRef, useState, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Animated, Dimensions, TouchableWithoutFeedback, Easing } from 'react-native';
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
        reports: fetchedReports,
        loading,
        refreshing,
        hasNext,
        error,
        loadMore,
        refresh,
        setReports: setFetchedReports,
        initialLoad,
        isLoadingMore,
        loadMoreError,
        retryLoadMore,
    } = useReportsList();

    const [open, setOpen] = useState(false);
    const [commentsModalVisible, setCommentsModalVisible] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [filtersModalVisible, setFiltersModalVisible] = useState(false);
    const [filters, setFilters] = useState({
        categoria: null as string | null,
        estado: null as string | null,
        urgencia: 1,
    });

    // Animaciones Drawer
    const drawerX = useRef(new Animated.Value(-Dimensions.get('window').width * 0.75)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const DRAWER_W = Math.min(280, Dimensions.get('window').width * 0.65);

    // Filtrar reportes por categoría
    const filtrarReportesPorCategoria = (
        categoria: string | null,
        reportsList: Report[]
    ): Report[] => {
        if (!categoria) {
            return reportsList;
        }
        return reportsList.filter((report) => report.categoria === categoria);
    };

    // Actualizar reportes filtrados
    useEffect(() => {
        const reportesFiltrados = filtrarReportesPorCategoria(selectedCategoria, fetchedReports);
        setFilteredReports(reportesFiltrados);
    }, [fetchedReports, selectedCategoria]);

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
        setFilters(newFilters);
        setFiltersModalVisible(false);
        // Aquí podrías aplicar los filtros a los reportes
    };

    const handleClearFilters = () => {
        setFilters({
            categoria: null,
            estado: null,
            urgencia: 1,
        });
    };

    const addComment = (content: string) => {
        if (!selectedReport) return;

        const newComment: Comment = {
            id: Date.now().toString(),
            author: 'Usuario Actual',
            content,
            timeAgo: 'Ahora',
        };

        setFetchedReports((prev) =>
            prev.map((report) =>
                report.id === selectedReport.id
                    ? { ...report, comments: [...report.comments, newComment] }
                    : report
            )
        );

        setSelectedReport((prev) =>
            prev ? { ...prev, comments: [...prev.comments, newComment] } : null
        );
    };

    // Handler mejorado para loadMore
    const handleLoadMore = () => {
        console.log('Handle load more called - hasNext:', hasNext, 'loading:', loading);
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

            <ClientContent
                reports={
                    filteredReports.length > 0 || selectedCategoria
                        ? filteredReports
                        : fetchedReports
                }
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
                    setSelectedReport(report);
                    setCommentsModalVisible(true);
                }}
                selectedCategoria={selectedCategoria}
                onCategoriaChange={setSelectedCategoria}
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
                initialFilters={filters}
            />
        </SafeAreaView>
    );
}

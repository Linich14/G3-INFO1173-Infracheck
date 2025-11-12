import React, { useState } from 'react';
import {
    ScrollView,
    RefreshControl,
    View,
    Text,
    TouchableOpacity,
    Modal,
    Share,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { ReportCard } from '~/features/posts';
import { CommentsModal, Report } from '~/features/comments';
import { SearchModal } from '~/features/search';
import { X, MapPin, AlertTriangle } from 'lucide-react-native';
import CategoryFilter from './CategoryFilter';
import FollowedReportsList from './FollowedReportsList';

interface ClientContentProps {
    reports: Report[];
    onCommentPress: (report: Report) => void;
    insets: any;
    refreshing: boolean;
    onRefresh: () => void;
    selectedReport: Report | null;
    commentsModalVisible: boolean;
    onCloseCommentsModal: () => void;
    onAddComment: (content: string) => void;
    searchModalVisible: boolean;
    onCloseSearchModal: () => void;
    onSelectReport: (report: Report) => void;
    selectedCategoria: string | null;
    onCategoriaChange: (categoria: string | null) => void;
    // Props para infinite scroll
    onLoadMore: () => void;
    hasNext: boolean;
    loading: boolean;
    error?: string | null;
    isLoadingMore?: boolean;
    loadMoreError?: string | null;
    retryLoadMore?: () => void;
}

export default function ClientContent({
    reports,
    onCommentPress,
    insets,
    refreshing,
    onRefresh,
    selectedReport,
    commentsModalVisible,
    onCloseCommentsModal,
    onAddComment,
    searchModalVisible,
    onCloseSearchModal,
    onSelectReport,
    selectedCategoria,
    onCategoriaChange,
    onLoadMore,
    hasNext,
    loading,
    error,
    isLoadingMore,
    loadMoreError,
    retryLoadMore,
}: ClientContentProps) {
    // Estados para manejar las interacciones
    const [upvotedReports, setUpvotedReports] = useState<Set<string>>(new Set());
    const [followedReports, setFollowedReports] = useState<Set<string>>(new Set());
    const [reportUpvotes, setReportUpvotes] = useState<{ [key: string]: number }>({});
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<any>(null);

    // Estado para pestañas
    const [activeTab, setActiveTab] = useState<'todos' | 'seguidos'>('todos');

    // Inicializar upvotes locales basados en los datos originales
    React.useEffect(() => {
        const initialUpvotes: { [key: string]: number } = {};
        reports.forEach((report) => {
            initialUpvotes[report.id] = report.upvotes;
        });
        setReportUpvotes(initialUpvotes);
    }, [reports]);

    // Función para manejar upvote
    const handleUpvote = (reportId: string) => {
        setUpvotedReports((prev) => {
            const newSet = new Set(prev);
            setReportUpvotes((prevCounts) => ({
                ...prevCounts,
                [reportId]: newSet.has(reportId) ? Math.max(0, (prevCounts[reportId] || 1) - 1) : (prevCounts[reportId] || 0) + 1,
            }));

            if (newSet.has(reportId)) {
                newSet.delete(reportId);
            } else {
                newSet.add(reportId);
            }

            return newSet;
        });
    };

    // Función para manejar follow
    const handleFollow = (reportId: string) => {
        setFollowedReports((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(reportId)) {
                newSet.delete(reportId);
            } else {
                newSet.add(reportId);
            }
            return newSet;
        });
    };

    // Función para mostrar ubicación
    const handleLocation = (reportId: string) => {
        const fakeLocation = {
            latitude: -36.8485 + Math.random() * 0.01,
            longitude: -73.0524 + Math.random() * 0.01,
            address: "Av. O'Higgins 123, Concepción",
        };
        setSelectedLocation(fakeLocation);
        setLocationModalVisible(true);
    };

    // Función para compartir
    const handleShare = async (reportTitle: string, reportId: string) => {
        try {
            await Share.share({
                message: `Mira este reporte: "${reportTitle}" - ID: ${reportId}`,
                title: 'Compartir Reporte',
            });
        } catch (error) {
            console.log('Error al compartir:', error);
        }
    };

    // Función para reportar (más opciones)
    const handleMore = (reportTitle: string) => {
        Alert.alert('Reportar Contenido', `¿Quieres reportar el contenido "${reportTitle}"?`, [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Reportar',
                style: 'destructive',
                onPress: () => {
                    Alert.alert('Reportado', 'El contenido ha sido reportado exitosamente.');
                },
            },
        ]);
    };

    // Función para detectar cuando el usuario llega al final del scroll
    const handleScroll = (event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;

        if (
            isCloseToBottom &&
            hasNext &&
            !loading &&
            !refreshing &&
            !isLoadingMore &&
            !error &&
            !loadMoreError
        ) {
            console.log('Triggering load more from scroll');
            onLoadMore();
        }
    };

    const handleRetry = () => {
        onRefresh();
    };

    // Renderizar el indicador de carga al final
    const renderFooter = () => {
        // Si hay error específico en loadMore, mostrar opción de reintentar
        if (loadMoreError) {
            return (
                <View className="items-center py-4">
                    <AlertTriangle size={24} color="#EF4444" />
                    <Text className="mt-2 px-4 text-center text-sm text-red-400">
                        {loadMoreError}
                    </Text>
                    <TouchableOpacity
                        onPress={retryLoadMore}
                        className="mt-2 rounded-lg bg-red-600 px-4 py-2"
                        activeOpacity={0.7}>
                        <Text className="text-sm font-medium text-white">Reintentar</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // Si hay error general en el loadMore, mostrar opción de reintentar
        if (error && reports.length > 0) {
            return (
                <View className="items-center py-4">
                    <AlertTriangle size={24} color="#EF4444" />
                    <Text className="mt-2 text-sm text-red-400">Error al cargar más reportes</Text>
                    <TouchableOpacity
                        onPress={handleRetry}
                        className="mt-2 rounded-lg bg-red-600 px-4 py-2"
                        activeOpacity={0.7}>
                        <Text className="text-sm font-medium text-white">Reintentar</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // Si no hay más reportes que cargar
        if (!hasNext) {
            return (
                <View className="items-center py-4">
                    <Text className="text-sm text-gray-500">Ya has visto todos los reportes</Text>
                </View>
            );
        }

        // Si está cargando más reportes, mostrar spinner
        if (loading || isLoadingMore) {
            return (
                <View className="items-center py-6">
                    <ActivityIndicator size="large" color="#537CF2" />
                    <Text className="mt-2 text-sm text-gray-400">Cargando más reportes...</Text>
                </View>
            );
        }

        // Si no está cargando, mostrar botón para cargar más
        return (
            <View className="items-center py-4">
                <TouchableOpacity
                    onPress={onLoadMore}
                    className="rounded-lg bg-[#537CF2] px-6 py-3"
                    activeOpacity={0.7}>
                    <Text className="text-base font-medium text-white">Cargar más reportes</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Renderizar estado de error principal
    const renderErrorState = () => (
        <View className="flex-1 items-center justify-center py-20">
            <AlertTriangle size={48} color="#EF4444" />
            <Text className="mt-4 text-lg text-red-400">Error al cargar reportes</Text>
            <Text className="mt-2 px-8 text-center text-sm text-gray-500">
                Hubo un problema al conectarse con el servidor. Verifica tu conexión a internet.
            </Text>
            <TouchableOpacity
                onPress={handleRetry}
                className="mt-6 rounded-lg bg-[#537CF2] px-6 py-3"
                activeOpacity={0.7}>
                <Text className="text-base font-medium text-white">Reintentar</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <>
            {/* Pestañas Todos / Seguidos - Diseño simple */}
            <View className="flex-row gap-2 bg-[#13161E] px-4 pb-2 pt-3">
                <TouchableOpacity
                    className={`flex-1 rounded-full py-2.5 ${
                        activeTab === 'todos' ? 'bg-[#537CF2]' : 'bg-[#1D212D]'
                    }`}
                    onPress={() => setActiveTab('todos')}>
                    <Text
                        className={`text-center text-base font-semibold ${
                            activeTab === 'todos' ? 'text-white' : 'text-gray-400'
                        }`}>
                        Todos
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className={`flex-1 rounded-full py-2.5 ${
                        activeTab === 'seguidos' ? 'bg-[#537CF2]' : 'bg-[#1D212D]'
                    }`}
                    onPress={() => setActiveTab('seguidos')}>
                    <Text
                        className={`text-center text-base font-semibold ${
                            activeTab === 'seguidos' ? 'text-white' : 'text-gray-400'
                        }`}>
                        Seguidos
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Filtro de categorías solo en pestaña "Todos" */}
            {activeTab === 'todos' && (
                <CategoryFilter
                    selectedCategoria={selectedCategoria}
                    onCategoriaChange={onCategoriaChange}
                />
            )}

            {/* Contenido según pestaña activa */}
            {activeTab === 'seguidos' ? (
                <FollowedReportsList onSwitchToAll={() => setActiveTab('todos')} />
            ) : (
                <ScrollView
                    className="mt-4 px-4"
                    contentContainerStyle={{ gap: 16, paddingBottom: insets.bottom + 12 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#537CF2"
                            colors={['#537CF2']}
                            progressBackgroundColor="#13161E"
                        />
                    }
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}>
                    {/* Estado de error principal (sin reportes) */}
                    {error && reports.length === 0 && !loading ? (
                        renderErrorState()
                    ) : loading && reports.length === 0 ? (
                        /* Indicador de carga inicial */
                        <View className="flex-1 items-center justify-center py-20">
                            <ActivityIndicator size="large" color="#537CF2" />
                            <Text className="mt-4 text-gray-400">Cargando reportes...</Text>
                        </View>
                    ) : reports.length === 0 ? (
                        /* Estado vacío sin error */
                        <View className="flex-1 items-center justify-center py-20">
                            <Text className="text-lg text-gray-400">
                                No hay reportes disponibles
                            </Text>
                            <Text className="mt-2 text-sm text-gray-500">
                                Desliza hacia abajo para actualizar
                            </Text>
                        </View>
                    ) : (
                        /* Lista de reportes */
                        <>
                            {reports.map((report) => {
                                const isFollowed = followedReports.has(report.id);
                                const isUpvoted = upvotedReports.has(report.id);
                                const currentUpvotes = reportUpvotes[report.id] || report.upvotes;

                                return (
                                    <ReportCard
                                        id={report.id}
                                        key={report.id}
                                        title={report.title}
                                        author={report.author}
                                        timeAgo={report.timeAgo}
                                        image={report.image}
                                        upvotes={currentUpvotes}
                                        followLabel={isFollowed ? 'Siguiendo ✓' : 'Seguir'}
                                        isFollowed={isFollowed}
                                        isUpvoted={isUpvoted}
                                        initialVoteCount={report.votos?.count}
                                        initialUserHasVoted={report.votos?.usuario_ha_votado}
                                        onComment={() => onCommentPress(report)}
                                        onFollow={() => handleFollow(report.id)}
                                        onMore={() => handleMore(report.title)}
                                        onLocation={() => handleLocation(report.id)}
                                        onUpvote={() => handleUpvote(report.id)}
                                        onShare={() => handleShare(report.title, report.id)}
                                    />
                                );
                            })}

                            {/* Footer con indicador de carga o botón para cargar más */}
                            {renderFooter()}
                        </>
                    )}
                </ScrollView>
            )}

            {/* Modal de Ubicación */}
            <Modal
                visible={locationModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setLocationModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="max-h-[70%] rounded-t-xl bg-[#13161E] p-6">
                        <View className="mb-4 flex-row items-center justify-between">
                            <Text className="text-xl font-bold text-white">
                                Ubicación del Reporte
                            </Text>
                            <TouchableOpacity
                                onPress={() => setLocationModalVisible(false)}
                                className="p-2">
                                <X size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        {selectedLocation && (
                            <>
                                <View className="mb-4 rounded-lg bg-[#1D212D] p-4">
                                    <View className="mb-3 flex-row items-center">
                                        <MapPin size={20} color="#537CF2" />
                                        <Text className="ml-2 text-lg font-semibold text-white">
                                            Dirección
                                        </Text>
                                    </View>
                                    <Text className="mb-3 text-base text-gray-300">
                                        {selectedLocation.address}
                                    </Text>

                                    <View className="flex-row justify-between">
                                        <View>
                                            <Text className="text-sm text-gray-400">Latitud</Text>
                                            <Text className="text-base text-white">
                                                {selectedLocation.latitude.toFixed(6)}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text className="text-sm text-gray-400">Longitud</Text>
                                            <Text className="text-base text-white">
                                                {selectedLocation.longitude.toFixed(6)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    className="items-center rounded-lg bg-[#537CF2] py-4"
                                    onPress={() => {
                                        Alert.alert('Navegación', 'Abriendo en Google Maps...');
                                        setLocationModalVisible(false);
                                    }}>
                                    <Text className="text-base font-semibold text-white">
                                        Ver en Mapa
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {selectedReport && (
                <CommentsModal
                    visible={commentsModalVisible}
                    onClose={onCloseCommentsModal}
                    postTitle={selectedReport.title}
                    comments={selectedReport.comments}
                    onAddComment={onAddComment}
                />
            )}

            <SearchModal
                visible={searchModalVisible}
                onClose={onCloseSearchModal}
                reports={reports}
                onSelectReport={onSelectReport}
            />
        </>
    );
}

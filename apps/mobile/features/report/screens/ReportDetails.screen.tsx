import {
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    Modal,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Carousel from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';
import { useReportDetails } from '../hooks/useReportDetails';
import { useReportEdit } from '../hooks/useReportEdit';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useUserContext } from '../../../contexts/UserContext';
import { useLanguage } from '~/contexts/LanguageContext';
import ModalMap from '../components/modalMap';
import { CommentsModal, Report } from '~/features/comments';
import EditReportScreen from './EditReport.screen';

type Props = {
    reportId: string;
    comentarioId?: string;
    onBack: () => void;
};

// Funciones de utilidad
const formatDate = (dateString: string, locale: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getUrgencyColor = (urgency: string): string => {
    switch (urgency.toLowerCase()) {
        case 'alta':
            return '#ef4444';
        case 'media':
            return '#f59e0b';
        case 'baja':
            return '#10b981';
        default:
            return '#6b7280';
    }
};

// Función para traducir tipo de denuncia
const getReportTypeTranslation = (type: string, t: any): string => {
    const typeMap: Record<string, string> = {
        'Calles y Veredas en Mal Estado': t('mapCategoryStreets'),
        'Luz o Alumbrado Público Dañado': t('mapCategoryLighting'),
        'Drenaje y Aguas Lluvias': t('mapCategoryDrainage'),
        'Parques y Árboles': t('mapCategoryParks'),
        'Basura y Escombros': t('mapCategoryGarbage'),
        'Emergencias y Riesgos': t('mapCategoryEmergencies'),
        'Mobiliario Urbano Dañado': t('mapCategoryFurniture'),
        'Infraestructura Pública': t('mapCategoryInfrastructure'),
    };
    return typeMap[type] || type;
};

export default function ReportDetailsScreen({ reportId, comentarioId, onBack }: Props) {
    const { t, locale } = useLanguage();
    const { report, loading, error, refetch } = useReportDetails(reportId);
    const { deleteReport } = useReportEdit();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
    const [showFullscreen, setShowFullscreen] = useState(false);
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const carouselRef = useRef<any>(null);
    const fullscreenCarouselRef = useRef<any>(null);

    // Shared value para el progreso del carrusel
    const progress = useSharedValue<number>(0);

    // Estado para controlar el modal del mapa
    const [showMapModal, setShowMapModal] = useState(false);

    // Estado para controlar el modal de comentarios
    const [showCommentsModal, setShowCommentsModal] = useState(false);

    // Nuevo estado para mostrar pantalla de edición
    const [showEditScreen, setShowEditScreen] = useState(false);

    // Obtener el usuario actual del UserContext
    const { user } = useUserContext();

    // Verificar si se debe abrir el modal de comentarios automáticamente
    useEffect(() => {
        if (comentarioId && report) {
            // Pequeño delay para asegurar que el componente esté montado
            const timer = setTimeout(() => {
                setShowCommentsModal(true);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [comentarioId, report]);

    // Función para verificar si el usuario actual es el propietario del reporte
    const isOwner = report && user && report.usuario.id === user.usua_id;

    // Función para manejar la navegación hacia atrás de forma segura
    const handleGoBack = useCallback(() => {
        try {
            onBack();
        } catch (e) {
            console.error('Error en navegación:', e);
            onBack();
        }
    }, [onBack]);

    // Función para abrir imagen en pantalla completa
    const openFullscreenImage = useCallback((index: number) => {
        setFullscreenImageIndex(index);
        setShowFullscreen(true);
    }, []);

    // Función para cerrar pantalla completa
    const closeFullscreenImage = useCallback(() => {
        setShowFullscreen(false);
    }, []);

    // Función para mostrar el mapa
    const handleShowMap = () => {
        setShowMapModal(true);
    };

    // Función para cerrar el modal del mapa
    const handleCloseMap = () => {
        setShowMapModal(false);
    };

    // Función para manejar edición
    const handleEdit = () => {
        setShowEditScreen(true);
    };

    // Función para manejar eliminación
    const handleDelete = () => {
        Alert.alert(
            t('reportDetailsDeleteConfirmTitle') || 'Eliminar Reporte',
            t('reportDetailsDeleteConfirmMessage') ||
                '¿Estás seguro de que quieres ocultar este reporte? Esta acción se puede deshacer.',
            [
                {
                    text: t('cancel') || 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: t('delete') || 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await deleteReport(reportId, false); // Soft delete
                        if (result.success) {
                            Alert.alert(t('success') || 'Éxito', result.message, [
                                {
                                    text: t('ok') || 'OK',
                                    onPress: onBack,
                                },
                            ]);
                        } else {
                            Alert.alert(t('error') || 'Error', result.message, [
                                { text: t('ok') || 'OK' },
                            ]);
                        }
                    },
                },
            ]
        );
    };

    // Función para volver de la pantalla de edición
    const handleBackFromEdit = () => {
        setShowEditScreen(false);
        refetch(); // Recargar datos actualizados
    };

    // Renderizar item del carrusel normal con parallax
    const renderCarouselItem = useCallback(
        ({ item: imagen, index }: { item: string; index: number }) => (
            <TouchableOpacity
                key={`carousel-image-${index}`}
                style={{
                    width: screenWidth,
                    borderRadius: 12,
                    overflow: 'hidden',
                }}
                activeOpacity={0.9}
                onPress={() => openFullscreenImage(index)}>
                <View
                    style={{
                        height: 258,
                        borderRadius: 12,
                        overflow: 'hidden',
                        backgroundColor: '#1a1a1a',
                    }}>
                    <Image
                        source={{
                            uri: imagen,
                            cache: 'force-cache',
                        }}
                        style={{
                            width: '100%',
                            height: 258,
                        }}
                        resizeMode="cover"
                        onError={(error) => {
                            console.log('Error loading image:', error.nativeEvent.error);
                        }}
                    />

                    {/* Overlay con gradiente */}
                    <View className="absolute inset-0">
                        {/* Gradiente principal */}
                        <View className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                        {/* Gradiente superior */}
                        <View className="absolute left-0 right-0 top-0 h-20 bg-gradient-to-b from-black/30 to-transparent" />

                        {/* Contenido del overlay */}
                        <View className="absolute bottom-4 left-4 right-4">
                            <View className="flex-row items-end justify-between">
                                <View className="flex-1">
                                    <View className="mb-1 flex-row items-center">
                                        <View className="mr-2 rounded-full bg-[#537CF2]/20 p-1">
                                            <Ionicons
                                                name="images-outline"
                                                size={12}
                                                color="#537CF2"
                                            />
                                        </View>
                                        <Text className="text-xs font-medium text-white/90">
                                            {t('reportDetailsImageEvidence')}
                                        </Text>
                                    </View>
                                    <Text className="text-xs text-white/70">
                                        {t('reportDetailsImage')} {index + 1}
                                    </Text>
                                </View>

                                {/* Contador */}
                                <View className="rounded-lg bg-black/60 px-2 py-1">
                                    <Text className="text-xs font-semibold text-white">
                                        {index + 1}/{report?.imagenes.length}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Icono de expandir */}
                    <View className="absolute right-3 top-3">
                        <View className="rounded-lg bg-black/50 p-1.5">
                            <Ionicons name="expand-outline" size={16} color="white" />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        ),
        [screenWidth, report?.imagenes.length, openFullscreenImage]
    );

    // Renderizar item del carrusel en pantalla completa
    const renderFullscreenCarouselItem = useCallback(
        ({ item: imagen, index }: { item: string; index: number }) => (
            <View
                key={`fullscreen-image-${index}`}
                style={{ width: screenWidth, height: screenHeight }}
                className="flex-1 items-center justify-center">
                <Image
                    source={{
                        uri: imagen,
                        cache: 'force-cache',
                    }}
                    style={{ width: screenWidth, height: screenHeight }}
                    resizeMode="contain"
                    onError={(error) => {
                        console.log('Error loading fullscreen image:', error.nativeEvent.error);
                    }}
                />
            </View>
        ),
        [screenWidth, screenHeight]
    );

    // Validación del reportId
    if (!reportId || reportId.trim() === '') {
        return (
            <SafeAreaView className="flex-1 bg-[#0A0E1A]">
                <View className="flex-1 items-center justify-center px-4">
                    <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                    <Text className="mt-4 text-xl font-semibold text-white">
                        {t('reportDetailsIdRequired')}
                    </Text>
                    <Text className="mt-2 text-center text-gray-400">
                        {t('reportDetailsIdRequiredMessage')}
                    </Text>
                    <TouchableOpacity
                        onPress={handleGoBack}
                        className="mt-4 rounded-lg bg-[#537CF2] px-4 py-2">
                        <Text className="text-white">{t('reportDetailsGoBack')}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Mostrar loading
    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-[#0A0E1A]">
                <View className="flex-1 items-center justify-center">
                    <Text className="text-white">{t('reportDetailsLoading')}</Text>
                    <Text className="mt-2 text-sm text-gray-400">
                        {t('reportDetailsIdLabel')}: {reportId}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Mostrar error
    if (error || !report) {
        return (
            <SafeAreaView className="flex-1 bg-[#0A0E1A]">
                <View className="flex-1 items-center justify-center px-4">
                    <Ionicons name="document-text-outline" size={64} color="#6b7280" />
                    <Text className="mt-4 text-xl font-semibold text-white">
                        {error || t('reportDetailsNotFound')}
                    </Text>
                    <Text className="mt-2 text-center text-gray-400">
                        {t('reportDetailsIdLabel')}: {reportId}
                    </Text>
                    <View className="mt-4 flex-row space-x-4">
                        <TouchableOpacity
                            onPress={refetch}
                            className="rounded-lg bg-[#537CF2] px-4 py-2">
                            <Text className="text-white">{t('reportDetailsRetry')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleGoBack}
                            className="rounded-lg bg-gray-600 px-4 py-2">
                            <Text className="text-white">{t('reportDetailsBack')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // Si estamos en modo edición, mostrar la pantalla de edición
    if (showEditScreen && report) {
        return (
            <EditReportScreen
                reportId={reportId}
                initialData={{
                    titulo: report.titulo,
                    descripcion: report.descripcion,
                    direccion: report.ubicacion.direccion,
                    latitud: report.ubicacion.latitud,
                    longitud: report.ubicacion.longitud,
                    urgencia: report.nivelUrgencia,
                    tipoDenuncia: report.tipoDenuncia,
                    ciudad: report.ciudad,
                    visible: true,
                }}
                onBack={handleBackFromEdit}
                onSuccess={() => {
                    // Opcional: mostrar mensaje de éxito
                }}
            />
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="bg-secondary px-4 py-3">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={handleGoBack} className="flex-row items-center">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="mr-6 flex-1 text-center text-2xl font-bold text-white">
                        {t('reportDetailsTitle')}
                    </Text>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Carrusel de imágenes con parallax */}
                {report.imagenes.length > 0 && (
                    <View className="bg-black px-4 py-6">
                        <Carousel
                            ref={carouselRef}
                            autoPlayInterval={4000}
                            data={report.imagenes}
                            height={258}
                            loop={true}
                            pagingEnabled={true}
                            snapEnabled={true}
                            width={screenWidth}
                            style={{
                                width: screenWidth,
                            }}
                            mode="parallax"
                            modeConfig={{
                                parallaxScrollingScale: 0.9,
                                parallaxScrollingOffset: 50,
                            }}
                            onProgressChange={progress}
                            onSnapToItem={(index) => setCurrentImageIndex(index)}
                            renderItem={renderCarouselItem}
                        />

                        {/* Indicadores de paginación */}
                        {report.imagenes.length > 1 && (
                            <View className="mt-4 flex-row items-center justify-center space-x-2">
                                {report.imagenes.map((_: string, index: number) => (
                                    <TouchableOpacity
                                        key={`indicator-${index}`}
                                        onPress={() => {
                                            carouselRef.current?.scrollTo({
                                                index,
                                                animated: true,
                                            });
                                        }}>
                                        <View
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                index === currentImageIndex
                                                    ? 'w-6 bg-[#537CF2]'
                                                    : 'w-2 bg-white/40'
                                            }`}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* Modal de pantalla completa */}
                <Modal
                    visible={showFullscreen}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={closeFullscreenImage}>
                    <StatusBar hidden />
                    <View className="flex-1 bg-black">
                        {/* Header de pantalla completa */}
                        <View className="absolute left-0 right-0 top-0 z-10 bg-black/50 px-4 py-12">
                            <View className="flex-row items-center justify-between">
                                <TouchableOpacity
                                    onPress={closeFullscreenImage}
                                    className="rounded-full bg-black/70 p-2">
                                    <Ionicons name="close" size={24} color="white" />
                                </TouchableOpacity>
                                <View className="rounded-full bg-black/70 px-3 py-2">
                                    <Text className="font-medium text-white">
                                        {fullscreenImageIndex + 1}/{report.imagenes.length}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Carrusel en pantalla completa */}
                        <Carousel
                            ref={fullscreenCarouselRef}
                            loop={true}
                            width={screenWidth}
                            height={screenHeight}
                            data={report.imagenes}
                            scrollAnimationDuration={300}
                            onSnapToItem={(index) => setFullscreenImageIndex(index)}
                            renderItem={renderFullscreenCarouselItem}
                            defaultIndex={fullscreenImageIndex}
                            mode="parallax"
                            modeConfig={{
                                parallaxScrollingScale: 0.95,
                                parallaxScrollingOffset: 30,
                            }}
                        />

                        {/* Indicadores de paginación en pantalla completa */}
                        {report.imagenes.length > 1 && (
                            <View className="absolute bottom-12 left-0 right-0">
                                <View className="flex-row justify-center space-x-2">
                                    {report.imagenes.map((_: string, index: number) => (
                                        <TouchableOpacity
                                            key={`fullscreen-indicator-${index}`}
                                            onPress={() => {
                                                fullscreenCarouselRef.current?.scrollTo({
                                                    index,
                                                    animated: true,
                                                });
                                            }}>
                                            <View
                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                    index === fullscreenImageIndex
                                                        ? 'w-8 bg-[#537CF2]'
                                                        : 'w-2 bg-white/60'
                                                }`}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                </Modal>

                {/* Título del reporte */}
                <View className="mx-4 mt-4 rounded-xl bg-secondary p-4">
                    <Text className="text-center text-xl font-bold text-white">
                        {report.titulo}
                    </Text>
                </View>

                {/* Información rápida */}
                <View className="mx-4 mt-4 flex-row justify-between">
                    <View className="mr-2 flex-1 rounded-xl bg-secondary p-4">
                        <View className="flex-row items-center">
                            <Ionicons name="calendar-outline" size={20} color="#537CF2" />
                            <Text className="ml-2 text-sm font-medium text-gray-300">
                                {t('reportDetailsDateLabel')}
                            </Text>
                        </View>
                        <Text className="mt-1 font-semibold text-white">
                            {formatDate(report.fecha, locale)}
                        </Text>
                    </View>

                    <View className="ml-2 flex-1 rounded-xl bg-secondary p-4">
                        <View className="mb-1 flex-row items-center">
                            <Ionicons
                                name="alert-circle-outline"
                                size={20}
                                color={getUrgencyColor(report.nivelUrgencia)}
                            />
                            <Text className="ml-2 text-sm font-medium text-gray-300">
                                {t('reportDetailsUrgencyLabel')}
                            </Text>
                        </View>
                        <View
                            className="mt-1 self-start rounded-full px-3 py-1"
                            style={{
                                backgroundColor: getUrgencyColor(report.nivelUrgencia) + '20',
                            }}>
                            <Text
                                className="text-sm font-bold"
                                style={{ color: getUrgencyColor(report.nivelUrgencia) }}>
                                {report.nivelUrgencia}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Tipo de denuncia */}
                <View className="mx-4 mt-4 rounded-xl bg-secondary p-4">
                    <View className="mb-2 flex-row items-center">
                        <Ionicons name="list-outline" size={20} color="#537CF2" />
                        <Text className="ml-2 text-lg font-semibold text-white">
                            {t('reportDetailsTypeLabel')}
                        </Text>
                    </View>
                    <View className="rounded-lg bg-[#537CF2] bg-opacity-20 p-3">
                        <Text className="text-center text-lg font-medium text-white">
                            {getReportTypeTranslation(report.tipoDenuncia, t)}
                        </Text>
                    </View>
                </View>

                {/* Descripción */}
                <View className="mx-4 mt-4 rounded-xl bg-secondary p-4">
                    <View className="mb-3 flex-row items-center">
                        <Ionicons name="document-text-outline" size={20} color="#537CF2" />
                        <Text className="ml-2 text-lg font-semibold text-white">
                            {t('reportDetailsDescriptionLabel')}
                        </Text>
                    </View>
                    <Text className="leading-6 text-gray-200">{report.descripcion}</Text>
                </View>

                {/* Ubicación */}
                <View className="mx-4 mt-4 rounded-xl bg-secondary p-4">
                    <View className="mb-3 flex-row items-center">
                        <Ionicons name="location-outline" size={20} color="#537CF2" />
                        <Text className="ml-2 text-lg font-semibold text-white">
                            {t('reportDetailsLocationLabel')}
                        </Text>
                    </View>

                    <View className="mb-3 rounded-lg p-3">
                        <Text className="mb-2 font-medium text-white">
                            {report.ubicacion.direccion}
                        </Text>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-400">
                                {t('reportDetailsLocationLat')}: {report.ubicacion.latitud}
                            </Text>
                            <Text className="text-gray-400">
                                {t('reportDetailsLocationLng')}: {report.ubicacion.longitud}
                            </Text>
                        </View>
                        <Text className="mt-1 text-sm text-gray-400">
                            {t('reportDetailsLocationCity')}: {report.ciudad}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleShowMap}
                        className="rounded-lg bg-[#537CF2] p-3">
                        <View className="flex-row items-center justify-center">
                            <Ionicons name="map-outline" size={18} color="white" />
                            <Text className="ml-2 font-medium text-white">
                                {t('reportDetailsViewMap')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Video */}
                {report.video && (
                    <View className="mx-4 mt-4 rounded-xl bg-secondary p-4">
                        <View className="mb-3 flex-row items-center">
                            <Ionicons name="videocam-outline" size={20} color="#537CF2" />
                            <Text className="ml-2 text-lg font-semibold text-white">
                                {t('reportDetailsVideoLabel')}
                            </Text>
                        </View>

                        <TouchableOpacity className="rounded-lg border border-gray-400 border-opacity-30 bg-tertiary p-4">
                            <View className="flex-row items-center justify-center">
                                <Ionicons name="play-circle-outline" size={24} color="#537CF2" />
                                <Text className="ml-2 font-medium text-[#537CF2]">
                                    {t('reportDetailsPlayVideo')}
                                </Text>
                            </View>
                            <Text className="mt-2 text-center text-sm text-white">
                                {report.video}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Estadísticas */}
                <View className="mx-4 mt-4 rounded-xl bg-secondary p-4">
                    <View className="mb-3 flex-row items-center">
                        <Ionicons name="stats-chart-outline" size={20} color="#537CF2" />
                        <Text className="ml-2 text-lg font-semibold text-white">
                            {t('reportDetailsStatsLabel')}
                        </Text>
                    </View>

                    <View className="space-y-2">
                        <View className="flex-row items-center justify-between border-b border-gray-600 py-2">
                            <Text className="text-gray-300">{t('reportDetailsStatsFiles')}</Text>
                            <Text className="font-semibold text-white">
                                {report.estadisticas.total_archivos}
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between border-b border-gray-600 py-2">
                            <Text className="text-gray-300">{t('reportDetailsStatsImages')}</Text>
                            <Text className="font-semibold text-white">
                                {report.estadisticas.imagenes}
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between border-b border-gray-600 py-2">
                            <Text className="text-gray-300">{t('reportDetailsStatsVideos')}</Text>
                            <Text className="font-semibold text-white">
                                {report.estadisticas.videos}
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between py-2">
                            <Text className="text-gray-300">{t('reportDetailsStatsDays')}</Text>
                            <Text className="font-semibold text-white">
                                {report.estadisticas.dias_desde_creacion}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Información del sistema */}
                <View className="mx-4 mt-4 rounded-xl bg-secondary p-4">
                    <View className="mb-3 flex-row items-center">
                        <Ionicons name="information-circle-outline" size={20} color="#537CF2" />
                        <Text className="ml-2 text-lg font-semibold text-white">
                            {t('reportDetailsSystemInfo')}
                        </Text>
                    </View>

                    <View className="space-y-2">
                        <View className="flex-row items-center justify-between border-b border-gray-600 py-2">
                            <Text className="text-gray-300">{t('reportDetailsReportId')}</Text>
                            <Text className="font-mono text-white">{report.id}</Text>
                        </View>
                        <View className="flex-row items-center justify-between border-b border-gray-600 py-2">
                            <Text className="text-gray-300">{t('reportDetailsStatus')}</Text>
                            <View className="rounded-full bg-yellow-500/20 px-3 py-1">
                                <Text className="font-medium text-yellow-500">{report.estado}</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center justify-between border-b border-gray-600 py-2">
                            <Text className="text-gray-300">{t('reportDetailsUser')}</Text>
                            <Text className="font-semibold text-white">
                                {report.usuario.nombre || report.usuario.email}
                            </Text>
                        </View>
                        <View className="flex-row items-start justify-between py-2">
                            <Text className="text-gray-300">{t('reportDetailsCreatedAt')}</Text>
                            <Text className="ml-4 flex-1 text-right text-white">
                                {formatDate(report.fecha, locale)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Acciones - Solo mostrar si el usuario es el propietario del reporte */}
                {isOwner && (
                    <View className="mx-4 mb-6 mt-4">
                        {report.estadisticas.puede_agregar_imagenes && (
                            <TouchableOpacity className="mb-3 rounded-xl bg-green-600 p-4">
                                <View className="flex-row items-center justify-center">
                                    <Ionicons name="camera-outline" size={20} color="white" />
                                    <Text className="ml-2 font-semibold text-white">
                                        {t('reportDetailsActionsAdd')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            className="mb-3 rounded-xl bg-[#537CF2] p-4"
                            onPress={handleEdit}>
                            <View className="flex-row items-center justify-center">
                                <Ionicons name="create-outline" size={20} color="white" />
                                <Text className="ml-2 font-semibold text-white">
                                    {t('reportDetailsActionsUpdate')}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="rounded-xl bg-red-600 p-4"
                            onPress={handleDelete}>
                            <View className="flex-row items-center justify-center">
                                <Ionicons name="trash-outline" size={20} color="white" />
                                <Text className="ml-2 font-semibold text-white">
                                    {t('reportDetailsActionsDelete')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Modal del mapa */}
            {report && (
                <ModalMap
                    visible={showMapModal}
                    onClose={handleCloseMap}
                    mode="view"
                    viewLocation={{
                        latitude: report.ubicacion.latitud,
                        longitude: report.ubicacion.longitud,
                        address: report.ubicacion.direccion,
                    }}
                    title={t('reportDetailsLocationMapTitle')}
                />
            )}

            {/* Modal de comentarios */}
            {report && (
                <CommentsModal
                    visible={showCommentsModal}
                    onClose={() => setShowCommentsModal(false)}
                    postTitle={report.titulo}
                    reportId={reportId}
                    comments={[]}
                    onAddComment={async (content: string) => {
                        // La lógica de agregar comentarios se maneja dentro del CommentsModal
                        console.log('Comment added:', content);
                    }}
                    onRefreshComments={() => {
                        refetch();
                    }}
                    highlightCommentId={comentarioId}
                />
            )}
        </SafeAreaView>
    );
}

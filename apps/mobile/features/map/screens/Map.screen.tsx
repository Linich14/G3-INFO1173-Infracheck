import { useState, useRef, useCallback, useEffect } from 'react';
import { Pressable, View, Text, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { MapView, Camera, UserLocation, PointAnnotation } from '@maplibre/maplibre-react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useUserLocation } from '~/utils/userLocation';
import { GPSPermissionModal } from '~/components/GPSPermissionModal';
import { MAP_CONFIG } from '~/constants/config';
import { localizacion, PinDetails } from '../types';
import {
    AnnotationType,
    AnnotationData,
    ANNOTATION_CONFIGS,
    FilterState,
    ZOOM_CONFIG,
} from '../types';
import PinDetailsModal from '../components/PinDetailsModal';
import MapFilters from '../components/MapFilters';
import MapPopup from '../components/MapPopup';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapService from '../services/mapService';
import { ReportService } from '~/features/report/services/reportService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MapScreen() {
    const [location, setLocation] = useState<localizacion>({
        latitud: -38.7399,
        longitud: -72.5901,
        direccion: '',
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [pinDetails, setPinDetails] = useState<PinDetails | null>(null);
    const [cargando, setCargando] = useState(false);
    const [selectedAnnotation, setSelectedAnnotation] = useState<AnnotationData | null>(null);

    const [popupVisible, setPopupVisible] = useState(false);
    const [popupAnnotation, setPopupAnnotation] = useState<AnnotationData | null>(null);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

    const [currentZoomLevel, setCurrentZoomLevel] = useState<number>(13);
    const [shouldUpdateCamera, setShouldUpdateCamera] = useState(true);

    const [annotations, setAnnotations] = useState<AnnotationData[]>([]);
    const [loadingAnnotations, setLoadingAnnotations] = useState(false);

    const mapRef = useRef<MapView>(null);

    const [filterState, setFilterState] = useState<FilterState>({
        activeTypes: new Set(Object.values(AnnotationType)),
        showAll: true,
    });
    const [filtersVisible, setFiltersVisible] = useState(false);

    const { getUserLocation, showPermissionModal, handleAcceptPermission, handleCancelPermission } =
        useUserLocation();
    const router = useRouter();

    const loadAnnotationsFromAPI = useCallback(async () => {
        if (currentZoomLevel < ZOOM_CONFIG.MIN_ZOOM_TO_SHOW_POINTS) {
            setAnnotations([]);
            return;
        }

        setLoadingAnnotations(true);
        try {
            if (filterState.activeTypes.size === 0) {
                setAnnotations([]);
                return;
            }

            const geoJsonData = await MapService.getReportsGeoJSON(filterState.activeTypes);
            const annotationData = MapService.featuresToAnnotationData(geoJsonData.features || []);
            setAnnotations(annotationData);
        } catch (error) {
            setAnnotations([]);
        } finally {
            setLoadingAnnotations(false);
        }
    }, [filterState.activeTypes, currentZoomLevel]);

    useEffect(() => {
        loadAnnotationsFromAPI();
    }, [loadAnnotationsFromAPI]);

    const updateCurrentZoom = useCallback(async () => {
        if (mapRef.current) {
            try {
                const zoom = await mapRef.current.getZoom();
                setCurrentZoomLevel(zoom);
            } catch (error) {
                // Error silencioso
            }
        }
    }, []);

    const updatePopupPosition = useCallback(async () => {
        if (popupVisible && popupAnnotation && mapRef.current) {
            try {
                const pointInView = await mapRef.current.getPointInView(popupAnnotation.coordinate);

                const popupWidth = 288;
                const popupHeight = 160;
                const pinOffset = 20;

                let x = pointInView[0] - popupWidth / 2;
                let y = pointInView[1] - popupHeight - pinOffset;

                if (x < 16) {
                    x = 16;
                } else if (x + popupWidth > SCREEN_WIDTH - 16) {
                    x = SCREEN_WIDTH - popupWidth - 16;
                }

                if (y < 100) {
                    y = pointInView[1] + 40;
                }

                setPopupPosition({ x, y });
            } catch (error) {
                // Error silencioso
            }
        }
    }, [popupVisible, popupAnnotation]);

    const onRegionWillChange = useCallback(() => {
        // Mantener popup visible durante movimiento
    }, []);

    const onRegionDidChange = useCallback(() => {
        updateCurrentZoom();
        updatePopupPosition();
        setShouldUpdateCamera(false);
    }, [updateCurrentZoom, updatePopupPosition]);

    const centerOnUserLocation = async () => {
        try {
            const userLocation = await getUserLocation();
            if (userLocation) {
                setLocation({
                    latitud: userLocation.coords.latitude,
                    longitud: userLocation.coords.longitude,
                    direccion: '',
                });
                setShouldUpdateCamera(true);
            }
        } catch (error) {
            // Error silencioso
        }
    };

    const hidePopup = useCallback(() => {
        setPopupVisible(false);
        setPopupAnnotation(null);
    }, []);

    const handleMapPress = useCallback(() => {
        if (popupVisible) {
            hidePopup();
        }
    }, [popupVisible, hidePopup]);

    const handleAnnotationSelected = async (annotation: AnnotationData, event?: any) => {
        setPopupAnnotation(annotation);

        try {
            if (mapRef.current) {
                const pointInView = await mapRef.current.getPointInView(annotation.coordinate);

                const popupWidth = 288;
                const popupHeight = 160;
                const pinOffset = 20;

                let x = pointInView[0] - popupWidth / 2;
                let y = pointInView[1] - popupHeight - pinOffset;

                if (x < 16) {
                    x = 16;
                } else if (x + popupWidth > SCREEN_WIDTH - 16) {
                    x = SCREEN_WIDTH - popupWidth - 16;
                }

                if (y < 100) {
                    y = pointInView[1] + 40;
                }

                setPopupPosition({ x, y });
                setPopupVisible(true);
            }
        } catch (error) {
            const fallbackPosition = {
                x: SCREEN_WIDTH / 2 - 144,
                y: SCREEN_HEIGHT / 2 - 80,
            };

            setPopupPosition(fallbackPosition);
            setPopupVisible(true);
        }
    };

    const handlePopupPress = async () => {
        if (!popupAnnotation) return;

        setSelectedAnnotation(popupAnnotation);
        setCargando(true);
        setModalVisible(true);
        setPopupVisible(false);

        try {
            const reportDetail = await ReportService.getReportDetail(popupAnnotation.id);

            if (reportDetail.success) {
                const data = reportDetail.data;

                const detalles: PinDetails = {
                    id: data.id.toString(),
                    titulo: data.titulo,
                    descripcion: data.descripcion,
                    tipoDenuncia: data.tipo_denuncia.nombre,
                    ubicacion: {
                        latitud: data.ubicacion.latitud,
                        longitud: data.ubicacion.longitud,
                        direccion: data.direccion,
                    },
                    nivelUrgencia: data.urgencia.etiqueta,
                    fecha: data.fecha_creacion,
                    imagenes: data.archivos
                        .filter((archivo) => archivo.tipo === 'imagen')
                        .map((archivo) => archivo.url),
                    video: data.archivos.find((archivo) => archivo.tipo === 'video')?.url || '',
                };

                setPinDetails(detalles);
            } else {
                const detalles: PinDetails = {
                    id: popupAnnotation.id,
                    titulo: popupAnnotation.title,
                    descripcion: popupAnnotation.description || 'Sin descripción',
                    tipoDenuncia: popupAnnotation.tipo_denuncia_nombre || '',
                    ubicacion: {
                        latitud: popupAnnotation.coordinate[1],
                        longitud: popupAnnotation.coordinate[0],
                        direccion: popupAnnotation.direccion || '',
                    },
                    nivelUrgencia: popupAnnotation.urgencia_label || '',
                    fecha: popupAnnotation.fecha_creacion || new Date().toISOString(),
                    imagenes: popupAnnotation.imagen_principal
                        ? [popupAnnotation.imagen_principal]
                        : [],
                    video: '',
                };

                setPinDetails(detalles);
            }
        } catch (error) {
            const detalles: PinDetails = {
                id: popupAnnotation.id,
                titulo: popupAnnotation.title,
                descripcion: popupAnnotation.description || 'Sin descripción',
                tipoDenuncia: popupAnnotation.tipo_denuncia_nombre || '',
                ubicacion: {
                    latitud: popupAnnotation.coordinate[1],
                    longitud: popupAnnotation.coordinate[0],
                    direccion: popupAnnotation.direccion || '',
                },
                nivelUrgencia: popupAnnotation.urgencia_label || '',
                fecha: popupAnnotation.fecha_creacion || new Date().toISOString(),
                imagenes: popupAnnotation.imagen_principal
                    ? [popupAnnotation.imagen_principal]
                    : [],
                video: '',
            };

            setPinDetails(detalles);
        } finally {
            setCargando(false);
        }
    };

    const handleOpenFullScreen = () => {
        if (!popupAnnotation) return;
        setModalVisible(false);
        router.push(`/(tabs)/report/${popupAnnotation.id}`);
    };

    const closeModal = () => {
        setModalVisible(false);
        setPinDetails(null);
        setSelectedAnnotation(null);
    };

    const getVisibleAnnotations = useCallback(() => {
        if (currentZoomLevel < ZOOM_CONFIG.MIN_ZOOM_TO_SHOW_POINTS) {
            return [];
        }

        if (filterState.activeTypes.size === 0) {
            return [];
        }

        const filtered = annotations.filter((annotation) => {
            return filterState.activeTypes.has(annotation.type);
        });

        return filtered;
    }, [annotations, currentZoomLevel, filterState.activeTypes]);

    const renderAnnotations = () => {
        const visibleAnnotations = getVisibleAnnotations();

        if (visibleAnnotations.length === 0) {
            return null;
        }

        return visibleAnnotations
            .map((annotation) => {
                const config = ANNOTATION_CONFIGS[annotation.type];

                if (!config) {
                    return null;
                }

                return (
                    <PointAnnotation
                        key={annotation.id}
                        id={annotation.id}
                        coordinate={annotation.coordinate}
                        onSelected={(event) => handleAnnotationSelected(annotation, event)}>
                        <View className="items-center justify-center">
                            <MaterialCommunityIcons
                                name={config.icon as any}
                                size={config.size}
                                color={annotation.marker_color || config.color}
                            />
                            {(annotation.severity === 'Alta' ||
                                annotation.severity === 'Crítica') && (
                                <View
                                    className={`absolute -right-1 -top-1 h-3 w-3 rounded-full border border-white ${
                                        annotation.severity === 'Crítica'
                                            ? 'bg-red-600'
                                            : 'bg-red-500'
                                    }`}
                                />
                            )}
                            {(annotation.status === 'Resuelto' ||
                                annotation.status === 'Cerrado') && (
                                <View className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-white bg-green-500" />
                            )}
                        </View>
                    </PointAnnotation>
                );
            })
            .filter(Boolean);
    };

    return (
        <SafeAreaView edges={['top', 'left', 'right']} className="flex-1">
            <View className="flex-1">
                <TouchableWithoutFeedback onPress={handleMapPress}>
                    <View className="h-full w-full">
                        <MapView
                            ref={mapRef}
                            style={{ flex: 1 }}
                            compassEnabled={true}
                            mapStyle={MAP_CONFIG.STYLE_URL}
                            onRegionWillChange={onRegionWillChange}
                            onRegionDidChange={onRegionDidChange}
                            onPress={handleMapPress}>
                            {shouldUpdateCamera && (
                                <Camera
                                    centerCoordinate={[location.longitud, location.latitud]}
                                    zoomLevel={ZOOM_CONFIG.DEFAULT_ZOOM}
                                    animationDuration={1000}
                                />
                            )}
                            <UserLocation />
                            {renderAnnotations()}
                        </MapView>
                    </View>
                </TouchableWithoutFeedback>

                {loadingAnnotations && (
                    <View className="absolute left-1/2 top-20 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2">
                        <Text className="text-sm text-white">Cargando reportes...</Text>
                    </View>
                )}

                <MapPopup
                    annotation={popupAnnotation}
                    visible={popupVisible}
                    onPress={handlePopupPress}
                    position={popupPosition}
                />

                <MapFilters
                    filterState={filterState}
                    onFilterChange={setFilterState}
                    isVisible={filtersVisible}
                    onToggleVisibility={() => setFiltersVisible(!filtersVisible)}
                    currentZoom={currentZoomLevel}
                />

                <View className="absolute bottom-0 right-0 flex-col items-center gap-3 px-4 py-7">
                    <Pressable
                        className="aspect-square flex-1 rounded-full bg-primary p-2"
                        onPress={centerOnUserLocation}>
                        <MaterialCommunityIcons name="crosshairs-gps" size={40} color="#FFFFFF" />
                    </Pressable>
                    <Pressable
                        onPress={() => router.push('/(tabs)/(map)/create_report')}
                        className="rounded-full bg-primary p-4">
                        <MaterialCommunityIcons name="plus" size={40} color="#FFFFFF" />
                    </Pressable>
                </View>

                <PinDetailsModal
                    cargando={cargando}
                    pinDetails={pinDetails}
                    visible={modalVisible}
                    onClose={closeModal}
                    onOpenFullScreen={handleOpenFullScreen}
                />

                <GPSPermissionModal
                    visible={showPermissionModal}
                    onAccept={handleAcceptPermission}
                    onCancel={handleCancelPermission}
                />
            </View>
        </SafeAreaView>
    );
}

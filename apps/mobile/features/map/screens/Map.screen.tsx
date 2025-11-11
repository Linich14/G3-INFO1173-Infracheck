import { useState, useRef, useCallback } from 'react';
import { Pressable, View, Text, Dimensions } from 'react-native';
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

// Obtener dimensiones de pantalla
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Datos de ejemplo - en producción vendrían de una API
const SAMPLE_ANNOTATIONS: AnnotationData[] = [
    {
        id: '1',
        type: AnnotationType.ALUMBRADO_DANADO,
        coordinate: [-72.591, -38.74],
        title: 'Hueco en la calzada',
        severity: 'high',
        status: 'active',
    },
    {
        id: '2',
        type: AnnotationType.BASURA_ESCOMBROS,
        coordinate: [-72.595, -38.742],
        title: 'Luminaria sin funcionar',
        severity: 'medium',
        status: 'pending',
    },
    {
        id: '3',
        type: AnnotationType.EMERGENCIAS_RIESGOS,
        coordinate: [-72.588, -38.738],
        title: 'Árbol caído',
        severity: 'high',
        status: 'pending',
    },
    {
        id: '4',
        type: AnnotationType.DRENAJE_AGUAS,
        coordinate: [-72.593, -38.745],
        title: 'Alcantarilla obstruida',
        severity: 'medium',
        status: 'active',
    },
    {
        id: '5',
        type: AnnotationType.PARQUES_ARBOLES,
        coordinate: [-72.589, -38.741],
        title: 'Banca rota',
        severity: 'low',
        status: 'active',
    },
    {
        id: '6',
        type: AnnotationType.BASURA_ESCOMBROS,
        coordinate: [-72.592, -39.739],
        title: 'Rampa de acceso dañada',
        severity: 'high',
        status: 'pending',
    },
];

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

    // Estados para el popup
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupAnnotation, setPopupAnnotation] = useState<AnnotationData | null>(null);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

    // Estado de zoom - iniciado en 10
    const [currentZoomLevel, setCurrentZoomLevel] = useState<number>(10);
    const [shouldUpdateCamera, setShouldUpdateCamera] = useState(true); // Control para la cámara

    // Referencia al MapView para usar getZoom()
    const mapRef = useRef<MapView>(null);

    // Estado de filtros
    const [filterState, setFilterState] = useState<FilterState>({
        activeTypes: new Set(Object.values(AnnotationType)),
        showAll: true,
    });
    const [filtersVisible, setFiltersVisible] = useState(false);

    const { getUserLocation, showPermissionModal, handleAcceptPermission, handleCancelPermission } =
        useUserLocation();
    const router = useRouter();

    // Función para actualizar el zoom actual
    const updateCurrentZoom = useCallback(async () => {
        if (mapRef.current) {
            try {
                const zoom = await mapRef.current.getZoom();
                setCurrentZoomLevel(zoom);
                console.log('Zoom level actualizado:', zoom);
            } catch (error) {
                console.error('Error obteniendo zoom level:', error);
            }
        }
    }, []);

    // Callback para cuando el mapa se mueve/hace zoom - oculta el popup
    const onRegionWillChange = useCallback(() => {
        setPopupVisible(false);
        setPopupAnnotation(null);
    }, []);

    const onRegionDidChange = useCallback(() => {
        updateCurrentZoom();
        // Después del primer cambio, no actualizar más la cámara automáticamente
        setShouldUpdateCamera(false);
    }, [updateCurrentZoom]);

    const centerOnUserLocation = async () => {
        try {
            const userLocation = await getUserLocation();
            if (userLocation) {
                setLocation({
                    latitud: userLocation.coords.latitude,
                    longitud: userLocation.coords.longitude,
                    direccion: '',
                });
                // Solo actualizar la cámara cuando el usuario lo solicite explícitamente
                setShouldUpdateCamera(true);
                console.log('Ubicación del usuario centrada:', userLocation);
            }
        } catch (error) {
            console.error('Error al obtener la ubicación del usuario:', error);
        }
    };

    // Función para mostrar el popup cuando se selecciona un marker
    const handleAnnotationSelected = async (annotation: AnnotationData, event?: any) => {
        setPopupAnnotation(annotation);

        try {
            if (mapRef.current) {
                // Obtener la posición del pin en coordenadas de pantalla
                const pointInView = await mapRef.current.getPointInView(annotation.coordinate);

                console.log('Coordenadas del pin en pantalla:', pointInView);
                console.log('Coordenadas geográficas:', annotation.coordinate);

                // Calcular posición del popup considerando:
                // - El ancho del popup (288px)
                // - La altura del popup (aproximadamente 140px)
                // - El offset para que aparezca arriba del pin
                const popupWidth = 288;
                const popupHeight = 140;
                const pinOffset = 16; // Offset para el icono del pin

                let x = pointInView[0] - popupWidth / 2; // Centrar horizontalmente
                let y = pointInView[1] - popupHeight - pinOffset; // Posicionar arriba del pin

                // Ajustar si el popup se sale de la pantalla horizontalmente
                if (x < 16) {
                    x = 16; // Margen mínimo izquierdo
                } else if (x + popupWidth > SCREEN_WIDTH - 16) {
                    x = SCREEN_WIDTH - popupWidth - 16; // Margen mínimo derecho
                }

                // Ajustar si el popup se sale de la pantalla verticalmente
                if (y < 100) {
                    // Considerar espacio para header/filtros
                    y = pointInView[1] + 40; // Mostrar debajo del pin si no hay espacio arriba
                }

                console.log('Posición calculada del popup:', { x, y });

                setPopupPosition({ x, y });
                setPopupVisible(true);
            }
        } catch (error) {
            console.error('Error calculando posición del popup:', error);

            // Fallback: centrar en pantalla
            const fallbackPosition = {
                x: SCREEN_WIDTH / 2 - 144, // 144 = popupWidth / 2
                y: SCREEN_HEIGHT / 2 - 70, // 70 = popupHeight / 2
            };

            setPopupPosition(fallbackPosition);
            setPopupVisible(true);
        }
    };

    // Función para abrir el modal detallado desde el popup
    const handlePopupPress = async () => {
        if (!popupAnnotation) return;

        setSelectedAnnotation(popupAnnotation);
        setCargando(true);
        setModalVisible(true);
        setPopupVisible(false); // Ocultar el popup

        try {
            // Simular carga de datos específicos del pin
            const detalles: PinDetails = {
                id: popupAnnotation.id,
                titulo: popupAnnotation.title,
                descripcion: popupAnnotation.description || 'Sin descripción',
                tipoDenuncia: popupAnnotation.type,
                ubicacion: {
                    latitud: popupAnnotation.coordinate[1],
                    longitud: popupAnnotation.coordinate[0],
                    direccion: '',
                },
                nivelUrgencia: popupAnnotation.severity || 'low',
                fecha: new Date().toISOString(),
                imagenes: ['https://picsum.photos/400/400'],
                video: '',
            };

            await new Promise((resolve) => setTimeout(resolve, 1500));
            setPinDetails(detalles);
        } catch (error) {
            console.error('Error al cargar detalles del pin:', error);
        } finally {
            setCargando(false);
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setPinDetails(null);
        setSelectedAnnotation(null);
    };

    // Filtrar anotaciones basado SOLO en filtros y zoom global
    const getVisibleAnnotations = useCallback(() => {
        // Verificar zoom global primero
        if (currentZoomLevel < ZOOM_CONFIG.MIN_ZOOM_TO_SHOW_POINTS) {
            return [];
        }

        // Solo filtrar por tipo si el zoom es suficiente
        return SAMPLE_ANNOTATIONS.filter((annotation) => {
            return filterState.activeTypes.has(annotation.type);
        });
    }, [filterState.activeTypes, currentZoomLevel]);

    const renderAnnotations = () => {
        const visibleAnnotations = getVisibleAnnotations();

        return visibleAnnotations.map((annotation) => {
            const config = ANNOTATION_CONFIGS[annotation.type];

            return (
                <PointAnnotation
                    key={annotation.id}
                    id={annotation.id}
                    coordinate={annotation.coordinate}
                    onSelected={(event) => handleAnnotationSelected(annotation, event)}>
                    <View className="items-center justify-center">
                        <MaterialCommunityIcons
                            name={config.icon}
                            size={config.size}
                            color={config.color}
                        />
                        {annotation.severity === 'high' && (
                            <View className="absolute -right-1 -top-1 h-3 w-3 rounded-full border border-white bg-red-500" />
                        )}
                    </View>
                </PointAnnotation>
            );
        });
    };

    return (
        <SafeAreaView edges={['top', 'left', 'right']} className="flex-1">
            <View className="flex-1">
                <View className="h-full w-full">
                    <MapView
                        ref={mapRef}
                        style={{ flex: 1 }}
                        compassEnabled={true}
                        mapStyle={MAP_CONFIG.STYLE_URL}
                        onRegionWillChange={onRegionWillChange}
                        onRegionDidChange={onRegionDidChange}>
                        {/* Solo mostrar Camera cuando sea necesario actualizar */}
                        {shouldUpdateCamera && (
                            <Camera
                                centerCoordinate={[location.longitud, location.latitud]}
                                zoomLevel={12} // Zoom inicial en 10
                                animationDuration={1000}
                            />
                        )}
                        <UserLocation />
                        {renderAnnotations()}
                    </MapView>
                </View>

                {/* Popup compacto */}
                <MapPopup
                    annotation={popupAnnotation}
                    visible={popupVisible}
                    onPress={handlePopupPress}
                    position={popupPosition}
                />

                {/* Filtros */}
                <MapFilters
                    filterState={filterState}
                    onFilterChange={setFilterState}
                    isVisible={filtersVisible}
                    onToggleVisibility={() => setFiltersVisible(!filtersVisible)}
                    currentZoom={currentZoomLevel}
                />

                {/* Botones de acción */}
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
                />

                {/* Modal de permisos GPS */}
                <GPSPermissionModal
                    visible={showPermissionModal}
                    onAccept={handleAcceptPermission}
                    onCancel={handleCancelPermission}
                />
            </View>
        </SafeAreaView>
    );
}

import { View, Text, Pressable, Modal, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { MapView, Camera, UserLocation, PointAnnotation } from '@maplibre/maplibre-react-native';
import { MAP_CONFIG } from '~/constants/config';
import { useUserLocation } from '~/utils/userLocation';
import { GPSPermissionModal } from '~/components/GPSPermissionModal';
import { useLanguage } from '~/contexts/LanguageContext';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Location {
    latitude: number;
    longitude: number;
    address?: string;
}

interface ModalMapProps {
    visible: boolean;
    onClose: () => void;
    onSelectLocation?: (location: Location) => void;
    initialLocation?: Location;
    title?: string;
    mode?: 'select' | 'view';
    viewLocation?: Location;
}

const ModalMap = ({
    visible,
    onClose,
    onSelectLocation,
    initialLocation,
    title,
    mode = 'select',
    viewLocation,
}: ModalMapProps) => {
    const { t } = useLanguage();
    const {
        location,
        errorMsg,
        showPermissionModal,
        handleAcceptPermission,
        handleCancelPermission,
    } = useUserLocation();
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(
        initialLocation || null
    );
    const [cameraCenter, setCameraCenter] = useState<[number, number] | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Determinar el título basado en el modo
    const modalTitle = title || (mode === 'view' ? t('reportMapViewTitle') : t('reportMapSelectTitle'));

    // Determinar si es modo de solo visualización
    const isViewMode = mode === 'view';

    // Inicialización solo una vez al abrir el modal
    useEffect(() => {
        if (visible && !hasInitialized) {
            let centerLocation: Location | null = null;

            // En modo visualización, usar viewLocation si está disponible
            if (isViewMode && viewLocation) {
                centerLocation = viewLocation;
                setSelectedLocation(viewLocation);
            }
            // En modo selección, usar location del usuario o initialLocation
            else if (!isViewMode && location) {
                centerLocation = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                };

                if (!selectedLocation) {
                    setSelectedLocation(centerLocation);
                }
            }
            // Si hay initialLocation, usarla como centro
            else if (initialLocation) {
                centerLocation = initialLocation;
                if (!selectedLocation) {
                    setSelectedLocation(initialLocation);
                }
            }

            // Establecer centro de cámara SOLO en la inicialización
            if (centerLocation) {
                const center: [number, number] = [
                    centerLocation.longitude,
                    centerLocation.latitude,
                ];
                setCameraCenter(center);
                setHasInitialized(true);
            }
        }
    }, [
        visible,
        location,
        isViewMode,
        viewLocation,
        initialLocation,
        hasInitialized,
        selectedLocation,
    ]);

    useEffect(() => {
        if (!visible) {
            setCameraCenter(null);
            setIsMapReady(false);
            setSelectedLocation(initialLocation || null);
            setHasInitialized(false);
        }
    }, [visible, initialLocation]);

    const handleMapPress = (event: any) => {
        // Solo permitir selección si no es modo visualización
        if (!isMapReady || isViewMode) return;

        const { coordinates } = event.geometry;
        const newLocation = {
            latitude: coordinates[1],
            longitude: coordinates[0],
        };

        // Solo actualizar la ubicación seleccionada, SIN centrar la cámara
        setSelectedLocation(newLocation);
    };

    const handleMarkerDragEnd = (event: any) => {
        // Solo permitir arrastrar si no es modo visualización
        if (isViewMode) return;

        const { coordinates } = event.geometry;
        const newLocation = {
            latitude: coordinates[1],
            longitude: coordinates[0],
        };

        // Solo actualizar la ubicación seleccionada, SIN centrar la cámara
        setSelectedLocation(newLocation);
    };

    const handleConfirmLocation = () => {
        if (selectedLocation && onSelectLocation && !isViewMode) {
            onSelectLocation(selectedLocation);
            onClose();
        }
    };

    // Función para centrar en el usuario manualmente (sin mover el pin)
    const handleCenterOnUser = () => {
        if (location) {
            const userLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
            setSelectedLocation(userLocation);
            const center: [number, number] = [userLocation.longitude, userLocation.latitude];
            setCameraCenter(center);
        } else if (errorMsg) {
            Alert.alert(t('reportValidationUnexpectedError'), t('reportMapLocationError'));
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 items-center justify-end bg-black/50">
                <View className="h-[80%] w-full overflow-hidden rounded-t-xl bg-[#0A0E1A]">
                    {/* Header con tema oscuro */}
                    <View className="flex-row items-center justify-between border-b border-gray-600 bg-primary p-4">
                        <Text className="text-lg font-bold text-white">{modalTitle}</Text>
                        <View className="flex-row gap-2">
                            <Pressable onPress={onClose} className="p-2">
                                <Ionicons name="close" size={24} color="white" />
                            </Pressable>
                        </View>
                    </View>

                    {/* Solo mostrar errores en modo selección */}
                    {!isViewMode && errorMsg && (
                        <View className="border-b border-red-700/50 bg-red-900/30 p-2">
                            <Text className="text-center text-red-300">{errorMsg}</Text>
                        </View>
                    )}

                    {/* Instrucciones dinámicas según el modo con tema oscuro */}
                    <View className="border-b border-[#537CF2]/30 bg-[#537CF2]/20 p-3">
                        <Text className="text-center text-sm text-[#537CF2]">
                            {isViewMode
                                ? t('reportMapViewInstruction')
                                : t('reportMapInstruction')}
                        </Text>
                    </View>

                    {/* Contenedor del mapa con botón flotante */}
                    <View className="relative flex-1">
                        <MapView
                            mapStyle={MAP_CONFIG.STYLE_URL}
                            style={{ flex: 1 }}
                            onPress={handleMapPress}
                            onDidFinishLoadingMap={() => setIsMapReady(true)}>
                            {/* Solo mostrar UserLocation en modo selección */}
                            {!isViewMode && <UserLocation visible={true} />}

                            {cameraCenter && (
                                <Camera
                                    centerCoordinate={cameraCenter}
                                    zoomLevel={15}
                                    animationDuration={1000}
                                />
                            )}

                            {selectedLocation && isMapReady && (
                                <PointAnnotation
                                    id={isViewMode ? 'view-marker' : 'draggable-marker'}
                                    coordinate={[
                                        selectedLocation.longitude,
                                        selectedLocation.latitude,
                                    ]}
                                    draggable={!isViewMode}
                                    onDragEnd={handleMarkerDragEnd}>
                                    <View className="items-center">
                                        <Ionicons
                                            name="location"
                                            size={40}
                                            color={isViewMode ? '#537CF2' : '#ef4444'}
                                        />
                                    </View>
                                </PointAnnotation>
                            )}
                        </MapView>

                        {/* Botón flotante para centrar en usuario - solo en modo selección */}
                        {!isViewMode && location && (
                            <View className="absolute right-4 top-4">
                                <Pressable
                                    onPress={handleCenterOnUser}
                                    className="rounded-full border border-gray-200 bg-white p-3 shadow-lg">
                                    <Ionicons name="navigate" size={24} color="#537CF2" />
                                </Pressable>
                            </View>
                        )}
                    </View>

                    {/* Información de ubicación con tema oscuro */}
                    {selectedLocation && (
                        <View className="border-t border-gray-600 bg-[#1A1F2E] p-3">
                            <Text className="text-center text-sm font-medium text-white">
                                {isViewMode ? t('reportMapLocationLabel') : t('reportMapSelectedLabel')}
                            </Text>
                            <Text className="text-center text-xs text-gray-400">
                                Lat: {selectedLocation.latitude.toFixed(6)}, Lng:{' '}
                                {selectedLocation.longitude.toFixed(6)}
                            </Text>
                        </View>
                    )}

                    {/* Botones dinámicos según el modo con tema oscuro */}
                    <View className="flex-row gap-3 border-t border-gray-600 bg-[#1A1F2E] p-4">
                        <Pressable
                            onPress={onClose}
                            className="flex-1 items-center rounded-lg bg-gray-600 p-3">
                            <Text className="font-medium text-white">
                                {isViewMode ? t('reportMapClose') : t('reportMapCancel')}
                            </Text>
                        </Pressable>

                        {/* Solo mostrar botón confirmar en modo selección */}
                        {!isViewMode && (
                            <Pressable
                                onPress={handleConfirmLocation}
                                disabled={!selectedLocation}
                                className={`flex-1 items-center rounded-lg p-3 ${
                                    selectedLocation ? 'bg-[#537CF2]' : 'bg-gray-700'
                                }`}>
                                <Text className="font-medium text-white">{t('reportMapConfirm')}</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </View>

            {/* Modal de permisos GPS - solo en modo selección */}
            {!isViewMode && (
                <GPSPermissionModal
                    visible={showPermissionModal}
                    onAccept={handleAcceptPermission}
                    onCancel={handleCancelPermission}
                />
            )}
        </Modal>
    );
};

export default ModalMap;

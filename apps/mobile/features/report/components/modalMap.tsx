import { View, Text, Pressable, Modal, Dimensions, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { MapView, Camera, UserLocation, PointAnnotation } from '@maplibre/maplibre-react-native';
import { MAP_CONFIG } from '~/constants/config';
import { useUserLocation } from '~/utils/userLocation';
import { GPSPermissionModal } from '~/components/GPSPermissionModal';

interface Location {
    latitude: number;
    longitude: number;
    address?: string;
}

interface ModalMapProps {
    visible: boolean;
    onClose: () => void;
    onSelectLocation: (location: Location) => void;
    initialLocation?: Location;
    title?: string;
}

const ModalMap = ({
    visible,
    onClose,
    onSelectLocation,
    initialLocation,
    title = 'Seleccionar Ubicación',
}: ModalMapProps) => {
    const { location, errorMsg, showPermissionModal, handleAcceptPermission, handleCancelPermission } = useUserLocation();
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(
        initialLocation || null
    );
    const [cameraCenter, setCameraCenter] = useState<[number, number] | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);

    useEffect(() => {
        if (visible && location && !cameraCenter) {
            const center: [number, number] = [location.coords.longitude, location.coords.latitude];
            setCameraCenter(center);

            if (!selectedLocation) {
                setSelectedLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            }
        }
    }, [visible, location, cameraCenter, selectedLocation]);

    useEffect(() => {
        if (!visible) {
            setCameraCenter(null);
            setIsMapReady(false);
            setSelectedLocation(initialLocation || null);
        }
    }, [visible, initialLocation]);

    const handleMapPress = (event: any) => {
        if (!isMapReady) return;

        const { coordinates } = event.geometry;
        const newLocation = {
            latitude: coordinates[1],
            longitude: coordinates[0],
        };
        setSelectedLocation(newLocation);
    };

    const handleMarkerDragEnd = (event: any) => {
        const { coordinates } = event.geometry;
        const newLocation = {
            latitude: coordinates[1],
            longitude: coordinates[0],
        };
        setSelectedLocation(newLocation);
    };

    const handleConfirmLocation = () => {
        if (selectedLocation) {
            onSelectLocation(selectedLocation);
            onClose();
        }
    };

    const handleUseCurrentLocation = () => {
        if (location) {
            const userLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
            setSelectedLocation(userLocation);
        } else if (errorMsg) {
            Alert.alert('Error', 'No se pudo obtener la ubicación actual');
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 items-center justify-end bg-black/50">
                <View className="h-[80%] w-full overflow-hidden rounded-t-xl bg-white">
                    <View className="flex-row items-center justify-between bg-primary p-4">
                        <Text className="text-lg font-bold text-white">{title}</Text>
                        <View className="flex-row gap-2">
                            {location && (
                                <Pressable
                                    onPress={handleUseCurrentLocation}
                                    className="rounded bg-blue-600 px-2 py-1">
                                    <Text className="text-xs text-white">Mi ubicación</Text>
                                </Pressable>
                            )}
                            <Pressable onPress={onClose} className="p-2">
                                <Text className="text-xl text-white">✕</Text>
                            </Pressable>
                        </View>
                    </View>
                    {errorMsg && (
                        <View className="bg-red-100 p-2">
                            <Text className="text-center text-red-600">{errorMsg}</Text>
                        </View>
                    )}

                    {/* Instrucciones */}
                    <View className="bg-blue-50 p-2">
                        <Text className="text-center text-sm text-blue-700">
                            Toca en el mapa para colocar el marcador o arrastra el marcador para
                            moverlo
                        </Text>
                    </View>

                    <MapView
                        mapStyle={MAP_CONFIG.STYLE_URL}
                        style={{ flex: 1 }}
                        onPress={handleMapPress}
                        onDidFinishLoadingMap={() => setIsMapReady(true)}>
                        <UserLocation visible={true} />

                        {cameraCenter && (
                            <Camera
                                centerCoordinate={cameraCenter}
                                zoomLevel={15}
                                animationDuration={1000}
                            />
                        )}

                        {selectedLocation && isMapReady && (
                            <PointAnnotation
                                id="draggable-marker"
                                coordinate={[selectedLocation.longitude, selectedLocation.latitude]}
                                draggable={true}
                                onDragEnd={handleMarkerDragEnd}>
                                <View className="h-10 w-10 items-center justify-center rounded-full bg-red-500 shadow-lg">
                                    <View className="h-4 w-4 rounded-full bg-white" />
                                </View>
                            </PointAnnotation>
                        )}
                    </MapView>

                    {selectedLocation && (
                        <View className="bg-gray-100 p-3">
                            <Text className="text-center text-sm font-medium text-gray-800">
                                Ubicación seleccionada:
                            </Text>
                            <Text className="text-center text-xs text-gray-600">
                                Lat: {selectedLocation.latitude.toFixed(6)}, Lng:{' '}
                                {selectedLocation.longitude.toFixed(6)}
                            </Text>
                        </View>
                    )}

                    <View className="flex-row gap-3 p-4">
                        <Pressable
                            onPress={onClose}
                            className="flex-1 items-center rounded-lg bg-gray-300 p-3">
                            <Text className="font-medium text-gray-700">Cancelar</Text>
                        </Pressable>

                        <Pressable
                            onPress={handleConfirmLocation}
                            disabled={!selectedLocation}
                            className={`flex-1 items-center rounded-lg p-3 ${
                                selectedLocation ? 'bg-primary' : 'bg-gray-400'
                            }`}>
                            <Text className="font-medium text-white">Confirmar Ubicación</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Modal de permisos GPS */}
            <GPSPermissionModal
                visible={showPermissionModal}
                onAccept={handleAcceptPermission}
                onCancel={handleCancelPermission}
            />
        </Modal>
    );
};

export default ModalMap;

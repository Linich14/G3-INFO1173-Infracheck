import { View, Text, Pressable, Modal, Dimensions } from 'react-native';
import { useState } from 'react';
import { MapView, Camera, UserLocation } from '@maplibre/maplibre-react-native';
import { MAP_CONFIG } from '~/constants/config';

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
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(
        initialLocation || null
    );

    const handleMapPress = () => {
        // Simulando selección de ubicación para prueba
        const mockLocation = {
            latitude: -12.0464,
            longitude: -77.0428,
        };
        setSelectedLocation(mockLocation);
    };

    const handleConfirmLocation = () => {
        if (selectedLocation) {
            onSelectLocation(selectedLocation);
            onClose();
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 items-center justify-end bg-black/50">
                <View className="h-[80%] w-full overflow-hidden rounded-t-xl bg-white">
                    {/* Header */}
                    <View className="flex-row items-center justify-between bg-primary p-4">
                        <Text className="text-lg font-bold text-white">{title}</Text>
                        <Pressable onPress={onClose} className="p-2">
                            <Text className="text-xl text-white">✕</Text>
                        </Pressable>
                    </View>

                    <MapView
                        mapStyle={MAP_CONFIG.STYLE_URL}
                        style={{ flex: 1 }}
                        onPress={handleMapPress}></MapView>

                    {/* Footer con botones */}
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
                            <Text className="font-medium text-white">Confirmar</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ModalMap;

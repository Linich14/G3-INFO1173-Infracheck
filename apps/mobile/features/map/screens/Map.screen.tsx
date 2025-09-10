import { useState } from 'react';
import { Pressable, View } from 'react-native';
import {
    MapView,
    Camera,
    UserLocation,
    PointAnnotation,
    Callout,
} from '@maplibre/maplibre-react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useUserLocation } from '~/utils/userLocation';
import { MAP_CONFIG } from '~/constants/config';
import { localizacion, PinDetails } from '../types';
import PinDetailsModal from '../components/PinDetailsModal';

export default function MapScreen() {
    const [location, setLocation] = useState<localizacion>({
        latitud: -38.7399,
        longitud: -72.5901, // Temuco por defecto
        direccion: '',
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [pinDetails, setPinDetails] = useState<PinDetails | null>(null);
    const [cargando, setCargando] = useState(false);

    const { getUserLocation } = useUserLocation();
    const router = useRouter();

    const centerOnUserLocation = async () => {
        try {
            const userLocation = await getUserLocation();
            if (userLocation) {
                setLocation({
                    latitud: userLocation.coords.latitude,
                    longitud: userLocation.coords.longitude,
                    direccion: '',
                });
                console.log('Ubicación del usuario centrada:', userLocation);
            }
        } catch (error) {
            console.error('Error al obtener la ubicación del usuario:', error);
        }
    };

    // Función para manejar la selección del pin
    const handlePinSelected = async () => {
        setCargando(true);
        setModalVisible(true);

        try {
            const detalles: PinDetails = {
                titulo: 'Vehículo en zona restringida',
                imagenes: ['https://picsum.photos/400/400'],
            };

            // simulacion de periodo de carga
            await new Promise((resolve) => setTimeout(resolve, 2000));

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
    };

    return (
        <View className="relative flex-1">
            <MapView style={{ flex: 1 }} mapStyle={MAP_CONFIG.STYLE_URL}>
                <Camera zoomLevel={13} centerCoordinate={[location.longitud, location.latitud]} />
                <UserLocation />

                <PointAnnotation
                    onSelected={handlePinSelected}
                    id="poi-car"
                    coordinate={[-72.591, -38.74]}>
                    <View
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: 'rgba(255,255,255,0.8)',
                        }}>
                        <MaterialCommunityIcons name="car" size={30} color="#007AFF" />
                    </View>
                    <Callout title="Vehículo" />
                </PointAnnotation>
            </MapView>

            <View className="absolute bottom-0 right-0 flex-col items-center gap-3 px-4 py-7">
                <Pressable
                    className="aspect-square flex-1 rounded-full bg-primary p-2"
                    onPress={centerOnUserLocation}>
                    <MaterialCommunityIcons name="crosshairs-gps" size={40} color="#FFFFFF" />
                </Pressable>
                <Pressable
                    onPress={() => router.push('/(tabs)/(map)/create_report')}
                    className="aspect-square rounded-xl bg-primary p-2 ">
                    <MaterialCommunityIcons name="plus" size={40} color="#FFFFFF" />
                </Pressable>
            </View>

            <PinDetailsModal
                cargando={cargando}
                pinDetails={pinDetails}
                visible={modalVisible}
                onClose={closeModal}
            />
        </View>
    );
}

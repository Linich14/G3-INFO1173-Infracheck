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

type Location = {
    latitude: number;
    longitude: number;
};

export default function MapScreen() {
    const key = process.env.EXPO_PUBLIC_MAPTILER_API_KEY;
    const STYLE_URL = `https://api.maptiler.com/maps/basic-v2/style.json?key=${key}`;
    const [location, setLocation] = useState<Location>({
        latitude: -38.7399,
        longitude: -72.5901, // Temuco por defecto
    });
    const { getUserLocation } = useUserLocation(); // Asumiendo que este hook tiene un método para obtener la ubicación del usuario
    const router = useRouter();

    const centerOnUserLocation = async () => {
        try {
            const userLocation = await getUserLocation();
            if (userLocation) {
                setLocation({
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                });
                console.log('Ubicación del usuario centrada:', userLocation);
            }
        } catch (error) {
            console.error('Error al obtener la ubicación del usuario:', error);
        }
    };

    return (
        <View className="relative flex-1">
            <MapView style={{ flex: 1 }} mapStyle={STYLE_URL}>
                <Camera zoomLevel={13} centerCoordinate={[location.longitude, location.latitude]} />
                <UserLocation />

                {/* Un marcador simple con vista personalizada */}
                <PointAnnotation id="poi-car" coordinate={[-72.591, -38.74]}>
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
        </View>
    );
}

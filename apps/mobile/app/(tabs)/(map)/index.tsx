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

export default function MapPage() {
    const key = process.env.EXPO_PUBLIC_MAPTILER_API_KEY;
    const STYLE_URL = `https://api.maptiler.com/maps/basic-v2/style.json?key=${key}`;
    const temuco = [-72.5901, -38.7399]; // [lng, lat]
    const router = useRouter();

    return (
        <View className="relative flex-1">
            <MapView style={{ flex: 1 }} mapStyle={STYLE_URL}>
                <Camera zoomLevel={13} centerCoordinate={temuco} />
                <UserLocation />

                {/* Un marcador simple con vista personalizada */}
                <PointAnnotation
                    id="poi-temuco"
                    coordinate={temuco}
                    draggable
                    onSelected={() => console.log('Marcador seleccionado')}
                    onDeselected={() => console.log('Marcador deseleccionado')}
                    onDragEnd={(e) => {
                        const coords = e?.geometry?.coordinates || e?.coordinates;
                        console.log('Nueva posición:', coords); // [lng, lat]
                    }}>
                    <View
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            borderWidth: 2,
                            borderColor: '#fff',
                            backgroundColor: '#007AFF',
                        }}
                    />
                    <Callout title="Hola desde Temuco" />
                </PointAnnotation>

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
            <Pressable
                onPress={() => router.push('/(tabs)/(map)/create_report')}
                className="absolute bottom-0 right-0 m-2 aspect-square w-3/12 rounded-full bg-[#537CF2]">
                <MaterialCommunityIcons name="plus" size={50} className="m-auto text-white" />
            </Pressable>
        </View>
    );
}

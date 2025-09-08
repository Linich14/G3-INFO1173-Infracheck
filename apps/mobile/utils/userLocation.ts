import * as Location from 'expo-location';
import { useState, useEffect } from 'react';

export function useUserLocation() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            // Rastrear continuamente la ubicación
            const subscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
                (loc) => setLocation(loc)
            );

            return () => subscription.remove(); // Limpieza al desmontar
        })();
    }, []);

    const getUserLocation = async () => {
        try {
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            return loc;
        } catch (error) {
            console.error('Error al obtener la ubicación del usuario:', error);
            throw error;
        }
    };

    return { location, errorMsg, getUserLocation };
}

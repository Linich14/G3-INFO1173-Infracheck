import * as Location from 'expo-location';
import { useState, useEffect } from 'react';

export function useUserLocation() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [permissionAsked, setPermissionAsked] = useState(false);

    const requestLocationPermission = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permiso de ubicación denegado');
            return false;
        }

        // Rastrear continuamente la ubicación
        const subscription = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
            (loc) => setLocation(loc)
        );

        return subscription;
    };

    useEffect(() => {
        (async () => {
            // Verificar si ya se pidió permiso antes
            const { status } = await Location.getForegroundPermissionsAsync();
            
            if (status === 'granted') {
                // Ya tiene permiso, iniciar seguimiento
                const subscription = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
                    (loc) => setLocation(loc)
                );
                return () => subscription.remove();
            } else if (!permissionAsked) {
                // Mostrar modal solo si no se ha pedido antes
                setShowPermissionModal(true);
            }
        })();
    }, [permissionAsked]);

    const getUserLocation = async () => {
        try {
            // Verificar si tiene permiso
            const { status } = await Location.getForegroundPermissionsAsync();
            
            if (status !== 'granted') {
                setShowPermissionModal(true);
                return null;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            return loc;
        } catch (error) {
            console.error('Error al obtener la ubicación del usuario:', error);
            throw error;
        }
    };

    const handleAcceptPermission = async () => {
        setShowPermissionModal(false);
        setPermissionAsked(true);
        await requestLocationPermission();
    };

    const handleCancelPermission = () => {
        setShowPermissionModal(false);
        setPermissionAsked(true);
        setErrorMsg('Permiso de ubicación denegado por el usuario');
    };

    return { 
        location, 
        errorMsg, 
        getUserLocation, 
        showPermissionModal,
        handleAcceptPermission,
        handleCancelPermission
    };
}

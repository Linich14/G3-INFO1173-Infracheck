import * as Location from 'expo-location';
import { useState, useEffect } from 'react';

// Hook helper para obtener el traductor (necesitará ser usado desde un componente React)
export function useUserLocation() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [permissionAsked, setPermissionAsked] = useState(false);

    const requestLocationPermission = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            // Mensaje genérico en inglés, será traducido donde se use
            setErrorMsg('location_permission_denied');
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
        // Mensaje genérico en inglés, será traducido donde se use
        setErrorMsg('location_permission_denied_by_user');
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

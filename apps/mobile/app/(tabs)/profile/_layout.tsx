import { Stack } from 'expo-router';

export default function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // Ocultar el header por defecto ya que usas headers personalizados
                animation: 'slide_from_right', // Animación de navegación
            }}>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Perfil',
                }}
            />
            <Stack.Screen
                name="my-reports"
                options={{
                    title: 'Mis Reportes',
                }}
            />
        </Stack>
    );
}

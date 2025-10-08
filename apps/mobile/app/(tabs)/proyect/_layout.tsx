import { Stack } from 'expo-router';

export default function ProyectsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Proyectos' }} />
      <Stack.Screen name="create" options={{ title: 'Crear Proyecto' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalles del Proyecto' }} />
      <Stack.Screen name="reports" options={{ title: 'Reportes' }} />
      <Stack.Screen name="statistics" options={{ title: 'Estadísticas' }} />
    </Stack>
  );
}

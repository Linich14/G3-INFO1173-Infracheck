import { Stack, useLocalSearchParams } from 'expo-router';
import PublicProfileScreen from '~/features/profile/screens/PublicProfileScreen';

export default function PublicUserProfile() {
  const { id, nickname } = useLocalSearchParams<{ id: string; nickname?: string }>();

  if (!id) {
    return null;
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: nickname ? `Perfil de ${nickname}` : 'Perfil de Usuario',
          headerShown: true,
        }} 
      />
      <PublicProfileScreen userId={id} nickname={nickname} />
    </>
  );
}

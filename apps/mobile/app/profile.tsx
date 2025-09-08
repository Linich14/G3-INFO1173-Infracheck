import { Stack } from 'expo-router';
import ProfileScreen from '../features/profile/screens/ProfileScreen';

export default function Profile() {
  return (
    <>
      <Stack.Screen options={{ title: 'Perfil' }} />
      <ProfileScreen />
    </>
  );
}

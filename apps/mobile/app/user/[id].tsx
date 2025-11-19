import { Stack, useLocalSearchParams } from 'expo-router';
import PublicProfileScreen from '~/features/profile/screens/PublicProfileScreen';
import { useLanguage } from '~/contexts/LanguageContext';

export default function PublicUserProfile() {
  const { id, nickname } = useLocalSearchParams<{ id: string; nickname?: string }>();
  const { t } = useLanguage();

  if (!id) {
    return null;
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: nickname ? `${t('userProfileOf')} ${nickname}` : t('userProfileTitle'),
          headerShown: true,
        }} 
      />
      <PublicProfileScreen userId={id} nickname={nickname} />
    </>
  );
}

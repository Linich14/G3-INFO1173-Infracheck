import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import WelcomeScreen from '~/features/auth/screens/WelcomeScreen';

export default function Index() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <WelcomeScreen />;
}

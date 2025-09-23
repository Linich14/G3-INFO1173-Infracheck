import React, { useRef, useState } from 'react';
import { TouchableWithoutFeedback, Animated, Easing, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '~/contexts/AuthContext';
import AdminHeader from '~/features/home/components/AdminHeader';
import AdminContent from '~/features/home/components/AdminContent';
import AdminDrawerMenu from '~/features/home/components/AdminDrawerMenu';

export default function AdminHomeScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const [open, setOpen] = useState(false);
  const drawerX = useRef(new Animated.Value(-Dimensions.get('window').width * 0.75)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const DRAWER_W = Math.min(320, Dimensions.get('window').width * 0.75);

  const openMenu = () => {
    setOpen(true);
    Animated.parallel([
      Animated.timing(drawerX, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.45,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(drawerX, {
        toValue: -DRAWER_W,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setOpen(false);
    });
  };

  const handleLogout = async () => {
    closeMenu();
    await logout();
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#090A0D' }}>
      <AdminHeader onMenuPress={openMenu} />
      
      <AdminContent />

      {open && (
        <>
          <TouchableWithoutFeedback onPress={closeMenu}>
            <Animated.View
              pointerEvents={open ? 'auto' : 'none'}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundColor: '#000',
                opacity: backdropOpacity,
              }}
            />
          </TouchableWithoutFeedback>

          <AdminDrawerMenu 
            drawerX={drawerX}
            DRAWER_W={DRAWER_W}
            insets={insets}
            onClose={closeMenu}
            onLogout={handleLogout}
          />
        </>
      )}
    </SafeAreaView>
  );
}
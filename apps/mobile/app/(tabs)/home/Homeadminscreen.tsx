import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Easing, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AlignJustify, UserCircle2, Search, LogOut, Home, Settings, Map, Shield, Users, Database, Activity, Users2, BarChart3 } from 'lucide-react-native';

const MENU_BG = '#0f172a';
const HEADER_BG = '#13161E';
const ACCENT = '#537CF2';

export default function AdminHomeScreen() {
  const insets = useSafeAreaInsets();

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

  const handleLogout = () => {
    closeMenu();
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#090A0D' }}>
      {/* Header */}
      <View className="bg-[#13161E] flex-row justify-between p-4">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={openMenu}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Abrir menú"
            activeOpacity={0.6}
          >
            <AlignJustify size={26} color="white" />
          </TouchableOpacity>

          <Text className="text-[#537CF2] font-bold text-2xl">Panel - Admin</Text>
        </View>

        <View className="flex-row items-center gap-6">

          <TouchableOpacity
            onPress={() => router.push('/profile')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Perfil"
            activeOpacity={0.6}
          >
            <UserCircle2 size={26} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido de Admin */}
      <ScrollView
        className="px-4 mt-4"
        contentContainerStyle={{
          gap: 16,
          paddingBottom: insets.bottom + 12,
        }}
      >
        {/* Métricas del Sistema */}
        <View className="bg-[#13161E] rounded-[12px] p-4">
          <Text className="text-white text-xl font-bold mb-4">Estado del Sistema</Text>
          
          <View className="flex-row justify-between mb-4">
            <View className="items-center">
              <Users2 size={32} color="#4ECDC4" />
              <Text className="text-white text-lg font-bold mt-2">1,247</Text>
              <Text className="text-gray-400">Usuarios</Text>
            </View>
            
            <View className="items-center">
              <Database size={32} color="#45B7D1" />
              <Text className="text-white text-lg font-bold mt-2">5,632</Text>
              <Text className="text-gray-400">Reportes</Text>
            </View>
            
            <View className="items-center">
              <Activity size={32} color="#96CEB4" />
              <Text className="text-white text-lg font-bold mt-2">98.5%</Text>
              <Text className="text-gray-400">Uptime</Text>
            </View>
          </View>
        </View>

        {/* Gestión de Usuarios */}
        <View className="bg-[#13161E] rounded-[12px] p-4">
          <Text className="text-white text-xl font-bold mb-4">Gestión de Usuarios</Text>
          
          <View className="bg-[#1D212D] rounded-lg p-3 mb-3">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white font-bold">Nuevos Registros Hoy</Text>
                <Text className="text-gray-400">23 usuarios nuevos</Text>
              </View>
              <View className="bg-green-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs">+15%</Text>
              </View>
            </View>
          </View>

          <View className="bg-[#1D212D] rounded-lg p-3 mb-3">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white font-bold">Usuarios Activos</Text>
                <Text className="text-gray-400">892 en las últimas 24h</Text>
              </View>
              <View className="bg-blue-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs">Estable</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Panel de Control */}
        <View className="bg-[#13161E] rounded-[12px] p-4">
          <Text className="text-white text-xl font-bold mb-4">Panel de Control</Text>
          
          <View className="flex-row flex-wrap gap-3 justify-center">
            <TouchableOpacity 
              onPress={() => console.log('Gestionar usuarios')}
              className="bg-[#537CF2] rounded-lg p-4 items-center justify-center"
              style={{ width: '47%', height: 120 }}
            >
              <Users2 size={24} color="white" />
              <Text className="text-white mt-2 text-center">Gestionar Usuarios</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => console.log('Base de datos')}
              className="bg-[#537CF2] rounded-lg p-4 items-center justify-center"
              style={{ width: '47%', height: 120 }}
            >
              <Database size={24} color="white" />
              <Text className="text-white mt-2 text-center">Base de Datos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => console.log('Analytics')}
              className="bg-[#537CF2] rounded-lg p-4 items-center justify-center"
              style={{ width: '47%', height: 120 }}
            >
              <BarChart3 size={24} color="white" />
              <Text className="text-white mt-2 text-center">Analytics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => console.log('Configuración')}
              className="bg-[#537CF2] rounded-lg p-4 items-center justify-center"
              style={{ width: '47%', height: 120 }}
            >
              <Settings size={24} color="white" />
              <Text className="text-white mt-2 text-center">Configuración</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ===== Drawer / Canvas ===== */}
      {open && (
        <>
          {/* Backdrop */}
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

          {/* Panel */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: DRAWER_W,
              backgroundColor: MENU_BG,
              paddingTop: insets.top + 12,
              paddingHorizontal: 16,
              transform: [{ translateX: drawerX }],
              borderRightWidth: 1,
              borderRightColor: '#1f2937',
            }}
          >
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: ACCENT, fontSize: 20, fontWeight: '700' }}>Menú Admin</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                closeMenu();
                router.replace('/(tabs)/home');
              }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 }}
              activeOpacity={0.7}
            >
              <Home size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16 }}>Inicio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                closeMenu();
                router.push('/(tabs)/(map)');
              }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 }}
              activeOpacity={0.7}
            >
              <Map size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16 }}>Mapa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                closeMenu();
                router.push('/(tabs)/settings');
              }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 }}
              activeOpacity={0.7}
            >
              <Settings size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16 }}>Ajustes</Text>
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: '#1f2937', marginVertical: 12 }} />

            <TouchableOpacity
              onPress={() => {
                closeMenu();
                router.push('/(tabs)/home/Homeclientescreen');
              }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 }}
              activeOpacity={0.7}
            >
              <UserCircle2 size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16 }}>Home Cliente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                closeMenu();
                router.push('/(tabs)/home/Homeauthoscreen');
              }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 }}
              activeOpacity={0.7}
            >
              <Shield size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16 }}>Home Autoridad</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                closeMenu();
                router.push('/(tabs)/home/Homeadminscreen');
              }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 }}
              activeOpacity={0.7}
            >
              <Users size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16 }}>Home Admin</Text>
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: '#1f2937', marginVertical: 12 }} />

            <TouchableOpacity
              onPress={handleLogout}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                gap: 10,
              }}
              activeOpacity={0.7}
            >
              <LogOut size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16 }}>Cerrar sesión</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}
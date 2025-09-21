import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Easing, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AlignJustify, UserCircle2, Search, LogOut, Home, Settings, Map, Shield, Users, BarChart3, FileText, AlertTriangle, FolderOpen, Plus } from 'lucide-react-native';

const MENU_BG = '#0f172a';
const HEADER_BG = '#13161E';
const ACCENT = '#537CF2';

export default function AuthorityHomeScreen() {
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

          <Text className="text-[#537CF2] font-bold text-2xl">Panel Autoridad</Text>
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

      {/* Contenido de Autoridad */}
      <ScrollView
        className="px-4 mt-4"
        contentContainerStyle={{
          gap: 16,
          paddingBottom: insets.bottom + 12,
        }}
      >
        {/* Estadísticas Rápidas */}
        <View className="bg-[#13161E] rounded-[12px] p-4">
          <Text className="text-white text-xl font-bold mb-4">Reportes del Día</Text>
          
          <View className="flex-row justify-between mb-4">
            <View className="items-center">
              <AlertTriangle size={32} color="#FF6B6B" />
              <Text className="text-white text-lg font-bold mt-2">12</Text>
              <Text className="text-gray-400">Urgentes</Text>
            </View>
            
            <View className="items-center">
              <FileText size={32} color="#4ECDC4" />
              <Text className="text-white text-lg font-bold mt-2">45</Text>
              <Text className="text-gray-400">Pendientes</Text>
            </View>
            
            <View className="items-center">
              <BarChart3 size={32} color="#45B7D1" />
              <Text className="text-white text-lg font-bold mt-2">23</Text>
              <Text className="text-gray-400">Resueltos</Text>
            </View>
          </View>
        </View>

        {/* Reportes Críticos */}
        <View className="bg-[#13161E] rounded-[12px] p-4">
          <Text className="text-white text-xl font-bold mb-4">Reportes Críticos</Text>
          
          <View className="bg-[#1D212D] rounded-lg p-3 mb-3">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white font-bold">Semáforo Principal Caído</Text>
                <Text className="text-gray-400">Av. Alemania con Prat</Text>
                <Text className="text-red-400 text-sm">Hace 15 min</Text>
              </View>
              <View className="bg-red-500 w-3 h-3 rounded-full" />
            </View>
          </View>

          <View className="bg-[#1D212D] rounded-lg p-3 mb-3">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white font-bold">Fuga de Agua Mayor</Text>
                <Text className="text-gray-400">Calle Bulnes 123</Text>
                <Text className="text-orange-400 text-sm">Hace 1 hora</Text>
              </View>
              <View className="bg-orange-500 w-3 h-3 rounded-full" />
            </View>
          </View>
        </View>

        {/* Acciones Rápidas */}
        <View className="bg-[#13161E] rounded-[12px] p-4">
          <Text className="text-white text-xl font-bold mb-4">Acciones Rápidas</Text>
          
          <View className="flex-row flex-wrap gap-3 justify-center">
            <TouchableOpacity 
              onPress={() => console.log('Lista proyectos')}
              className="bg-[#537CF2] rounded-lg p-4 items-center justify-center"
              style={{ width: '47%', height: 120 }}
            >
              <FolderOpen size={24} color="white" />
              <Text className="text-white text-sm mt-2 text-center">Lista Proyectos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => console.log('Crear proyecto')}
              className="bg-[#537CF2] rounded-lg p-4 items-center justify-center"
              style={{ width: '47%', height: 120 }}
            >
              <Plus size={24} color="white" />
              <Text className="text-white text-sm mt-2 text-center">Crear Proyecto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => console.log('Lista reportes')}
              className="bg-[#537CF2] rounded-lg p-4 items-center justify-center"
              style={{ width: '47%', height: 120 }}
            >
              <FileText size={24} color="white" />
              <Text className="text-white text-sm mt-2 text-center">Lista Reportes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => console.log('Ver estadísticas')}
              className="bg-[#537CF2] rounded-lg p-4 items-center justify-center"
              style={{ width: '47%', height: 120 }}
            >
              <BarChart3 size={24} color="white" />
              <Text className="text-white text-sm mt-2 text-center">Ver Estadísticas</Text>
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
              <Text style={{ color: ACCENT, fontSize: 20, fontWeight: '700' }}>Menú Autoridad</Text>
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
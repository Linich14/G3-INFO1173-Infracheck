import React from 'react';
import { View, Text, ScrollView, TouchableOpacity} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ReportCard from '~/components/ReportCard';
import {
  AlignJustify,
  UserCircle2,
  Search,
} from 'lucide-react-native';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#090A0D' }}>
  {/* Header */}
  <View className="bg-[#13161E] flex-row justify-between p-4">
    <View className="flex-row items-center gap-4">
      <TouchableOpacity
        onPress={() => console.log('Menú')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Abrir menú"
        activeOpacity={0.6}
      >
        <AlignJustify size={26} color="white" />
      </TouchableOpacity>

      <Text className="text-[#537CF2] font-bold text-2xl">Reportes</Text>
    </View>

    <View className="flex-row items-center gap-6">
      <TouchableOpacity
        onPress={() => console.log('Buscar')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Buscar"
        activeOpacity={0.6}
      >
        <Search size={26} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => console.log('Perfil')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Perfil"
        activeOpacity={0.6}
      >
        <UserCircle2 size={26} color="white" />
      </TouchableOpacity>
    </View>
  </View>

      {/* Lista de reportes */}
      <ScrollView
        className="px-4 mt-4"
        // damos aire SOLO al contenido, para que no lo tape la tab bar
        contentContainerStyle={{
          gap: 16,
          paddingBottom: insets.bottom + 12, // 👈 en vez del safe area del contenedor
        }}
      >
        <ReportCard
          title="Calle en mal estado"
          author="ChristianV"
          timeAgo="3d"
          image={require('@assets/Publicaciones/1.png')}
          upvotes={254}
          onFollow={() => console.log('Seguir')}
          onMore={() => console.log('Más opciones')}
          onLocation={() => console.log('Ubicación')}
          onUpvote={() => console.log('Upvote')}
          onComment={() => console.log('Comentar')}
          onShare={() => console.log('Compartir')}
        />

        <ReportCard
          title="Semáforo apagado"
          author="María"
          timeAgo="5h"
          image={{ uri: 'https://picsum.photos/seed/semaforo/800/500' }}
          upvotes={91}
          onFollow={() => {}}
          onMore={() => {}}
          onLocation={() => {}}
          onUpvote={() => {}}
          onComment={() => {}}
          onShare={() => {}}
          aspectRatio={4 / 3}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
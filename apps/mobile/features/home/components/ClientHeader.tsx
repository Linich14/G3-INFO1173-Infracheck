import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AlignJustify, Search, UserCircle2 } from "lucide-react-native";
import { router } from "expo-router";

interface ClientHeaderProps {
  onMenuPress: () => void;
  onSearchPress: () => void;
}

export default function ClientHeader({ onMenuPress, onSearchPress }: ClientHeaderProps) {
  return (
    <View className="flex-row justify-between bg-[#13161E] p-4">
      <View className="flex-row items-center gap-4">
        <TouchableOpacity 
          onPress={onMenuPress} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Abrir menú"
          activeOpacity={0.6}
        >
          <AlignJustify size={26} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-[#537CF2]">Reportes</Text>
      </View>
      
      <View className="flex-row items-center gap-6">
        <TouchableOpacity 
          onPress={onSearchPress} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Buscar"
          activeOpacity={0.6}
        >
          <Search size={26} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push("/profile")} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Perfil"
          activeOpacity={0.6}
        >
          <UserCircle2 size={26} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
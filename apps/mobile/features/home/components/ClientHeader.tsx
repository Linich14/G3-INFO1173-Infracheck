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
    <View className="flex-row items-center justify-between bg-[#13161E] p-4 relative">
      {/* Botón del menú - lado izquierdo */}
      <TouchableOpacity 
        onPress={onMenuPress} 
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Abrir menú"
        activeOpacity={0.6}
      >
        <AlignJustify size={26} color="white" />
      </TouchableOpacity>
      
      {/* Título centrado */}
      <View className="absolute left-0 right-0 items-center">
        <Text className="text-2xl font-bold text-[#537CF2]">InfraCheck</Text>
      </View>
      
      {/* Botón de búsqueda - lado derecho */}
      <TouchableOpacity 
        onPress={onSearchPress} 
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Buscar"
        activeOpacity={0.6}
      >
        <Search size={26} color="white" />
      </TouchableOpacity>
    </View>
  );
}
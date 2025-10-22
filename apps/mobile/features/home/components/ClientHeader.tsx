import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AlignJustify, Search, UserCircle2 } from "lucide-react-native";
import { router } from "expo-router";
import { NotificationBell } from "~/components/NotificationBell";

interface ClientHeaderProps {
  onMenuPress: () => void;
  onSearchPress: () => void;
}

export default function ClientHeader({ onMenuPress, onSearchPress }: ClientHeaderProps) {
  return (
    <View className="flex-row items-center justify-between bg-[#13161E] p-4 relative">
      <TouchableOpacity 
        onPress={onMenuPress} 
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Abrir menú"
        activeOpacity={0.6}
      >
        <AlignJustify size={26} color="white" />
      </TouchableOpacity>
      
      <View className="absolute left-0 right-0 items-center">
        <Text className="text-2xl font-bold text-[#537CF2]">InfraCheck</Text>
      </View>
      
      <View className="flex-row items-center gap-4">
        <NotificationBell />
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
    </View>
  );
}
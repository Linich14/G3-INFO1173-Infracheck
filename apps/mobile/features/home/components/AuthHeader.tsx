import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AlignJustify, UserCircle2 } from "lucide-react-native";
import { router } from "expo-router";

interface AuthHeaderProps {
  onMenuPress: () => void;
  title?: string;
}

export default function AuthHeader({ onMenuPress, title = "Panel Autoridad" }: AuthHeaderProps) {
  return (
    <View className="bg-[#13161E] flex-row justify-between p-4">
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

        <Text className="text-[#537CF2] font-bold text-2xl">{title}</Text>
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
  );
}
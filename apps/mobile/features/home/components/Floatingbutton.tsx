import React from "react";
import { View, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function FloatingButton({ onPress }: { onPress: () => void }) {
  return (
    <View className="absolute bottom-0 right-0 flex-col items-center gap-3 px-4 py-7">
      <TouchableOpacity onPress={onPress} className="rounded-full bg-primary p-4">
        <MaterialCommunityIcons name="plus" size={40} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

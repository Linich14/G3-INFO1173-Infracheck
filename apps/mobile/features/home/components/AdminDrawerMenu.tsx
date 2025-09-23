import React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Home, Map, Settings, UserCircle2, Shield, Users, LogOut } from "lucide-react-native";
import { router } from "expo-router";

const MENU_BG = "#0f172a";
const ACCENT = "#537CF2";

interface AdminDrawerMenuProps {
  drawerX: any;
  DRAWER_W: number;
  insets: any;
  onClose: () => void;
  onLogout: () => void;
}

export default function AdminDrawerMenu({ drawerX, DRAWER_W, insets, onClose, onLogout }: AdminDrawerMenuProps) {
  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        width: DRAWER_W,
        backgroundColor: MENU_BG,
        paddingTop: insets.top + 12,
        paddingHorizontal: 16,
        transform: [{ translateX: drawerX }],
        borderRightWidth: 1,
        borderRightColor: "#1f2937",
      }}
    >
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: ACCENT, fontSize: 20, fontWeight: "700" }}>Menú Admin</Text>
      </View>

      <TouchableOpacity onPress={() => { onClose(); router.replace("/(tabs)/home"); }} style={styles.item}>
        <Home size={20} color="#fff" />
        <Text style={styles.text}>Inicio</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { onClose(); router.push("/(tabs)/(map)"); }} style={styles.item}>
        <Map size={20} color="#fff" />
        <Text style={styles.text}>Mapa</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { onClose(); router.push("/(tabs)/settings"); }} style={styles.item}>
        <Settings size={20} color="#fff" />
        <Text style={styles.text}>Ajustes</Text>
      </TouchableOpacity>

      <View style={styles.separator} />

      <TouchableOpacity onPress={onLogout} style={styles.item}>
        <LogOut size={20} color="#fff" />
        <Text style={styles.text}>Cerrar sesión</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = {
  item: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 12,
    gap: 10,
  },
  text: { color: "#fff", fontSize: 16 },
  separator: { height: 1, backgroundColor: "#1f2937", marginVertical: 12 },
};
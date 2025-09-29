import React from "react";
import { View, Text, TouchableOpacity, Animated, Image, ActivityIndicator } from "react-native";
import { Home, Map, Settings, LogOut, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { useUser } from "~/features/profile/hooks/useUser";

const MENU_BG = "#0f172a";
const ACCENT = "#537CF2";

interface ClientDrawerMenuProps {
  drawerX: Animated.Value;
  DRAWER_W: number;
  insets: any;
  onClose: () => void;
  onLogout: () => void;
}

export default function ClientDrawerMenu({ drawerX, DRAWER_W, insets, onClose, onLogout }: ClientDrawerMenuProps) {
  const { user, loading } = useUser();

  // Función helper para obtener las iniciales
  const getInitials = (fullName: string | null | undefined, nickname?: string) => {
    if (!fullName || fullName === 'null' || fullName.trim() === '') {
      return nickname ? nickname.charAt(0).toUpperCase() : 'U';
    }
    const names = fullName.split(' ').filter(name => name.trim() !== '');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    return names.length > 0 ? names[0].charAt(0).toUpperCase() : 'U';
  };



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
        <Text style={{ color: ACCENT, fontSize: 20, fontWeight: "700" }}>Menú</Text>
      </View>

      {/* Sección de perfil del usuario */}
      <TouchableOpacity 
        onPress={() => { 
          onClose(); 
          router.push('/profile'); 
        }}
        style={{
          alignItems: 'center',
          paddingVertical: 16,
          marginBottom: 8,
          backgroundColor: 'rgba(83, 124, 242, 0.1)',
          borderRadius: 8,
          marginHorizontal: 8,
          position: 'relative'
        }}
      >
        {/* Ícono indicador de que es clickeable */}
        <View style={{
          position: 'absolute',
          top: 8,
          right: 8
        }}>
          <ChevronRight size={16} color="#94a3b8" />
        </View>
        
        {loading ? (
          <ActivityIndicator size="small" color={ACCENT} style={{ marginBottom: 8 }} />
        ) : (
          <>
            {user?.avatar ? (
              <Image 
                source={{ uri: user.avatar }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  marginBottom: 8,
                  borderWidth: 2,
                  borderColor: ACCENT
                }}
              />
            ) : (
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: ACCENT,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 8,
                borderWidth: 2,
                borderColor: ACCENT
              }}>
                <Text style={{
                  color: '#fff',
                  fontSize: 24,
                  fontWeight: 'bold'
                }}>
                  {user ? getInitials(user.full_name, user.usua_nickname) : 'U'}
                </Text>
              </View>
            )}
            
            <Text style={{ 
              color: '#fff', 
              fontSize: 16, 
              fontWeight: '600',
              marginBottom: 4 
            }}>
              {user?.full_name && user.full_name !== 'null' 
                ? user.full_name 
                : user ? `${user.usua_nombre || ''} ${user.usua_apellido || ''}`.trim() || `@${user.usua_nickname}` : 'Usuario'
              }
            </Text>
            
            <Text style={{ 
              color: '#94a3b8', 
              fontSize: 14,
              marginBottom: 4
            }}>
              {user?.usua_email || 'Email no disponible'}
            </Text>
            
            <Text style={{ 
              color: '#94a3b8', 
              fontSize: 12,
              fontStyle: 'italic'
            }}>
              Toca para ver perfil
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.separator} />

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
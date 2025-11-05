import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Edit, UserCheck, UserX } from 'lucide-react-native';
import { User } from '../services/usersService';

// Helper para convertir rol numérico a texto
const getRoleName = (rous_id: number): string => {
  switch (rous_id) {
    case 1: return 'Usuario';
    case 2: return 'Administrador';
    case 3: return 'Municipal';
    default: return 'Desconocido';
  }
};

// Helper para convertir estado numérico a texto
const getStatusName = (usua_estado: number): string => {
  return usua_estado === 1 ? 'Habilitado' : 'Deshabilitado';
};

// Helper para formatear fecha
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL');
};

interface UserCardProps {
  user: User;
  onToggleStatus: (user: User) => void;
}

export default function UserCard({ user, onToggleStatus }: UserCardProps) {
  // Obtener la inicial del nombre
  const getInitial = (nickname: string): string => {
    return nickname ? nickname.charAt(0).toUpperCase() : '?';
  };

  return (
    <View
      style={{
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#334155',
      }}
    >
      {/* Header con avatar, nombre y botones */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Avatar con inicial y borde gradiente */}
        <View style={{ 
          width: 64, 
          height: 64, 
          borderRadius: 32,
          backgroundColor: '#475569',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 3,
          borderColor: '#537CF2',
          marginRight: 12
        }}>
          <Text style={{ color: 'white', fontSize: 26, fontWeight: 'bold' }}>
            {getInitial(user.usua_nickname)}
          </Text>
        </View>

        {/* Nombre e ID */}
        <View style={{ flex: 1 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 2 }}>
            {user.usua_nickname}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>
            ID: {user.usua_id}
          </Text>
        </View>

        {/* Botones de acción en columna */}
        <View style={{ gap: 8 }}>
          <TouchableOpacity
            style={{
              backgroundColor: user.usua_estado === 1 ? '#ef4444' : '#10b981',
              width: 48,
              height: 48,
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => onToggleStatus(user)}
          >
            {user.usua_estado === 1 ? (
              <UserX size={20} color="white" />
            ) : (
              <UserCheck size={20} color="white" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: '#334155',
              width: 48,
              height: 48,
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => console.log('Editar usuario', user.usua_nickname, 'ID:', user.usua_id)}
          >
            <Edit size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Información de contacto */}
      <View style={{ marginTop: -26, marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
          <View style={{ 
            width: 6, 
            height: 6, 
            borderRadius: 3, 
            backgroundColor: '#537CF2', 
            marginRight: 10 
          }} />
          <Text style={{ color: '#e2e8f0', fontSize: 13 }}>
            {user.usua_email}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ 
            width: 6, 
            height: 6, 
            borderRadius: 3, 
            backgroundColor: '#537CF2', 
            marginRight: 10 
          }} />
          <Text style={{ color: '#e2e8f0', fontSize: 13 }}>
            RUT: {user.usua_rut}
          </Text>
        </View>
      </View>

      {/* Badges de rol y estado */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
        <View style={{
          backgroundColor: user.rous_id === 2 ? '#f59e0b' : 
                         user.rous_id === 3 ? '#dc2626' : 
                         '#537CF2',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 7
        }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>
            {getRoleName(user.rous_id)}
          </Text>
        </View>
        
        <View style={{
          backgroundColor: user.usua_estado === 1 ? '#10b981' : '#ef4444',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 7
        }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>
            {getStatusName(user.usua_estado)}
          </Text>
        </View>
      </View>

      {/* Línea separadora */}
      <View style={{ 
        height: 1, 
        backgroundColor: '#334155', 
        marginBottom: 8 
      }} />

      {/* Fecha de registro */}
      <Text style={{ color: '#64748b', fontSize: 11 }}>
        Registro: {formatDate(user.usua_creado)}
      </Text>
    </View>
  );
}
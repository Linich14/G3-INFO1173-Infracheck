import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
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
  return (
    <View
      className='bg-tertiary'
      style={{
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1e293b'
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        {/* Foto del usuario */}
        <View style={{ alignItems: 'center' }}>
          <Image 
            className='rounded-full'
            source={{ uri: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }}
            style={{ width: 56, height: 56 }}
          />
        </View>

        {/* Información del usuario */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
              {user.usua_nickname}
            </Text>
            <Text style={{ color: '#64748b', fontSize: 12 }}>
              (ID: {user.usua_id})
            </Text>
          </View>
          <Text style={{ color: '#94a3b8', fontSize: 14, marginBottom: 4 }}>
            {user.usua_email}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>
            RUT: {user.usua_rut}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <View style={{
              backgroundColor: user.rous_id === 2 ? '#f59e0b' : 
                             user.rous_id === 3 ? '#dc2626' : 
                             '#537CF2',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
                {getRoleName(user.rous_id)}
              </Text>
            </View>
            
            <View style={{
              backgroundColor: user.usua_estado === 1 ? '#10b981' : '#ef4444',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
                {getStatusName(user.usua_estado)}
              </Text>
            </View>
          </View>
          
          <Text style={{ color: '#64748b', fontSize: 12 }}>
            Registro: {formatDate(user.usua_creado)}
          </Text>
        </View>

        {/* Acciones */}
        <View style={{ flexDirection: 'column', gap: 8 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#1e293b',
              padding: 8,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={() => console.log('Editar usuario', user.usua_nickname, 'ID:', user.usua_id)}
          >
            <Edit size={16} color="#94a3b8" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: user.usua_estado === 1 ? '#ef4444' : '#10b981',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 80
            }}
            onPress={() => onToggleStatus(user)}
          >
            <View style={{ alignItems: 'center', gap: 4 }}>
              {user.usua_estado === 1 ? (
                <UserX size={16} color="white" />
              ) : (
                <UserCheck size={16} color="white" />
              )}
              <Text style={{ color: 'white', fontSize: 10, fontWeight: '500' }}>
                {user.usua_estado === 1 ? 'Deshabilitar' : 'Habilitar'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
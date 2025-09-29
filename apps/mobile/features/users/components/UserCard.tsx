import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Edit, Trash2, UserCheck, UserX } from 'lucide-react-native';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
}

interface UserCardProps {
  user: User;
  onDelete: (user: User) => void;
}

export default function UserCard({ user, onDelete }: UserCardProps) {
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
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
            {user.name}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>
            {user.email}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <View style={{
              backgroundColor: user.role === 'Administrador' ? '#f59e0b' : 
                             user.role === 'Autoridad' ? '#dc2626' : 
                             '#537CF2',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
                {user.role}
              </Text>
            </View>
            
            <View style={{
              backgroundColor: user.status === 'Activo' ? '#10b981' : '#ef4444',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
                {user.status}
              </Text>
            </View>
          </View>
          
          <Text style={{ color: '#64748b', fontSize: 12 }}>
            Registro: {user.joinDate}
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
            onPress={() => console.log('Editar usuario', user.id)}
          >
            <Edit size={16} color="#94a3b8" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: user.status === 'Activo' ? '#ef4444' : '#10b981',
              padding: 8,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={() => console.log('Toggle status', user.id)}
          >
            {user.status === 'Activo' ? (
              <UserX size={16} color="white" />
            ) : (
              <UserCheck size={16} color="white" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: '#dc2626',
              padding: 8,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={() => onDelete(user)}
          >
            <Trash2 size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
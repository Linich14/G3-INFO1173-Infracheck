import React from 'react';
import { View, ScrollView, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { UserX } from 'lucide-react-native';
import UserCard from './UserCard';
import { User } from '../services/usersService';

interface UsersListProps {
  users: User[];
  onToggleUserStatus: (user: User) => void;
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function UsersList({ 
  users, 
  onToggleUserStatus, 
  loading = false,
  onRefresh,
  refreshing = false
}: UsersListProps) {
  // Estado de loading durante búsqueda/actualización
  if (loading && users.length === 0) {
    return (
      <View className='px-5 pb-5 py-10 items-center justify-center'>
        <ActivityIndicator size="large" color="#537CF2" />
        <Text className='text-gray-400 mt-4 text-base'>Cargando usuarios...</Text>
      </View>
    );
  }

  // Estado vacío
  if (!loading && users.length === 0) {
    return (
      <ScrollView
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#537CF2"
              colors={["#537CF2"]}
            />
          ) : undefined
        }
      >
        <View className='px-5 pb-5 py-10 items-center justify-center'>
          <UserX size={48} color="#6b7280" />
          <Text className='text-gray-400 mt-4 text-lg font-semibold'>No se encontraron usuarios</Text>
          <Text className='text-gray-500 mt-2 text-sm text-center'>
            No hay usuarios que coincidan con tu búsqueda
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#537CF2"
            colors={["#537CF2"]}
          />
        ) : undefined
      }
    >
      <View className='px-5 pb-5' style={{ gap: 12 }}>
        {users.map((user) => (
          <UserCard 
            key={user.usua_id} 
            user={user} 
            onToggleStatus={onToggleUserStatus}
          />
        ))}
      </View>
    </ScrollView>
  );
}
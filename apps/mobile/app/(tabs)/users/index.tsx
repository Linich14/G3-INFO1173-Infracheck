import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Edit, Trash2, UserCheck, UserX, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";


export default function UsersManagement() {
  const insets = useSafeAreaInsets();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  // Datos de ejemplo
  const users = [
    {
      id: 1,
      name: 'Christian Vera',
      email: 'christian@example.com',
      role: 'Usuario',
      status: 'Activo',
      joinDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'María González',
      email: 'maria@example.com',
      role: 'Administrador',
      status: 'Activo',
      joinDate: '2024-02-20'
    },
    {
      id: 3,
      name: 'Carlos Rodríguez',
      email: 'carlos@example.com',
      role: 'Autoridad',
      status: 'Inactivo',
      joinDate: '2024-03-10'
    },
  ];

  return (
    <View className='flex-1 bg-background' style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className='px-5 pt-5 pb-4'>
        <View className='bg-secondary p-2 rounded-[12px] items-center justify-center py-3'>
          <Text className='text-[#537CF2] font-bold text-3xl'>
            Gestión de Usuarios
          </Text>
        </View>
      </View>

      {/* Contenedor con background #13161E */}
      <View className='bg-[#13161E] rounded-[10px] pt-5 mx-4 mb-4'>
        
        {/* Barra de búsqueda */}
        <View className='px-5 mb-5 flex-row items-center gap-4'>
          <TouchableOpacity 
            className='bg-[#537CF2] rounded-2xl p-4'
            onPress={() => router.push('/home')}
          >
            <ArrowLeft size={24} color='white' />
          </TouchableOpacity>
          
          <View className='flex-1 flex-row items-center bg-gray-300 rounded-full px-4 py-4'>
            <Search size={20} color="#6b7280" />
            <TextInput
              placeholder="Buscar"
              placeholderTextColor="#6b7280"
              className='flex-1 text-gray-800 px-3 text-xl'
            />
          </View>
        </View>

        <ScrollView>
        {/* Lista de usuarios */}
        <View className='px-5 pb-5' style={{ gap: 12 }}>
        {users.map((user) => (
          <View
          className='bg-tertiary'
            key={user.id}
            style={{
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: '#1e293b'
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              {/* Foto del usuario */}
              <View style={{ alignItems: 'center' }} className=''>
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
                  <Edit size={24} color="#94a3b8" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={{
                    backgroundColor: '#dc2626',
                    padding: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onPress={() => {
                    setUserToDelete(user);
                    setShowDeleteModal(true);
                  }}
                >
                  <Trash2 size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        </View>
        </ScrollView>
      </View>
        <View className="absolute bottom-0 right-0 flex-col items-center gap-3 px-4 py-7">
            <TouchableOpacity  className="rounded-full bg-primary p-4">
                <MaterialCommunityIcons name="plus" size={40} color="#FFFFFF" />
            </TouchableOpacity>
        </View>

      {/* Modal de confirmación para eliminar */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className='flex-1 bg-black/50 justify-center items-center px-6'>
          <View className='bg-[#1a1a1a] rounded-3xl p-6 w-full max-w-sm'>
            <Text className='text-white text-2xl font-bold text-center mb-2'>
              Eliminar Usuario
            </Text>
            <Text className='text-gray-300 text-base text-center mb-8 leading-6'>
              ¿Estas seguro que quieres eliminar{'\n'}al usuario?
            </Text>
            
            <View className='flex-row'>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                className='flex-1 bg-red-500 py-4 rounded-l-2xl border border-white'
                activeOpacity={0.8}
              >
                <Text className='text-white text-xl font-semibold text-center'>
                  No
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  // Aquí no eliminamos nada, solo cerramos el modal
                  console.log('Usuario NO eliminado:', userToDelete?.name);
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className='flex-1 bg-green-500 py-4 rounded-r-2xl border border-white'
                activeOpacity={0.8}
              >
                <Text className='text-white text-xl font-semibold text-center'>
                  Si
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
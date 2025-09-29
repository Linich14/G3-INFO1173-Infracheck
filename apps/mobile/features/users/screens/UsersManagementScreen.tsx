import React, { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UsersHeader from '../components/UsersHeader';
import UsersSearchBar from '../components/UsersSearchBar';
import UsersList from '../components/UsersList';
import DeleteUserModal from '../components/DeleteUserModal';
import UsersFloatingButton from '../components/UsersFloatingButton';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
}

export default function UsersManagementScreen() {
  const insets = useSafeAreaInsets();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Datos de ejemplo
  const users: User[] = [
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

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    // Aquí no eliminamos nada, solo cerramos el modal
    console.log('Usuario NO eliminado:', userToDelete?.name);
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleAddUser = () => {
    console.log('Agregar nuevo usuario');
  };

  return (
    <View className='flex-1 bg-background' style={{ paddingTop: insets.top }}>
      <UsersHeader />

      {/* Contenedor con background #13161E */}
      <View className='bg-[#13161E] rounded-[10px] pt-5 mx-4 mb-4'>
        <UsersSearchBar />
        <UsersList users={users} onDeleteUser={handleDeleteUser} />
      </View>

      <UsersFloatingButton onPress={handleAddUser} />

      <DeleteUserModal
        visible={showDeleteModal}
        user={userToDelete}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}
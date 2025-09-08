import { useState, useEffect } from 'react';
import { User } from '../types';

// Mock data - reemplaza esto con tu lógica de autenticación real
const mockUser: User = {
  id: '1',
  name: 'Alberto Caro',
  email: 'albertocaro@gmail.com',
  rut: '12.345.678-9',
  address: 'Valle Perdido 421',
};

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simula la carga de datos del usuario
    // Aquí deberías llamar a tu API o sistema de autenticación
    const loadUser = async () => {
      try {
        setLoading(true);
        // Simula delay de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUser(mockUser);
      } catch (err) {
        setError('Error al cargar los datos del usuario');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUser });
    }
  };

  return {
    user,
    loading,
    error,
    updateUser,
  };
};

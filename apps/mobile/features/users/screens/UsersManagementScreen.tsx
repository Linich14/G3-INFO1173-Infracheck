import React, { useState, useEffect } from 'react';
import { View, Alert, ActivityIndicator, Text, TouchableOpacity, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import UsersHeader from '../components/UsersHeader';
import UsersSearchBar from '../components/UsersSearchBar';
import UsersList from '../components/UsersList';
import UsersFloatingButton from '../components/UsersFloatingButton';
import AddUserModal from '../components/AddUserModal';
import { 
  User, 
  getUsers, 
  updateUserStatus, 
  searchUsers,
  testConnection,
  diagnoseAuth
} from '../services/usersService';
// Importar hook de autenticación
import { useAuth } from '../../../contexts/AuthContext';

export default function UsersManagementScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  // Hook de autenticación - obtener rol del usuario
  const { userRole } = useAuth();
  
  // Estados de la pantalla según especificación
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Estados adicionales existentes
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para control de cache y polling
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [isPollingActive, setIsPollingActive] = useState(true);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false); // Nueva flag para evitar llamadas simultáneas
  
  // Constantes de configuración
  const CACHE_DURATION = 60000; // 1 minuto en milisegundos
  const POLLING_INTERVAL = 60000; // 1 minuto
  const MIN_REQUEST_INTERVAL = 5000; // 5 segundos mínimo entre peticiones manuales


  // Función para verificar si el cache es válido
  const isCacheValid = () => {
    if (!lastFetchTime) return false;
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;
    return timeSinceLastFetch < CACHE_DURATION;
  };
  
  // Función para verificar si se puede hacer una petición manual
  const canMakeManualRequest = () => {
    if (!lastFetchTime) return true;
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;
    return timeSinceLastFetch >= MIN_REQUEST_INTERVAL;
  };

  // Hook para verificar rol y cargar usuarios según especificación
  useEffect(() => {
    if (userRole && userRole.rous_id === 1) {
      loadUsers();
    } else if (userRole !== null) {
      // Si el userRole no es null y no es 1, mostrar error
      setErrorMessage('Acceso denegado. Solo administradores pueden ver usuarios.');
      Alert.alert(
        'Acceso denegado', 
        'Solo administradores pueden ver usuarios.',
        [
          {
            text: 'Entendido',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  }, [userRole]);



  // Función para probar conectividad
  const testServerConnection = async () => {
    const result = await testConnection();
    
    Alert.alert(
      result.success ? 'Conectividad OK' : 'Error de Conectividad',
      result.message,
      [{ text: 'OK' }]
    );
  };

  // Función para diagnosticar autenticación - VERSIÓN EXTENDIDA
  const testAuthentication = async () => {
    console.log('🔍 === DIAGNÓSTICO COMPLETO DE AUTENTICACIÓN ===');
    
    try {
      // 1. Diagnóstico desde el servicio
      const result = await diagnoseAuth();
      
      console.log('📋 Resultado del diagnóstico:', result);
      
      // 2. Verificar rol desde el contexto de autenticación
      console.log('🔍 Rol desde AuthContext:', {
        userRole: userRole,
        rous_id: userRole?.rous_id,
        rous_nombre: userRole?.rous_nombre,
        tipo_rous_id: typeof userRole?.rous_id
      });
      
      // 3. Intentar hacer una petición para ver qué error devuelve
      console.log('🚀 Intentando petición de usuarios...');
      const usersResult = await getUsers();
      
      console.log('📊 Resultado de getUsers:', usersResult);
      
      // Mostrar resultado completo
      const message = `
DIAGNÓSTICO COMPLETO:

1. Autenticación: ${result.success ? '✅ OK' : '❌ FALLO'}
   ${result.message}

2. Rol en Context: 
   - ID: ${userRole?.rous_id} (${typeof userRole?.rous_id})
   - Nombre: ${userRole?.rous_nombre}

3. Petición API:
   - Éxito: ${usersResult.success ? '✅' : '❌'}
   - Mensaje: ${usersResult.message}
   
Revisa la consola para detalles completos.
      `.trim();
      
      Alert.alert(
        '🔍 Diagnóstico de Autenticación',
        message,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
      Alert.alert(
        '❌ Error en Diagnóstico',
        `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        [{ text: 'OK' }]
      );
    }
  };

  // Función para cargar usuarios con control de cache
  const loadUsersWithCache = async (forceRefresh: boolean = false, source: string = 'manual') => {
    // Evitar llamadas simultáneas
    if (isLoadingUsers) {
      return;
    }
    
    setIsLoadingUsers(true);
    try {
      // Verificar cache solo si no es un refresh forzado
      if (!forceRefresh && isCacheValid() && users.length > 0) {
        return;
      }
      
      // Para peticiones manuales, verificar el intervalo mínimo
      if (source === 'manual' && !canMakeManualRequest()) {
        const timeUntilNext = MIN_REQUEST_INTERVAL - (Date.now() - (lastFetchTime || 0));
        setErrorMessage(`Espera ${Math.ceil(timeUntilNext / 1000)} segundos antes de volver a intentar`);
        return;
      }
      
      setLoading(true);
      setErrorMessage(null);
      
      const result = await getUsers();
      
      if (result.success && result.data) {
        setUsers(result.data);
        setLastFetchTime(Date.now());
      } else {
        setErrorMessage(result.message || 'Error al cargar usuarios');
        
        // Solo mostrar alert para errores manuales, no para polling
        if (source === 'manual' || source === 'inicial') {
          Alert.alert(
            'Error al cargar usuarios', 
            result.message || 'No se pudieron cargar los usuarios',
            [
              { text: 'Reintentar', onPress: () => loadUsersWithCache(true, 'manual') },
              { text: 'Probar Conexión', onPress: testServerConnection },
              { text: 'Verificar Auth', onPress: testAuthentication },
              { text: 'Cancelar', style: 'cancel' }
            ]
          );
        }
      }
    } catch (error) {
      setErrorMessage('Error inesperado al cargar usuarios');
    } finally {
      setLoading(false);
      setIsLoadingUsers(false);
    }
  };
  
  // Función para cargar usuarios según especificación
  const loadUsers = async () => {
    // Evitar llamadas simultáneas
    if (isLoadingUsers) {
      return;
    }
    
    setIsLoadingUsers(true);
    setLoading(true);
    setErrorMessage(null);
    
    try {
      const result = await getUsers();
      
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        setErrorMessage(result.message || 'Error al cargar usuarios');
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      setErrorMessage('Error inesperado al cargar usuarios');
    } finally {
      setLoading(false);
      setIsLoadingUsers(false);
    }
  };

  // Función para refrescar usuarios
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsersWithCache(true, 'refresh');
    setRefreshing(false);
  };

  // Función para toggle de estado con API
  const handleToggleUserStatus = async (user: User) => {
    const newStatus = user.usua_estado === 1 ? 0 : 1;
    const statusText = newStatus === 1 ? 'habilitar' : 'deshabilitar';
    
    Alert.alert(
      'Confirmar cambio',
      `¿Estás seguro que deseas ${statusText} a ${user.usua_nickname}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'default',
          onPress: async () => {
            try {
              const result = await updateUserStatus(user.usua_id, newStatus);
              
              if (result.success) {
                // Actualizar estado local inmediatamente
                setUsers(prevUsers => 
                  prevUsers.map(u => 
                    u.usua_id === user.usua_id 
                      ? { ...u, usua_estado: newStatus }
                      : u
                  )
                );
                
                Alert.alert('Éxito', result.message);

              } else {
                Alert.alert('Error', result.message);
                console.error('❌ Error al actualizar estado:', result.message);
              }
            } catch (error) {
              console.error('❌ Error inesperado al actualizar estado:', error);
              Alert.alert('Error', 'Error inesperado al actualizar el estado');
            }
          }
        }
      ]
    );
  };

  // Función para búsqueda
  const handleSearch = async (query: string) => {
    try {
      setSearchQuery(query);
      setLoading(true);
      setErrorMessage(null);
      
      // Si el query está vacío, usar cache si es válido
      if (!query.trim()) {
        if (isCacheValid() && users.length > 0) {

          setLoading(false);
          return;
        } else {

          await loadUsersWithCache(true, 'search-all');
          return;
        }
      }
      

      const result = await searchUsers(query);
      
      if (result.success && result.data) {
        setUsers(result.data);

      } else {
        setErrorMessage(result.message || 'Error en la búsqueda');
        Alert.alert('Error', result.message || 'No se pudo realizar la búsqueda');
      }
    } catch (error) {
      console.error('❌ Error inesperado en búsqueda:', error);
      setErrorMessage('Error inesperado en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setShowAddUserModal(true);
  };

  const handleSubmitNewUser = (userData: any) => {

  };

  // Renderizar indicador de carga
  if (loading && users.length === 0) {
    return (
      <View className='flex-1 bg-background justify-center items-center' style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color="#537CF2" />
        <Text className='text-white mt-4 text-base'>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-background' style={{ paddingTop: insets.top }}>
      <UsersHeader />

      {/* Mensaje de error */}
      {errorMessage && (
        <View className='mx-4 mb-2 p-3 bg-red-500/20 rounded-lg border border-red-500'>
          <Text className='text-red-400 text-sm text-center'>{errorMessage}</Text>
          {lastFetchTime && (
            <Text className='text-red-300 text-xs text-center mt-1'>
              Última actualización: hace {Math.round((Date.now() - lastFetchTime) / 1000)}s
            </Text>
          )}
          <View className='flex-row justify-center mt-3 gap-2 flex-wrap'>
            <TouchableOpacity 
              onPress={loadUsers}
              className='bg-blue-500 px-3 py-2 rounded-lg'
            >
              <Text className='text-white text-xs'>Reintentar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={testServerConnection}
              className='bg-yellow-500 px-3 py-2 rounded-lg'
            >
              <Text className='text-white text-xs'>Conexión</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={testAuthentication}
              className='bg-purple-500 px-3 py-2 rounded-lg'
            >
              <Text className='text-white text-xs'>Auth</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Contenedor con background #13161E */}
      <View className='bg-[#13161E] rounded-[10px] pt-5 mx-4 mb-4'>
        <UsersSearchBar 
          onSearch={handleSearch}
          loading={loading}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
        <UsersList 
          users={users} 
          onToggleUserStatus={handleToggleUserStatus}
          loading={loading}
        />
      </View>

      <UsersFloatingButton onPress={handleAddUser} />

      <AddUserModal
        visible={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSubmit={handleSubmitNewUser}
      />
    </View>
  );
}
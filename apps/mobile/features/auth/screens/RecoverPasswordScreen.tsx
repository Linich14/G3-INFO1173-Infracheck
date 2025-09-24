import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image} from 'react-native';
import { useRouter } from 'expo-router';
import EmailInput from '../components/EmailInput';
import RutInput from '../components/RutInput';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RecoverPasswordScreen: React.FC = () => {
  const router = useRouter();
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState<'rut' | 'email'>('rut');

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]">
      {/* Header decorativo */}
      <View>
        <View className='flex-row justify-between'>
          <View className="top-5 left-10 w-32 h-32 bg-white rounded-full justify-center" />
          <View className='justify-center items-end mr-4'>
            <Text className=" text-white text-2xl font-bold">Recuperar Contraseña</Text>
          </View>
        </View>
      </View>
      {/* Vector separador */}
      <View>
        <Image
          source={require('@assets/Vectores/Vector 7.png')}
          className="-left-10 "
          resizeMode="cover"
          style={{ width: "120%", height: 120 }}
        />
        <Image
          source={require('@assets/Vectores/Vector 6.png')}
          className="absolute mt-8 -left-10 "
          resizeMode="cover"
          style={{ width: "120%", height: 120 }}
        />
      </View>
      {/* Formulario de recuperación */}
      <View className='-my-10 pt-16 flex-1 bg-[#14161E]' keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View className="w-full px-6">
          {/* Botón atrás y título en la misma fila */}
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/sign-in')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Volver"
              activeOpacity={0.6}
              className="items-center justify-center bg-primary p-3 px-4 rounded-[12px]"
            >
              <ArrowLeft size={28} color="#fff" />
            </TouchableOpacity>
            
            <Text className="text-white text-2xl font-bold text-center flex-1 mx-4">¿Olvidaste tu{'\n'}contraseña?</Text>
            
            {/* Espacio vacío para balancear el layout */}
            <View className="w-16" />
          </View>

          {/* Selector y campo centrados */}
          <View className="w-full items-center space-y-6">
            <Text className="text-white text-lg text-center py-2">Selecciona cómo buscar tu cuenta</Text>
            
            <View className="flex-row gap-4 mb-6">
              <TouchableOpacity
                onPress={() => setMethod('rut')}
                className={`flex-row items-center px-6 py-3 rounded-xl ${method === 'rut' ? 'bg-[#537CF2]' : 'bg-gray-700'}`}
                activeOpacity={0.8}
              >
                <View className={`w-5 h-5 mr-3 rounded-full border-2 ${method === 'rut' ? 'bg-white border-blue-600' : 'border-gray-400'}`} />
                <Text className="text-white text-base font-medium">RUT</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setMethod('email')}
                className={`flex-row items-center px-6 py-3 rounded-xl ${method === 'email' ? 'bg-[#537CF2]' : 'bg-gray-700'}`}
                activeOpacity={0.8}
              >
                <View className={`w-5 h-5 mr-3 rounded-full border-2 ${method === 'email' ? 'bg-white border-blue-600' : 'border-gray-400'}`} />
                <Text className="text-white text-base font-medium">Email</Text>
              </TouchableOpacity>
            </View>

            {method === 'rut' ? (
              <View className="w-full max-w-xs">
                <Text className="text-white text-xl font-bold mb-3">RUT</Text>
                <RutInput value={rut} onChangeText={setRut} keyboardType="numeric" />
              </View>
            ) : (
              <View className="w-full max-w-xs">
                <Text className="text-white text-xl font-bold mb-3">Correo Electrónico</Text>
                <EmailInput value={email} onChangeText={setEmail} placeholder="usuarioinfracheck@correo.cl" />
              </View>
            )}
          </View>

          {/* Botón centrado */}
          <View className='items-center mt-8'>
            <TouchableOpacity
              className="bg-[#537CF2] items-center justify-center w-64 py-4 rounded-[32px] shadow active:opacity-80"
              onPress={() => {/* lógica de recuperación */}}
            >
              <Text className="text-white text-lg font-bold">Recuperar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RecoverPasswordScreen;

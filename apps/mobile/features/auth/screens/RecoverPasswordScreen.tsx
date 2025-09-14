import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import EmailInput from '../components/EmailInput';
import RutInput from '../components/RutInput';
import { ArrowLeft } from 'lucide-react-native';

const RecoverPasswordScreen: React.FC = () => {
  const router = useRouter();
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState<'rut' | 'email'>('rut');

  return (
    <View className="flex-1 bg-[#0f172a]">
      {/* Header decorativo */}
      <View>
        <View className='flex-row justify-between'>
          <View className="top-5 left-10 w-32 h-32 bg-white rounded-full justify-center" />
          <View className='justify-center items-end mr-4'>
            <Text className=" text-white text-4xl font-bold">Recuperar Contraseña</Text>
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
      <ScrollView  className='-my-10 pt-24 flex-1 align-items-center justify-content-start bg-[#14161E]'  keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View className="w-full px-6 ">
          <View className="flex-row items-center justify-between mb-10 ">
            {/* Botón atrás */}
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
            {/* Texto centrado */}
            <Text className="text-white text-4xl font-bold">¿Olvidaste tu contraseña?</Text>
            {/* View vacío para balancear el espacio */}
            <View className="w-16" />
          </View>
          {/* Selector y campo centrados y con tamaño consistente */}
          <View className="w-full items-center space-y-8 mb-8">
            <Text className="text-white text-lg mb-2">Selecciona cómo buscar tu cuenta</Text>
            <View className="flex-row gap-4 mb-8">
              <TouchableOpacity
                onPress={() => setMethod('rut')}
                className={`flex-row items-center px-4 py-2 rounded-xl ${method === 'rut' ? 'bg-[#537CF2]' : 'bg-gray-700'}`}
                activeOpacity={0.8}
              >
                <View className={`w-5 h-5 mr-2 rounded-full border-2 ${method === 'rut' ? 'bg-white border-blue-600' : 'border-gray-400'}`} />
                <Text className="text-white text-base">RUT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMethod('email')}
                className={`flex-row items-center px-4 py-2 rounded-xl ${method === 'email' ? 'bg-[#537CF2]' : 'bg-gray-700'}`}
                activeOpacity={0.8}
              >
                <View className={`w-5 h-5 mr-2 rounded-full border-2 ${method === 'email' ? 'bg-white border-blue-600' : 'border-gray-400'}`} />
                <Text className="text-white text-base">Email</Text>
              </TouchableOpacity>
            </View>
            {method === 'rut' ? (
              <View className="space-y-2 w-72">
                <Text className="text-white text-2xl font-bold">RUT</Text>
                <RutInput value={rut} onChangeText={setRut} keyboardType="numeric" />
              </View>
            ) : (
              <View className="space-y-2 w-72">
                <Text className="text-white text-2xl font-bold">Correo Electrónico</Text>
                <EmailInput value={email} onChangeText={setEmail} placeholder="usuarioinfracheck@correo.cl" />
              </View>
            )}
          </View>
          {/* Botón centrado y tamaño consistente */}
          <View className='items-center mt-2'>
            <TouchableOpacity
              className="bg-[#537CF2] items-center justify-center w-48 py-5 rounded-[32px] shadow active:opacity-80 mb-4"
              onPress={() => {/* lógica de recuperación */}}
            >
              <Text className="text-white text-lg font-bold">Recuperar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default RecoverPasswordScreen;

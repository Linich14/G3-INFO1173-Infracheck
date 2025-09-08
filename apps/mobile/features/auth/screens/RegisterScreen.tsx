import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import EmailInput from '../components/EmailInput';
import RutInput from '../components/RutInput';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');

  const handleRegister = () => {
    router.replace('/(tabs)/home');
  };

  return (
    // Respetamos solo el safe area superior; la parte inferior la maneja el contenido
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#0f172a' }}>
      {/* Sección superior decorativa */}
      <View>
        <View className="flex-row justify-between">
          <View className="top-5 left-10 w-32 h-32 bg-white rounded-full justify-center" />
          <View className="justify-center items-end mr-4">
            <Text className="text-white text-4xl font-bold">Registrarse</Text>
          </View>
        </View>
      </View>

      {/* Vector separador */}
      <View>
        <Image
          source={require('@assets/Vectores/Vector 7.png')}
          className="-left-10"
          resizeMode="cover"
          style={{ width: '120%', height: 120 }}
        />
        <Image
          source={require('@assets/Vectores/Vector 6.png')}
          className="absolute mt-8 -left-10"
          resizeMode="cover"
          style={{ width: '120%', height: 120 }}
        />
      </View>

      {/* Sección principal con scroll (sobre fondo #14161E) */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        className="-my-10 bg-[#14161E]"
        contentContainerStyle={{
          paddingTop: 64,
          paddingBottom: insets.bottom + 16, // aire para no chocar con la tab bar
          alignItems: 'center',
          rowGap: 0,
        }}
      >
        <View className="w-full px-6">
          {/* Header del form: back + Hola! centrado + spacer */}
          <View className="flex-row items-center justify-between mb-10">
            {/* Botón atrás (icon-only, sin fondo) */}
            <TouchableOpacity
              onPress={() => router.replace('/')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Volver"
              activeOpacity={0.6}
              className="items-center justify-center bg-primary p-3 px-4 rounded-[12px]"
            >
              <ArrowLeft size={28} color="#fff" />
            </TouchableOpacity>

            <Text className="text-white text-6xl font-bold">Hola!</Text>

            {/* Spacer del mismo ancho visual que el botón atrás */}
            <View style={{ width: 36 }} />
          </View>

          {/* Campos */}
          <View className="items-center mb-8">
            {/* Campo RUT */}
            <View className="space-y-2 w-72 mb-8">
              <Text className="text-white text-2xl font-bold">RUT</Text>
              <RutInput value={rut} onChangeText={setRut} keyboardType="numeric" />
            </View>

            {/* Campo Nombre */}
            <View className="space-y-2 w-72 mb-8">
              <Text className="text-white text-2xl font-bold">Nombre</Text>
              <TextInput
                placeholder="Juan"
                placeholderTextColor="#ccc"
                className="text-white text-xl border-b border-white pb-2"
                keyboardType="default"
              />
            </View>

            {/* Campo Apellido */}
            <View className="space-y-2 w-72 mb-8">
              <Text className="text-white text-2xl font-bold">Apellido</Text>
              <TextInput
                placeholder="Pérez Parada"
                placeholderTextColor="#ccc"
                className="text-white text-xl border-b border-white pb-2"
                keyboardType="default"
              />
            </View>

            {/* Campo Nombre de Usuario */}
            <View className="space-y-2 w-72 mb-8">
              <Text className="text-white text-2xl font-bold">Nombre de Usuario</Text>
              <TextInput
                placeholder="pepa"
                placeholderTextColor="#ccc"
                className="text-white text-xl border-b border-white pb-2"
                keyboardType="default"
              />
            </View>

            {/* Campo Correo */}
            <View className="space-y-2 w-72 mb-8">
              <Text className="text-white text-2xl font-bold">Correo Electrónico</Text>
              <EmailInput value={email} onChangeText={setEmail} />
            </View>

            {/* Campo Contraseña */}
            <View className="space-y-2 w-72 mb-8">
              <Text className="text-white text-2xl font-bold">Contraseña</Text>
              <TextInput
                placeholder="************"
                placeholderTextColor="#ccc"
                secureTextEntry
                className="text-white text-xl border-b border-white pb-2"
                keyboardType="default"
              />
            </View>

            {/* Campo Repetir Contraseña */}
            <View className="space-y-2 w-72 mb-8">
              <Text className="text-white text-2xl font-bold">Repetir Contraseña</Text>
              <TextInput
                placeholder="************"
                placeholderTextColor="#ccc"
                secureTextEntry
                className="text-white text-xl border-b border-white pb-2"
                keyboardType="default"
              />
            </View>

            {/* Campo Teléfono */}
            <View className="space-y-2 w-72 mb-8">
              <Text className="text-white text-2xl font-bold">Teléfono</Text>
              <View className="flex-row items-center">
                <Text className="text-white text-xl mr-2">+569</Text>
                <TextInput
                  placeholder="12345678"
                  placeholderTextColor="#ccc"
                  keyboardType="number-pad"
                  className="text-white text-xl border-b border-white pb-2 flex-1"
                  maxLength={8}
                />
              </View>
            </View>
          </View>

          {/* Botones */}
          <View className="items-center mt-2">
            <TouchableOpacity
              className="bg-[#537CF2] items-center justify-center w-48 py-5 rounded-[32px] shadow active:opacity-80 mb-4"
              onPress={handleRegister}
            >
              <Text className="text-white text-lg font-bold">Registrarse</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/(auth)/sign-in')}
              className="bg-gray-400 items-center justify-center w-48 py-5 rounded-[32px] shadow border-2 border-white active:opacity-80"
            >
              <Text className="text-white text-lg font-bold">Ya tengo cuenta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
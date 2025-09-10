import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import  RutInput  from '../components/RutInput'
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context'


const LoginScreen: React.FC = () => {
  const router = useRouter()
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    router.replace('/(tabs)/home')
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]">
      {/* Sección superior decorativa */}
      <View>
        <View className='flex-row justify-between'>
          <View className="top-5 left-10 w-32 h-32 bg-white rounded-full justify-center" />
          <View className='justify-center items-end mr-4'>
            <Text className=" text-white text-4xl font-bold">Inicio Sesión</Text>
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

      
      {/* Sección central con ScrollView para evitar desbordes y manejo de teclado */}
      <ScrollView
        contentContainerStyle={{ paddingTop: 64, paddingBottom: 32, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        className='bg-[#14161E] -my-10'
      >
        <View className="w-full px-6 ">
          <View className="flex-row items-center justify-between mb-10 ">
            {/* Botón atrás */}
            <TouchableOpacity
              onPress={() => router.replace('/')}   // o router.back() si prefieres
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Volver"
              activeOpacity={0.6}
              className="items-center justify-center bg-primary p-3 px-4 rounded-[12px]"
            >
              <ArrowLeft size={28} color="#fff" />
            </TouchableOpacity>
            {/* Texto centrado */}
            <Text className="text-white text-6xl font-bold">Hola!</Text>
            {/* View vacío para balancear el espacio */}
            <View className="w-16" />
          </View>
          {/* Campos de usuario y contraseña alineados verticalmente */}
          <View className="w-full items-center space-y-6 mb-8 ">
            {/* Campo Usuario */}
            <View className="space-y-2 w-72">
              <Text className="text-white text-2xl font-bold ">Usuario</Text>
              <RutInput value={rut} onChangeText={setRut} keyboardType="numeric" />
            </View>
            {/* Campo Contraseña */}
            <View className="space-y-2 w-72 pt-8">
              <Text className="text-white text-2xl font-bold">Contraseña</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="*************"
                placeholderTextColor="#ccc"
                secureTextEntry
                className="text-white text-xl border-b border-white pb-2"
                keyboardType="default"
              />
            </View>
          </View>
          {/* Botones centrados y visibles */}
          <View className='items-center mt-2'>
            <TouchableOpacity
              className="bg-[#537CF2] items-center justify-center w-48 py-5 rounded-[32px] shadow active:opacity-80 mb-4"
              onPress={handleLogin}
            >
              <Text className="text-white text-lg font-bold">Iniciar Sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace('/(auth)/recover-password')}>
              <Text className="text-[#537CF2] text-lg mt-2">¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default LoginScreen

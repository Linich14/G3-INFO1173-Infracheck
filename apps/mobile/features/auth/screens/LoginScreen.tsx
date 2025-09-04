import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { formatRut } from '../utils/formatRut'
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context'

const LoginScreen: React.FC = () => {
  const router = useRouter()
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    router.replace('/(tabs)/home')
  }

  const handleRutChange = (text: string) => {
    setRut(formatRut(text).slice(0, 12))
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]">


      {/* Sección superior decorativa */}
      <View className=''>
        {/* Onda decorativa (puedes reemplazar con SVG o imagen si tienes una) */}
        <View className='flex-row justify-between'>
          <View className="top-5 left-10 w-32 h-32 bg-white rounded-full justify-center" />
          <View className='justify-center items-end mr-4'>
            <Text className=" text-white text-4xl font-bold">Inicio Sesión</Text>
          </View>
        </View>
      </View>

    {/* Vector separador */}
        <View className="">
            <Image
              source={require('@assets/Vectores/Vector 7.png')}
              className="-left-10 "
              resizeMode="cover"
                style={{
                width: "120%",   // aumenta solo el ancho (ej. 120% del contenedor)
                height: 120,     // altura fija (no cambia)
              }}
            />
            <Image
              source={require('@assets/Vectores/Vector 6.png')}
              className="absolute mt-8 -left-10 "
              resizeMode="cover"
                style={{
              width: "120%",   // aumenta solo el ancho (ej. 120% del contenedor)
              height: 120,     // altura fija (no cambia)
            }}
            />
        </View>
            

      {/* Sección central */}
    <View className="flex-1 pt-10 -my-10 bg-[#14161E]">
      <View className="flex-row items-center justify-between mb-10 px-4">
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



    <View className="items-center  space-y-6 mb-20">
      {/* Campo Usuario */}
      <View className="space-y-2 w-72 mb-12 ">
        <Text className="text-white text-2xl font-bold ">Usuario</Text>
        <TextInput
          placeholder="12.345.678-k"
          placeholderTextColor="#ccc"
          className="text-white  border-b text-xl border-white italic pb-2"
          value={rut}
          onChangeText={handleRutChange}
          maxLength={12} // 12: 99.999.999-k
        />
      </View>

      {/* Campo Contraseña */}
      <View className="space-y-2 w-72">
        <Text className="text-white text-2xl font-bold">Contraseña</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="*************"
          placeholderTextColor="#ccc"
          secureTextEntry
          className="text-white text-xl border-b border-white pb-2"
        />
      </View>
    </View>





        {/* Botón de login */}
        <View className='flex items-center'>
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

        {/* Enlace de recuperación */}


      </View>
    </SafeAreaView>
  )
}

export default LoginScreen

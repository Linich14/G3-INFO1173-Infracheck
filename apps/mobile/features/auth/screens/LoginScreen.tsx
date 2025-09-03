import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { formatRut } from '../utils/formatRut'

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
    <View className="flex-1 bg-[#0f172a]">


      {/* Sección superior decorativa */}
      <View >
        {/* Onda decorativa (puedes reemplazar con SVG o imagen si tienes una) */}
        <View className=" top-10 left-10 w-32 h-32 bg-white rounded-full " />
        <Text className=" text-white text-4xl absolute top-20 right-20 font-bold">Inicio Sesión</Text>
      </View>

    {/* Vector separador */}
    <View className="h-32 bg-blue-500 justify-center">
      <Text className=' text-center text-white text-2xl'> Soy un vector temporal </Text>
      
    </View>
            

      {/* Sección central */}
      <View className="flex-1 items-center justify-start px-6 pt-10 bg-[#14161E]">
        <View className='flex-row justify-between w-full mb-32  '>
            <TouchableOpacity
                className="bg-blue-400 rounded-xl w-20 h-15 shadow active:opacity-80 "
                onPress={() => router.replace('/')}
            >
                <Text className="text-white text-base font-bold text-center text-4xl "> ← </Text>
            </TouchableOpacity>
            <Text className="text-white text-6xl font-bold right-60">Hola!</Text>

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
        <TouchableOpacity
          className="bg-blue-400 flex-row items-center justify-center w-48 h-12 rounded-xl shadow active:opacity-80 mb-4"
          onPress={handleLogin}
        >
          {/* Flecha izquierda (puedes usar un ícono si tienes uno) */}

          <Text className="text-white text-lg font-medium">Iniciar Sesión</Text>
        </TouchableOpacity>

        {/* Enlace de recuperación */}
        <TouchableOpacity onPress={() => router.replace('/(auth)/recover-password')}>
          <Text className="text-blue-400 text-lg mt-2">¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

      </View>
    </View>
  )
}

export default LoginScreen

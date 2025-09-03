import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'

const WelcomeScreen: React.FC = () => {
  const router = useRouter()

  return (
    <View className="flex-1 bg-[#0f172a]">


      {/* Sección superior */}
      <View className="flex-1 items-center justify-center relative">

        {/* Círculo decorativo */}
        <View className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full " />

        {/* Título */}
        <Text className="text-white text-6xl absolute top-30 right-20 font-bold mb-6">Bienvenidos</Text>


      </View>


      {/* Vector separador */}
      <View className="h-2 bg-blue-500">


      </View>
      

      
      {/* Sección inferior */}
      <View className="flex-1 items-center justify-center px-6 bg-[#14161E]">

        {/* Logo */}
        <Image
          source={require('@assets/infracheck_logo.png')}
          className="w-64 h-64 mb-6"
          resizeMode="contain"
        />

        <TouchableOpacity
          className="bg-blue-600 py-3 rounded-xl w-48 h-12 mb-4 shadow"
          onPress={() => router.replace('/(auth)/sign-up')}
        >
          <Text className="text-white text-center text-base font-medium">Registrarse</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-700 py-3 rounded-xl w-48 h-12 shadow"
          onPress={() => router.replace('/(auth)/sign-in')}
        >
          <Text className="text-white text-center text-base font-medium">Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default WelcomeScreen

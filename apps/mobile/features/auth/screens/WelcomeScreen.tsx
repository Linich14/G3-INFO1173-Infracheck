import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'

const WelcomeScreen: React.FC = () => {
  const router = useRouter()

  return (
    <View className="flex-1 bg-[#0f172a]">


      {/* Sección superior */}
      <View className="  relative mb-64 py-4 ">

        {/* Círculo decorativo */}
        <View className="top-10 absolute  right-20 w-32 h-32 bg-white rounded-full " />

        {/* Título */}
        <Text className="text-white  text-6xl justify-center text-center absolute top-48 right-20 font-bold  ">Bienvenidos</Text>


      </View>


    {/* Vector separador */}
    <View className="h-32 bg-blue-500 justify-center">
      <Text className=' text-center text-white text-2xl'> Soy un vector temporal </Text>
      
    </View>
      

      
      {/* Sección inferior */}
      <View className="flex-1 items-center   bg-[#14161E]">

        {/* Logo */}
        <Image
          source={require('@assets/infracheck_logo.png')}
          className="w-64 h-64 mb-6 border-2 border-white mt-20"
          resizeMode="contain"
        />

        <TouchableOpacity
          className="bg-blue-600 py-3 rounded-xl w-48 h-12 mb-4 shadow"
          onPress={() => router.replace('/(auth)/sign-up')}
        >
          <Text className="text-white text-center text-base font-medium">Registrarse</Text>
        </TouchableOpacity>

        

        <TouchableOpacity
          className="bg-gray-400 py-3 rounded-xl w-48 h-12 shadow border-2 border-white"
          onPress={() => router.replace('/(auth)/sign-in')}
        >
          <Text className="text-white text-center text-base font-medium">Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default WelcomeScreen

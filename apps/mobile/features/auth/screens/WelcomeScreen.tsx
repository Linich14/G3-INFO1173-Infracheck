import React from 'react'
import { View, Text, Image, TouchableOpacity} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

const WelcomeScreen: React.FC = () => {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]">
        {/* Sección superior */}
      <View className="bg-[#0f172a]">
        <View className="mb-32 py-4 ">
          {/* Círculo decorativo */}
          <View className="absolute right-10 w-32 h-32 bg-white rounded-full " />

          {/* Título */}
        </View>
        <View className='flex justify-end items-end mr-5'>
          <Text className="text-white text-6xl font-bold">Bienvenidos</Text>
        </View>
        {/* VECTORES */}
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
      </View>
      {/* Sección inferior */}
      <View className="flex-1 items-center bg-[#14161E] -m-10">

        {/* Logo */}
        <Image
          source={require('@assets/infracheck_logo.png')}
          className="w-64 h-64"
          resizeMode="contain"
        />

        <TouchableOpacity
          className="bg-[#537CF2] py-5 rounded-[32] w-48 mb-8 shadow"
          onPress={() => router.replace('/(auth)/sign-up')}
        >
          <Text className="text-white text-center text-base font-bold">Registrarse</Text>
        </TouchableOpacity>

        

        <TouchableOpacity
          className="bg-gray-400 py-5 rounded-[32] w-48 shadow border-2 border-white"
          onPress={() => router.replace('/(auth)/sign-in')}
        >
          <Text className="text-white text-center text-base font-bold">Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default WelcomeScreen

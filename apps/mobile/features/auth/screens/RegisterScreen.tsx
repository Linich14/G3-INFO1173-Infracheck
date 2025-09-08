import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import EmailInput from '../components/EmailInput'
import RutInput from '../components/RutInput'
import { ArrowLeft } from 'lucide-react-native';

const RegisterScreen: React.FC = () => {
  const router = useRouter()
  const [rut, setRut] = useState('')
  const [email, setEmail] = useState('')

  const handleRegister = () => {
    router.replace('/(tabs)/home')
  }

  return (
    <View className="flex-1 bg-[#0f172a]">
      {/* Sección superior decorativa */}
      {/* Sección superior decorativa */}
      <View>
        <View className='flex-row justify-between'>
          <View className="top-5 left-10 w-32 h-32 bg-white rounded-full justify-center" />
          <View className='justify-center items-end mr-4'>
            <Text className=" text-white text-4xl font-bold">Registrarse</Text>
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

      {/* Sección principal con scroll */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 40, backgroundColor: '#14161E' }}>
        <View className='flex-row justify-between w-full mb-20'>
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
          <Text className="text-white text-6xl font-bold right-60">Hola!</Text>
        </View>
        {/* Campos */}
        <View className="items-center space-y-10 mb-12">
          {/* Campo RUT */}
          <View className="space-y-2 w-72 mb-8">
            <Text className="text-white text-xl font-semibold">RUT</Text>
            <RutInput value={rut} onChangeText={setRut} keyboardType="numeric" />
          </View>

          {/* Campo Nombre */}
          <View className="space-y-2 w-72 mb-8">
            <Text className="text-white text-xl font-semibold">Nombre</Text>
            <TextInput
              placeholder="Juan"
              placeholderTextColor="#ccc"
              className="text-white text-lg border-b border-white pb-2"
              keyboardType="default"
            />
          </View>

          {/* Campo Apellido */}
          <View className="space-y-2 w-72 mb-8">
            <Text className="text-white text-xl font-semibold">Apellido</Text>
            <TextInput
              placeholder="Perez Parada"
              placeholderTextColor="#ccc"
              className="text-white text-lg border-b border-white pb-2"
              keyboardType="default"
            />
          </View>

          {/* Campo Nickname */}
          <View className="space-y-2 w-72 mb-8">
            <Text className="text-white text-xl font-semibold">Nombre de Usuario</Text>
            <TextInput
              placeholder="pepa"
              placeholderTextColor="#ccc"
              className="text-white text-lg border-b border-white pb-2"
              keyboardType="default"
            />
          </View>

          {/* Campo Correo */}
          <View className="space-y-2 w-72 mb-8">
            <Text className="text-white text-xl font-semibold">Correo Electrónico</Text>
            <EmailInput value={email} onChangeText={setEmail} />
          </View>

          {/* Campo Contraseña */}
          <View className="space-y-2 w-72 mb-8">
            <Text className="text-white text-xl font-semibold">Contraseña</Text>
            <TextInput
              placeholder="************"
              placeholderTextColor="#ccc"
              secureTextEntry
              className="text-white text-lg border-b border-white pb-2"
              keyboardType="default"
            />
          </View>

          {/* Campo Repetir Contraseña */}
          <View className="space-y-2 w-72 mb-8">
            <Text className="text-white text-xl font-semibold">Repetir Contraseña</Text>
            <TextInput
              placeholder="************"
              placeholderTextColor="#ccc"
              secureTextEntry
              className="text-white text-lg border-b border-white pb-2"
              keyboardType="default"
            />
          </View>

          {/* Campo Teléfono */}
          <View className="space-y-2 w-72 mb-8">
            <Text className="text-white text-xl font-semibold">Teléfono</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text className="text-white text-lg mr-2">+569</Text>
              <TextInput
                placeholder="12345678"
                placeholderTextColor="#ccc"
                keyboardType="number-pad"
                className="text-white text-lg border-b border-white pb-2 flex-1"
                maxLength={8}
              />
            </View>
          </View>
        </View>
        {/* Botones */}
        <View className="gap-4 items-center mb-10">
          <TouchableOpacity
            className="bg-blue-600 py-3 rounded-xl w-48 h-12 shadow active:opacity-80"
            onPress={handleRegister}
          >
            <Text className="text-white text-center text-base font-medium">Registrarse</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-gray-400 py-3 rounded-xl w-48 h-12 shadow border-2 border-white active:opacity-80"
            onPress={() => router.replace('/(auth)/sign-in')}
          >
            <Text className="text-white text-center text-base font-medium">Ya tengo cuenta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

export default RegisterScreen

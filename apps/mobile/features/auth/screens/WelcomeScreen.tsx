import React, { useState } from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLanguage } from '~/contexts/LanguageContext'

const WelcomeScreen: React.FC = () => {
  const router = useRouter()
  const { t, locale, setLocale } = useLanguage()
  const [isLangOpen, setIsLangOpen] = useState(false)

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
          <Text className="text-white text-6xl font-bold">{t('welcomeTitle')}</Text>
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
          <Text className="text-white text-center text-base font-bold">{t('welcomeRegister')}</Text>
        </TouchableOpacity>

        

        <TouchableOpacity
          className="bg-gray-400 py-5 rounded-[32] w-48 shadow border-2 border-white"
          onPress={() => router.replace('/(auth)/sign-in')}
        >
          <Text className="text-white text-center text-base font-bold">{t('welcomeLogin')}</Text>
        </TouchableOpacity>

        {/* Selector de idioma como dropdown debajo del botón de inicio de sesión */}
        <View className="w-full items-center mt-6">
          {/* Botón principal del dropdown */}
          <TouchableOpacity
            onPress={() => setIsLangOpen(!isLangOpen)}
            activeOpacity={0.8}
            className="flex-row items-center justify-between px-4 py-3 w-48 rounded-2xl bg-[#1F2937] border border-white/10"
          >
            <View className="flex-row items-center">
              {/* Bandera del idioma actual */}
              <Text className="text-xl mr-2">
                {locale === 'es' ? '🇨🇱' : '🇺🇸'}
              </Text>
              <Text className="text-white font-medium">
                {locale === 'es' ? 'Español' : 'English'}
              </Text>
            </View>
            <Text className="text-gray-300 text-xs">
              {isLangOpen ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {/* Lista desplegable */}
          {isLangOpen && (
            <View className="mt-2 w-48 rounded-2xl bg-[#111827] border border-white/10 overflow-hidden">
              <TouchableOpacity
                onPress={() => {
                  setLocale('es')
                  setIsLangOpen(false)
                }}
                activeOpacity={0.8}
                className={`flex-row items-center px-4 py-3 ${locale === 'es' ? 'bg-[#1F2937]' : ''}`}
              >
                <Text className="text-xl mr-2">🇨🇱</Text>
                <Text className="text-white font-medium">Español</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setLocale('en')
                  setIsLangOpen(false)
                }}
                activeOpacity={0.8}
                className={`flex-row items-center px-4 py-3 border-t border-white/5 ${locale === 'en' ? 'bg-[#1F2937]' : ''}`}
              >
                <Text className="text-xl mr-2">🇺🇸</Text>
                <Text className="text-white font-medium">English</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

export default WelcomeScreen

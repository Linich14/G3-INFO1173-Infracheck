import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLanguage } from '~/contexts/LanguageContext';

interface CategoryFilterProps {
  selectedCategoria: string | null;
  onCategoriaChange: (categoria: string | null) => void;
  categorias?: string[];
}

export default function CategoryFilter({ 
  selectedCategoria, 
  onCategoriaChange,
  categorias = ['Infraestructura', 'Señalización', 'Alumbrado', 'Limpieza', 'Áreas Verdes', 'Servicios Públicos']
}: CategoryFilterProps) {
  const { t, locale } = useLanguage();
  
  // Mapa para traducir categorías del backend según el idioma actual
  const getCategoryTranslation = useMemo(() => {
    const categoryMap: Record<string, { es: string; en: string }> = {
      'Infraestructura': { es: 'Infraestructura', en: 'Infrastructure' },
      'Señalización': { es: 'Señalización', en: 'Signage' },
      'Alumbrado': { es: 'Alumbrado', en: 'Lighting' },
      'Limpieza': { es: 'Limpieza', en: 'Cleaning' },
      'Áreas Verdes': { es: 'Áreas Verdes', en: 'Green Areas' },
      'Servicios Públicos': { es: 'Servicios Públicos', en: 'Public Services' },
      'Seguridad': { es: 'Seguridad', en: 'Security' },
      'Transporte': { es: 'Transporte', en: 'Transport' },
      'Otro': { es: 'Otro', en: 'Other' }
    };
    
    return (categoria: string): string => {
      if (!categoryMap[categoria]) return categoria;
      return categoryMap[categoria][locale] || categoria;
    };
  }, [locale]);
  
  return (
    <View className="px-4 py-3 bg-[#13161E]">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}>
        {/* Botón Todas */}
        <TouchableOpacity
          onPress={() => onCategoriaChange(null)}
          className={`px-4 py-2 rounded-full border ${
            selectedCategoria === null 
              ? 'bg-[#537CF2] border-[#537CF2]' 
              : 'bg-transparent border-gray-600'
          }`}>
          <Text className={`font-medium ${
            selectedCategoria === null ? 'text-white' : 'text-gray-400'
          }`}>
            {t('categoryFilterAll')}
          </Text>
        </TouchableOpacity>
        
        {/* Categorías */}
        {categorias.map((categoria) => (
          <TouchableOpacity
            key={categoria}
            onPress={() => onCategoriaChange(categoria)}
            className={`px-4 py-2 rounded-full border ${
              selectedCategoria === categoria 
                ? 'bg-[#537CF2] border-[#537CF2]' 
                : 'bg-transparent border-gray-600'
            }`}>
            <Text className={`font-medium ${
              selectedCategoria === categoria ? 'text-white' : 'text-gray-400'
            }`}>
              {getCategoryTranslation(categoria)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

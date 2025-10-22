import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

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
            Todas
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
              {categoria}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

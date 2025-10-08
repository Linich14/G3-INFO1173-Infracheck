import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

type NivelUrgencia = 'baja' | 'media' | 'alta' | 'critica';

interface SelectorNivelUrgenciaProps {
  value: string;
  onChange: (nivel: string) => void;
  error?: string;
}

const niveles: {
  valor: NivelUrgencia;
  label: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
}[] = [
  {
    valor: 'baja',
    label: 'Baja',
    colorBg: 'bg-green-500/20',
    colorBorder: 'border-green-500',
    colorText: 'text-green-500',
  },
  {
    valor: 'media',
    label: 'Media',
    colorBg: 'bg-yellow-500/20',
    colorBorder: 'border-yellow-500',
    colorText: 'text-yellow-500',
  },
  {
    valor: 'alta',
    label: 'Alta',
    colorBg: 'bg-orange-500/20',
    colorBorder: 'border-orange-500',
    colorText: 'text-orange-500',
  },
  {
    valor: 'critica',
    label: 'Crítica',
    colorBg: 'bg-red-500/20',
    colorBorder: 'border-red-500',
    colorText: 'text-red-500',
  },
];

export const SelectorNivelUrgencia: React.FC<SelectorNivelUrgenciaProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <View>
      <View className="mb-3 flex-row items-center">
        <AlertCircle size={20} color="#FFFFFF" />
        <Text className="ml-2 text-base font-semibold text-white">Nivel de Urgencia</Text>
      </View>
      
      <View className="flex-row flex-wrap gap-3">
        {niveles.map((nivel) => {
          const isSelected = value === nivel.valor;
          return (
            <TouchableOpacity
              key={nivel.valor}
              onPress={() => onChange(nivel.valor)}
              className={`flex-1 min-w-[45%] rounded-lg border-2 px-4 py-3 ${
                isSelected
                  ? `${nivel.colorBg} ${nivel.colorBorder}`
                  : 'border-gray-600 bg-secondary'
              }`}
            >
              <Text
                className={`text-center text-base font-semibold ${
                  isSelected ? nivel.colorText : 'text-gray-400'
                }`}
              >
                {nivel.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {error && <Text className="mt-2 text-sm text-red-500">{error}</Text>}
    </View>
  );
};

import React from 'react';
import { View, Text } from 'react-native';
import { TrendIndicatorProps } from '../types';

/**
 * Indicador visual de tendencia (crecimiento/decrecimiento)
 * Muestra una flecha y el porcentaje en color verde o rojo
 */
export default function TrendIndicator({ value, isPositive, arrow }: TrendIndicatorProps) {
  // Si no hay arrow, se calcula automáticamente
  const displayArrow = arrow || (isPositive ? '↑' : '↓');

  return (
    <View
      className={`flex-row items-center rounded-full px-2 py-1 ${
        isPositive ? 'bg-green-500/20' : 'bg-red-500/20'
      }`}
    >
      <Text
        className={`text-xs font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}
      >
        {displayArrow} {value}%
      </Text>
    </View>
  );
}

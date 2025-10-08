import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InsightCardProps } from '../types';
import { getInsightColor } from '../utils';

/**
 * Tarjeta para mostrar un insight o conclusión importante
 * Con icono colorido según el tipo (success, warning, info, danger)
 */
export default function InsightCard({ icon, text, type }: InsightCardProps) {
  const color = getInsightColor(type);

  // Estilos según el tipo
  const bgColorClass = {
    success: 'bg-green-500/10',
    warning: 'bg-orange-500/10',
    info: 'bg-blue-500/10',
    danger: 'bg-red-500/10',
  }[type];

  const borderColorClass = {
    success: 'border-green-500/30',
    warning: 'border-orange-500/30',
    info: 'border-blue-500/30',
    danger: 'border-red-500/30',
  }[type];

  return (
    <View className={`flex-row items-start rounded-lg border ${bgColorClass} ${borderColorClass} p-3`}>
      {/* Icono */}
      <View className="mr-3 mt-0.5">
        <Ionicons name={icon as any} size={20} color={color} />
      </View>

      {/* Texto del insight */}
      <Text className="flex-1 text-sm leading-5 text-gray-300">{text}</Text>
    </View>
  );
}

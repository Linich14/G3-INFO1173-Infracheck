import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatCardProps } from '../types';

/**
 * Tarjeta para mostrar una métrica estadística individual
 * Incluye título, valor, icono y tendencia opcional
 */
export default function StatCard({
  title,
  value,
  icon,
  iconColor,
  trend,
  subtitle,
}: StatCardProps) {
  return (
    <View className="rounded-xl bg-[#13161E] p-4">
      {/* Header con icono */}
      <View className="mb-3 flex-row items-center justify-between">
        <View
          className="rounded-lg p-2"
          style={{ backgroundColor: `${iconColor}20` }} // 20 = opacidad 12%
        >
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        
        {/* Indicador de tendencia */}
        {trend && (
          <View
            className={`flex-row items-center rounded-full px-2 py-1 ${
              trend.isPositive ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trend.arrow} {trend.value}%
            </Text>
          </View>
        )}
      </View>

      {/* Valor principal */}
      <Text className="mb-1 text-2xl font-bold text-white">{value}</Text>

      {/* Título */}
      <Text className="text-sm text-gray-400">{title}</Text>

      {/* Subtítulo opcional */}
      {subtitle && <Text className="mt-1 text-xs text-gray-500">{subtitle}</Text>}
    </View>
  );
}

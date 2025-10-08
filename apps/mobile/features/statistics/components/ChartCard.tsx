import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ChartCardProps } from '../types';

/**
 * Contenedor estándar para gráficos
 * Proporciona un formato consistente con título, subtítulo y soporte para scroll
 */
export default function ChartCard({
  title,
  subtitle,
  children,
  scrollable = false,
}: ChartCardProps) {
  return (
    <View className="rounded-xl bg-[#13161E] p-4">
      {/* Header */}
      <View className="mb-4">
        <Text className="mb-1 text-lg font-bold text-blue-400">{title}</Text>
        {subtitle && <Text className="text-sm text-gray-400">{subtitle}</Text>}
      </View>

      {/* Contenido del gráfico */}
      {scrollable ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View>{children}</View>
      )}
    </View>
  );
}

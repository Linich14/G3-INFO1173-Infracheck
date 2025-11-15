import React from 'react';
import { View, Text } from 'react-native';

interface UserStatsProps {
  reportes_creados: number;
  reportes_seguidos: number;
  votos_recibidos: number;
  votos_realizados: number;
}

const StatItem = ({ label, value }: { label: string; value: number }) => (
  <View className="flex-1 items-center">
    <Text className="text-white text-2xl font-bold" numberOfLines={1}>
      {value}
    </Text>
    <Text className="text-gray-400 text-xs mt-1 text-center" numberOfLines={2}>
      {label}
    </Text>
  </View>
);

export const UserStats: React.FC<UserStatsProps> = ({
  reportes_creados,
  reportes_seguidos,
  votos_recibidos,
  votos_realizados,
}) => {
  // Asegurar defaults en caso de valores nulos/undefined
  const safeReportesCreados = Number.isFinite(reportes_creados) ? reportes_creados : 0;
  const safeReportesSeguidos = Number.isFinite(reportes_seguidos) ? reportes_seguidos : 0;
  const safeVotosRecibidos = Number.isFinite(votos_recibidos) ? votos_recibidos : 0;
  const safeVotosRealizados = Number.isFinite(votos_realizados) ? votos_realizados : 0;

  return (
    <View className="mx-4 mt-4 mb-2 rounded-2xl bg-[#13161E] px-4 py-5 border border-[#1F2933]">
      <Text className="text-gray-300 text-xs font-semibold mb-3 uppercase tracking-wide">
        Actividad
      </Text>
      <View className="flex-row items-stretch">
        <StatItem label="Reportes creados" value={safeReportesCreados} />
        <View className="w-px h-10 bg-[#1F2933] mx-2" />
        <StatItem label="Reportes seguidos" value={safeReportesSeguidos} />
        <View className="w-px h-10 bg-[#1F2933] mx-2" />
        <StatItem label="Votos recibidos" value={safeVotosRecibidos} />
        <View className="w-px h-10 bg-[#1F2933] mx-2" />
        <StatItem label="Votos realizados" value={safeVotosRealizados} />
      </View>
    </View>
  );
};

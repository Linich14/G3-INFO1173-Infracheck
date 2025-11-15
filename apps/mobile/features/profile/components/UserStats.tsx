import React from 'react';
import { View, Text } from 'react-native';
import { useLanguage } from '~/contexts/LanguageContext';

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

  const { t } = useLanguage();

  return (
    <View className="mx-4 mt-4 mb-2 rounded-2xl bg-[#1D212D] px-4 py-5 border border-[#1F2933]">
      <Text className="text-gray-300 text-xs font-semibold mb-3 uppercase tracking-wide">
        {t('statsTitle')}
      </Text>
      <View className="flex-row items-stretch">
        <StatItem label={t('statsReportsCreated')} value={safeReportesCreados} />
        <View className="w-px h-10 bg-[#111827] mx-2" />
        <StatItem label={t('statsReportsFollowed')} value={safeReportesSeguidos} />
        <View className="w-px h-10 bg-[#111827] mx-2" />
        <StatItem label={t('statsVotesReceived')} value={safeVotosRecibidos} />
        <View className="w-px h-10 bg-[#111827] mx-2" />
        <StatItem label={t('statsVotesMade')} value={safeVotosRealizados} />
      </View>
    </View>
  );
};

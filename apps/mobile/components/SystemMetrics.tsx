import React from 'react';
import { View, Text } from 'react-native';
import { Users2, Database, Activity } from 'lucide-react-native';
import { useLanguage } from '~/contexts/LanguageContext';

interface SystemMetricsProps {
  title?: string;
  showContainer?: boolean;
  marginBottom?: boolean;
}

export function SystemMetrics({ 
  title,
  showContainer = true,
  marginBottom = false
}: SystemMetricsProps) {
  const { t } = useLanguage();
  const displayTitle = title || t('systemMetricsTitle');
  
  const MetricsContent = () => (
    <>
      {displayTitle && (
        <Text className="text-white text-xl font-bold mb-4">{displayTitle}</Text>
      )}
      
      <View className="flex-row justify-between mb-4">
        <View className="items-center flex-1">
          <Users2 size={32} color="#4ECDC4" />
          <Text className="text-white text-lg font-bold mt-2">1,247</Text>
          <Text className="text-gray-400 text-sm text-center">{t('metricsUsers')}</Text>
        </View>
        
        <View className="items-center flex-1">
          <Database size={32} color="#45B7D1" />
          <Text className="text-white text-lg font-bold mt-2">5,632</Text>
          <Text className="text-gray-400 text-sm text-center">{t('metricsReports')}</Text>
        </View>
        
        <View className="items-center flex-1">
          <Activity size={32} color="#96CEB4" />
          <Text className="text-white text-lg font-bold mt-2">98.5%</Text>
          <Text className="text-gray-400 text-sm text-center">{t('metricsUptime')}</Text>
        </View>
      </View>
    </>
  );

  if (showContainer) {
    return (
      <View className={`bg-[#13161E] rounded-[12px] p-4 ${marginBottom ? 'mb-4' : ''}`}>
        <MetricsContent />
      </View>
    );
  }

  return <MetricsContent />;
}
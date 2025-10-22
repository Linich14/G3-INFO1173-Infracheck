import React from 'react';
import { View, Text } from 'react-native';
import { Users2, Database, Activity } from 'lucide-react-native';

interface SystemMetricsProps {
  title?: string;
  showContainer?: boolean;
  marginBottom?: boolean;
}

export function SystemMetrics({ 
  title = "Métricas del Sistema", 
  showContainer = true,
  marginBottom = false
}: SystemMetricsProps) {
  const MetricsContent = () => (
    <>
      {title && (
        <Text className="text-white text-xl font-bold mb-4">{title}</Text>
      )}
      
      <View className="flex-row justify-between mb-4">
        <View className="items-center flex-1">
          <Users2 size={32} color="#4ECDC4" />
          <Text className="text-white text-lg font-bold mt-2">1,247</Text>
          <Text className="text-gray-400 text-sm text-center">Usuarios</Text>
        </View>
        
        <View className="items-center flex-1">
          <Database size={32} color="#45B7D1" />
          <Text className="text-white text-lg font-bold mt-2">5,632</Text>
          <Text className="text-gray-400 text-sm text-center">Reportes</Text>
        </View>
        
        <View className="items-center flex-1">
          <Activity size={32} color="#96CEB4" />
          <Text className="text-white text-lg font-bold mt-2">98.5%</Text>
          <Text className="text-gray-400 text-sm text-center">Uptime</Text>
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
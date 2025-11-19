import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Users2, Database } from 'lucide-react-native';
import { useLanguage } from '~/contexts/LanguageContext';
import { getAdminStats, AdminStats } from '~/services/adminService';

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
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error loading admin stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const MetricsContent = () => (
    <>
      {displayTitle && (
        <Text className="text-white text-xl font-bold mb-4">{displayTitle}</Text>
      )}
      
      {loading ? (
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color="#537CF2" />
        </View>
      ) : error ? (
        <View className="py-4">
          <Text className="text-red-400 text-center">{error}</Text>
        </View>
      ) : (
        <View className="flex-row justify-around mb-4">
          <View className="items-center flex-1">
            <Users2 size={32} color="#4ECDC4" />
            <Text className="text-white text-lg font-bold mt-2">
              {stats?.total_users?.toLocaleString() || '0'}
            </Text>
            <Text className="text-gray-400 text-sm text-center">{t('metricsUsers')}</Text>
          </View>
          
          <View className="items-center flex-1">
            <Database size={32} color="#45B7D1" />
            <Text className="text-white text-lg font-bold mt-2">
              {stats?.total_reports?.toLocaleString() || '0'}
            </Text>
            <Text className="text-gray-400 text-sm text-center">{t('metricsReports')}</Text>
          </View>
        </View>
      )}
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
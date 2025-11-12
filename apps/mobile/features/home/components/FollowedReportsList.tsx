import React, { useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { useFollowedReports } from '~/features/posts/hooks/useFollowedReports';
import FollowedReportCard from './FollowedReportCard';
import EmptyFollowedReports from './EmptyFollowedReports';
import FollowedReportsPlaceholder from './FollowedReportsPlaceholder';

interface FollowedReportsListProps {
  onSwitchToAll?: () => void;
}

const FollowedReportsList: React.FC<FollowedReportsListProps> = ({ onSwitchToAll }) => {
  const { followedReports, count, isLoading, error, refresh } = useFollowedReports();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  if (isLoading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-[#13161E]">
        <ActivityIndicator size="large" color="#537CF2" />
        <Text className="text-gray-400 mt-4">Cargando reportes seguidos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-[#13161E] px-6">
        <View className="items-center mb-6">
          <View className="h-20 w-20 rounded-full bg-red-500/20 items-center justify-center mb-4">
            <AlertCircle size={40} color="#EF4444" />
          </View>
          <Text className="text-red-400 text-center text-lg font-semibold mb-2">
            Error al cargar reportes
          </Text>
          <Text className="text-gray-400 text-center mb-6">{error}</Text>
        </View>
        <TouchableOpacity
          className="bg-[#537CF2] px-6 py-3 rounded-full active:opacity-80"
          onPress={refresh}
        >
          <Text className="text-white font-semibold">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (followedReports.length === 0) {
    return <EmptyFollowedReports onExplore={onSwitchToAll} />;
  }

  return (
    <FlatList
      data={followedReports}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <FollowedReportCard
          id={item.reporte.id}
          titulo={item.reporte.titulo}
          descripcion={item.reporte.descripcion || ''}
          urgencia={item.reporte.urgencia.valor}
          estado={item.reporte.estado}
          categoria={item.reporte.categoria || ''}
          fecha_creacion={item.fecha_seguimiento}
          usuario_nombre={item.reporte.usuario?.nickname || 'Usuario'}
          onUnfollow={async (id) => {
            await refresh();
            return true;
          }}
        />
      )}
      contentContainerStyle={{
        padding: 16,
        backgroundColor: '#13161E'
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#537CF2"
          colors={['#537CF2']}
        />
      }
    />
  );
};

export default FollowedReportsList;

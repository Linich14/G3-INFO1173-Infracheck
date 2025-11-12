import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart } from 'lucide-react-native';
import ReportCard from '../../posts/components/ReportCard';
import { ReportService } from '../services/reportService';
import { useFocusEffect } from '@react-navigation/native';

interface Report {
  id: string;
  denu_titulo: string;
  denu_descripcion: string;
  denu_fecha_creacion: string;
  denu_estado: string;
  denu_imagen?: string;
  usuario: {
    usua_id: number;
    usua_nickname: string;
  };
  votos_count: number;
  comentarios_count: number;
  votos?: {
    count: number;
    usuario_ha_votado: boolean;
  };
}

const FollowedReportsScreen: React.FC = () => {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadReports = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
    if (pageNum === 1) {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await ReportService.getFollowedReports(pageNum, 10);
      
      if (pageNum === 1) {
        setReports(response.results);
      } else {
        setReports(prev => [...prev, ...response.results]);
      }
      
      // Verificar si hay más páginas
      const totalPages = Math.ceil(response.count / 10);
      setHasMore(pageNum < totalPages);
      setPage(pageNum);
    } catch (err: any) {
      console.error('Error al cargar reportes seguidos:', err);
      setError(err?.response?.data?.detail || 'Error al cargar los reportes');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReports(1);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleRefresh = useCallback(() => {
    loadReports(1, true);
  }, [loadReports]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      loadReports(page + 1);
    }
  }, [loadingMore, hasMore, loading, page, loadReports]);

  const handleUnfollow = useCallback((reportId: string, reportTitle: string) => {
    Alert.alert(
      'Dejar de seguir',
      `¿Estás seguro que deseas dejar de seguir "${reportTitle}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Dejar de seguir',
          style: 'destructive',
          onPress: async () => {
            try {
              // Actualización optimista: remover del estado inmediatamente
              setReports(prev => prev.filter(r => r.id !== reportId));
              
              // Llamar al servicio para hacer unfollow
              await ReportService.unfollowReport(reportId);
            } catch (err: any) {
              console.error('Error al dejar de seguir:', err);
              // Si falla, recargar la lista
              loadReports(1);
              Alert.alert('Error', 'No se pudo dejar de seguir el reporte');
            }
          },
        },
      ]
    );
  }, [loadReports]);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  const renderReport = ({ item }: { item: Report }) => (
    <View className="mb-3">
      <ReportCard
        id={item.id}
        title={item.denu_titulo}
        author={item.usuario?.usua_nickname || 'Usuario desconocido'}
        timeAgo={formatTimeAgo(item.denu_fecha_creacion)}
        image={item.denu_imagen ? { uri: item.denu_imagen } : null}
        upvotes={item.votos_count || 0}
        isFollowed={true}
        followLabel="Dejar de seguir"
        initialVoteCount={item.votos?.count}
        initialUserHasVoted={item.votos?.usuario_ha_votado}
        onFollow={() => handleUnfollow(item.id, item.denu_titulo)}
        onUpvote={() => {
          // Implementar lógica de votar si es necesario
          console.log('Votar reporte:', item.id);
        }}
        onComment={() => {
          router.push(`/report/${item.id}`);
        }}
        onShare={() => {
          // Implementar lógica de compartir si es necesario
          console.log('Compartir reporte:', item.id);
        }}
        onLocation={() => {
          // Implementar lógica de ubicación si es necesario
          console.log('Ver ubicación:', item.id);
        }}
      />
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#537CF2" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View className="flex-1 justify-center items-center py-20">
        <Heart size={64} color="#4B5563" />
        <Text className="text-gray-400 text-lg mt-4 text-center px-8">
          No sigues ningún reporte aún
        </Text>
        <Text className="text-gray-500 text-sm mt-2 text-center px-8">
          Comienza a seguir reportes para verlos aquí
        </Text>
      </View>
    );
  };

  if (loading && reports.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#090A0D]">
        <View className="bg-[#13161E] flex-row justify-between items-center p-4">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={26} color="white" />
          </TouchableOpacity>
          
          <Text className="text-[#537CF2] font-bold text-2xl">Reportes Seguidos</Text>
          
          <View className="w-[26px]" />
        </View>

        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#537CF2" />
          <Text className="text-white mt-4">Cargando reportes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#090A0D]">
      <View className="bg-[#13161E] flex-row justify-between items-center p-4">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={26} color="white" />
        </TouchableOpacity>
        
        <Text className="text-[#537CF2] font-bold text-2xl">Reportes Seguidos</Text>
        
        <View className="w-[26px]" />
      </View>

      {error && (
        <View className="bg-red-500/20 border border-red-500 mx-4 mt-4 p-4 rounded-lg">
          <Text className="text-red-500 text-center">{error}</Text>
        </View>
      )}

      <FlatList
        data={reports}
        renderItem={renderReport}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
};

export default FollowedReportsScreen;

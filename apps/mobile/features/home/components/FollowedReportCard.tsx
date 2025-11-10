import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { UserCircle2, Clock, AlertCircle, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface FollowedReportCardProps {
  id: number;
  titulo: string;
  descripcion: string;
  urgencia: number;
  estado: string;
  categoria: string;
  fecha_creacion: string;
  usuario_nombre: string;
  onUnfollow: (id: number) => Promise<boolean>;
}

const FollowedReportCard: React.FC<FollowedReportCardProps> = ({
  id,
  titulo,
  descripcion,
  urgencia,
  estado,
  categoria,
  fecha_creacion,
  usuario_nombre,
  onUnfollow
}) => {
  const router = useRouter();

  const getUrgencyLabel = (level: number): string => {
    const labels = { 1: 'Baja', 2: 'Media', 3: 'Alta', 4: 'Crítica' };
    return labels[level as keyof typeof labels] || 'Desconocida';
  };

  const getUrgencyColor = (level: number): string => {
    const colors = {
      1: '#10B981', // Verde
      2: '#F59E0B', // Amarillo
      3: '#EF4444', // Rojo
      4: '#DC2626'  // Rojo oscuro
    };
    return colors[level as keyof typeof colors] || '#6B7280';
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'Nuevo': '#3B82F6',
      'En Proceso': '#F59E0B',
      'Resuelto': '#10B981',
      'Rechazado': '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  const handleUnfollow = () => {
    Alert.alert(
      'Dejar de seguir',
      '¿Estás seguro que deseas dejar de seguir este reporte?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Dejar de seguir',
          style: 'destructive',
          onPress: async () => {
            const success = await onUnfollow(id);
            if (!success) {
              Alert.alert('Error', 'No se pudo dejar de seguir el reporte');
            }
          }
        }
      ]
    );
  };

  const goToDetail = () => {
    router.push(`/report/${id}`);
  };

  return (
    <TouchableOpacity
      className="overflow-hidden rounded-xl bg-[#1D212D] p-4 mb-3 active:opacity-90"
      onPress={goToDetail}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1 gap-2">
          <UserCircle2 size={24} color="#537CF2" />
          <Text className="text-white text-base font-medium flex-1" numberOfLines={1}>
            {usuario_nombre}
          </Text>
        </View>

        <TouchableOpacity
          className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-red-500/20 active:bg-red-500/30"
          onPress={(e) => {
            e.stopPropagation();
            handleUnfollow();
          }}
        >
          <X size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Título */}
      <Text className="text-white text-lg font-semibold mb-2" numberOfLines={2}>
        {titulo}
      </Text>

      {/* Descripción */}
      <Text className="text-gray-400 text-sm mb-3" numberOfLines={2}>
        {descripcion}
      </Text>

      {/* Footer: Estado, Urgencia, Categoría, Fecha */}
      <View className="flex-row items-center justify-between flex-wrap gap-2">
        {/* Estado */}
        <View
          className="flex-row items-center px-3 py-1 rounded-full"
          style={{ backgroundColor: `${getStatusColor(estado)}20` }}
        >
          <View
            className="h-2 w-2 rounded-full mr-2"
            style={{ backgroundColor: getStatusColor(estado) }}
          />
          <Text className="text-xs font-medium" style={{ color: getStatusColor(estado) }}>
            {estado}
          </Text>
        </View>

        {/* Urgencia */}
        <View
          className="flex-row items-center px-3 py-1 rounded-full"
          style={{ backgroundColor: `${getUrgencyColor(urgencia)}20` }}
        >
          <AlertCircle size={12} color={getUrgencyColor(urgencia)} />
          <Text className="text-xs font-medium ml-1" style={{ color: getUrgencyColor(urgencia) }}>
            {getUrgencyLabel(urgencia)}
          </Text>
        </View>

        {/* Fecha */}
        <View className="flex-row items-center px-3 py-1 rounded-full bg-[#13161E]">
          <Clock size={12} color="#9CA3AF" />
          <Text className="text-xs font-medium ml-1 text-gray-400">
            {formatDate(fecha_creacion)}
          </Text>
        </View>
      </View>

      {/* Categoría */}
      <View className="mt-2">
        <Text className="text-xs text-gray-500">
          Categoría: <Text className="text-gray-400 font-medium">{categoria}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default FollowedReportCard;

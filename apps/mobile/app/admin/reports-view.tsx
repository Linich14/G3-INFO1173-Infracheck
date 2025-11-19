import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Shield } from 'lucide-react-native';
import { useAuth } from '~/contexts/AuthContext';
import ReportCard from '~/features/posts/components/ReportCard';
import { useReportsList } from '~/features/report/hooks/useReportsList';
import { CommentsModal, Report } from '~/features/comments';

/**
 * Vista de moderación de reportes para administradores
 * Esta es una pantalla completamente independiente y segura
 * Solo accesible para usuarios con rol de administrador
 */
export default function AdminReportsView() {
  const { userRole } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Hook para obtener la lista de reportes
  const {
    reports,
    loading,
    refreshing,
    refresh,
  } = useReportsList();

  // Verificación de seguridad: solo administradores
  useEffect(() => {
    const checkAdminAccess = () => {
      const adminAccess = userRole?.rous_nombre?.toLowerCase().includes('admin') ?? false;
      setIsAdmin(adminAccess);
      
      if (!adminAccess) {
        Alert.alert(
          'Acceso Denegado',
          'No tienes permisos para acceder a esta sección',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    };

    checkAdminAccess();
  }, [userRole]);

  const handleRefresh = async () => {
    await refresh();
  };

  const openCommentsModal = (report: any) => {
    setSelectedReport(report);
    setCommentsModalVisible(true);
  };

  const closeCommentsModal = () => {
    setCommentsModalVisible(false);
    setSelectedReport(null);
  };

  // Si no es admin, no renderizar nada (ya se mostró el alert)
  if (!isAdmin) {
    return (
      <SafeAreaView className="flex-1 bg-[#090A0D]">
        <View className="flex-1 justify-center items-center">
          <Shield size={64} color="#ef4444" />
          <Text className="text-white text-xl mt-4">Acceso Denegado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#090A0D]">
      {/* Header */}
      <View className="bg-[#14161F] px-4 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color="#537CF2" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-2xl font-bold">Moderación de Reportes</Text>
            <Text className="text-gray-400 text-sm mt-1">
              Vista de administrador - {reports.length} reportes
            </Text>
          </View>
        </View>
        <Shield size={24} color="#537CF2" />
      </View>

      {/* Aviso de moderación */}
      <View className="bg-[#537CF2]/10 border-l-4 border-[#537CF2] mx-4 mt-4 p-3 rounded">
        <Text className="text-[#537CF2] font-semibold">Modo Administrador</Text>
        <Text className="text-gray-300 text-sm mt-1">
          Puedes eliminar cualquier reporte o comentario. Los cambios son permanentes.
        </Text>
      </View>

      {/* Lista de reportes */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#537CF2" />
          <Text className="text-gray-400 mt-4">Cargando reportes...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#537CF2"
            />
          }
        >
          {reports.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-gray-400 text-lg">No hay reportes disponibles</Text>
            </View>
          ) : (
            reports.map((report) => (
              <View key={report.id} className="mb-4">
                <ReportCard
                  id={report.id}
                  title={report.title}
                  author={report.author || 'Usuario'}
                  authorId={report.authorId}
                  timeAgo={report.timeAgo || 'Hace un momento'}
                  image={report.image}
                  votos={report.votos}
                  seguimiento={report.seguimiento}
                  ubicacion={report.ubicacion}
                  commentsCount={report.commentsCount || 0}
                  onComment={() => openCommentsModal(report)}
                  onShare={() => {}}
                  onFollow={() => {}}
                  onMore={() => {}}
                  onLocation={() => {}}
                  onUpvote={() => {}}
                />
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Modal de comentarios */}
      {selectedReport && (
        <CommentsModal
          visible={commentsModalVisible}
          onClose={closeCommentsModal}
          postTitle={selectedReport.title || 'Reporte'}
          reportId={selectedReport.id}
          comments={selectedReport.comments || []}
          onAddComment={async () => {
            await refresh();
          }}
          onRefreshComments={() => {
            refresh();
          }}
        />
      )}
    </SafeAreaView>
  );
}

import React, { useState } from "react";
import { ScrollView, RefreshControl, View, Text, TouchableOpacity, Modal, Share, Alert } from "react-native";
import { ReportCard } from "~/features/posts";
import { CommentsModal, Comment, Report } from "~/features/comments";
import { SearchModal } from "~/features/search";
import { X, MapPin, Check } from "lucide-react-native";

interface ClientContentProps {
  reports: Report[];
  onCommentPress: (report: Report) => void;
  insets: any;
  refreshing: boolean;
  onRefresh: () => void;
  selectedReport: Report | null;
  commentsModalVisible: boolean;
  onCloseCommentsModal: () => void;
  onAddComment: (content: string) => void;
  searchModalVisible: boolean;
  onCloseSearchModal: () => void;
  onSelectReport: (report: Report) => void;
}

export default function ClientContent({
  reports,
  onCommentPress,
  insets,
  refreshing,
  onRefresh,
  selectedReport,
  commentsModalVisible,
  onCloseCommentsModal,
  onAddComment,
  searchModalVisible,
  onCloseSearchModal,
  onSelectReport,
}: ClientContentProps) {
  // Estados para manejar las interacciones
  const [upvotedReports, setUpvotedReports] = useState<Set<string>>(new Set());
  const [followedReports, setFollowedReports] = useState<Set<string>>(new Set());
  const [reportUpvotes, setReportUpvotes] = useState<{ [key: string]: number }>({});
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  // Inicializar upvotes locales basados en los datos originales
  React.useEffect(() => {
    const initialUpvotes: { [key: string]: number } = {};
    reports.forEach(report => {
      initialUpvotes[report.id] = report.upvotes;
    });
    setReportUpvotes(initialUpvotes);
  }, [reports]);

  // Función para manejar upvote
  const handleUpvote = (reportId: string) => {
    if (!upvotedReports.has(reportId)) {
      setUpvotedReports(prev => new Set(prev).add(reportId));
      setReportUpvotes(prev => ({
        ...prev,
        [reportId]: (prev[reportId] || 0) + 1
      }));
    }
  };

  // Función para manejar follow
  const handleFollow = (reportId: string) => {
    setFollowedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  // Función para mostrar ubicación
  const handleLocation = (reportId: string) => {
    // Datos falsos de ubicación para demostración
    const fakeLocation = {
      latitude: -36.8485 + Math.random() * 0.01,
      longitude: -73.0524 + Math.random() * 0.01,
      address: "Av. O'Higgins 123, Concepción"
    };
    setSelectedLocation(fakeLocation);
    setLocationModalVisible(true);
  };

  // Función para compartir
  const handleShare = async (reportTitle: string, reportId: string) => {
    try {
      await Share.share({
        message: `Mira este reporte: "${reportTitle}" - ID: ${reportId}`,
        title: 'Compartir Reporte'
      });
    } catch (error) {
      console.log('Error al compartir:', error);
    }
  };

  // Función para reportar (más opciones)
  const handleMore = (reportTitle: string) => {
    Alert.alert(
      "Reportar Contenido",
      `¿Quieres reportar el contenido "${reportTitle}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Reportar",
          style: "destructive",
          onPress: () => {
            Alert.alert("Reportado", "El contenido ha sido reportado exitosamente.");
          }
        }
      ]
    );
  };

  return (
    <>
      <ScrollView
        className="mt-4 px-4"
        contentContainerStyle={{ gap: 16, paddingBottom: insets.bottom + 12 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#537CF2"
            colors={['#537CF2']}
            progressBackgroundColor="#13161E"
          />
        }
      >
        {reports.map((report) => {
          const isFollowed = followedReports.has(report.id);
          const isUpvoted = upvotedReports.has(report.id);
          const currentUpvotes = reportUpvotes[report.id] || report.upvotes;
          
          return (
            <ReportCard
              id={report.id}
              key={report.id}
              title={report.title}
              author={report.author}
              timeAgo={report.timeAgo}
              image={report.image}
              upvotes={currentUpvotes}
              followLabel={isFollowed ? "Siguiendo ✓" : "Seguir"}
              isFollowed={isFollowed}
              isUpvoted={isUpvoted}
              onComment={() => onCommentPress(report)}
              onFollow={() => handleFollow(report.id)}
              onMore={() => handleMore(report.title)}
              onLocation={() => handleLocation(report.id)}
              onUpvote={() => handleUpvote(report.id)}
              onShare={() => handleShare(report.title, report.id)}
            />
          );
        })}
      </ScrollView>

      {/* Modal de Ubicación */}
      <Modal
        visible={locationModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-[#13161E] rounded-t-xl p-6 max-h-[70%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-bold">Ubicación del Reporte</Text>
              <TouchableOpacity
                onPress={() => setLocationModalVisible(false)}
                className="p-2"
              >
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>

            {selectedLocation && (
              <>
                <View className="bg-[#1D212D] rounded-lg p-4 mb-4">
                  <View className="flex-row items-center mb-3">
                    <MapPin size={20} color="#537CF2" />
                    <Text className="text-white text-lg font-semibold ml-2">Dirección</Text>
                  </View>
                  <Text className="text-gray-300 text-base mb-3">{selectedLocation.address}</Text>
                  
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-gray-400 text-sm">Latitud</Text>
                      <Text className="text-white text-base">{selectedLocation.latitude.toFixed(6)}</Text>
                    </View>
                    <View>
                      <Text className="text-gray-400 text-sm">Longitud</Text>
                      <Text className="text-white text-base">{selectedLocation.longitude.toFixed(6)}</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  className="bg-[#537CF2] rounded-lg py-4 items-center"
                  onPress={() => {
                    Alert.alert("Navegación", "Abriendo en Google Maps...");
                    setLocationModalVisible(false);
                  }}
                >
                  <Text className="text-white text-base font-semibold">Ver en Mapa</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {selectedReport && (
        <CommentsModal
          visible={commentsModalVisible}
          onClose={onCloseCommentsModal}
          postTitle={selectedReport.title}
          comments={selectedReport.comments}
          onAddComment={onAddComment}
        />
      )}

      <SearchModal
        visible={searchModalVisible}
        onClose={onCloseSearchModal}
        reports={reports}
        onSelectReport={onSelectReport}
      />
    </>
  );
}
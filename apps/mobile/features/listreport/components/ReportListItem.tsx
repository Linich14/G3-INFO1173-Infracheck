import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportListItem, ReportStatus, UrgencyLevel } from '../types';

interface ReportListItemProps {
  report: ReportListItem;
  onPress: (report: ReportListItem) => void;
  onShare?: (report: ReportListItem) => void;
}

const getStatusColor = (estado: ReportStatus): string => {
  switch (estado) {
    case 'Nuevo':
      return 'bg-blue-600';
    case 'En proceso':
      return 'bg-yellow-600';
    case 'Resuelto':
      return 'bg-green-600';
    case 'Rechazado':
      return 'bg-red-600';
    case 'Cancelado':
      return 'bg-gray-600';
    default:
      return 'bg-gray-600';
  }
};

const getUrgencyColor = (urgencia: UrgencyLevel): string => {
  switch (urgencia) {
    case 'Crítico':
      return '#ef4444'; // red-500
    case 'Alto':
      return '#f97316'; // orange-500
    case 'Medio':
      return '#eab308'; // yellow-500
    case 'Bajo':
      return '#22c55e'; // green-500
    default:
      return '#6b7280'; // gray-500
  }
};

const getUrgencyIcon = (urgencia: UrgencyLevel): keyof typeof Ionicons.glyphMap => {
  switch (urgencia) {
    case 'Crítico':
      return 'alert-circle';
    case 'Alto':
      return 'warning';
    case 'Medio':
      return 'information-circle';
    case 'Bajo':
      return 'checkmark-circle';
    default:
      return 'help-circle';
  }
};

export default function ReportListItemComponent({ report, onPress, onShare }: ReportListItemProps) {
  return (
    <TouchableOpacity
      className="mb-3 rounded-xl bg-[#13161E] p-4 shadow-sm"
      onPress={() => onPress(report)}
      activeOpacity={0.7}
    >
      {/* Header con título y estado */}
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-lg font-semibold text-white" numberOfLines={2}>
            {report.titulo}
          </Text>
        </View>
        <View className="flex-shrink-0">
          <View className={`rounded-md px-2 py-1 ${getStatusColor(report.estado)}`}>
            <Text className="text-xs font-medium text-white">{report.estado}</Text>
          </View>
        </View>
      </View>

      {/* Descripción corta */}
      <Text className="mb-3 text-sm leading-5 text-gray-300" numberOfLines={2}>
        {report.descripcionCorta}
      </Text>

      {/* Información del reporte */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="person" size={14} color="#9CA3AF" />
          <Text className="ml-1 text-xs text-gray-400">{report.autor}</Text>
          <Text className="ml-3 text-xs text-gray-400">•</Text>
          <Text className="ml-3 text-xs text-gray-400">{report.fechaRelativa}</Text>
        </View>

        {/* Nivel de urgencia */}
        <View className="flex-row items-center">
          <Ionicons
            name={getUrgencyIcon(report.nivelUrgencia)}
            size={14}
            color={getUrgencyColor(report.nivelUrgencia)}
          />
          <Text
            className="ml-1 text-xs font-medium"
            style={{ color: getUrgencyColor(report.nivelUrgencia) }}
          >
            {report.nivelUrgencia}
          </Text>
        </View>
      </View>

      {/* Footer con tipo, ubicación y acciones */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="mb-2 flex-row items-center">
            <Ionicons name="list" size={12} color="#537CF2" />
            <Text className="ml-1 text-xs text-blue-400">{report.tipoDenuncia}</Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="location" size={12} color="#9CA3AF" />
            <Text className="ml-1 text-xs text-gray-400" numberOfLines={1}>
              {report.ubicacion}
            </Text>
          </View>
        </View>

        {/* Acciones */}
        <View className="flex-row items-center">
          {report.votos !== undefined && (
            <View className="mr-3 flex-row items-center">
              <Ionicons name="thumbs-up" size={12} color="#9CA3AF" />
              <Text className="ml-1 text-xs text-gray-400">{report.votos}</Text>
            </View>
          )}

          {onShare && (
            <TouchableOpacity
              className="rounded-full bg-[#1D212D] p-2"
              onPress={(e) => {
                e.stopPropagation();
                onShare(report);
              }}
            >
              <Ionicons name="share-outline" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Imagen preview si existe */}
      {report.imagenPreview && (
        <View className="mt-3 overflow-hidden rounded-lg">
          <Image
            source={{ uri: report.imagenPreview }}
            className="h-20 w-full"
            resizeMode="cover"
          />
        </View>
      )}
    </TouchableOpacity>
  );
}
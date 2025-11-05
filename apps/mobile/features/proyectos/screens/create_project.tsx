import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useReports } from '../../listreport/hooks/useReports';
import { ReportListItem } from '../../listreport/types';

interface Denuncia {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  usuario: string;
  votos: number;
  ubicacion: string;
  tipoDenuncia: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  fotos?: string[];
}

interface CreateProjectProps {
  denunciaSeleccionada?: Denuncia;
  onBack?: () => void;
  onProjectCreated?: (project: any) => void;
}

interface FormData {
  nombreProyecto: string;
  descripcion: string;
  prioridadProyecto: 'Alta' | 'Media' | 'Baja';
  fechaInicioEstimada: Date | null;
}

const mapUrgencyToPriority = (urgencia: string): 'Alta' | 'Media' | 'Baja' => {
  if (urgencia === 'Crítico' || urgencia === 'Alto') return 'Alta';
  if (urgencia === 'Medio') return 'Media';
  return 'Baja';
};

const transformReportToDenuncia = (report: ReportListItem): Denuncia => {
  return {
    id: parseInt(report.id),
    titulo: report.titulo,
    descripcion: report.descripcion,
    fecha: report.fecha,
    usuario: report.autor,
    votos: report.votos || 0,
    ubicacion: report.ubicacion,
    tipoDenuncia: report.tipoDenuncia,
    prioridad: mapUrgencyToPriority(report.nivelUrgencia),
    fotos: report.imagenPreview ? [report.imagenPreview] : [],
  };
};

export default function CreateProjectScreen({
  denunciaSeleccionada,
  onBack,
  onProjectCreated,
}: CreateProjectProps) {
  const { allResults, loading, error, refresh } = useReports({ 
    limit: 100,
    autoLoad: true,
  });

  const [denunciasDisponibles, setDenunciasDisponibles] = useState<Denuncia[]>([]);

  useEffect(() => {
    if (allResults.length > 0) {
      const transformed = allResults.map(transformReportToDenuncia);
      setDenunciasDisponibles(transformed);
    }
  }, [allResults]);
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/(tabs)/home');
    }
  };

  const [denunciaSelected, setDenunciaSelected] = useState<Denuncia | null>(
    denunciaSeleccionada || null
  );

  const [showDenunciaSelector, setShowDenunciaSelector] = useState(!denunciaSeleccionada);

  const [formData, setFormData] = useState<FormData>({
    nombreProyecto: '',
    descripcion: '',
    prioridadProyecto: 'Media',
    fechaInicioEstimada: null,
  });

  // Estado para mostrar/ocultar el selector de fecha
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ==================== FUNCIONES DE MANEJO ====================

  /**
   * Maneja la selección/deselección de denuncias
   * Implementa toggle: si ya está seleccionada la quita, si no la agrega
   * @param denuncia - La denuncia a seleccionar o deseleccionar
   */

  const handleSelectDenuncia = (denuncia: Denuncia) => {
    setDenunciaSelected(denunciaSelected?.id === denuncia.id ? null : denuncia);
  };

  // Función para manejar cambio de fecha
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.fechaInicioEstimada;
    setShowDatePicker(Platform.OS === 'ios'); // En iOS mantiene el picker abierto
    setFormData((prev) => ({ ...prev, fechaInicioEstimada: currentDate }));
  };

  // Función para mostrar el selector de fecha
  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  // Función para formatear fecha para mostrar
  const formatDate = (date: Date | null): string => {
    if (!date) return 'Seleccionar fecha';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  /**
   * Función principal para crear el proyecto
   * Realiza validaciones completas antes de proceder
   * Crea el objeto proyecto y notifica al componente padre
   */
  const handleCreateProject = () => {
    // ==================== VALIDACIONES ====================

    // Validación 1: Debe haber una denuncia seleccionada
    if (!denunciaSelected) {
      Alert.alert('Error', 'Debe seleccionar una denuncia para crear el proyecto');
      return;
    }

    // Validación 2: El nombre del proyecto es obligatorio
    if (!formData.nombreProyecto.trim()) {
      Alert.alert('Error', 'El nombre del proyecto es obligatorio');
      return;
    }

    // Validación 3: La descripción es obligatoria
    if (!formData.descripcion.trim()) {
      Alert.alert('Error', 'La descripción del proyecto es obligatoria');
      return;
    }

    // ==================== CREACIÓN DEL PROYECTO ====================

    /**
     * Construye el objeto proyecto con toda la información recopilada
     * Incluye timestamp único como ID y metadatos de creación
     */
    const nuevoProyecto = {
      id: Date.now(), // ID único basado en timestamp
      nombreProyecto: formData.nombreProyecto,
      descripcion: formData.descripcion,
      tipoDenuncia: denunciaSelected.tipoDenuncia,
      prioridad: formData.prioridadProyecto,
      fechaInicioEstimada: formData.fechaInicioEstimada?.toISOString() || null,
      denunciaAsociada: denunciaSelected, // Denuncia que resuelve este proyecto
      estado: 'Aprobado',
      fechaCreacion: new Date().toISOString(),
      createdBy: 'Administrador Municipal', // Aqui tengo que identificar al usuario
    };

    // ==================== CONFIRMACIÓN Y NAVEGACIÓN ====================

    /**
     * Muestra confirmación al usuario y ejecuta callbacks
     * onProjectCreated: Notifica al componente padre sobre el nuevo proyecto
     * onBack: Navega de regreso a la pantalla anterior
     */

    Alert.alert(
      'Proyecto Creado',
      `El proyecto "${formData.nombreProyecto}" ha sido creado exitosamente`,
      [
        {
          text: 'OK',
          onPress: () => {
            onProjectCreated?.(nuevoProyecto); // Notifica al padre
            handleBack(); // Regresa a la pantalla anterior
          },
        },
      ]
    );
  };

  // ==================== RENDERIZADO CONDICIONAL ====================

  /**
   * PANTALLA 1: SELECTOR DE DENUNCIAS
   * Se muestra cuando el usuario necesita seleccionar denuncias
   * Permite selección múltiple con feedback visual
   */

  if (showDenunciaSelector) {
    return (
      <View className="flex-1 bg-black px-4 pt-10">
        <View className="mb-6 flex-row items-center">
          <TouchableOpacity className="rounded-xl bg-[#537CF2] p-2" onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-bold text-white">Seleccionar Denuncia</Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#537CF2" />
            <Text className="mt-4 text-gray-300">Cargando reportes...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text className="mt-4 text-center text-gray-300">{error}</Text>
            <TouchableOpacity
              className="mt-4 rounded-xl bg-[#537CF2] px-6 py-3"
              onPress={refresh}>
              <Text className="font-bold text-white">Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : denunciasDisponibles.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
            <Text className="mt-4 text-center text-gray-300">
              No hay reportes activos disponibles
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="mb-2 text-gray-300">
              Selecciona la denuncia para la cual quieres crear un proyecto de respuesta:
            </Text>
            <Text className="mb-4 text-sm text-blue-400">
              {denunciaSelected
                ? `Denuncia seleccionada: ${denunciaSelected.titulo}`
                : 'Toca una denuncia para seleccionarla'}
            </Text>

            {denunciaSelected && (
              <TouchableOpacity
                className="mb-4 rounded-xl bg-[#537CF2] p-4"
                onPress={() => setShowDenunciaSelector(false)}>
                <Text className="text-center font-bold text-white">
                  Continuar con denuncia seleccionada
                </Text>
              </TouchableOpacity>
            )}

            {denunciasDisponibles.map((denuncia) => {
              const isSelected = denunciaSelected?.id === denuncia.id;
              return (
                <TouchableOpacity
                  key={denuncia.id}
                  className={`mb-4 rounded-xl p-4 ${
                    isSelected ? 'border-2 border-[#537CF2] bg-[#537CF2]/20' : 'bg-[#1D212D]'
                  }`}
                  onPress={() => handleSelectDenuncia(denuncia)}>
                  <View className="mb-2 flex-row items-start justify-between">
                    <View className="flex-1 flex-row items-center">
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#3B82F6"
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Text className="flex-1 pr-2 text-lg font-semibold text-white">
                        {denuncia.titulo}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="arrow-up" size={16} color="#60A5FA" />
                      <Text className="ml-1 font-semibold text-blue-400">{denuncia.votos}</Text>
                    </View>
                  </View>

                  <Text className="mb-3 text-gray-300">{denuncia.descripcion}</Text>

                  <View className="mb-2 flex-row items-center">
                    <Ionicons name="location" size={14} color="#9CA3AF" />
                    <Text className="ml-2 text-sm text-gray-400">{denuncia.ubicacion}</Text>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="person" size={14} color="#9CA3AF" />
                      <Text className="ml-1 text-sm text-gray-400">{denuncia.usuario}</Text>
                      <Text className="ml-3 text-sm text-gray-400">{denuncia.fecha}</Text>
                    </View>

                    <View className="flex-row">
                      <Text className="rounded px-2 py-1 text-xs text-white">
                        {denuncia.tipoDenuncia}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  }

  // ==================== PANTALLA 2: FORMULARIO DE PROYECTO ====================

  /**
   * PANTALLA PRINCIPAL: FORMULARIO DE CREACIÓN
   * Se muestra después de seleccionar las denuncias
   * Contiene todos los campos necesarios para definir el proyecto municipal
   */
  return (
    <View className="flex-1 bg-black px-4 pt-10">
      {/* Header del formulario */}
      <View className="mb-6 flex-row items-center">
        <TouchableOpacity className="rounded-xl bg-[#537CF2] p-2" onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="ml-4 text-xl font-bold text-white">Crear Proyecto</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* SECCIÓN: Resumen de denuncias seleccionadas */}
        {/* Denuncia Seleccionada */}
        {denunciaSelected && (
          <View className="mb-6 rounded-xl bg-[#13161E] p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-blue-400">Denuncia Seleccionada</Text>
              {/* Botón para modificar la selección */}
              <TouchableOpacity onPress={() => setShowDenunciaSelector(true)}>
                <Text className="text-blue-400">Modificar</Text>
              </TouchableOpacity>
            </View>

            {/* Información de la denuncia seleccionada */}
            <View>
              <Text className="mb-1 font-semibold text-white">{denunciaSelected.titulo}</Text>
              <Text className="mb-2 text-sm text-gray-300">{denunciaSelected.descripcion}</Text>
              <View className="flex-row items-center">
                <Ionicons name="location" size={14} color="#9CA3AF" />
                <Text className="ml-2 text-sm text-gray-400">{denunciaSelected.ubicacion}</Text>
              </View>
            </View>
          </View>
        )}

        {/* SECCIÓN: Formulario principal del proyecto */}

        {/* Formulario de Proyecto */}
        <View className="mb-6 rounded-xl bg-[#13161E] p-4">
          <Text className="mb-4 text-lg font-bold text-blue-400">Información del Proyecto</Text>

          {/* CAMPO: Nombre del Proyecto (Obligatorio) */}
          <View className="mb-4">
            <Text className="mb-2 text-gray-400">Nombre del Proyecto *</Text>
            <TextInput
              className="rounded-lg bg-[#1D212D] p-3 text-white"
              placeholder="Ej: Reparación de bache en Av. Alemania"
              placeholderTextColor="#9CA3AF"
              value={formData.nombreProyecto}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, nombreProyecto: text }))}
            />
          </View>

          {/* CAMPO: Descripción del Proyecto (Obligatorio) */}
          <View className="mb-4">
            <Text className="mb-2 text-gray-400">Descripción del Proyecto *</Text>
            <TextInput
              className="rounded-lg bg-[#1D212D] p-3 text-white"
              placeholder="Describe detalladamente el proyecto y cómo resolverá la denuncia..."
              placeholderTextColor="#9CA3AF"
              value={formData.descripcion}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, descripcion: text }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* CAMPO: Prioridad del Proyecto con botones de selección */}
          <View className="mb-4">
            <Text className="mb-2 text-gray-400">Prioridad del Proyecto</Text>
            <View className="flex-row">
              {['Alta', 'Media', 'Baja'].map((prioridad) => (
                <TouchableOpacity
                  key={prioridad}
                  className={`mr-2 rounded-lg px-4 py-2 ${
                    formData.prioridadProyecto === prioridad
                      ? prioridad === 'Alta'
                        ? 'bg-red-600' // Rojo para alta prioridad
                        : prioridad === 'Media'
                          ? 'bg-yellow-600' // Amarillo para media prioridad
                          : 'bg-blue-600' // Azul para baja prioridad
                      : 'bg-[#1D212D]' // Gris para no seleccionado
                  }`}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      prioridadProyecto: prioridad as any,
                    }))
                  }>
                  <Text className="text-sm text-white">{prioridad}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* CAMPO: Fecha de inicio estimada */}
          <View className="mb-4">
            <Text className="mb-2 text-gray-400">Fecha de Inicio Estimada</Text>
            <TouchableOpacity
              className="flex-row items-center justify-between rounded-lg bg-[#1D212D] p-3"
              onPress={showDatepicker}>
              <Text className={`${formData.fechaInicioEstimada ? 'text-white' : 'text-gray-400'}`}>
                {formatDate(formData.fechaInicioEstimada)}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={formData.fechaInicioEstimada || new Date()}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()} // No permitir fechas pasadas
              />
            )}
          </View>
        </View>

        {/* SECCIÓN: Botones de acción del formulario */}

        {/* Botones de Acción */}
        <View className="mb-6 flex-row">
          {/* Botón Cancelar - Regresa sin guardar cambios */}
          <TouchableOpacity className="mr-3 flex-1 rounded-lg bg-[#1D212D] p-4" onPress={handleBack}>
            <Text className="text-center font-semibold text-white">Cancelar</Text>
          </TouchableOpacity>

          {/* Botón Crear Proyecto - Ejecuta validaciones y crea el proyecto */}
          <TouchableOpacity
            className="flex-1 rounded-lg bg-[#537CF2] p-4"
            onPress={handleCreateProject}>
            <Text className="text-center font-semibold text-white">Crear Proyecto</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

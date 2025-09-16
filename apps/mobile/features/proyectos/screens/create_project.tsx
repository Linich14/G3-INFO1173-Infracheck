import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

// ==================== INTERFACES Y TIPOS ====================

/**
 * Interface que define la estructura de una denuncia ciudadana
 * Esta representa los reportes que envían los ciudadanos
 */
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

/**
 * Props que recibe el componente CreateProjectScreen
 * Permite inicializar con denuncias preseleccionadas
 */
interface CreateProjectProps {
    denunciasSeleccionadas?: Denuncia[];
    onBack: () => void;
    onProjectCreated?: (project: any) => void;
}

/**
 * Estructura del formulario para crear un proyecto municipal
 * Define todos los campos obligatorios y opcionales
 */
interface FormData {
    nombreProyecto: string;
    tipoDenuncia: string;
    prioridadProyecto: 'Alta' | 'Media' | 'Baja';
    fechaInicioEstimada: string;
    observaciones: string;
}

// ==================== DATOS DE CONFIGURACIÓN ====================

/**
 * Opciones disponibles para categorizar los tipos de denuncia
 * Estas categorías ayudan a organizar y filtrar los proyectos municipales
 */
const tiposDenuncia = [
    'Infraestructura Vial',
    'Limpieza y Ornato',
    'Seguridad Ciudadana',
    'Espacios Públicos',
    'Medio Ambiente',
    'Otros',
];

/**
 * Datos de ejemplo de denuncias ciudadanas disponibles
 * En producción, estos datos vendrían de la API del backend
 * Representan los reportes que los ciudadanos han enviado previamente
 */
const denunciasDisponibles: Denuncia[] = [
    {
        id: 1,
        titulo: 'Bache profundo en intersección',
        descripcion: 'Hay un bache muy profundo que puede dañar los vehículos',
        fecha: '2024-09-05',
        usuario: 'Juan Pérez',
        votos: 23,
        ubicacion: 'Esquina de Av. Alemania con Prat',
        tipoDenuncia: 'Infraestructura Vial',
        prioridad: 'Alta',
    },
    {
        id: 2,
        titulo: 'Farol dañado en plaza central',
        descripcion: 'Luminaria no funciona desde hace una semana',
        fecha: '2024-09-03',
        usuario: 'María González',
        votos: 15,
        ubicacion: 'Plaza Central',
        tipoDenuncia: 'Iluminación Pública',
        prioridad: 'Media',
    },
    {
        id: 3,
        titulo: 'Alcantarilla tapada',
        descripcion: 'Se acumula agua cuando llueve',
        fecha: '2024-09-01',
        usuario: 'Carlos Silva',
        votos: 8,
        ubicacion: 'Calle Los Aromos',
        tipoDenuncia: 'Servicios Básicos',
        prioridad: 'Media',
    },
];

/**
 * COMPONENTE PRINCIPAL: CreateProjectScreen
 *
 * PROPÓSITO: Permite a las autoridades municipales crear proyectos de respuesta
 * a las denuncias ciudadanas. Maneja tanto la selección múltiple de denuncias
 * como el formulario completo para definir el proyecto.
 *
 * FLUJO PRINCIPAL:
 * 1. Selección de denuncias (si no vienen preseleccionadas)
 * 2. Formulario de creación del proyecto
 * 3. Validación y creación del proyecto
 * 4. Confirmación y navegación de regreso
 */
export default function CreateProjectScreen({
    denunciasSeleccionadas,
    onBack,
    onProjectCreated,
}: CreateProjectProps) {
    // ==================== ESTADO DEL COMPONENTE ====================

    /**
     * Denuncias actualmente seleccionadas para este proyecto
     * Permite selección múltiple para proyectos que resuelven varios problemas
     */
    const [denunciasSelected, setDenunciasSelected] = useState<Denuncia[]>(
        denunciasSeleccionadas || []
    );

    /**
     * Controla si se muestra la pantalla de selección de denuncias
     * Se muestra cuando no hay denuncias preseleccionadas o el usuario quiere cambiarlas
     */
    const [showDenunciaSelector, setShowDenunciaSelector] = useState(
        !denunciasSeleccionadas || denunciasSeleccionadas.length === 0
    );

    /**
     * Estado del formulario con todos los campos del proyecto
     * Inicializado con valores por defecto seguros
     */
    const [formData, setFormData] = useState<FormData>({
        nombreProyecto: '',
        tipoDenuncia: '',
        prioridadProyecto: 'Media',
        fechaInicioEstimada: '',
        observaciones: '',
    });

    // ==================== FUNCIONES DE MANEJO ====================

    /**
     * Maneja la selección/deselección de denuncias
     * Implementa toggle: si ya está seleccionada la quita, si no la agrega
     * @param denuncia - La denuncia a seleccionar o deseleccionar
     */

    const handleSelectDenuncia = (denuncia: Denuncia) => {
        setDenunciasSelected((prev) => {
            const isAlreadySelected = prev.some((d) => d.id === denuncia.id);
            if (isAlreadySelected) {
                // Si ya está seleccionada, la quitamos de la lista
                return prev.filter((d) => d.id !== denuncia.id);
            } else {
                // Si no está seleccionada, la agregamos a la lista
                return [...prev, denuncia];
            }
        });
    };

    /**
     * Función principal para crear el proyecto
     * Realiza validaciones completas antes de proceder
     * Crea el objeto proyecto y notifica al componente padre
     */
    const handleCreateProject = () => {
        // ==================== VALIDACIONES ====================

        // Validación 1: Debe haber al menos una denuncia seleccionada
        if (denunciasSelected.length === 0) {
            Alert.alert('Error', 'Debe seleccionar al menos una denuncia para crear el proyecto');
            return;
        }

        // Validación 2: El nombre del proyecto es obligatorio
        if (!formData.nombreProyecto.trim()) {
            Alert.alert('Error', 'El nombre del proyecto es obligatorio');
            return;
        }

        // Validación 3: Debe seleccionar un tipo de denuncia
        if (!formData.tipoDenuncia) {
            Alert.alert('Error', 'Debe seleccionar un tipo de denuncia');
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
            tipoDenuncia: formData.tipoDenuncia,
            prioridad: formData.prioridadProyecto,
            fechaInicioEstimada: formData.fechaInicioEstimada,
            observaciones: formData.observaciones,
            denunciasAsociadas: denunciasSelected, // Array de denuncias que resuelve este proyecto
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
                        onBack(); // Regresa a la pantalla anterior
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
                {/* Header de la pantalla de selección */}
                <View className="mb-6 flex-row items-center">
                    <TouchableOpacity className="rounded-xl bg-blue-500 p-2" onPress={onBack}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="ml-4 text-xl font-bold text-white">Seleccionar Denuncia</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Instrucciones y contador de selección */}
                    <Text className="mb-2 text-gray-300">
                        Selecciona las denuncias para las cuales quieres crear un proyecto de
                        respuesta:
                    </Text>
                    <Text className="mb-4 text-sm text-blue-400">
                        {denunciasSelected.length > 0
                            ? `${denunciasSelected.length} denuncia${denunciasSelected.length > 1 ? 's' : ''} seleccionada${denunciasSelected.length > 1 ? 's' : ''}`
                            : 'Toca para seleccionar múltiples denuncias'}
                    </Text>

                    {/* Botón para continuar - solo visible si hay selecciones */}
                    {denunciasSelected.length > 0 && (
                        <TouchableOpacity
                            className="mb-4 rounded-xl bg-green-600 p-4"
                            onPress={() => setShowDenunciaSelector(false)}>
                            <Text className="text-center font-bold text-white">
                                Continuar con {denunciasSelected.length} denuncia
                                {denunciasSelected.length > 1 ? 's' : ''}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Lista de denuncias disponibles con estado de selección */}

                    {denunciasDisponibles.map((denuncia) => {
                        const isSelected = denunciasSelected.some((d) => d.id === denuncia.id);
                        return (
                            <TouchableOpacity
                                key={denuncia.id}
                                className={`mb-4 rounded-xl p-4 ${
                                    isSelected
                                        ? 'border-2 border-blue-500 bg-blue-900'
                                        : 'bg-neutral-900'
                                }`}
                                onPress={() => handleSelectDenuncia(denuncia)}>
                                {/* Header de la denuncia con título y votos */}
                                <View className="mb-2 flex-row items-start justify-between">
                                    <View className="flex-1 flex-row items-center">
                                        {/* Ícono de check para denuncias seleccionadas */}
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
                                    {/* Contador de votos con ícono de flecha hacia arriba */}
                                    <View className="flex-row items-center">
                                        <Ionicons name="arrow-up" size={16} color="#60A5FA" />
                                        <Text className="ml-1 font-semibold text-blue-400">
                                            {denuncia.votos}
                                        </Text>
                                    </View>
                                </View>

                                {/* Descripción de la denuncia */}
                                <Text className="mb-3 text-gray-300">{denuncia.descripcion}</Text>

                                {/* Ubicación con ícono */}
                                <View className="mb-2 flex-row items-center">
                                    <Ionicons name="location" size={14} color="#9CA3AF" />
                                    <Text className="ml-2 text-sm text-gray-400">
                                        {denuncia.ubicacion}
                                    </Text>
                                </View>

                                {/* Footer con información del usuario y tipo */}
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <Ionicons name="person" size={14} color="#9CA3AF" />
                                        <Text className="ml-1 text-sm text-gray-400">
                                            {denuncia.usuario}
                                        </Text>
                                        <Text className="ml-3 text-sm text-gray-400">
                                            {denuncia.fecha}
                                        </Text>
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
                <TouchableOpacity className="rounded-xl bg-blue-500 p-2" onPress={onBack}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="ml-4 text-xl font-bold text-white">Crear Proyecto</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* SECCIÓN: Resumen de denuncias seleccionadas */}
                {/* Denuncias Seleccionadas */}
                {denunciasSelected.length > 0 && (
                    <View className="mb-6 rounded-xl bg-neutral-900 p-4">
                        <View className="mb-3 flex-row items-center justify-between">
                            <Text className="text-lg font-bold text-blue-400">
                                Denuncias Seleccionadas ({denunciasSelected.length})
                            </Text>
                            {/* Botón para modificar la selección */}
                            <TouchableOpacity onPress={() => setShowDenunciaSelector(true)}>
                                <Text className="text-blue-400">Modificar</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Lista compacta de denuncias seleccionadas */}
                        {denunciasSelected.map((denuncia, index) => (
                            <View
                                key={denuncia.id}
                                className={`${index > 0 ? 'mt-3 border-t border-neutral-700 pt-3' : ''}`}>
                                <View className="flex-row items-start justify-between">
                                    <View className="flex-1">
                                        <Text className="mb-1 font-semibold text-white">
                                            {denuncia.titulo}
                                        </Text>
                                        <Text className="mb-2 text-sm text-gray-300">
                                            {denuncia.descripcion}
                                        </Text>
                                        <View className="flex-row items-center">
                                            <Ionicons name="location" size={14} color="#9CA3AF" />
                                            <Text className="ml-2 text-sm text-gray-400">
                                                {denuncia.ubicacion}
                                            </Text>
                                        </View>
                                    </View>
                                    {/* Botón para remover denuncia individual */}
                                    <TouchableOpacity
                                        onPress={() => handleSelectDenuncia(denuncia)}
                                        className="ml-3 p-2">
                                        <Ionicons name="close" size={16} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* SECCIÓN: Formulario principal del proyecto */}

                {/* Formulario de Proyecto */}
                <View className="mb-6 rounded-xl bg-neutral-900 p-4">
                    <Text className="mb-4 text-lg font-bold text-blue-400">
                        Información del Proyecto
                    </Text>

                    {/* CAMPO: Nombre del Proyecto (Obligatorio) */}
                    <View className="mb-4">
                        <Text className="mb-2 text-gray-400">Nombre del Proyecto *</Text>
                        <TextInput
                            className="rounded-lg bg-neutral-800 p-3 text-white"
                            placeholder="Ej: Reparación de bache en Av. Alemania"
                            placeholderTextColor="#9CA3AF"
                            value={formData.nombreProyecto}
                            onChangeText={(text) =>
                                setFormData((prev) => ({ ...prev, nombreProyecto: text }))
                            }
                        />
                    </View>

                    {/* CAMPO: Tipo de Denuncia con Picker (Obligatorio) */}
                    <View className="mb-4">
                        <Text className="mb-2 text-gray-400">Tipo de Denuncia *</Text>
                        <View className="rounded-lg bg-neutral-800">
                            <Picker
                                selectedValue={formData.tipoDenuncia}
                                onValueChange={(itemValue) =>
                                    setFormData((prev) => ({ ...prev, tipoDenuncia: itemValue }))
                                }
                                style={{
                                    color: 'white',
                                    backgroundColor: '#262626',
                                    height: 50,
                                }}
                                dropdownIconColor="white">
                                <Picker.Item
                                    label="Seleccionar tipo de denuncia..."
                                    value=""
                                    color="#9CA3AF"
                                />
                                {tiposDenuncia.map((tipo) => (
                                    <Picker.Item
                                        key={tipo}
                                        label={tipo}
                                        value={tipo}
                                        color="white"
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    {/* CAMPO DUPLICADO: Campo de texto para tipo de denuncia (A eliminar) */}
                    {/* NOTA: Este campo parece ser duplicado del picker de arriba */}

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
                                            : 'bg-neutral-800' // Gris para no seleccionado
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
                        <TextInput
                            className="rounded-lg bg-neutral-800 p-3 text-white"
                            placeholder="DD/MM/AAAA"
                            placeholderTextColor="#9CA3AF"
                            value={formData.fechaInicioEstimada}
                            onChangeText={(text) =>
                                setFormData((prev) => ({ ...prev, fechaInicioEstimada: text }))
                            }
                        />
                    </View>

                    {/* CAMPO: Observaciones adicionales (multilinea) */}
                    <View className="mb-4">
                        <Text className="mb-2 text-gray-400">Observaciones Adicionales</Text>
                        <TextInput
                            className="rounded-lg bg-neutral-800 p-3 text-white"
                            placeholder="Cualquier información adicional relevante..."
                            placeholderTextColor="#9CA3AF"
                            value={formData.observaciones}
                            onChangeText={(text) =>
                                setFormData((prev) => ({ ...prev, observaciones: text }))
                            }
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* SECCIÓN: Botones de acción del formulario */}

                {/* Botones de Acción */}
                <View className="mb-6 flex-row">
                    {/* Botón Cancelar - Regresa sin guardar cambios */}
                    <TouchableOpacity
                        className="mr-3 flex-1 rounded-lg bg-gray-600 p-4"
                        onPress={onBack}>
                        <Text className="text-center font-semibold text-white">Cancelar</Text>
                    </TouchableOpacity>

                    {/* Botón Crear Proyecto - Ejecuta validaciones y crea el proyecto */}
                    <TouchableOpacity
                        className="flex-1 rounded-lg bg-green-600 p-4"
                        onPress={handleCreateProject}>
                        <Text className="text-center font-semibold text-white">Crear Proyecto</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

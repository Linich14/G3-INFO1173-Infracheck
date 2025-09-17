import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';

interface ReportsStatisticsProps {
    projectId: number;
    projectName: string;
    onBack: () => void;
}

export default function ReportsStatistics({ projectName, onBack }: ReportsStatisticsProps) {
    // Obtener dimensiones de pantalla para gráficos responsivos
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 32; // 16px padding a cada lado

    // Datos de ejemplo para los gráficos
    const tipoProblemasData = {
        labels: ['Baches', 'Semáforos', 'Alumbrado', 'Limpieza', 'Señalética'],
        datasets: [
            {
                data: [12, 8, 15, 6, 9],
                colors: [
                    () => '#3B82F6', // Azul
                    () => '#EF4444', // Rojo
                    () => '#F59E0B', // Amarillo
                    () => '#10B981', // Verde
                    () => '#8B5CF6', // Púrpura
                ],
            },
        ],
    };

    const evolucionTemporalData = {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [
            {
                data: [5, 8, 12, 15, 18, 14],
                strokeWidth: 3,
                color: () => '#3B82F6',
            },
        ],
    };

    const chartConfig = {
        backgroundColor: '#1F2937',
        backgroundGradientFrom: '#1F2937',
        backgroundGradientTo: '#111827',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForLabels: {
            fontSize: 12,
        },
        propsForVerticalLabels: {
            fontSize: 10,
        },
    };

    // Función para calcular el porcentaje para las barras de progreso
    const maxValue = Math.max(...tipoProblemasData.datasets[0].data);

    return (
        <View className="flex-1 bg-black px-4 pt-10">
            {/* Header */}
            <View className="mb-6 flex-row items-center">
                <TouchableOpacity className="rounded-xl bg-blue-500 p-2" onPress={onBack}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="ml-4 text-xl font-bold text-white">Estadísticas de Reportes</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Información del Proyecto */}
                <View className="mb-6 rounded-xl bg-neutral-900 p-6">
                    <Text className="mb-2 text-lg font-bold text-blue-400">
                        Proyecto: {projectName}
                    </Text>
                    <Text className="text-gray-400">
                        Análisis estadístico de reportes asociados
                    </Text>
                </View>

                {/* Gráfico 2: Evolución Temporal */}
                <View className="mb-8 rounded-xl bg-neutral-900 p-6">
                    <Text className="mb-4 text-lg font-bold text-blue-400">
                        Historial de reportes en (calle o ubicación aquí)
                    </Text>
                    <Text className="mb-4 text-sm text-gray-400">
                        Tendencia de reportes recibidos por mes
                    </Text>

                    {/* Scroll horizontal para el gráfico */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <LineChart
                            data={evolucionTemporalData}
                            width={chartWidth * 2} // Doble del ancho de pantalla para permitir scroll
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={{
                                borderRadius: 12,
                            }}
                            withDots={true}
                            withShadow={false}
                            withInnerLines={true}
                            withOuterLines={true}
                        />
                    </ScrollView>

                    {/* Métricas adicionales */}
                    <View className="mt-4 flex-row justify-between">
                        <View className="mr-2 flex-1 rounded-lg bg-neutral-800 p-3">
                            <Text className="text-sm text-gray-400">Promedio Mensual</Text>
                            <Text className="text-lg font-bold text-white">
                                {Math.round(
                                    evolucionTemporalData.datasets[0].data.reduce(
                                        (a, b) => a + b,
                                        0
                                    ) / evolucionTemporalData.datasets[0].data.length
                                )}{' '}
                                reportes
                            </Text>
                        </View>
                        <View className="ml-2 flex-1 rounded-lg bg-neutral-800 p-3">
                            <Text className="text-sm text-gray-400">Mes con Más Reportes</Text>
                            <Text className="text-lg font-bold text-white">
                                {
                                    evolucionTemporalData.labels[
                                        evolucionTemporalData.datasets[0].data.indexOf(
                                            Math.max(...evolucionTemporalData.datasets[0].data)
                                        )
                                    ]
                                }{' '}
                                ({Math.max(...evolucionTemporalData.datasets[0].data)})
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Resumen de Insights */}
                <View className="mb-6 rounded-xl bg-neutral-900 p-6">
                    <Text className="mb-4 text-lg font-bold text-blue-400">Insights Clave</Text>

                    <View className="space-y-3">
                        <View className="flex-row items-start">
                            <Ionicons name="trending-up" size={16} color="#10B981" />
                            <Text className="ml-2 flex-1 text-sm text-gray-300">
                                El tipo de problema más reportado es "
                                {
                                    tipoProblemasData.labels[
                                        tipoProblemasData.datasets[0].data.indexOf(maxValue)
                                    ]
                                }
                                " con {maxValue} casos
                            </Text>
                        </View>

                        <View className="flex-row items-start">
                            <Ionicons name="calendar" size={16} color="#F59E0B" />
                            <Text className="ml-2 flex-1 text-sm text-gray-300">
                                Mayo fue el mes con mayor actividad de reportes (18 casos)
                            </Text>
                        </View>

                        <View className="flex-row items-start">
                            <Ionicons name="analytics" size={16} color="#3B82F6" />
                            <Text className="ml-2 flex-1 text-sm text-gray-300">
                                Tendencia general muestra un incremento en reportes durante los
                                primeros 5 meses
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Acciones */}
                <View className="mb-6 rounded-xl bg-neutral-900 p-6">
                    <Text className="mb-4 text-lg font-bold text-blue-400">Acciones</Text>

                    <TouchableOpacity className="mb-3 flex-row items-center rounded-lg bg-green-600 p-4">
                        <Ionicons name="download" size={20} color="white" />
                        <Text className="ml-3 font-semibold text-white">Exportar Estadísticas</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center rounded-lg bg-purple-600 p-4">
                        <Ionicons name="share" size={20} color="white" />
                        <Text className="ml-3 font-semibold text-white">Compartir Reporte</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

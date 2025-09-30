import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Polyline, Circle, Text as SvgText } from 'react-native-svg';

interface LineChartProps {
  data: { label: string; value: number; color: string }[];
  width?: number;
  height?: number;
}

// Componente alternativo sin SVG (fallback)
function SimpleLineChart({ data, width = 320, height = 200 }: LineChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <View className="items-center">
      {/* Gráfico de barras como alternativa */}
      <View style={{ width, height: height - 60 }} className="justify-end">
        <View className="flex-row justify-between items-end h-full px-4">
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 80);
            return (
              <View key={index} className="items-center">
                <Text className="text-white text-xs mb-2 font-bold">{item.value}</Text>
                <View
                  style={{
                    height: barHeight,
                    width: 25,
                    backgroundColor: item.color,
                    borderRadius: 4,
                  }}
                />
                <Text className="text-gray-400 text-xs mt-2">{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
      
      {/* Leyenda */}
      <View className="flex-row justify-center mt-4 space-x-4">
        {data.map((item, index) => (
          <View key={index} className="flex-row items-center">
            <View 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: item.color }}
            />
            <Text className="text-gray-400 text-sm">{item.label}: {item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function LineChart({ data, width = 320, height = 200 }: LineChartProps) {
  // Usar SVG si está disponible, sino usar componente simple
  try {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const valueRange = maxValue - minValue || 1;
    
    // Padding para el área de gráfico
    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Calcular posiciones de los puntos
    const points = data.map((item, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y = padding + chartHeight - ((item.value - minValue) / valueRange) * chartHeight;
      return { x, y, ...item };
    });
    
    // Crear string de puntos para la polyline
    const pathData = points.map(p => `${p.x},${p.y}`).join(' ');
    
    return (
      <View className="items-center">
        <Svg width={width} height={height}>
          {/* Línea principal */}
          <Polyline
            points={pathData}
            fill="none"
            stroke="#537CF2"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Puntos en cada dato */}
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="6"
              fill="#537CF2"
              stroke="#fff"
              strokeWidth="2"
            />
          ))}
          
          {/* Etiquetas en el eje X */}
          {points.map((point, index) => (
            <SvgText
              key={index}
              x={point.x}
              y={height - 15}
              fontSize="12"
              fill="#94a3b8"
              textAnchor="middle"
            >
              {point.label}
            </SvgText>
          ))}
          
          {/* Valores en los puntos */}
          {points.map((point, index) => (
            <SvgText
              key={index}
              x={point.x}
              y={point.y - 15}
              fontSize="12"
              fill="#fff"
              textAnchor="middle"
              fontWeight="bold"
            >
              {point.value}
            </SvgText>
          ))}
        </Svg>
        
        {/* Leyenda */}
        <View className="flex-row justify-center mt-4 flex-wrap">
          <Text className="text-gray-400 text-sm">
            Reportes por día de la semana
          </Text>
        </View>
      </View>
    );
  } catch {
    console.log('Error with SVG, using fallback chart');
    return <SimpleLineChart data={data} width={width} height={height} />;
  }
}
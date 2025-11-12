import React, { useEffect } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { ArrowBigUp, CheckCircle2, XCircle, Info } from 'lucide-react-native';

interface VoteToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'vote' | 'unvote';
  onHide: () => void;
  duration?: number;
}

const VoteToast: React.FC<VoteToastProps> = ({
  visible,
  message,
  type,
  onHide,
  duration = 2000,
}) => {
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (visible) {
      // Animación de entrada
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 7,
        }),
      ]).start();

      // Auto-hide después del duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.3,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const getToastConfig = () => {
    switch (type) {
      case 'vote':
        return {
          bgColor: 'bg-green-500',
          icon: <ArrowBigUp size={24} color="#fff" fill="#fff" />,
          borderColor: 'border-green-400',
        };
      case 'unvote':
        return {
          bgColor: 'bg-gray-600',
          icon: <ArrowBigUp size={24} color="#fff" />,
          borderColor: 'border-gray-500',
        };
      case 'success':
        return {
          bgColor: 'bg-emerald-500',
          icon: <CheckCircle2 size={24} color="#fff" />,
          borderColor: 'border-emerald-400',
        };
      case 'error':
        return {
          bgColor: 'bg-red-500',
          icon: <XCircle size={24} color="#fff" />,
          borderColor: 'border-red-400',
        };
      case 'info':
        return {
          bgColor: 'bg-blue-500',
          icon: <Info size={24} color="#fff" />,
          borderColor: 'border-blue-400',
        };
      default:
        return {
          bgColor: 'bg-gray-600',
          icon: <Info size={24} color="#fff" />,
          borderColor: 'border-gray-500',
        };
    }
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        zIndex: 9999,
        transform: [{ translateY }, { scale }],
        opacity,
      }}
    >
      <View
        className={`${config.bgColor} ${config.borderColor} flex-row items-center rounded-2xl border-2 px-5 py-4 shadow-2xl`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        <View className="mr-3">{config.icon}</View>
        <Text className="flex-1 text-base font-semibold text-white">{message}</Text>
      </View>
    </Animated.View>
  );
};

export default VoteToast;

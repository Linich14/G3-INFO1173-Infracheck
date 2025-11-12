import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';

interface FloatingEmojiProps {
  emoji: string;
  trigger: number; // Incrementa este valor para activar la animación
}

const FloatingEmoji: React.FC<FloatingEmojiProps> = ({ emoji, trigger }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (trigger > 0) {
      // Reset valores
      translateY.setValue(0);
      opacity.setValue(0);
      scale.setValue(0.5);

      // Animación de flotación
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -60,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.delay(600),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.spring(scale, {
            toValue: 1.2,
            useNativeDriver: true,
            tension: 100,
            friction: 5,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 5,
          }),
        ]),
      ]).start();
    }
  }, [trigger]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        transform: [{ translateY }, { scale }],
        opacity,
        zIndex: 1000,
      }}
      pointerEvents="none"
    >
      <Text style={{ fontSize: 32 }}>{emoji}</Text>
    </Animated.View>
  );
};

export default FloatingEmoji;

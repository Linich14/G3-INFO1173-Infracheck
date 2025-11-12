import React, { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, Text, Animated, ActivityIndicator, View } from 'react-native';
import { ArrowBigUp } from 'lucide-react-native';
import FloatingEmoji from './FloatingEmoji';

interface VoteButtonProps {
  voteCount: number;
  userHasVoted: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const VoteButton: React.FC<VoteButtonProps> = ({
  voteCount,
  userHasVoted,
  isLoading,
  isSubmitting,
  onPress,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [emojiTrigger, setEmojiTrigger] = useState(0);
  const [currentEmoji, setCurrentEmoji] = useState('😊');
  const previousVotedRef = useRef(userHasVoted);

  // Animación cuando cambia el estado de votado
  useEffect(() => {
    // Detectar cambio en el estado de votado
    if (previousVotedRef.current !== userHasVoted) {
      if (userHasVoted) {
        // Usuario acaba de votar - mostrar carita feliz
        setCurrentEmoji('😊');
        setEmojiTrigger(prev => prev + 1);

        // Animación de "pop" cuando se vota
        Animated.sequence([
          Animated.spring(scaleAnim, {
            toValue: 1.2,
            useNativeDriver: true,
            tension: 100,
            friction: 3,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 5,
          }),
        ]).start();

        // Pequeña rotación para efecto dinámico
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          rotateAnim.setValue(0);
        });
      } else {
        // Usuario quitó su voto - mostrar carita triste
        setCurrentEmoji('😔');
        setEmojiTrigger(prev => prev + 1);
      }

      previousVotedRef.current = userHasVoted;
    }
  }, [userHasVoted]);

  const handlePress = () => {
    // Animación de presión
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }),
    ]).start();

    onPress();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '12deg'],
  });

  return (
    <View style={{ position: 'relative' }}>
      {/* Emoji flotante */}
      <View style={{ position: 'absolute', top: -10, left: '50%', marginLeft: -16 }}>
        <FloatingEmoji emoji={currentEmoji} trigger={emojiTrigger} />
      </View>

      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { rotate: rotation }],
        }}
      >
        <TouchableOpacity
          className={`mr-4 flex-row items-center gap-2 rounded-[32px] border px-4 py-2 shadow active:opacity-90 ${
            userHasVoted
              ? 'border-blue-500 bg-[#4A90E2]'
              : 'border-gray-400 bg-[#f0f0f0]'
          }`}
          onPress={handlePress}
          disabled={isLoading || isSubmitting || disabled}
          accessibilityLabel={`${voteCount} votos${userHasVoted ? ', ya has votado' : ''}`}
          accessibilityRole="button"
          style={{
            shadowColor: userHasVoted ? '#4A90E2' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: userHasVoted ? 0.3 : 0.1,
            shadowRadius: userHasVoted ? 4 : 2,
            elevation: userHasVoted ? 4 : 2,
          }}
        >
          {isLoading || isSubmitting ? (
            <ActivityIndicator size="small" color={userHasVoted ? '#fff' : '#666'} />
          ) : (
            <ArrowBigUp 
              size={18} 
              color={userHasVoted ? '#fff' : '#666'} 
              fill={userHasVoted ? '#fff' : 'transparent'}
            />
          )}
          <Text
            className={`text-center text-base font-medium ${
              userHasVoted ? 'text-white' : 'text-gray-600'
            }`}
          >
            {voteCount}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default VoteButton;

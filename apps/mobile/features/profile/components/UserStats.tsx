import React from 'react';
import { View, Text } from 'react-native';

interface UserStatsProps {
  reportCount: number;
  upVotes: number;
}

export const UserStats: React.FC<UserStatsProps> = ({ reportCount, upVotes }) => {
  return (
    <View className="flex-row justify-center items-center gap-16 px-4 py-6">
      <View className="items-center">
        <Text className="text-white text-4xl font-bold">{reportCount}</Text>
        <Text className="text-gray-400 text-base mt-1">Reportes</Text>
      </View>
      
      <View className="w-px h-12 bg-gray-700" />
      
      <View className="items-center">
        <Text className="text-white text-4xl font-bold">{upVotes}</Text>
        <Text className="text-gray-400 text-base mt-1">Up Votos</Text>
      </View>
    </View>
  );
};

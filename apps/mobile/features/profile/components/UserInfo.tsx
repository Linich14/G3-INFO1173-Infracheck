import React from 'react';
import { View, Text } from 'react-native';
import { Mail, CreditCard, MapPin } from 'lucide-react-native';
import { ContactField } from './ContactField';
import { QRSection } from './QRSection';
import { UserInfoProps } from '../types';

export const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  return (
    <View className="flex-1 px-3.5 w-full">
      {/* User Avatar */}
      <View className="self-center mt-8 w-[108px] h-[108px] bg-[#537CF2] rounded-full justify-center items-center shadow-lg">
        <Text className="text-white text-4xl font-bold">
          {user.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* User Name */}
      <View className="justify-center items-center px-4 mt-6">
        <Text className="text-3xl font-medium text-white text-center leading-9">
          {user.name}
        </Text>
      </View>

      {/* Contact Information */}
      <View className="px-3.5 py-5 mt-3 w-full">
        <ContactField
          icon={<Mail size={24} color="#f6fa00ff" />}
          value={user.email}
          className="mb-4"
        />

        <ContactField
          icon={<CreditCard size={24} color="#3cff00ff" />}
          value={user.rut}
          className="mb-4"
        />

        <ContactField
          icon={<MapPin size={24} color="#ff0000ff" />}
          value={user.address}
          className="mb-4"
        />

        <QRSection />
      </View>
    </View>
  );
};

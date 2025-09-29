import React from 'react';
import { View, Text } from 'react-native';
import { ContactFieldProps } from '../types';

export const ContactField: React.FC<ContactFieldProps> = ({ 
  icon, 
  value, 
  className = ""
}) => {
  return (
    <View style={{
      flexDirection: 'row',
      width: '100%',
      backgroundColor: '#1D212D',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(83, 124, 242, 0.1)',
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center'
    }} className={className}>
      <View style={{
        marginRight: 12
      }}>
        {icon}
      </View>
      <Text style={{
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        flex: 1
      }}>
        {value}
      </Text>
    </View>
  );
};

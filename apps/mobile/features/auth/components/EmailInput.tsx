import React, { useState } from 'react';
import { View, TextInput, Text } from 'react-native';

interface EmailInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

function isValidEmail(email: string) {
  // Valida que tenga formato usuario@dominio.ext
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

const EmailInput: React.FC<EmailInputProps> = ({ value, onChangeText, placeholder }) => {
  const [touched, setTouched] = useState(false);
  const valid = isValidEmail(value);

  // Resetear touched si el campo queda vacío
  React.useEffect(() => {
    if (value.length === 0 && touched) setTouched(false);
  }, [value, touched]);

  return (
    <View style={{ width: '100%' }}>
      <TextInput
        value={value}
        onChangeText={text => {
          onChangeText(text);
          if (!touched && text.length > 0) setTouched(true);
        }}
        placeholder={placeholder || 'usuarioinfracheck@correo.cl'}
        placeholderTextColor="#ccc"
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ color: 'white', borderBottomWidth: 1, borderColor: valid || !touched ? 'white' : 'red', paddingBottom: 8, fontSize: 18 }}
      />
      {touched && value.length > 0 && !valid && (
        <Text style={{ color: 'red', fontSize: 14, marginTop: 4}}>
          Ingresa un correo válido (ej: usuario@dominio.com)
        </Text>
      )}
    </View>
  );
};

export default EmailInput;

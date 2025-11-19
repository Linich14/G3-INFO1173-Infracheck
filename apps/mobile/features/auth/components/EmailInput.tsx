import React, { useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import { isValidEmail } from '../../../utils/validation';
import { useLanguage } from '~/contexts/LanguageContext';

interface EmailInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
}



const EmailInput: React.FC<EmailInputProps> = ({ value, onChangeText, placeholder, error }) => {
  const [touched, setTouched] = useState(false);
  const valid = isValidEmail(value);
  const { t } = useLanguage();

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
        placeholder={placeholder || t('emailPlaceholder')}
        placeholderTextColor="#ccc"
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ color: 'white', borderBottomWidth: 1, borderColor: valid || !touched ? 'white' : 'red', paddingBottom: 8, fontSize: 18 }}
      />
      {(error || (touched && value.length > 0 && !valid)) && (
        <Text style={{ color: 'red', fontSize: 14, marginTop: 4}}>
          {error ? error : t('emailErrorDefault')}
        </Text>
      )}
    </View>
  );
};

export default EmailInput;

import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, KeyboardTypeOptions } from 'react-native';
import { formatRut } from '../../../utils/formatRut';
import { isValidRut } from '../../../utils/validation';
import { useLanguage } from '~/contexts/LanguageContext';

interface RutInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
}



const RutInput: React.FC<RutInputProps> = ({ value, onChangeText, placeholder, keyboardType, error }) => {
  const [touched, setTouched] = useState(false);
  const valid = isValidRut(value);
  const { t } = useLanguage();

  useEffect(() => {
    if (value.length === 0 && touched) setTouched(false);
  }, [value, touched]);

  const handleChange = (text: string) => {
    const formatted = formatRut(text).slice(0, 12);
    onChangeText(formatted);
    if (!touched && formatted.length > 0) setTouched(true);
  };

  return (
    <View style={{ width: '100%' }}>
      <TextInput
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder || t('rutPlaceholder')}
        placeholderTextColor="#ccc"
        keyboardType={keyboardType || "default"}
        autoCapitalize="none"
        style={{ color: 'white', borderBottomWidth: 1, borderColor: valid || !touched ? 'white' : 'red', paddingBottom: 8, fontSize: 18 }}
        maxLength={12}
      />
          {(error || (touched && value.length > 0 && !valid)) && (
        <Text style={{ color: 'red', fontSize: 14, marginTop: 4}}>
      {error ? error : t('rutErrorDefault')}
        </Text>
      )}
    </View>
  );
};

export default RutInput;

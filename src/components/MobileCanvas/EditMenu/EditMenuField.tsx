import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from './EditMenu.styles';

export type EditMenuFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  required?: boolean;
  inputRef?: React.RefObject<TextInput | null>;
  multiline?: boolean;
};

export const EditMenuField: React.FC<EditMenuFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  secureTextEntry = false,
  required = false,
  inputRef,
  multiline = false,
}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        ref={inputRef}
        style={[styles.input, multiline && styles.textarea]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#666"
        secureTextEntry={secureTextEntry}
        multiline={multiline}
      />
    </View>
  );
};

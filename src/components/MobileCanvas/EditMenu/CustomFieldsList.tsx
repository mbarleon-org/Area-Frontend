import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import type { CustomFieldsListProps } from './EditMenu.types';
import { styles } from './EditMenu.styles';

export const CustomFieldsList: React.FC<CustomFieldsListProps> = ({
  fields,
  specs,
  newKey,
  onNewKeyChange,
  onFieldChange,
  onFieldRemove,
  onFieldAdd,
  placeholder,
  helpText,
  isGmailModule = false,
}) => {
  const hiddenForGmail = new Set(['HTML Body', 'From']);

  // Fields defined by specs
  const specFields = specs
    .filter((spec) => !(isGmailModule && hiddenForGmail.has(spec.pretty_name)))
    .map((spec) => {
      const isBody = spec.pretty_name?.toLowerCase().includes('body');
      return (
        <View key={spec.id} style={styles.fieldGroup}>
          <Text style={styles.label}>
            {spec.pretty_name}
            {spec.required && <Text style={styles.required}> *</Text>}
          </Text>
          <TextInput
            style={[styles.input, isBody && styles.textarea]}
            value={fields[spec.id] || ''}
            onChangeText={(text) => onFieldChange(spec.id, text)}
            placeholder={`Enter ${spec.pretty_name}`}
            placeholderTextColor="#666"
            multiline={isBody}
          />
        </View>
      );
    });

  // Custom fields (not in specs)
  const customFields = Object.entries(fields)
    .filter(([k]) => !specs.find((s) => s.id === k))
    .map(([k, v]) => (
      <View key={k} style={styles.customRow}>
        <View style={styles.customRowField}>
          <Text style={styles.label}>{k}</Text>
          <TextInput
            style={styles.input}
            value={v}
            onChangeText={(text) => onFieldChange(k, text)}
            placeholder={`Enter ${k}`}
            placeholderTextColor="#666"
          />
        </View>
        <TouchableOpacity onPress={() => onFieldRemove(k)} style={styles.deleteFieldBtn}>
          <Text style={styles.deleteFieldText}>✕</Text>
        </TouchableOpacity>
      </View>
    ));

  return (
    <>
      <Text style={styles.helpText}>{helpText}</Text>
      {specFields}
      {customFields}
      <View style={styles.addBox}>
        <TextInput
          style={styles.addInput}
          value={newKey}
          onChangeText={onNewKeyChange}
          placeholder={placeholder}
          placeholderTextColor="#666"
        />
        <TouchableOpacity onPress={onFieldAdd} style={styles.addBtn}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

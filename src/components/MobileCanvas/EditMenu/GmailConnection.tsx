import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import type { GmailConnectionProps } from './EditMenu.types';
import { styles } from './EditMenu.styles';

export const GmailConnection: React.FC<GmailConnectionProps> = ({
  connectedAccountLabel,
  availableCredentials,
  selectedCredentialId,
  authEmail,
  authPassword,
  isConnecting,
  onSelectCredential,
  onEmailChange,
  onPasswordChange,
  onConnect,
}) => {
  const isDisabled = isConnecting || !authEmail || !authPassword;
  const selected = availableCredentials.find((c) => c.id === selectedCredentialId);
  const selectedLabel = selected?.name || selected?.metadata?.email || selected?.id;
  const [showNewCredentialForm, setShowNewCredentialForm] = useState(false);

  useEffect(() => {
    if (selectedCredentialId) {
      setShowNewCredentialForm(false);
    }
  }, [selectedCredentialId]);

  return (
    <View style={styles.connectionBox}>
      <Text style={styles.connectionTitle}>Log in (Gmail)</Text>

      {selectedCredentialId && (
        <View style={styles.connectedRow}>
          <View style={styles.connectedBadge}>
            <Text style={styles.statusDot}>●</Text>
            <Text style={styles.connectedText} numberOfLines={1}>
              {selectedLabel || connectedAccountLabel}
            </Text>
          </View>
        </View>
      )}

      {/* Dropdown menu for saved accounts */}
      {availableCredentials.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.selectLabel}>Use a saved account:</Text>
          <View style={styles.picker}>
            <Picker
              selectedValue={selectedCredentialId || ''}
              onValueChange={(value) => onSelectCredential(value || null)}
              style={{ color: '#fff' }}
              dropdownIconColor="#fff"
            >
              <Picker.Item label="-- Select a saved account --" value="" />
              {availableCredentials.map((cred) => (
                <Picker.Item
                  key={cred.id}
                  label={cred.name || cred.metadata?.email || cred.id}
                  value={cred.id}
                />
              ))}
            </Picker>
          </View>
          <TouchableOpacity
            style={styles.connectBtn}
            onPress={() => setShowNewCredentialForm(true)}
          >
            <Text style={styles.connectBtnText}>Link a new account</Text>
          </TouchableOpacity>
        </View>
      )}

      {(showNewCredentialForm || !selectedCredentialId || connectedAccountLabel === null) && (
        <View>
          <TextInput
            style={[styles.input, { marginBottom: 10 }]}
            placeholder="Email (ex: john.smith@gmail.com)"
            placeholderTextColor="#666"
            value={authEmail}
            onChangeText={onEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { marginBottom: 10 }]}
            placeholder="App Password (16 chars)"
            placeholderTextColor="#666"
            value={authPassword}
            onChangeText={onPasswordChange}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.connectBtn, isDisabled && styles.connectBtnDisabled]}
            onPress={onConnect}
            disabled={isDisabled}
          >
            {isConnecting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.connectBtnText}>Link this account</Text>
            )}
          </TouchableOpacity>
          {showNewCredentialForm && availableCredentials.length > 0 && (
            <TouchableOpacity
              style={[styles.disconnectBtn, { marginTop: 8, alignSelf: 'center' }]}
              onPress={() => setShowNewCredentialForm(false)}
            >
              <Text style={styles.disconnectBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.hintText}>
            Use a Google app password (Security {'>'} App Passwords).
          </Text>
        </View>
      )}
    </View>
  );
};

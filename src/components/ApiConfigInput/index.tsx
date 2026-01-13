import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { isWeb } from '../../utils/IsWeb';
import { useApiConfig } from '../../contexts/ApiConfigContext';

interface ApiConfigInputProps {
  compact?: boolean;
  showCurrentUrl?: boolean;
  onSave?: (url: string) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  showReset?: boolean;
}

const ApiConfigInput: React.FC<ApiConfigInputProps> = ({
  compact = false,
  showCurrentUrl = true,
  onSave,
  onError,
  placeholder = 'Enter server address (e.g., 192.168.1.15)',
  showReset = false,
}) => {
  const { baseUrl, setBaseUrl, resetBaseUrl, validateBaseUrl, isLoading } = useApiConfig();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Initialize input with current URL
  useEffect(() => {
    if (!isLoading && baseUrl) {
      setInputValue(baseUrl);
    }
  }, [isLoading, baseUrl]);

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    // Validate before saving
    const validation = validateBaseUrl(inputValue);
    if (!validation.valid) {
      setError(validation.error || 'Invalid URL');
      onError?.(validation.error || 'Invalid URL');
      return;
    }

    setSaving(true);

    try {
      const result = await setBaseUrl(inputValue);

      if (result.success) {
        setSuccess(true);
        onSave?.(inputValue);
        // Clear success after 2s
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(result.error || 'Failed to save');
        onError?.(result.error || 'Failed to save');
      }
    } catch (err) {
      const errorMsg = 'An error occurred while saving';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      await resetBaseUrl();
      setInputValue('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError('Failed to reset');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setError(null);
    setSuccess(false);
  };

  if (isLoading) {
    if (!isWeb) {
      return (
        <View style={mobileStyles.loadingContainer}>
          <ActivityIndicator color="#007AFF" />
        </View>
      );
    }
  }

  // ------------------------ Mobile View ------------------------
  if (!isWeb) {
    return (
      <View style={[mobileStyles.container, compact && mobileStyles.containerCompact]}>
        {!compact && (
          <Text style={mobileStyles.label}>Server Address</Text>
        )}

        {showCurrentUrl && baseUrl && !compact && (
          <Text style={mobileStyles.currentUrl}>
            Current: {baseUrl}
          </Text>
        )}

        <View style={[mobileStyles.inputRow, compact && mobileStyles.inputRowCompact]}>
          <TextInput
            style={[
              mobileStyles.input,
              compact && mobileStyles.inputCompact,
              error ? mobileStyles.inputError : null,
              success ? mobileStyles.inputSuccess : null,
            ]}
            value={inputValue}
            onChangeText={handleInputChange}
            placeholder={placeholder}
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={!saving}
          />

          <TouchableOpacity
            style={[
              mobileStyles.saveBtn,
              compact && mobileStyles.saveBtnCompact,
              saving && mobileStyles.saveBtnDisabled,
              success && mobileStyles.saveBtnSuccess,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={mobileStyles.saveBtnText}>
              {saving ? '...' : success ? '✓' : 'Save'}
            </Text>
          </TouchableOpacity>

          {showReset && (
            <TouchableOpacity
              style={[mobileStyles.resetBtn, saving && mobileStyles.resetBtnDisabled]}
              onPress={handleReset}
              disabled={saving}
            >
              <Text style={mobileStyles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {error && (
          <Text style={mobileStyles.errorText}>{error}</Text>
        )}

        {success && !compact && (
          <Text style={mobileStyles.successText}>Configuration saved!</Text>
        )}
      </View>
    );
  }
};

const mobileStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  containerCompact: {
    marginBottom: 8,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  label: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  currentUrl: {
    color: '#666',
    fontSize: 12,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'column',
    gap: 10,
  },
  inputRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
  },
  inputCompact: {
    flex: 1,
    padding: 10,
    marginRight: 8,
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  inputSuccess: {
    borderColor: '#4CAF50',
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnCompact: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnSuccess: {
    backgroundColor: '#4CAF50',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  resetBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  resetBtnDisabled: {
    opacity: 0.5,
  },
  resetBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 8,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 8,
  },
});

export default ApiConfigInput;

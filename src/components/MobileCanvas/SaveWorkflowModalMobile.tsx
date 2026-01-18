import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Switch, ActivityIndicator } from 'react-native';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: { name: string; description: string; enabled: boolean }) => void;
  initialName?: string;
  initialDescription?: string;
  initialEnabled?: boolean;
  loading?: boolean;
  error?: string[] | string | null;
};

const SaveWorkflowModalMobile: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialName = '',
  initialDescription = '',
  initialEnabled = true,
  loading = false,
  error = null,
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [enabled, setEnabled] = useState(initialEnabled);
  const nameInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(initialName);
    setDescription(initialDescription);
    setEnabled(initialEnabled);
    setTimeout(() => nameInputRef.current?.focus(), 100);
  }, [isOpen, initialName, initialDescription, initialEnabled]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim() || loading) return;
    onSave({ name: name.trim(), description: description.trim(), enabled });
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Save Workflow</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ paddingBottom: 8 }}>
            <View style={styles.field}>
              <Text style={styles.label}>Workflow Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                ref={nameInputRef}
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="My Awesome Workflow"
                placeholderTextColor="#777"
                editable={!loading}
                returnKeyType="done"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe what this workflow does..."
                placeholderTextColor="#777"
                editable={!loading}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={[styles.field, styles.switchRow]}>
              <Text style={styles.label}>Enable workflow immediately</Text>
              <Switch value={enabled} onValueChange={setEnabled} disabled={loading} />
            </View>

            {error && (
              <View style={styles.errorBox}>
                {Array.isArray(error) ? error.map((msg, idx) => (
                  <Text key={idx} style={styles.errorText}>{msg}</Text>
                )) : (
                  <Text style={styles.errorText}>{error}</Text>
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.secondary]} onPress={onClose} disabled={loading}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primary, (!name.trim() || loading) && styles.disabled]}
              onPress={handleSubmit}
              disabled={!name.trim() || loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Workflow</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#1e1e1e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  close: {
    color: '#aaa',
    fontSize: 20,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '600',
  },
  required: {
    color: '#ff8888',
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    backgroundColor: '#2a2a2a',
    fontSize: 14,
  },
  textarea: {
    minHeight: 90,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBox: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,100,100,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,100,100,0.35)',
  },
  errorText: {
    color: '#ff8b8b',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#007acc',
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SaveWorkflowModalMobile;

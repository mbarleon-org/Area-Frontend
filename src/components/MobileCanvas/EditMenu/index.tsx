import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import type { EditMenuProps, EditMenuHandle, TabType } from './EditMenu.types';

const EditMenu = forwardRef<EditMenuHandle, EditMenuProps>(
  ({ node, updateNode, onClose, onDelete }, ref) => {
    const [name, setName] = useState(node?.label || '');
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [inputs, setInputs] = useState<Record<string, string>>(node?.inputs || {});
    const [outputs, setOutputs] = useState<Record<string, string>>(node?.outputs || {});
    const [options, setOptions] = useState<Record<string, any>>(node?.options || {});

    const nameRef = useRef<TextInput>(null);

    useEffect(() => {
      setName(node?.label || '');
      setInputs(node?.inputs || {});
      setOutputs(node?.outputs || {});
      setOptions(node?.options || {});
    }, [node]);

    const handleSave = () => {
      if (node) {
        updateNode({
          label: name,
          inputs,
          outputs,
          options,
        });
      }
      onClose();
    };

    const handleDelete = () => {
      Alert.alert(
        'Delete Node',
        'Are you sure you want to delete this node?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              onDelete?.();
              onClose();
            },
          },
        ]
      );
    };

    useImperativeHandle(ref, () => ({
      requestClose: () => {
        handleSave();
      },
    }));

    if (!node) return null;

    const hasInputs = node.module?.actions && Object.keys(node.module.actions).length > 0;
    const hasOutputs = node.module?.triggers || node.module?.actions;
    const hasOptions = node.module?.triggers && Object.keys(node.module.triggers).length > 0;

    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Edit Node</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.closeButton}>
                  <Text style={styles.closeText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'general' && styles.tabActive]}
                onPress={() => setActiveTab('general')}
              >
                <Text style={[styles.tabText, activeTab === 'general' && styles.tabTextActive]}>
                  General
                </Text>
              </TouchableOpacity>
              {hasInputs && (
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'inputs' && styles.tabActive]}
                  onPress={() => setActiveTab('inputs')}
                >
                  <Text style={[styles.tabText, activeTab === 'inputs' && styles.tabTextActive]}>
                    Inputs
                  </Text>
                </TouchableOpacity>
              )}
              {hasOutputs && (
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'outputs' && styles.tabActive]}
                  onPress={() => setActiveTab('outputs')}
                >
                  <Text style={[styles.tabText, activeTab === 'outputs' && styles.tabTextActive]}>
                    Outputs
                  </Text>
                </TouchableOpacity>
              )}
              {hasOptions && (
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'options' && styles.tabActive]}
                  onPress={() => setActiveTab('options')}
                >
                  <Text style={[styles.tabText, activeTab === 'options' && styles.tabTextActive]}>
                    Options
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Content */}
            <ScrollView style={styles.content}>
              {activeTab === 'general' && (
                <View style={styles.section}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    ref={nameRef}
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Node name"
                    placeholderTextColor="#666"
                  />
                  {node.module && (
                    <View style={styles.infoBox}>
                      <Text style={styles.infoText}>Module: Unknown</Text>
                    </View>
                  )}
                </View>
              )}

              {activeTab === 'inputs' && hasInputs && (
                <View style={styles.section}>
                  {Object.entries(inputs).map(([key, value]) => (
                    <View key={key} style={styles.fieldGroup}>
                      <Text style={styles.label}>{key}</Text>
                      <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={(text) => setInputs({ ...inputs, [key]: text })}
                        placeholder={`Enter ${key}`}
                        placeholderTextColor="#666"
                      />
                    </View>
                  ))}
                </View>
              )}

              {activeTab === 'outputs' && hasOutputs && (
                <View style={styles.section}>
                  {Object.entries(outputs).map(([key, value]) => (
                    <View key={key} style={styles.fieldGroup}>
                      <Text style={styles.label}>{key}</Text>
                      <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={(text) => setOutputs({ ...outputs, [key]: text })}
                        placeholder={`Enter ${key}`}
                        placeholderTextColor="#666"
                      />
                    </View>
                  ))}
                </View>
              )}

              {activeTab === 'options' && hasOptions && (
                <View style={styles.section}>
                  {Object.entries(options).map(([key, value]) => (
                    <View key={key} style={styles.fieldGroup}>
                      <Text style={styles.label}>{key}</Text>
                      <TextInput
                        style={styles.input}
                        value={String(value || '')}
                        onChangeText={(text) => setOptions({ ...options, [key]: text })}
                        placeholder={`Enter ${key}`}
                        placeholderTextColor="#666"
                      />
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1f1d24',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#6366f1',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#2a2730',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3a3740',
  },
  infoBox: {
    backgroundColor: '#2a2730',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  infoText: {
    color: '#888',
    fontSize: 14,
  },
});

export default EditMenu;

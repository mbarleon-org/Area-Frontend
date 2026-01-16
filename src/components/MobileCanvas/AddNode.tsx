import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';

type ModuleEntry = { name: string; data: any };
type CredentialItem = { id: string; provider?: string; type?: string; name?: string };

type AddNodeProps = {
  modules: ModuleEntry[];
  credentials: CredentialItem[];
  onClose: () => void;
  onAdd: (node: any) => void;
  offset: { x: number; y: number };
  scale: number;
  gridPx: number;
};

const computeSnapOffset = (worldSize: number, gridPx: number) => {
  const cells = Math.round(worldSize / gridPx);
  return (cells % 2 === 0) ? 0 : gridPx / 2;
};

const AddNode: React.FC<AddNodeProps> = ({ modules, onClose, onAdd, offset, scale, gridPx }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModules = modules.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectModule = (module: ModuleEntry) => {
    const m = module.data;
    const w = 240;
    const h = 144;

    // Calculate center of screen in world coordinates
    const screenCenterX = 200;
    const screenCenterY = 300;
    const worldX = (screenCenterX - offset.x) / scale;
    const worldY = (screenCenterY - offset.y) / scale;

    const snapOffX = computeSnapOffset(w, gridPx);
    const snapOffY = computeSnapOffset(h, gridPx);
    const x = Math.round((worldX - snapOffX) / gridPx) * gridPx + snapOffX;
    const y = Math.round((worldY - snapOffY) / gridPx) * gridPx + snapOffY;

    const connectionPoints: Array<{ side: 'left' | 'right' | 'top' | 'bottom'; offset: number }> = [];
    if (m.inputs) {
      Object.keys(m.inputs).forEach((_, idx) => {
        connectionPoints.push({ side: 'left' as const, offset: (idx - Object.keys(m.inputs).length / 2 + 0.5) * 24 });
      });
    }
    if (m.outputs) {
      Object.keys(m.outputs).forEach((_, idx) => {
        connectionPoints.push({ side: 'right' as const, offset: (idx - Object.keys(m.outputs).length / 2 + 0.5) * 24 });
      });
    }

    const newNode = {
      id: `n${Date.now()}`,
      x,
      y,
      width: w,
      height: h,
      label: m.name || module.name,
      icon: m.icon,
      module: m,
      connectionPoints,
      inputs: {},
      outputs: {},
      options: {},
    };

    onAdd(newNode);
  };

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
            <Text style={styles.title}>Add Module</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search modules..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Module List */}
          <ScrollView style={styles.moduleList}>
            {filteredModules.length === 0 ? (
              <Text style={styles.emptyText}>No modules found</Text>
            ) : (
              filteredModules.map((module, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.moduleItem}
                  onPress={() => handleSelectModule(module)}
                >
                  {module.data?.icon && (
                    <Text style={styles.moduleIcon}>{module.data.icon}</Text>
                  )}
                  <View style={styles.moduleInfo}>
                    <Text style={styles.moduleName}>{module.data?.name || module.name}</Text>
                    {module.data?.description && (
                      <Text style={styles.moduleDesc} numberOfLines={2}>
                        {module.data.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

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
    paddingBottom: 20,
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
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#aaa',
    fontSize: 32,
    lineHeight: 32,
  },
  searchInput: {
    margin: 16,
    padding: 12,
    backgroundColor: '#2a2730',
    borderRadius: 8,
    color: '#fff',
    fontSize: 16,
  },
  moduleList: {
    paddingHorizontal: 16,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2a2730',
    borderRadius: 8,
    marginBottom: 12,
  },
  moduleIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  moduleDesc: {
    color: '#888',
    fontSize: 14,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default AddNode;

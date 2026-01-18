import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { EditMenuTabsProps, TabType } from './EditMenu.types';
import { styles } from './EditMenu.styles';

type TabConfig = {
  key: TabType;
  label: string;
  visible: boolean;
};

export const EditMenuTabs: React.FC<EditMenuTabsProps> = ({
  activeTab,
  setActiveTab,
  hasInputs,
  hasOutputs,
  hasOptions,
}) => {
  const tabs: TabConfig[] = [
    { key: 'general', label: 'General', visible: true },
    { key: 'inputs', label: 'Inputs', visible: hasInputs },
    { key: 'outputs', label: 'Outputs', visible: hasOutputs },
    { key: 'options', label: 'Options', visible: hasOptions },
  ];

  return (
    <View style={styles.tabs}>
      {tabs
        .filter((tab) => tab.visible)
        .map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
    </View>
  );
};

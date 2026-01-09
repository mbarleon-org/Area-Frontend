import React from 'react';
import type { EditMenuTabsProps, TabType } from './EditMenu.types';
import { tabContainerStyle, tabStyle, activeTabStyle, combineStyles } from './EditMenu.styles';

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
    <div style={tabContainerStyle}>
      {tabs
        .filter((tab) => tab.visible)
        .map((tab) => (
          <button
            key={tab.key}
            style={combineStyles(tabStyle, activeTab === tab.key && activeTabStyle)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
    </div>
  );
};

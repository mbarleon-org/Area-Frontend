import React from 'react';

// --- Node Types ---
export type NodeItem = {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  label?: string;
  module?: ModuleData;
  inputs?: Record<string, string>;
  outputs?: Record<string, string>;
  options?: Record<string, any>;
  credential_id?: string;
} | null;

export type CredentialItem = {
  id: string;
  provider?: string;
  type?: string;
  name?: string;
  metadata?: Record<string, any>;
};

export type ModuleData = {
  actions?: Record<string, { spec?: ModuleSpec }>;
  triggers?: Record<string, { spec?: ModuleSpec }>;
};

export type ModuleSpec = {
  inputs?: InputSpec[];
  outputs?: InputSpec[];
  options?: OptionSpec[];
};

// --- Spec Types ---
export type InputSpec = {
  id: string;
  pretty_name: string;
  type: string;
  required?: boolean;
  description?: string;
};

export type OptionSpec = {
  id: string;
  pretty_name: string;
  type: string;
  description?: string;
};

export type ModuleSpecs = {
  inputs: InputSpec[];
  outputs: InputSpec[];
  options: OptionSpec[];
  isAction: boolean;
  isTrigger: boolean;
};

// --- Component Props ---
export type EditMenuProps = {
  node: NodeItem;
  updateNode: (patch: Partial<NonNullable<NodeItem>>) => void;
  onClose: () => void;
  credentials: CredentialItem[];
  refreshCredentials: () => Promise<void> | void;
};

export type EditMenuHandle = {
  requestClose: () => void;
};

export type TabType = 'general' | 'inputs' | 'outputs' | 'options';

// --- Sub-component Props ---
export type EditMenuTabsProps = {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  hasInputs: boolean;
  hasOutputs: boolean;
  hasOptions: boolean;
};

export type EditMenuFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'password';
  required?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
};

export type GmailConnectionProps = {
  connectedAccountLabel: string | null;
  availableCredentials: CredentialItem[];
  selectedCredentialId: string | null;
  authEmail: string;
  authPassword: string;
  isConnecting: boolean;
  onSelectCredential: (id: string | null) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onConnect: () => void;
};

export type CustomFieldsListProps = {
  fields: Record<string, string>;
  specs: InputSpec[];
  newKey: string;
  onNewKeyChange: (key: string) => void;
  onFieldChange: (id: string, value: string) => void;
  onFieldRemove: (id: string) => void;
  onFieldAdd: () => void;
  placeholder: string;
  helpText: string;
  isGmailModule?: boolean;
};

// --- Hook Return Type ---
export type UseEditMenuLogicReturn = {
  // State
  name: string;
  inputs: Record<string, string>;
  outputs: Record<string, string>;
  options: Record<string, any>;
  visible: boolean;
  activeTab: TabType;
  newInputKey: string;
  newOutputKey: string;
  authEmail: string;
  authPassword: string;
  isConnecting: boolean;
  connectedAccountLabel: string | null;
  selectedCredentialId: string | null;
  availableCredentials: CredentialItem[];
  specs: ModuleSpecs;
  provider: string | null;

  // Refs
  nameRef: React.RefObject<HTMLInputElement | null>;

  // Setters
  setName: (name: string) => void;
  setActiveTab: (tab: TabType) => void;
  setNewInputKey: (key: string) => void;
  setNewOutputKey: (key: string) => void;
  setAuthEmail: (email: string) => void;
  setAuthPassword: (password: string) => void;
  setSelectedCredentialId: (id: string | null) => void;

  // Handlers
  handleRequestClose: () => void;
  handleConnect: () => void;
  handleDisconnect: () => void;
  updateInput: (id: string, value: string) => void;
  updateOutput: (id: string, value: string) => void;
  updateOption: (id: string, value: string) => void;
  removeInput: (id: string) => void;
  removeOutput: (id: string) => void;
  addInput: () => void;
  addOutput: () => void;

  // Computed
  hasInputs: boolean;
  hasOutputs: boolean;
  hasOptions: boolean;
  isGmailModule: boolean;
};

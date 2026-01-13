// Field configuration for each admin entity type
export interface FieldConfig {
  key: string;
  label: string;
  editable: boolean;
  type: 'text' | 'email' | 'boolean' | 'number' | 'readonly';
}

export const USER_FIELDS: FieldConfig[] = [
  { key: 'id', label: 'ID', editable: false, type: 'readonly' },
  { key: 'username', label: 'Username', editable: true, type: 'text' },
  { key: 'email', label: 'Email', editable: true, type: 'email' },
  { key: 'isAdmin', label: 'Admin', editable: true, type: 'boolean' },
];

export const TEAM_FIELDS: FieldConfig[] = [
  { key: 'id', label: 'ID', editable: false, type: 'readonly' },
  { key: 'name', label: 'Name', editable: true, type: 'text' },
];

export const WORKFLOW_FIELDS: FieldConfig[] = [
  { key: 'id', label: 'ID', editable: false, type: 'readonly' },
  { key: 'pretty_name', label: 'Name', editable: true, type: 'text' },
  { key: 'description', label: 'Description', editable: true, type: 'text' },
  { key: 'enabled', label: 'Enabled', editable: true, type: 'boolean' },
];

export const CREDENTIAL_FIELDS: FieldConfig[] = [
  { key: 'id', label: 'ID', editable: false, type: 'readonly' },
  { key: 'name', label: 'Name', editable: true, type: 'text' },
  { key: 'description', label: 'Description', editable: true, type: 'text' },
  { key: 'type', label: 'Type', editable: false, type: 'readonly' },
];

export const getFieldsForType = (type: 'user' | 'team' | 'workflow' | 'credential'): FieldConfig[] => {
  switch (type) {
    case 'user':
      return USER_FIELDS;
    case 'team':
      return TEAM_FIELDS;
    case 'workflow':
      return WORKFLOW_FIELDS;
    case 'credential':
      return CREDENTIAL_FIELDS;
    default:
      return [];
  }
};

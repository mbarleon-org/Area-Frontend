export interface AdminUser {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt?: string;
  teams?: string[];
}

export interface AdminTeam {
  id: string;
  name: string;
}

export interface AdminWorkflow {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
  pretty_name?: string;
}

export interface AdminCredential {
  id: string;
  name: string;
  description: string;
  type: string;
}

export type AdminDataItem = AdminUser | AdminTeam | AdminWorkflow | AdminCredential;

export interface AdminCardData {
  id: string;
  fields: { label: string; value: string | number | boolean }[];
  raw: AdminDataItem;
  type: 'user' | 'team' | 'workflow' | 'credential';
}

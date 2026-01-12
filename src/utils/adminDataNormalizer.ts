import type { AdminCardData, AdminUser, AdminTeam, AdminWorkflow, AdminCredential } from '../types/AdminTypes';

export const normalizeUserToCard = (user: AdminUser): AdminCardData => ({
  id: user.id,
  fields: [
    { label: 'Username', value: user.username },
    { label: 'Email', value: user.email },
    { label: 'Admin', value: user.isAdmin },
  ],
  raw: user,
  type: 'user',
});

export const normalizeTeamToCard = (team: AdminTeam): AdminCardData => ({
  id: team.id,
  fields: [
    { label: 'Id', value: team.id || '—' },
    { label: 'Name', value: team.name },
  ],
  raw: team,
  type: 'team',
});

export const normalizeWorkflowToCard = (workflow: AdminWorkflow): AdminCardData => ({
  id: workflow.id,
  fields: [
    { label: 'Workflow Name', value: workflow.pretty_name || '—' },
    { label: 'Workflow Description', value: workflow.description || '—' },
    { label: 'Enabled', value: workflow.enabled },
  ],
  raw: workflow,
  type: 'workflow',
});

export const normalizeCredentialToCard = (credential: AdminCredential): AdminCardData => ({
  id: credential.id,
  fields: [
    { label: 'Credential Name', value: credential.name },
    { label: 'Credential Description', value: credential.description || '—' },
    { label: 'Type', value: credential.type },
  ],
  raw: credential,
  type: 'credential',
});

export const normalizeAdminData = (
  filterId: string,
  rawList: any[]
): AdminCardData[] => {
  switch (filterId) {
    case 'users':
      return rawList.map(normalizeUserToCard);
    case 'teams':
      return rawList.map(normalizeTeamToCard);
    case 'workflows':
      return rawList.map(normalizeWorkflowToCard);
    case 'credentials':
      return rawList.map(normalizeCredentialToCard);
    default:
      return [];
  }
};

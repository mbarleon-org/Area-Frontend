export { usersApi } from './admin/usersApi';
export { teamsApi } from './admin/teamsApi';
export { workflowsApi } from './admin/workflowsApi';
export { credentialsApi } from './admin/credentialsApi';

export type AdminApiType = 'user' | 'team' | 'workflow' | 'credential';

export interface UpdatePayload {
  [key: string]: any;
}

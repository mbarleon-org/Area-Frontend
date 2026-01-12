export interface AdminFilter {
  id: string;
  label: string;
  endpoint: string;
}

export const ADMIN_FILTERS: AdminFilter[] = [
  { id: 'users', label: 'Users', endpoint: '/users/all' },
  { id: 'teams', label: 'Teams', endpoint: '/teams/all' },
  { id: 'workflows', label: 'Workflows', endpoint: '/workflows/all' },
  { id: 'credentials', label: 'Credentials', endpoint: '/credentials/all' },
];

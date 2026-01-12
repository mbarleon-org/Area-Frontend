import type { AdminTeam } from '../../types/AdminTypes';

export const teamsApi = {
  getAll: async (get: (url: string) => Promise<any>): Promise<AdminTeam[]> => {
    const res = await get('/teams');
    return res?.teams || (Array.isArray(res) ? res : []);
  },

  getById: async (get: (url: string) => Promise<any>, id: string): Promise<AdminTeam | null> => {
    try {
      const res = await get(`/teams/${id}`);
      return res?.team || res || null;
    } catch {
      return null;
    }
  },

  update: async (
    put: (url: string, data: any) => Promise<any>,
    id: string,
    data: Partial<AdminTeam>
  ): Promise<boolean> => {
    try {
      await put(`/teams/${id}`, data);
      return true;
    } catch (err) {
      console.error('Failed to update team', err);
      return false;
    }
  },

  delete: async (del: (url: string) => Promise<any>, id: string): Promise<boolean> => {
    try {
      await del(`/teams/${id}`);
      return true;
    } catch (err) {
      console.error('Failed to delete team', err);
      return false;
    }
  },
};

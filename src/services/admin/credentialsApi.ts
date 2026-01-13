import type { AdminCredential } from '../../types/AdminTypes';

export const credentialsApi = {
  getAll: async (get: (url: string) => Promise<any>): Promise<AdminCredential[]> => {
    const res = await get('/credentials/all');
    return res?.credentials || (Array.isArray(res) ? res : []);
  },

  getById: async (get: (url: string) => Promise<any>, id: string): Promise<AdminCredential | null> => {
    try {
      const res = await get(`/credentials/${id}`);
      return res?.credential || res || null;
    } catch {
      return null;
    }
  },

  update: async (
    put: (url: string, data: any) => Promise<any>,
    id: string,
    data: Partial<AdminCredential>
  ): Promise<boolean> => {
    try {
      await put(`/credentials/${id}`, data);
      return true;
    } catch (err) {
      console.error('Failed to update credential', err);
      return false;
    }
  },

  delete: async (del: (url: string) => Promise<any>, id: string): Promise<boolean> => {
    try {
      await del(`/credentials/${id}`);
      return true;
    } catch (err) {
      console.error('Failed to delete credential', err);
      return false;
    }
  },
};

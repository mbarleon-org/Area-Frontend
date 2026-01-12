import type { AdminUser } from '../../types/AdminTypes';

export const usersApi = {
  getAll: async (get: (url: string) => Promise<any>): Promise<AdminUser[]> => {
    const res = await get('/users/all');
    return res?.users || (Array.isArray(res) ? res : []);
  },

  getById: async (get: (url: string) => Promise<any>, id: string): Promise<AdminUser | null> => {
    try {
      const res = await get(`/users/${id}`);
      return res?.user || res || null;
    } catch {
      return null;
    }
  },

  update: async (
    put: (url: string, data: any) => Promise<any>,
    id: string,
    data: Partial<AdminUser>
  ): Promise<boolean> => {
    try {
      const payload: any = { ...data };
      if (Object.prototype.hasOwnProperty.call(payload, 'isAdmin')) {
        payload.permissions = payload.isAdmin ? 1 : 0;
        delete payload.isAdmin;
      }

      await put(`/users/${id}`, payload);
      return true;
    } catch (err) {
      console.error('Failed to update user', err);
      return false;
    }
  },

  delete: async (del: (url: string) => Promise<any>, id: string): Promise<boolean> => {
    try {
      await del(`/users/${id}`);
      return true;
    } catch (err) {
      console.error('Failed to delete user', err);
      return false;
    }
  },

  search: (users: AdminUser[], query: string): AdminUser[] => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter((u) => {
      if (!u) return false;
      const id = (u.id ?? '').toString().toLowerCase();
      const email = (u.email ?? '').toString().toLowerCase();
      const username = (u.username ?? '').toString().toLowerCase();
      return id.includes(q) || email.includes(q) || username.includes(q);
    });
  },
};

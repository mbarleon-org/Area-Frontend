import type { AdminWorkflow } from '../../types/AdminTypes';

export const workflowsApi = {
  getAll: async (get: (url: string) => Promise<any>): Promise<AdminWorkflow[]> => {
    const res = await get('/workflows');
    return res?.workflows || (Array.isArray(res) ? res : []);
  },

  getById: async (get: (url: string) => Promise<any>, id: string): Promise<AdminWorkflow | null> => {
    try {
      const res = await get(`/workflows/${id}`);
      return res?.workflow || res || null;
    } catch {
      return null;
    }
  },

  update: async (
    put: (url: string, data: any) => Promise<any>,
    id: string,
    data: Partial<AdminWorkflow>
  ): Promise<boolean> => {
    try {
      await put(`/workflows/${id}`, data);
      return true;
    } catch (err) {
      console.error('Failed to update workflow', err);
      return false;
    }
  },

  delete: async (del: (url: string) => Promise<any>, id: string): Promise<boolean> => {
    try {
      await del(`/workflows/${id}`);
      return true;
    } catch (err) {
      console.error('Failed to delete workflow', err);
      return false;
    }
  },

  enable: async (post: (url: string, data: any) => Promise<any>, id: string): Promise<boolean> => {
    try {
      await post(`/workflows/${id}/enable`, {});
      return true;
    } catch (err) {
      console.error('Failed to enable workflow', err);
      return false;
    }
  },

  disable: async (post: (url: string, data: any) => Promise<any>, id: string): Promise<boolean> => {
    try {
      await post(`/workflows/${id}/disable`, {});
      return true;
    } catch (err) {
      console.error('Failed to disable workflow', err);
      return false;
    }
  },
};

import api from '@/lib/api';

export interface CreateGroupPayload {
  name: string;
  studentIds?: number[];
}

export const GroupService = {
  async getAll() {
    const { data } = await api.get('/groups');
    return data;
  },

  async getById(id: number) {
    const { data } = await api.get(`/groups/${id}`);
    return data;
  },

  async create(payload: CreateGroupPayload) {
    const { data } = await api.post('/groups', payload);
    return data;
  },

  async update(id: number, payload: { name: string }) {
    const { data } = await api.patch(`/groups/${id}`, payload);
    return data;
  },

  async addMember(groupId: number, studentId: number) {
    const { data } = await api.post(`/groups/${groupId}/members/${studentId}`);
    return data;
  },

  async removeMember(groupId: number, studentId: number) {
    const { data } = await api.delete(
      `/groups/${groupId}/members/${studentId}`,
    );
    return data;
  },

  async remove(id: number) {
    await api.delete(`/groups/${id}`);
  },
};

export default GroupService;

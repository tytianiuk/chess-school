import api from '@/lib/api';

export const UserService = {
  async getMyStudents() {
    const { data } = await api.get('/users/my-students');
    return data;
  },

  async getUnassignedStudents() {
    const { data } = await api.get('/users/unassigned');
    return data;
  },

  async assignStudent(studentId: number) {
    const { data } = await api.patch(`/users/assign/${studentId}`);
    return data;
  },

  async unassignStudent(studentId: number) {
    const { data } = await api.patch(`/users/unassign/${studentId}`);
    return data;
  },
};

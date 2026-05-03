import api from '@/lib/api';

export const AssignmentService = {
  async getAll() {
    const { data } = await api.get('/assignments');
    return data;
  },

  async create(payload: {
    title: string;
    description: string;
    puzzleIds: number[];
  }) {
    const { data } = await api.post('/assignments', payload);
    return data;
  },

  async remove(id: number) {
    await api.delete(`/assignments/${id}`);
  },

  async assignToStudent(payload: { studentId: number; assignmentId: number }) {
    const { data } = await api.post('/student-progress/assign', payload);
    return data;
  },
};

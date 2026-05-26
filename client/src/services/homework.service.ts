import api from '@/lib/api';

export interface HomeworkPuzzlePayload {
  puzzleId: number;
  checkType?: 'AUTO' | 'MANUAL';
}

export interface CreateHomeworkPayload {
  title: string;
  description?: string;
  groupId?: number; // Якщо домашнє завдання на всю групу
  studentId?: number; // Якщо завдання індивідуальне
  puzzles: HomeworkPuzzlePayload[];
}

export interface UpdateHomeworkPayload {
  title?: string;
  description?: string;
  groupId?: number;
  studentId?: number;
  puzzles?: HomeworkPuzzlePayload[];
}

export const HomeworkService = {
  async getAll() {
    const { data } = await api.get('/homeworks');
    return data;
  },

  async getById(id: number) {
    const { data } = await api.get(`/homeworks/${id}`);
    return data;
  },

  async getStudentHomeworks(studentId: number) {
    const { data } = await api.get(`/homeworks/student/${studentId}`);
    return data;
  },

  async create(payload: CreateHomeworkPayload) {
    const { data } = await api.post('/homeworks', payload);
    return data;
  },

  async update(id: number, payload: UpdateHomeworkPayload) {
    const { data } = await api.patch(`/homeworks/${id}`, payload);
    return data;
  },

  async remove(id: number) {
    await api.delete(`/homeworks/${id}`);
  },
};

export default HomeworkService;

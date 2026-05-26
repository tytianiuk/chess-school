import api from '@/lib/api';

export const PuzzleService = {
  async getAll() {
    const { data } = await api.get('/puzzles');
    return data;
  },

  async getById(id: number) {
    const { data } = await api.get(`/puzzles/${id}`);
    return data;
  },

  async create(payload: {
    fen: string;
    solution: string;
    title?: string;
    hint?: string;
    tags?: string[];
    type?: 'AUTO' | 'MANUAL';
  }) {
    const { data } = await api.post('/puzzles', payload);
    return data;
  },

  async update(
    id: number,
    payload: Partial<{
      fen: string;
      solution: string;
      title: string;
      hint: string;
      tags: string[];
      type: 'AUTO' | 'MANUAL';
    }>,
  ) {
    const { data } = await api.patch(`/puzzles/${id}`, payload);
    return data;
  },

  async remove(id: number) {
    await api.delete(`/puzzles/${id}`);
  },
};

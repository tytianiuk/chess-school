import api from '@/lib/api';
import { PuzzleTag } from '@/lib/types';

export const PuzzleTagService = {
  async getAll() {
    const { data } = await api.get('/puzzles-tags');
    return data as PuzzleTag[];
  },

  async getById(id: number) {
    const { data } = await api.get<PuzzleTag>(`/puzzles-tags/${id}`);
    return data;
  },

  async create(payload: { name: string; label: string }) {
    const { data } = await api.post<PuzzleTag>('/puzzles-tags', payload);
    return data;
  },

  async update(
    id: number,
    payload: Partial<{
      name: string;
      label: string;
    }>,
  ) {
    const { data } = await api.patch<PuzzleTag>(`/puzzles-tags/${id}`, payload);
    return data;
  },

  async remove(id: number) {
    await api.delete(`/puzzles-tags/${id}`);
  },
};

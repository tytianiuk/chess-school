import api from '@/lib/api';
import { CheckType, PaginatedResponse, Puzzle } from '@/lib/types';

export const PuzzleService = {
  async getAll() {
    const { data } = await api.get('/puzzles');
    return data as PaginatedResponse<Puzzle>;
  },

  async getPaginated(page: number = 1, limit: number = 8) {
    const { data } = await api.get<{
      data: Puzzle[];
    }>('/puzzles', {
      params: { page, limit },
    });
    return data as PaginatedResponse<Puzzle>;
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
    rating?: number;
    type?: CheckType;
    tagIds?: number[];
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
      rating?: number;
      tags: string[];
      type: CheckType;
      tagIds?: number[];
    }>,
  ) {
    const { data } = await api.patch(`/puzzles/${id}`, payload);
    return data;
  },

  async remove(id: number) {
    await api.delete(`/puzzles/${id}`);
  },
};

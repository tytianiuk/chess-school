import api from '@/lib/api';
import { ProgressStatus } from '@/lib/types';
export interface CreateHomeworkAnswerPayload {
  homeworkId: number;
  studentId: number;
}

export interface MakeMovePayload {
  homeworkPuzzleId: number;
  move: string;
}

export interface ReviewHomeworkPayload {
  status: ProgressStatus;
  comment?: string;
  score?: number;
}

export const HomeworkAnswerService = {
  async assign(payload: CreateHomeworkAnswerPayload) {
    const { data } = await api.post('/homework-answers/assign', payload);
    return data;
  },

  async getAnswersForHomework(homeworkId: number) {
    const { data } = await api.get(`/homework-answers/homework/${homeworkId}`);
    return data;
  },

  async getStudentAnswer(homeworkId: number, studentId: number) {
    const { data } = await api.get(
      `/homework-answers/homework/${homeworkId}/student/${studentId}`,
    );
    return data;
  },

  async getMyHomeworks() {
    const { data } = await api.get('/homework-answers/my-homeworks');
    return data;
  },

  async makeMove(id: number, payload: MakeMovePayload) {
    const { data } = await api.patch(`/homework-answers/${id}/move`, payload);
    return data;
  },

  async review(id: number, payload: ReviewHomeworkPayload) {
    const { data } = await api.patch(`/homework-answers/${id}/review`, payload);
    return data;
  },

  async getPuzzleState(id: number, homeworkPuzzleId: number) {
    const { data } = await api.get(
      `/homework-answers/${id}/puzzle-state/${homeworkPuzzleId}`,
    );
    return data;
  },

  async unassign(id: number) {
    const { data } = await api.delete(`/homework-answers/${id}/unassign`);
    return data;
  },
};

export default HomeworkAnswerService;

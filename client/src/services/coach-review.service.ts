import api from '@/lib/api';
import type {
  CoachReview,
  CreateCoachReviewInput,
  TrainingCoach,
} from '@/lib/types';

export const CoachReviewService = {
  getStudentCoaches: async (): Promise<{
    hasCoach: boolean;
    coaches: TrainingCoach[];
  }> => {
    const { data } = await api.get('/coach-reviews/my-coaches');
    return data;
  },

  createReview: async (
    payload: CreateCoachReviewInput,
  ): Promise<CoachReview> => {
    const { data } = await api.post('/coach-reviews', payload);
    return data;
  },

  getCoachReviews: async (coachId: number): Promise<any[]> => {
    const { data } = await api.get(`/coach-reviews/coach/${coachId}`);
    return data;
  },

  getMyOwnReviews: async (): Promise<{
    avgRating: number;
    reviewsCount: number;
    reviews: any[];
  }> => {
    const { data } = await api.get('/coach-reviews/my-reviews');
    return data;
  },

  deleteReview: async (coachId: number): Promise<void> => {
    await api.delete(`/coach-reviews/coach/${coachId}`);
  },
};

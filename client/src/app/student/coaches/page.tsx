'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { CoachReviewService } from '@/services/coach-review.service';
import { CoachReviewModal } from './components/coach-review-modal';
import { CoachSearchGrid } from './components/coach-search-grid';
import { CoachProfileDetails } from './components/coach-profile-details';
import { PersonalCoachCard } from './components/personal-coach-card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { TrainingCoach } from '@/lib/types';

export default function StudentCoachesPage() {
  const [selectedCoachForReview, setSelectedCoachForReview] =
    useState<TrainingCoach | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeCoachId, setActiveCoachId] = useState<number | null>(null);

  const {
    data: response,
    mutate: mutateCoach,
    isLoading: isCoachLoading,
  } = useSWR<{
    hasCoach: boolean;
    coaches: TrainingCoach[];
  }>('student-coaches', CoachReviewService.getStudentCoaches);

  const hasCoach = response?.hasCoach ?? false;
  const coachesList = response?.coaches ?? [];

  const coach = hasCoach
    ? coachesList[0]
    : coachesList.find((c: any) => c.id === activeCoachId) || null;

  const {
    data: reviews,
    mutate: mutateReviews,
    isLoading: isReviewsLoading,
  } = useSWR(coach ? `coach-reviews-${coach.id}` : null, () =>
    CoachReviewService.getCoachReviews(coach!.id),
  );

  const handleOpenReviewModal = (coachToReview: TrainingCoach) => {
    setSelectedCoachForReview(coachToReview);
    setIsModalOpen(true);
  };

  const handleDeleteReview = async (coachId: number) => {
    setIsDeleting(true);
    try {
      await CoachReviewService.deleteReview(coachId);
      toast.success('Відгук успішно видалено!');
      mutateCoach();
      mutateReviews();
    } catch {
      toast.error('Не вдалося видалити відгук');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isCoachLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Завантаження даних...
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-4 max-w-5xl mx-auto">
      {!hasCoach && !coach ? (
        <CoachSearchGrid
          coachesList={coachesList}
          onSelectCoach={setActiveCoachId}
        />
      ) : !hasCoach && coach ? (
        <CoachProfileDetails
          coach={coach}
          reviews={reviews}
          isReviewsLoading={isReviewsLoading}
          onBack={() => setActiveCoachId(null)}
        />
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Мій Тренер</h1>
          </div>
          <PersonalCoachCard
            coach={coach!}
            reviews={reviews}
            isReviewsLoading={isReviewsLoading}
            isDeleting={isDeleting}
            onOpenReviewModal={handleOpenReviewModal}
            onDeleteReview={handleDeleteReview}
          />
        </div>
      )}

      <CoachReviewModal
        coach={selectedCoachForReview}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCoachForReview(null);
        }}
        onSuccess={() => {
          mutateCoach();
          mutateReviews();
        }}
      />
    </div>
  );
}

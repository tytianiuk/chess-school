'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
import { CoachReviewService } from '@/services/coach-review.service';
import { toast } from 'sonner';
import { MessageSquarePlus } from 'lucide-react';
import type { TrainingCoach } from '@/lib/types';

interface CoachReviewModalProps {
  coach: TrainingCoach | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CoachReviewModal({
  coach,
  isOpen,
  onClose,
  onSuccess,
}: CoachReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!coach) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Будь ласка, оберіть оцінку від 1 до 5 зірок');
      return;
    }

    setIsSubmitting(true);
    try {
      await CoachReviewService.createReview({
        coachId: coach.id,
        rating,
        comment: comment.trim(),
      });
      toast.success(
        `Дякуємо! Відгук про тренера ${coach.name} успішно збережено.`,
      );
      setComment('');
      setRating(5);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Не вдалося зберегти відгук',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <MessageSquarePlus className="h-5 w-5" />
            <DialogTitle>Оцінити роботу тренера</DialogTitle>
          </div>
          <DialogDescription className="text-xs pt-1">
            Ваш відгук допоможе тренеру підвищити якість занять, а іншим учням
            зробити правильний вибір.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-1.5 flex flex-col items-center justify-center p-2 bg-muted/20 rounded-xl border">
            <span className="text-xs font-medium text-muted-foreground">
              Ваша оцінка:
            </span>
            <StarRating rating={rating} onRatingChange={setRating} size={28} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Ваш відгук (обов'язково):
            </label>
            <Textarea
              placeholder="Поділіться враженнями від тренувань (пунктуальність, зрозумілість пояснень, підбір матеріалу тощо)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] text-sm rounded-xl resize-none"
              required
              maxLength={500}
            />
            <span className="text-[10px] text-muted-foreground text-right block">
              {comment.length}/500 символів
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl text-xs"
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold px-4"
            >
              {isSubmitting ? 'Надсилання...' : 'Залишити відгук'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

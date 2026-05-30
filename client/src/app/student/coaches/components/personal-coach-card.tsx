'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CoachReviewsList } from '@/components/coach-reviews-list';
import {
  Mail,
  CheckCircle,
  Trash2,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import type { TrainingCoach } from '@/lib/types';

interface PersonalCoachCardProps {
  coach: TrainingCoach;
  reviews: any[] | undefined;
  isReviewsLoading: boolean;
  isDeleting: boolean;
  onOpenReviewModal: (coach: TrainingCoach) => void;
  onDeleteReview: (id: number) => void;
}

export function PersonalCoachCard({
  coach,
  reviews,
  isReviewsLoading,
  isDeleting,
  onOpenReviewModal,
  onDeleteReview,
}: PersonalCoachCardProps) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-600 text-xl shrink-0">
              {coach.name.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">
                {coach.name}
              </CardTitle>
              <CardDescription className="text-sm flex items-center gap-1.5 mt-1 font-mono text-blue-600">
                <Mail className="h-4 w-4 text-muted-foreground" /> {coach.email}
              </CardDescription>
            </div>
          </div>

          <Badge
            variant={coach.hasReviewed ? 'secondary' : 'default'}
            className={`text-xs px-3 py-1 font-medium ${
              coach.hasReviewed
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-blue-600 text-white'
            }`}
          >
            {coach.hasReviewed ? 'Оцінено вами' : 'Чекає вашої оцінки'}
          </Badge>
        </CardHeader>

        <CardContent className="pt-3 flex items-center justify-between border-t bg-muted/10 px-5">
          {coach.hasReviewed ? (
            <>
              <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <CheckCircle className="h-4 w-4" /> Вашу оцінку успішно додано
              </div>
              <Button
                size="sm"
                variant="ghost"
                disabled={isDeleting}
                onClick={() => onDeleteReview(coach.id)}
                className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50/80 gap-1.5 rounded-lg px-3"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Видалити відгук
              </Button>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <Button
                onClick={() => onOpenReviewModal(coach)}
                className="gap-2 text-xs font-bold h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 shadow-sm"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Оцінити роботу
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
          Відгуки інших учнів
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-mono text-muted-foreground">
            {reviews?.length ?? 0}
          </span>
        </h3>
        {isReviewsLoading ? (
          <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Завантаження
            коментарів...
          </div>
        ) : (
          <CoachReviewsList reviews={reviews} />
        )}
      </div>
    </div>
  );
}

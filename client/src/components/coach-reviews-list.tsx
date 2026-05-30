'use client';

import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { Calendar, MessageSquare } from 'lucide-react';
import type { CoachReview } from '@/lib/types';

interface CoachReviewsListProps {
  reviews: CoachReview[] | undefined;
}

export function CoachReviewsList({ reviews }: CoachReviewsListProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-xl bg-muted/5">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground italic">
          Про цього тренера ще немає публічних відгуків. Будьте першим!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {reviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </div>
  );
}

function ReviewItem({ review }: { review: any }) {
  return (
    <Card className="bg-background/50 hover:bg-background/80 transition-colors border-border/80">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-md font-bold text-muted-foreground">
              {review.student?.fullName?.charAt(0) || 'U'}
            </div>
            <span className="text-sm font-semibold text-foreground">
              {review.student?.fullName || 'Анонімний учень'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <StarRating rating={review.rating} readonly size={14} />
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
              <Calendar className="h-3 w-3" />
              {new Date(review.createdAt).toLocaleDateString('uk-UA')}
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/20 px-3 rounded-xl border border-border/40 font-normal">
          {review.comment}
        </p>
      </CardContent>
    </Card>
  );
}

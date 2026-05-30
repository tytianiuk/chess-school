'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CoachReviewsList } from '@/components/coach-reviews-list';
import { ArrowLeft, Mail, Star, Loader2 } from 'lucide-react';
import type { TrainingCoach } from '@/lib/types';

interface CoachProfileDetailsProps {
  coach: TrainingCoach;
  reviews: any[] | undefined;
  isReviewsLoading: boolean;
  onBack: () => void;
}

export function CoachProfileDetails({
  coach,
  reviews,
  isReviewsLoading,
  onBack,
}: CoachProfileDetailsProps) {
  return (
    <div className="space-y-6 px-4 py-4 max-w-4xl mx-auto animate-in fade-in duration-200">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-1.5 text-muted-foreground rounded-xl"
      >
        <ArrowLeft className="h-4 w-4" /> Назад до списку тренерів
      </Button>

      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-muted/5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-blue-600 border border-blue-700 flex items-center justify-center font-bold text-white text-xl">
              {coach.name.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-xl font-bold">{coach.name}</CardTitle>
              <CardDescription className="text-sm flex items-center gap-1.5 mt-1">
                <Mail className="h-4 w-4 text-blue-500" />
                <a
                  href={`mailto:${coach.email}`}
                  className="text-blue-600 hover:underline font-mono"
                >
                  {coach.email}
                </a>
              </CardDescription>
            </div>
          </div>
          <div className="bg-background px-4 py-2 rounded-xl border flex flex-col items-center shrink-0">
            <div className="flex items-center gap-1 text-amber-500 font-bold text-lg font-mono">
              <Star className="h-4 w-4 fill-current" />{' '}
              {(coach as any).avgRating || '0.0'}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Рейтинг тренера
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5 text-sm text-muted-foreground leading-relaxed">
          <p>
            Ви можете зв'язатися з цим тренером через вказану електронну пошту,
            щоб домовитися про індивідуальні шахові заняття, аналіз партій чи
            складання тренувального плану. Після того як тренер прикріпить вас
            до себе в кабінеті, ви зможете отримувати від нього інтерактивні
            домашні завдання.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
          Відгуки вихованців тренера
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-mono text-muted-foreground">
            {reviews?.length ?? 0}
          </span>
        </h3>
        {isReviewsLoading ? (
          <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Оновлюємо
            коментарі...
          </div>
        ) : (
          <CoachReviewsList reviews={reviews} />
        )}
      </div>
    </div>
  );
}

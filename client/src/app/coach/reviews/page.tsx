'use client';

import useSWR from 'swr';
import { CoachReviewService } from '@/services/coach-review.service';
import { CoachReviewsList } from '@/components/coach-reviews-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Star, Loader2 } from 'lucide-react';

export default function CoachReviewsPage() {
  const { data: data, isLoading } = useSWR(
    'coach-own-reviews',
    CoachReviewService.getMyOwnReviews,
  );

  const statsConfig = [
    {
      title: 'Середній рейтинг',
      value: `${data?.avgRating || '0.0'}`,
      extra: (
        <span className="text-xs text-muted-foreground font-normal font-sans">
          / 5.0
        </span>
      ),
      icon: <Star className="h-4 w-4 fill-amber-500 text-amber-500" />,
    },
    {
      title: 'Усього відгуків',
      value: `${data?.reviewsCount || 0}`,
      extra: null,
      icon: <MessageSquare className="h-4 w-4 text-blue-500" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Завантаження відгуків та аналітики...
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-4 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Відгуки про мене</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Аналізуйте оцінки та коментарі ваших вихованців для підвищення якості
          навчання.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statsConfig.map((item, index) => (
          <Card key={index} className="shadow-sm border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {item.title}
              </CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-foreground flex items-baseline gap-1">
                {item.value}
                {item.extra}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3 pt-2">
        <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
          Історія коментарів від учнів
        </h3>

        <CoachReviewsList reviews={data?.reviews} />
      </div>
    </div>
  );
}

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Star } from 'lucide-react';
import type { TrainingCoach } from '@/lib/types';

interface CoachSearchGridProps {
  coachesList: TrainingCoach[];
  onSelectCoach: (id: number) => void;
}

export function CoachSearchGrid({
  coachesList,
  onSelectCoach,
}: CoachSearchGridProps) {
  return (
    <div className="space-y-6 px-4 py-4 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Доступні Тренери</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Оберіть наставника для індивідуальної роботи та перегляньте його
          рейтинг і відгуки.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coachesList.length > 0 ? (
          coachesList.map((c: any) => (
            <Card
              key={c.id}
              className="overflow-hidden border flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base font-bold text-foreground truncate group-hover:text-blue-600 transition-colors">
                      {c.name}
                    </CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1 mt-1 font-mono text-muted-foreground truncate">
                      <Mail className="h-3 w-3 shrink-0" /> {c.email}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-lg text-xs font-bold font-mono shrink-0">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />{' '}
                  {c.avgRating || '0.0'}
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex items-center justify-between border-t bg-muted/10 px-4">
                <span className="text-xs text-muted-foreground font-medium">
                  Відгуків:{' '}
                  <span className="font-bold text-foreground font-mono">
                    {c.reviewsCount}
                  </span>
                </span>
                <Button
                  size="sm"
                  onClick={() => onSelectCoach(c.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-9 px-4"
                >
                  Переглянути профіль
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed col-span-2 h-[200px] flex items-center justify-center bg-muted/10">
            <p className="text-sm text-muted-foreground italic">
              На платформі ще немає зареєстрованих тренерів.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

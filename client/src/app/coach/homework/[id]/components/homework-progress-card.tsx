'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface HomeworkProgressCardProps {
  completedCount: number;
  pendingReviewCount: number;
  totalStudents: number;
  progressPercent: number;
}

export function HomeworkProgressCard({
  completedCount,
  pendingReviewCount,
  totalStudents,
  progressPercent,
}: HomeworkProgressCardProps) {
  const inProgressCount = totalStudents - completedCount - pendingReviewCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Загальний прогрес</CardTitle>
        <CardDescription>
          Виконано {completedCount} з {totalStudents} учнів
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progressPercent} className="h-2" />
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {completedCount}
            </div>
            <div className="text-sm text-muted-foreground">Виконано</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingReviewCount}
            </div>
            <div className="text-sm text-muted-foreground">На перевірці</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">
              {inProgressCount < 0 ? 0 : inProgressCount}
            </div>
            <div className="text-sm text-muted-foreground">В процесі</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

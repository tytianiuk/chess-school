'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import type { HomeworkAnswer } from '@/lib/types';
import { StatusBadge } from './status-badge';

interface AnswerStatusCardProps {
  answer: HomeworkAnswer;
  solvedPuzzlesCount: number;
  totalPuzzlesCount: number;
}

export function AnswerStatusCard({
  answer,
  solvedPuzzlesCount,
  totalPuzzlesCount,
}: AnswerStatusCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Статус виконання</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={answer.status} />
          <Badge
            variant="outline"
            className="flex items-center gap-1.5 py-1 px-2.5 font-medium border-blue-200 bg-blue-50/50 text-blue-700"
          >
            <Trophy className="h-3.5 w-3.5 text-blue-600" />
            <span>
              Задач вирішено: {solvedPuzzlesCount} з {totalPuzzlesCount}
            </span>
          </Badge>

          {answer.score !== null && answer.score !== undefined && (
            <div className="text-base sm:ml-4 font-medium">
              Оцінка:{' '}
              <span className="font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md font-mono">
                {answer.score}/100
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

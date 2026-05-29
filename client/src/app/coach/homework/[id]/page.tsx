'use client';

import { use } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { HomeworkService } from '@/services/homework.service';
import { HomeworkAnswerService } from '@/services/homework-answer.service';
import type { HomeworkAnswer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { HomeworkProgressCard } from './components/homework-progress-card';
import { StudentResultsCard } from './components/student-results-card';
import { HomeworkPuzzlesCard } from './components/homework-puzzles-card';
import { HomeworkHeader } from './components/header';

export default function HomeworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const homeworkId = parseInt(resolvedParams.id);

  const { data: homework, isLoading: homeworkLoading } = useSWR(
    homeworkId ? `homework-${homeworkId}` : null,
    () => HomeworkService.getById(homeworkId),
  );

  const { data: answers, isLoading: answersLoading } = useSWR(
    homeworkId ? `homework-answers-${homeworkId}` : null,
    () => HomeworkAnswerService.getAnswersForHomework(homeworkId),
  );

  const isLoading = homeworkLoading || answersLoading;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-4 py-2">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!homework) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">Завдання не знайдено</h2>
        <Link href="/coach/homework">
          <Button>Повернутися до списку</Button>
        </Link>
      </div>
    );
  }

  const totalStudents = answers?.length ?? 0;
  const completedCount =
    answers?.filter((a: HomeworkAnswer) => a.status === 'SOLVED').length ?? 0;
  const pendingReviewCount =
    answers?.filter((a: HomeworkAnswer) => a.status === 'REVIEW_PENDING')
      .length ?? 0;
  const progressPercent =
    totalStudents > 0 ? (completedCount / totalStudents) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-2">
      <HomeworkHeader homework={homework} />

      {homework.description && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Опис завдання
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {homework.description}
            </p>
          </CardContent>
        </Card>
      )}

      <HomeworkProgressCard
        completedCount={completedCount}
        pendingReviewCount={pendingReviewCount}
        totalStudents={totalStudents}
        progressPercent={progressPercent}
      />
      <StudentResultsCard answers={answers} homeworkId={homeworkId} />
      <HomeworkPuzzlesCard puzzles={homework.puzzles} />
    </div>
  );
}

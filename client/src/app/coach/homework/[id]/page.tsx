'use client';

import { use } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { HomeworkService } from '@/services/homework.service';
import { HomeworkAnswerService } from '@/services/homework-answer.service';
import type {
  HomeworkAnswer,
  HomeworkPuzzle,
  ProgressStatus,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Users,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
} from 'lucide-react';

const statusConfig: Record<
  ProgressStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING: { label: 'Очікує', color: 'bg-gray-500', icon: Clock },
  IN_PROGRESS: { label: 'В процесі', color: 'bg-blue-500', icon: Clock },
  REVIEW_PENDING: {
    label: 'На перевірці',
    color: 'bg-yellow-500',
    icon: AlertCircle,
  },
  SOLVED: { label: 'Виконано', color: 'bg-green-500', icon: CheckCircle2 },
  FAILED: { label: 'Не виконано', color: 'bg-red-500', icon: XCircle },
};

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
      <div className="max-w-4xl mx-auto space-y-6">
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/coach/homework">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {homework.title}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            {homework.groupId ? (
              <>
                <Users className="h-4 w-4" />
                <span>{homework.group?.name}</span>
              </>
            ) : homework.studentId ? (
              <>
                <User className="h-4 w-4" />
                <span>{homework.student?.fullName}</span>
              </>
            ) : null}
            <span>•</span>
            <span>{homework.puzzles?.length ?? 0} задач</span>
          </div>
        </div>
      </div>

      {homework.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Опис</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{homework.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Progress Overview */}
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
                {totalStudents - completedCount - pendingReviewCount}
              </div>
              <div className="text-sm text-muted-foreground">В процесі</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Answers */}
      <Card>
        <CardHeader>
          <CardTitle>Результати учнів</CardTitle>
          <CardDescription>Перегляньте та оцініть роботи учнів</CardDescription>
        </CardHeader>
        <CardContent>
          {answers && answers.length > 0 ? (
            <div className="space-y-3">
              {answers.map((answer: HomeworkAnswer) => {
                const config = statusConfig[answer.status];
                const StatusIcon = config.icon;

                return (
                  <div
                    key={answer.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${config.color}`}
                      >
                        <StatusIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {answer.student?.fullName}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                          {answer.score !== null &&
                            answer.score !== undefined && (
                              <span>Оцінка: {answer.score}</span>
                            )}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/coach/homework/${homeworkId}/student/${answer.studentId}`}
                    >
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Переглянути
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Ще немає відповідей</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Задачі в завданні</CardTitle>
        </CardHeader>
        <CardContent>
          {homework.puzzles && homework.puzzles.length > 0 ? (
            <div className="space-y-2">
              {homework.puzzles.map((hp: HomeworkPuzzle, index: number) => (
                <div
                  key={hp.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <span className="text-sm text-muted-foreground w-6">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">
                      {hp.puzzle?.title || `Задача #${hp.puzzleId}`}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono truncate max-w-md">
                      {hp.puzzle?.fen}
                    </div>
                  </div>
                  <Badge
                    variant={hp.checkType === 'AUTO' ? 'secondary' : 'outline'}
                  >
                    {hp.checkType === 'AUTO' ? 'Автоматична' : 'Ручна'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Немає задач</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

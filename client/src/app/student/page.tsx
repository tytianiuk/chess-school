'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { HomeworkAnswerService } from '@/services/homework-answer.service';
import type { HomeworkAnswer, ProgressStatus } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Trophy,
} from 'lucide-react';

const statusConfig: Record<
  ProgressStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING: { label: 'Нове', color: 'bg-gray-500', icon: Clock },
  IN_PROGRESS: { label: 'В процесі', color: 'bg-blue-500', icon: Clock },
  REVIEW_PENDING: {
    label: 'На перевірці',
    color: 'bg-yellow-500',
    icon: AlertCircle,
  },
  SOLVED: { label: 'Виконано', color: 'bg-green-500', icon: CheckCircle2 },
  FAILED: { label: 'Не виконано', color: 'bg-red-500', icon: AlertCircle },
};

export default function StudentDashboardPage() {
  const { data: homeworks, isLoading } = useSWR(
    'my-homeworks',
    HomeworkAnswerService.getMyHomeworks,
  );

  const stats = {
    total: homeworks?.length ?? 0,
    completed:
      homeworks?.filter((h: HomeworkAnswer) => h.status === 'SOLVED').length ??
      0,
    inProgress:
      homeworks?.filter((h: HomeworkAnswer) => h.status === 'IN_PROGRESS')
        .length ?? 0,
    pending:
      homeworks?.filter((h: HomeworkAnswer) => h.status === 'PENDING').length ??
      0,
  };

  const completionRate =
    stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const activeHomeworks = homeworks?.filter(
    (h: HomeworkAnswer) => h.status === 'PENDING' || h.status === 'IN_PROGRESS',
  );

  const recentCompleted = homeworks
    ?.filter((h: HomeworkAnswer) => h.status === 'SOLVED')
    .sort((a: HomeworkAnswer, b: HomeworkAnswer) => {
      if (!a.completedAt || !b.completedAt) return 0;
      return (
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
    })
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Мої завдання</h1>
        <p className="text-muted-foreground">
          Переглядайте завдання та вирішуйте шахові задачі
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Всього завдань</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? <Skeleton className="h-9 w-12" /> : stats.total}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Виконано</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {isLoading ? <Skeleton className="h-9 w-12" /> : stats.completed}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>В процесі</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {isLoading ? <Skeleton className="h-9 w-12" /> : stats.inProgress}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Нові</CardDescription>
            <CardTitle className="text-3xl text-gray-600">
              {isLoading ? <Skeleton className="h-9 w-12" /> : stats.pending}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Загальний прогрес
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-4 w-full" />
          ) : (
            <div className="space-y-2">
              <Progress value={completionRate} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Виконано {stats.completed} з {stats.total} завдань (
                {Math.round(completionRate)}
                %)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Активні завдання</CardTitle>
              <CardDescription>
                Завдання, що потребують виконання
              </CardDescription>
            </div>
            <Link href="/student/homework">
              <Button variant="ghost" size="sm" className="gap-1">
                Всі
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : activeHomeworks && activeHomeworks.length > 0 ? (
              <div className="space-y-3">
                {activeHomeworks.slice(0, 5).map((hw: HomeworkAnswer) => {
                  const config = statusConfig[hw.status];
                  const StatusIcon = config.icon;

                  return (
                    <Link
                      key={hw.id}
                      href={`/student/homework/${hw.homeworkId}`}
                    >
                      <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${config.color}`}
                        >
                          <StatusIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            {hw.homework?.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {hw.homework?.puzzles?.length ?? 0} задач
                          </div>
                        </div>
                        <Badge variant="outline">{config.label}</Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Немає активних завдань</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Нещодавно виконані</CardTitle>
            <CardDescription>Ваші останні досягнення</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentCompleted && recentCompleted.length > 0 ? (
              <div className="space-y-3">
                {recentCompleted.map((hw: HomeworkAnswer) => (
                  <div
                    key={hw.id}
                    className="flex items-center gap-4 p-4 rounded-lg border"
                  >
                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{hw.homework?.title}</div>
                      {hw.score !== null && hw.score !== undefined && (
                        <div className="text-sm text-muted-foreground">
                          Оцінка: {hw.score}/100
                        </div>
                      )}
                    </div>
                    {hw.completedAt && (
                      <span className="text-sm text-muted-foreground">
                        {new Date(hw.completedAt).toLocaleDateString('uk-UA')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Ще немає виконаних завдань</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

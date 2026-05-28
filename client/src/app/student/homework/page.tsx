'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { HomeworkAnswerService } from '@/services/homework-answer.service';
import type { HomeworkAnswer, ProgressStatus } from '@/lib/types';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';

const statusConfig: Record<
  ProgressStatus,
  {
    label: string;
    color: string;
    icon: React.ElementType;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
  }
> = {
  PENDING: {
    label: 'Нове',
    color: 'bg-gray-500',
    icon: Clock,
    variant: 'outline',
  },
  IN_PROGRESS: {
    label: 'В процесі',
    color: 'bg-blue-500',
    icon: Clock,
    variant: 'secondary',
  },
  REVIEW_PENDING: {
    label: 'На перевірці',
    color: 'bg-yellow-500',
    icon: AlertCircle,
    variant: 'default',
  },
  SOLVED: {
    label: 'Виконано',
    color: 'bg-green-500',
    icon: CheckCircle2,
    variant: 'default',
  },
  FAILED: {
    label: 'Не виконано',
    color: 'bg-red-500',
    icon: XCircle,
    variant: 'destructive',
  },
};

export default function StudentHomeworkListPage() {
  const { data: homeworks, isLoading } = useSWR(
    'my-homeworks',
    HomeworkAnswerService.getMyHomeworks,
  );
  const [activeTab, setActiveTab] = useState('active');

  const activeHomeworks = homeworks?.filter(
    (h: HomeworkAnswer) => h.status === 'PENDING' || h.status === 'IN_PROGRESS',
  );
  const completedHomeworks = homeworks?.filter(
    (h: HomeworkAnswer) => h.status === 'SOLVED' || h.status === 'FAILED',
  );
  const reviewHomeworks = homeworks?.filter(
    (h: HomeworkAnswer) => h.status === 'REVIEW_PENDING',
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Мої завдання</h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col"
      >
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            <Clock className="h-4 w-4" />
            Активні ({activeHomeworks?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="review" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            На перевірці ({reviewHomeworks?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Завершені ({completedHomeworks?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {isLoading ? (
            <HomeworkListSkeleton />
          ) : activeHomeworks && activeHomeworks.length > 0 ? (
            <HomeworkList homeworks={activeHomeworks} />
          ) : (
            <EmptyState
              icon={BookOpen}
              title="Немає активних завдань"
              description="Коли тренер призначить вам нове завдання, воно з'явиться тут"
            />
          )}
        </TabsContent>

        <TabsContent value="review" className="mt-6">
          {isLoading ? (
            <HomeworkListSkeleton />
          ) : reviewHomeworks && reviewHomeworks.length > 0 ? (
            <HomeworkList homeworks={reviewHomeworks} />
          ) : (
            <EmptyState
              icon={AlertCircle}
              title="Немає завдань на перевірці"
              description="Завдання, що очікують перевірки тренером, з'являться тут"
            />
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {isLoading ? (
            <HomeworkListSkeleton />
          ) : completedHomeworks && completedHomeworks.length > 0 ? (
            <HomeworkList homeworks={completedHomeworks} />
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="Немає завершених завдань"
              description="Виконані завдання з'являться тут"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HomeworkList({
  homeworks,
}: {
  homeworks: Awaited<ReturnType<typeof HomeworkAnswerService.getMyHomeworks>>;
}) {
  return (
    <div className="space-y-4">
      {homeworks.map((hw: HomeworkAnswer) => {
        const config = statusConfig[hw.status];
        const StatusIcon = config.icon;

        return (
          <Card key={hw.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    {hw.homework?.title}
                  </CardTitle>
                  <CardDescription>
                    {hw.homework?.puzzles?.length ?? 0} задач •{' '}
                    {new Date(hw.homework?.createdAt ?? '').toLocaleDateString(
                      'uk-UA',
                    )}
                  </CardDescription>
                </div>
                <Badge variant={config.variant} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {hw.score !== null && hw.score !== undefined && (
                    <div className="text-sm">
                      Оцінка:{' '}
                      <span className="font-medium">{hw.score}/100</span>
                    </div>
                  )}
                  {hw.trainerComment && (
                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                      Коментар: {hw.trainerComment}
                    </div>
                  )}
                </div>
                <Link href={`/student/homework/${hw.homeworkId}`}>
                  <Button variant="outline" className="gap-2">
                    {hw.status === 'PENDING' ? 'Почати' : 'Переглянути'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function HomeworkListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Icon className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

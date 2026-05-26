'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { PuzzleService } from '@/services/puzzle.service';
import { GroupService } from '@/services/group.service';
import { HomeworkService } from '@/services/homework.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Puzzle, BookOpen, Users, Plus, ArrowRight } from 'lucide-react';
import { Homework } from '@/lib/types';

export default function CoachDashboardPage() {
  const { data: puzzles, isLoading: puzzlesLoading } = useSWR(
    'puzzles',
    PuzzleService.getAll,
  );
  const { data: groups, isLoading: groupsLoading } = useSWR(
    'groups',
    GroupService.getAll,
  );
  const { data: homeworks, isLoading: homeworksLoading } = useSWR(
    'homeworks',
    HomeworkService.getAll,
  );

  const stats = [
    {
      title: 'Задачі',
      value: puzzles?.meta.total ?? 0,
      icon: Puzzle,
      href: '/coach/puzzles',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Завдання',
      value: homeworks?.length ?? 0,
      icon: BookOpen,
      href: '/coach/homework',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Групи',
      value: groups?.length ?? 0,
      icon: Users,
      href: '/coach/groups',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const isLoading = puzzlesLoading || groupsLoading || homeworksLoading;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Панель тренера</h1>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={cn(stat.bgColor, 'p-2 rounded-full')}>
                  <stat.icon className={cn('h-6 w-6', stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Швидкі дії</CardTitle>
          <CardDescription>
            Почніть роботу з основними функціями платформи
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Link href="/coach/puzzles/new">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-4"
            >
              <Plus className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Створити задачу</div>
                <div className="text-xs text-muted-foreground">
                  Додати нову шахову задачу
                </div>
              </div>
            </Button>
          </Link>
          <Link href="/coach/homework/new">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-4"
            >
              <BookOpen className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Створити завдання</div>
                <div className="text-xs text-muted-foreground">
                  Назначити задачі учням
                </div>
              </div>
            </Button>
          </Link>
          <Link href="/coach/groups/new">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-4"
            >
              <Users className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Створити групу</div>
                <div className="text-xs text-muted-foreground">
                  Об&apos;єднати учнів
                </div>
              </div>
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Останні завдання</CardTitle>
            <CardDescription>
              Нещодавно створені завдання для перевірки
            </CardDescription>
          </div>
          <Link href="/coach/homework">
            <Button variant="ghost" size="sm" className="gap-1">
              Всі завдання
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {homeworksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : homeworks && homeworks.length > 0 ? (
            <div className="space-y-3">
              {homeworks.slice(0, 5).map((homework: Homework) => (
                <Link key={homework.id} href={`/coach/homework/${homework.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                    <div>
                      <div className="font-medium">{homework.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {homework.group?.name ??
                          homework.student?.fullName ??
                          'Без призначення'}
                        {homework.puzzles &&
                          ` • ${homework.puzzles.length} задач`}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Ще немає завдань</p>
              <Link href="/coach/homework/new">
                <Button variant="link" className="mt-2">
                  Створити перше завдання
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

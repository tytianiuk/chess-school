'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Puzzle, BookOpen, Users } from 'lucide-react';

interface DashboardStatsProps {
  puzzlesCount: number;
  homeworksCount: number;
  groupsCount: number;
  isLoading: boolean;
}

export function DashboardStats({
  puzzlesCount,
  homeworksCount,
  groupsCount,
  isLoading,
}: DashboardStatsProps) {
  const stats = [
    {
      title: 'Задачі',
      value: puzzlesCount,
      icon: Puzzle,
      href: '/coach/puzzles',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Завдання',
      value: homeworksCount,
      icon: BookOpen,
      href: '/coach/homework',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Групи',
      value: groupsCount,
      icon: Users,
      href: '/coach/groups',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Link key={stat.href} href={stat.href}>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {stat.title}
              </CardTitle>
              <div
                className={`${stat.bgColor} p-2 rounded-full transition-transform group-hover:scale-105`}
              >
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { Homework } from '@/lib/types';

interface RecentHomeworksCardProps {
  homeworks: Homework[] | undefined;
  isLoading: boolean;
}

export function RecentHomeworksCard({
  homeworks,
  isLoading,
}: RecentHomeworksCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Останні завдання</CardTitle>
          <CardDescription className="mt-1">
            Нещодавно створені завдання для перевірки
          </CardDescription>
        </div>
        <Link href="/coach/homework">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            Всі завдання
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : homeworks && homeworks.length > 0 ? (
          <div className="space-y-3">
            {homeworks.slice(0, 5).map((homework) => (
              <Link key={homework.id} href={`/coach/homework/${homework.id}`}>
                <div className="flex items-center justify-between p-3 rounded-xl border bg-background hover:bg-accent/40 transition-colors group">
                  <div className="min-w-0">
                    <div className="font-medium text-sm group-hover:text-primary transition-colors truncate pr-4">
                      {homework.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                      <span className="truncate max-w-[200px] sm:max-w-xs">
                        {homework.group?.name ??
                          homework.student?.fullName ??
                          'Без призначення'}
                      </span>
                      {homework.puzzles && homework.puzzles.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="font-mono bg-muted px-1 py-0.2 rounded border text-[10px]">
                            {homework.puzzles.length} задач
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed rounded-xl">
            <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-40 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Ви ще не створили жодного завдання
            </p>
            <Link href="/coach/homework/new" className="inline-block mt-2">
              <Button
                variant="link"
                size="sm"
                className="text-xs font-semibold p-0 h-auto"
              >
                Створити перше завдання
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

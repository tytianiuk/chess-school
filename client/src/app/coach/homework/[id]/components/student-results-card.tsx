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
import { Badge } from '@/components/ui/badge';
import { Users, Eye } from 'lucide-react';
import { STATUS_CONFIG } from '@/lib/constants';
import type { HomeworkAnswer } from '@/lib/types';

interface StudentResultsCardProps {
  answers: HomeworkAnswer[] | undefined;
  homeworkId: number;
}

export function StudentResultsCard({
  answers,
  homeworkId,
}: StudentResultsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Результати учнів</CardTitle>
        <CardDescription>Перегляньте та оцініть роботи учнів</CardDescription>
      </CardHeader>
      <CardContent>
        {answers && answers.length > 0 ? (
          <div className="space-y-3">
            {answers.map((answer) => {
              const config = STATUS_CONFIG[answer.status] || {
                label: answer.status,
                color: 'bg-gray-500',
                icon: Users,
              };
              const StatusIcon = config.icon;

              return (
                <div
                  key={answer.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-background hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${config.color}`}
                    >
                      <StatusIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {answer.student?.fullName}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="outline"
                          className="text-[11px] px-1.5 py-0"
                        >
                          {config.label}
                        </Badge>
                        {answer.score !== null &&
                          answer.score !== undefined && (
                            <span className="text-xs font-mono text-green-700 bg-green-50 px-1.5 py-0.2 rounded border border-green-200">
                              Оцінка: {answer.score}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/coach/homework/${homeworkId}/student/${answer.studentId}`}
                    className="shrink-0 ml-4"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs h-8"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Переглянути
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed rounded-lg">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-40 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Ще немає зданих відповідей від учнів
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

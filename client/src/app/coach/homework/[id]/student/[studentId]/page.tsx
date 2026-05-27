'use client';

import { useState, use } from 'react';
import useSWR from 'swr';
import { HomeworkService } from '@/services/homework.service';
import { HomeworkAnswerService } from '@/services/homework-answer.service';
import type {
  HomeworkPuzzle,
  ProgressStatus,
  PuzzleAttempt,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChessDiagram } from '@/components/chess-diagram';
export default function StudentAnswerPage({
  params,
}: {
  params: Promise<{ id: string; studentId: string }>;
}) {
  const resolvedParams = use(params);
  const homeworkId = parseInt(resolvedParams.id);
  const studentId = parseInt(resolvedParams.studentId);

  const { data: homework, isLoading: homeworkLoading } = useSWR(
    homeworkId ? `homework-${homeworkId}` : null,
    () => HomeworkService.getById(homeworkId),
  );

  const {
    data: answer,
    isLoading: answerLoading,
    mutate,
  } = useSWR(
    homeworkId && studentId ? `answer-${homeworkId}-${studentId}` : null,
    () => HomeworkAnswerService.getStudentAnswer(homeworkId, studentId),
  );

  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [gradeData, setGradeData] = useState({
    score: '',
    trainerComment: '',
    status: 'SOLVED' as ProgressStatus,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = homeworkLoading || answerLoading;

  const handleGrade = async () => {
    const score = parseInt(gradeData.score);
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error('Оцінка має бути від 0 до 100');
      return;
    }

    setIsSubmitting(true);
    try {
      await HomeworkAnswerService.review(answer!.id, {
        score,
        comment: gradeData.trainerComment || undefined,
        status: gradeData.status,
      });
      toast.success('Оцінку виставлено');
      mutate();
      setIsGradeDialogOpen(false);
    } catch {
      toast.error('Помилка при виставленні оцінки');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!homework || !answer) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">Відповідь не знайдено</h2>
        <Link href={`/coach/homework/${homeworkId}`}>
          <Button>Повернутися до завдання</Button>
        </Link>
      </div>
    );
  }

  const canGrade =
    answer.status === 'REVIEW_PENDING' || answer.status === 'IN_PROGRESS';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/coach/homework/${homeworkId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {answer.student?.fullName}
            </h1>
            <p className="text-muted-foreground">{homework.title}</p>
          </div>
        </div>
        {canGrade && (
          <Button onClick={() => setIsGradeDialogOpen(true)}>
            Оцінити роботу
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Статус виконання</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <StatusBadge status={answer.status} />
          {answer.score !== null && answer.score !== undefined && (
            <div className="text-lg">
              Оцінка: <span className="font-bold">{answer.score}/100</span>
            </div>
          )}
          {answer.trainerComment && (
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Коментар: {answer.trainerComment}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Результати вирішення задач</CardTitle>
        </CardHeader>
        <CardContent>
          {answer.puzzleAttempts && answer.puzzleAttempts.length > 0 ? (
            <div className="space-y-6">
              {answer.puzzleAttempts.map(
                (attempt: PuzzleAttempt, index: number) => {
                  const puzzle = attempt.homeworkPuzzle?.puzzle;
                  const hp = homework.puzzles?.find(
                    (p: HomeworkPuzzle) => p.id === attempt.homeworkPuzzleId,
                  );

                  return (
                    <div
                      key={attempt.id}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            {index + 1}.{' '}
                            {puzzle?.title ||
                              `Задача #${attempt.homeworkPuzzleId}`}
                            {attempt.isSolved ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                hp?.checkType === 'AUTO'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {hp?.checkType === 'AUTO'
                                ? 'Автоматична'
                                : 'Ручна'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Спроб: {attempt.attemptCount}
                            </span>
                            {attempt.solvedOnFirst && (
                              <Badge className="bg-green-100 text-green-800">
                                З першої спроби
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="aspect-square mt-2 ">
                            <ChessDiagram
                              fen={puzzle!.fen}
                              className="mx-auto"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm text-muted-foreground">
                              Правильне рішення
                            </Label>
                            <p className="font-mono text-sm mt-1">
                              {puzzle?.solution}
                            </p>
                          </div>
                          {attempt.studentAnswer && (
                            <div>
                              <Label className="text-sm text-muted-foreground">
                                Відповідь учня
                              </Label>
                              <p className="font-mono text-sm mt-1">
                                {attempt.studentAnswer}
                              </p>
                            </div>
                          )}
                          {puzzle?.hint && (
                            <div>
                              <Label className="text-sm text-muted-foreground">
                                Підказка
                              </Label>
                              <p className="text-sm mt-1">{puzzle.hint}</p>
                            </div>
                          )}
                          {!attempt.solvedOnFirst &&
                            attempt.attemptCount > 3 && (
                              <div className="flex items-center gap-2 text-yellow-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm">
                                  Багато спроб - можливо, учень вгадував
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Учень ще не розпочав виконання
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Оцінити роботу</DialogTitle>
            <DialogDescription>
              Виставте оцінку та залиште коментар для учня
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="score">Оцінка (0-100) *</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                value={gradeData.score}
                onChange={(e) =>
                  setGradeData({ ...gradeData, score: e.target.value })
                }
                placeholder="85"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Коментар (необов&apos;язково)</Label>
              <Textarea
                id="comment"
                value={gradeData.trainerComment}
                onChange={(e) =>
                  setGradeData({ ...gradeData, trainerComment: e.target.value })
                }
                placeholder="Гарна робота! Зверніть увагу на..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Статус</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={
                    gradeData.status === 'SOLVED' ? 'default' : 'outline'
                  }
                  className="flex-1"
                  onClick={() =>
                    setGradeData({ ...gradeData, status: 'SOLVED' })
                  }
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Виконано
                </Button>
                <Button
                  type="button"
                  variant={
                    gradeData.status === 'FAILED' ? 'destructive' : 'outline'
                  }
                  className="flex-1"
                  onClick={() =>
                    setGradeData({ ...gradeData, status: 'FAILED' })
                  }
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Не виконано
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGradeDialogOpen(false)}
            >
              Скасувати
            </Button>
            <Button onClick={handleGrade} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Збереження...
                </>
              ) : (
                'Зберегти оцінку'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: ProgressStatus }) {
  const config: Record<
    ProgressStatus,
    {
      label: string;
      variant: 'default' | 'secondary' | 'outline' | 'destructive';
    }
  > = {
    PENDING: { label: 'Очікує', variant: 'outline' },
    IN_PROGRESS: { label: 'В процесі', variant: 'secondary' },
    REVIEW_PENDING: { label: 'На перевірці', variant: 'default' },
    SOLVED: { label: 'Виконано', variant: 'default' },
    FAILED: { label: 'Не виконано', variant: 'destructive' },
  };

  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}

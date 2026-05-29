'use client';

import { useState, use, useEffect } from 'react';
import useSWR from 'swr';
import { HomeworkService } from '@/services/homework.service';
import { HomeworkAnswerService } from '@/services/homework-answer.service';
import type {
  HomeworkPuzzle,
  ProgressStatus,
  PuzzleAttempt,
  PuzzleStatus,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Trophy,
  Clock,
  AlertCircle,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChessDiagram } from '@/components/chess-diagram';
import { ChessNotation } from '@/components/chess-notation';

const statusConfig: Record<
  ProgressStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING: { label: 'Очікує', color: 'bg-gray-500 text-white', icon: Clock },
  IN_PROGRESS: {
    label: 'В процесі',
    color: 'bg-blue-500 text-white',
    icon: Clock,
  },
  REVIEW_PENDING: {
    label: 'На перевірці',
    color: 'bg-yellow-500 text-black',
    icon: AlertCircle,
  },
  SOLVED: {
    label: 'Виконано',
    color: 'bg-green-500 text-white',
    icon: CheckCircle2,
  },
  FAILED: {
    label: 'Не виконано',
    color: 'bg-red-500 text-white',
    icon: XCircle,
  },
};

const puzzleStatusConfig: Record<
  PuzzleStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING: {
    label: 'Не розпочато',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Clock,
  },
  REVIEW_PENDING: {
    label: 'Очікує перевірки',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertCircle,
  },
  SOLVED: {
    label: 'Вирішено успішно',
    color: 'bg-green-100 text-green-800 border-transparent',
    icon: CheckCircle2,
  },
  FAILED: {
    label: 'Не зараховано',
    color: 'bg-red-100 text-red-800 border-transparent',
    icon: XCircle,
  },
};

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

  const [activePuzzleIndex, setActivePuzzleIndex] = useState<number>(0);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [isUpdatingTaskStatus, setIsUpdatingTaskStatus] = useState(false);
  const [gradeData, setGradeData] = useState({
    score: '',
    trainerComment: '',
    status: 'SOLVED' as ProgressStatus,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (answer) {
      setGradeData({
        score: answer.score?.toString() || '',
        trainerComment: answer.trainerComment || '',
        status: answer.status === 'REVIEW_PENDING' ? 'SOLVED' : answer.status,
      });
    }
  }, [answer]);

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

  const handleUpdateTaskStatus = async (
    attemptId: number,
    targetStatus: 'SOLVED' | 'FAILED',
  ) => {
    setIsUpdatingTaskStatus(true);
    try {
      await HomeworkAnswerService.updateAttemptStatus(attemptId, targetStatus);
      toast.success(
        targetStatus === 'SOLVED' ? 'Задачу зараховано' : 'Задачу відхилено',
      );
      mutate();
    } catch {
      toast.error('Не вдалося оновити статус задачі');
    } finally {
      setIsUpdatingTaskStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
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

  const totalPuzzlesCount = homework.puzzles?.length || 0;
  const puzzleAttempts = answer.puzzleAttempts || [];

  const solvedPuzzlesCount =
    puzzleAttempts.filter((attempt: any) => attempt.status === 'SOLVED')
      .length || 0;

  const hasUnreviewedTasks = puzzleAttempts.some(
    (attempt: any) => attempt.status === 'REVIEW_PENDING',
  );
  const canGradeHomework =
    (answer.status === 'REVIEW_PENDING' || answer.status === 'IN_PROGRESS') &&
    !hasUnreviewedTasks;

  const currentAttempt = puzzleAttempts[activePuzzleIndex] as any | undefined;
  const currentPuzzle = currentAttempt?.homeworkPuzzle?.puzzle;
  const currentHp = homework.puzzles?.find(
    (p: HomeworkPuzzle) => p.id === currentAttempt?.homeworkPuzzleId,
  );

  const isCurrentManual = currentHp?.checkType === 'MANUAL';

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 py-2">
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

        <div className="flex flex-col items-end gap-1">
          <Button
            onClick={() => setIsGradeDialogOpen(true)}
            disabled={!canGradeHomework}
            className={
              !canGradeHomework
                ? 'bg-muted text-muted-foreground'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          >
            Оцінити роботу
          </Button>
          {hasUnreviewedTasks && (
            <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <AlertTriangle className="h-3 w-3" />
              Спочатку перевірте всі ручні задачі
            </span>
          )}
        </div>
      </div>

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

          {answer.trainerComment && (
            <div className="border-t pt-2 sm:border-t-0 sm:pt-0 max-w-md bg-muted/40 p-2.5 rounded-lg border flex-1 text-left">
              <p className="text-xs text-muted-foreground font-semibold">
                Коментар тренера:
              </p>
              <p className="text-sm italic text-foreground mt-0.5">
                {answer.trainerComment}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {puzzleAttempts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/40 border-b py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    Задача {activePuzzleIndex + 1}. {currentPuzzle?.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isCurrentManual ? 'outline' : 'secondary'}
                      className={
                        isCurrentManual
                          ? 'border-yellow-500 text-yellow-700 bg-yellow-50'
                          : ''
                      }
                    >
                      {isCurrentManual
                        ? 'Ручна перевірка'
                        : 'Автоматична перевірка'}
                    </Badge>

                    {currentAttempt && (
                      <Badge
                        className={
                          currentAttempt.status === 'SOLVED'
                            ? 'bg-green-100 text-green-800 border-transparent'
                            : currentAttempt.status === 'REVIEW_PENDING'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : currentAttempt.status === 'FAILED'
                                ? 'bg-red-100 text-red-800 border-transparent'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                        }
                        variant={
                          currentAttempt.status === 'FAILED'
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {puzzleStatusConfig[
                          currentAttempt.status as keyof typeof puzzleStatusConfig
                        ]?.label || currentAttempt.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {currentPuzzle?.fen ? (
                  <div className="flex flex-col md:flex-row gap-6 items-center lg:items-start">
                    <div className="shrink-0 bg-muted/30 p-2 rounded-xl border">
                      <ChessDiagram fen={currentPuzzle.fen} size={340} />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                          Правильний розв&apos;язок
                        </Label>
                        <div className="mt-1">
                          <ChessNotation
                            moves={currentPuzzle.solution.split(' ')}
                            startFen={currentPuzzle.fen}
                          />
                        </div>
                      </div>

                      {currentAttempt?.studentAnswer && (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                              Спроба учня
                            </Label>
                            <div className="mt-1 font-mono text-sm p-2 rounded-lg border bg-yellow-50 text-yellow-800 border-yellow-200">
                              {isCurrentManual ? (
                                <div className="whitespace-pre-wrap leading-relaxed">
                                  {currentAttempt.studentAnswer}
                                </div>
                              ) : (
                                <ChessNotation
                                  moves={currentAttempt.studentAnswer.split(
                                    ' ',
                                  )}
                                  startFen={currentPuzzle.fen}
                                />
                              )}
                            </div>
                          </div>

                          {currentAttempt && (
                            <div className="grid grid-cols-1 gap-2 bg-muted/40 p-3 rounded-lg border border-dashed">
                              <Button
                                size="sm"
                                type="button"
                                disabled={isUpdatingTaskStatus}
                                variant={
                                  currentAttempt.status === 'SOLVED'
                                    ? 'default'
                                    : 'outline'
                                }
                                className={`flex-1 text-xs h-8 ${currentAttempt.status === 'SOLVED' ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                                onClick={() =>
                                  handleUpdateTaskStatus(
                                    currentAttempt.id,
                                    'SOLVED',
                                  )
                                }
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Правильно
                              </Button>
                              <Button
                                size="sm"
                                type="button"
                                disabled={isUpdatingTaskStatus}
                                variant={
                                  currentAttempt.status === 'FAILED'
                                    ? 'destructive'
                                    : 'outline'
                                }
                                className={`flex-1 text-xs h-8 ${currentAttempt.status === 'FAILED' ? 'bg-red-600 hover:bg-red-700 text-white' : 'text-red-600 border-red-200 hover:bg-red-50'}`}
                                onClick={() =>
                                  handleUpdateTaskStatus(
                                    currentAttempt.id,
                                    'FAILED',
                                  )
                                }
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Не правильн
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {!isCurrentManual && (
                        <div className="text-sm pt-2">
                          <div className="bg-muted/40 p-2 rounded border">
                            {currentAttempt?.solvedOnFirst ? (
                              <span className="font-bold text-green-700">
                                Вирішено з першої спроби!
                              </span>
                            ) : (
                              <>
                                <span className="text-muted-foreground block text-xs">
                                  Усього спроб:
                                </span>
                                <span className="font-bold text-lg">
                                  {currentAttempt?.attemptCount + 1}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {!isCurrentManual &&
                        !currentAttempt?.solvedOnFirst &&
                        (currentAttempt?.attemptCount ?? 0) > 3 && (
                          <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                            <span className="text-xs font-medium">
                              Спроб більше 3. Можливо, учень вгадував ходи
                              методом підбору.
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Помилка завантаження діаграми
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {puzzleAttempts.map((attempt: any, index: number) => {
              const isSelected = index === activePuzzleIndex;
              const p = attempt.homeworkPuzzle?.puzzle;
              const hp = homework.puzzles?.find(
                (item: HomeworkPuzzle) => item.id === attempt.homeworkPuzzleId,
              );
              const isManual = hp?.checkType === 'MANUAL';

              return (
                <button
                  key={attempt.id}
                  type="button"
                  onClick={() => setActivePuzzleIndex(index)}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all group ${
                    isSelected
                      ? 'bg-blue-600 border-transparent text-white shadow-md ring-2 ring-blue-600/20'
                      : 'bg-background hover:bg-muted border-border text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-7 w-7 rounded-lg text-xs font-bold font-mono flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-muted text-muted-foreground group-hover:bg-background'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate pr-2">
                        {p?.title || `Задача #${attempt.homeworkPuzzleId}`}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${isSelected ? 'text-blue-100' : 'text-muted-foreground'}`}
                      >
                        {isManual
                          ? 'Ручна перевірка'
                          : `Спроб: ${attempt.attemptCount + 1}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center shrink-0">
                    {attempt.status === 'REVIEW_PENDING' ? (
                      <AlertCircle
                        className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-yellow-500'}`}
                      />
                    ) : attempt.status === 'SOLVED' ? (
                      <CheckCircle2
                        className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-green-600'}`}
                      />
                    ) : attempt.status === 'FAILED' ? (
                      <XCircle
                        className={`h-4 w-4 ${isSelected ? 'text-white/60' : 'text-red-500'}`}
                      />
                    ) : (
                      <Clock
                        className={`h-4 w-4 ${isSelected ? 'text-white/40' : 'text-gray-400'}`}
                      />
                    )}
                    <ChevronRight
                      className={`h-4 w-4 ml-1 transition-transform ${
                        isSelected
                          ? 'text-white translate-x-0.5'
                          : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground italic text-sm">
            Учень ще не розпочав виконання цієї домашньої роботи.
          </CardContent>
        </Card>
      )}

      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Оцінити роботу</DialogTitle>
            <DialogDescription>
              Виставте оцінку за шкалою 0-100 та залиште коментар з аналізом
              помилок.
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
              <Label htmlFor="comment">Коментар тренера</Label>
              <Textarea
                id="comment"
                value={gradeData.trainerComment}
                onChange={(e) =>
                  setGradeData({ ...gradeData, trainerComment: e.target.value })
                }
                placeholder="Гарна робота! Зверніть увагу на тактичні вилки..."
                rows={3}
                className="resize-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Фінальний статус</Label>
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
            <Button
              onClick={handleGrade}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
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
  const current = statusConfig[status] || {
    label: status,
    color: 'bg-gray-500 text-white',
    icon: HelpCircle,
  };
  const Icon = current.icon;

  return (
    <Badge
      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md ${current.color}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {current.label}
    </Badge>
  );
}

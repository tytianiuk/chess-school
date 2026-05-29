'use client';

import { useState, use, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { HomeworkService } from '@/services/homework.service';
import { HomeworkAnswerService } from '@/services/homework-answer.service';
import type { HomeworkPuzzle, ProgressStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { AnswerStatusCard } from './components/answer-status-card';
import { TaskViewer } from './components/task-viewer';
import { TaskNavigationSidebar } from './components/task-navigation-sidebar';
import { GradeHomeworkDialog } from './components/grade-homework-dialog';
import { Card } from '@/components/ui/card';

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
      <div className="max-w-5xl mx-auto space-y-6 px-4 py-2">
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
    puzzleAttempts.filter((a: any) => a.status === 'SOLVED').length || 0;

  const hasUnreviewedTasks = puzzleAttempts.some(
    (a: any) => a.status === 'REVIEW_PENDING',
  );
  const canGradeHomework =
    answer.status === 'REVIEW_PENDING' && !hasUnreviewedTasks;

  const currentAttempt = puzzleAttempts[activePuzzleIndex];
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

      <AnswerStatusCard
        answer={answer}
        solvedPuzzlesCount={solvedPuzzlesCount}
        totalPuzzlesCount={totalPuzzlesCount}
      />

      {puzzleAttempts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <TaskViewer
              activePuzzleIndex={activePuzzleIndex}
              currentAttempt={currentAttempt}
              isCurrentManual={isCurrentManual}
              isUpdatingTaskStatus={isUpdatingTaskStatus}
              onUpdateStatus={handleUpdateTaskStatus}
            />
          </div>

          <div>
            <TaskNavigationSidebar
              puzzleAttempts={puzzleAttempts}
              activePuzzleIndex={activePuzzleIndex}
              homeworkPuzzles={homework.puzzles}
              onSelectPuzzle={setActivePuzzleIndex}
            />
          </div>
        </div>
      ) : (
        <Card>
          <div className="text-center py-12 text-muted-foreground italic text-sm">
            Учень ще не розпочав виконання цієї домашньої роботи.
          </div>
        </Card>
      )}

      <GradeHomeworkDialog
        isOpen={isGradeDialogOpen}
        onOpenChange={setIsGradeDialogOpen}
        gradeData={gradeData}
        setGradeData={setGradeData}
        onSubmit={handleGrade}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

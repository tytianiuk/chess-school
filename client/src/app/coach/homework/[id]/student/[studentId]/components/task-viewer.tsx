'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { ChessDiagram } from '@/components/chess-diagram';
import { ChessNotation } from '@/components/chess-notation';
import { StatusBadge } from './status-badge';
import type { PuzzleAttempt } from '@/lib/types';

interface TaskViewerProps {
  activePuzzleIndex: number;
  currentAttempt: PuzzleAttempt | undefined;
  isCurrentManual: boolean;
  isUpdatingTaskStatus: boolean;
  onUpdateStatus: (
    attemptId: number,
    status: 'SOLVED' | 'FAILED',
  ) => Promise<void>;
}

const taskReviewButtons = [
  {
    status: 'SOLVED',
    label: 'Правильно',
    icon: CheckCircle2,
    activeVariant: 'default' as const,
    activeStyles:
      'bg-green-600 hover:bg-green-700 text-white border-transparent',
    inactiveStyles: 'text-green-600 border-green-200 hover:bg-green-50/80',
  },
  {
    status: 'FAILED',
    label: 'Не правильно',
    icon: XCircle,
    activeVariant: 'destructive' as const,
    activeStyles: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
    inactiveStyles: 'text-red-600 border-red-200 hover:bg-red-50/80',
  },
];

export function TaskViewer({
  activePuzzleIndex,
  currentAttempt,
  isCurrentManual,
  isUpdatingTaskStatus,
  onUpdateStatus,
}: TaskViewerProps) {
  const currentPuzzle = currentAttempt?.homeworkPuzzle?.puzzle;

  if (!currentPuzzle) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-muted-foreground">
          Помилка завантаження діаграми або даних задачі
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/40 border-b py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Задача {activePuzzleIndex + 1}.{' '}
            {currentPuzzle.title || `#${currentPuzzle.id}`}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="border-yellow-500 text-yellow-700 bg-yellow-50">
              {isCurrentManual ? 'Ручна перевірка' : 'Автоматична перевірка'}
            </Badge>

            {currentAttempt && <StatusBadge status={currentAttempt.status} />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center lg:items-start">
          <div className="shrink-0 bg-muted/30 p-2 rounded-xl border">
            <ChessDiagram fen={currentPuzzle.fen} size={340} />
          </div>
          <div className="flex-1 w-full space-y-4">
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
                  <div className="mt-1 font-mono text-sm p-2 rounded-lg border ">
                    {isCurrentManual ? (
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {currentAttempt.studentAnswer}
                      </div>
                    ) : (
                      <ChessNotation
                        moves={currentAttempt.studentAnswer.split(' ')}
                        startFen={currentPuzzle.fen}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 bg-muted/40 p-3 rounded-lg border border-dashed">
                  {taskReviewButtons.map((btn) => {
                    const isActive = currentAttempt.status === btn.status;
                    const Icon = btn.icon;

                    return (
                      <Button
                        key={btn.status}
                        size="sm"
                        type="button"
                        disabled={isUpdatingTaskStatus}
                        variant={isActive ? btn.activeVariant : 'outline'}
                        className={`flex-1 text-xs h-8 font-medium transition-all ${
                          isActive ? btn.activeStyles : btn.inactiveStyles
                        }`}
                        onClick={() =>
                          onUpdateStatus(
                            currentAttempt.id,
                            btn.status as 'SOLVED' | 'FAILED',
                          )
                        }
                      >
                        <Icon className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                        {btn.label}
                      </Button>
                    );
                  })}
                </div>
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
                        {(currentAttempt?.attemptCount ?? 0) + 1}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {!isCurrentManual &&
              !currentAttempt?.solvedOnFirst &&
              (currentAttempt?.attemptCount ?? 0) + 1 > 3 && (
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                  <span className="text-xs font-medium">
                    Спроб більше 3. Можливо, учень вгадував ходи методом
                    підбору.
                  </span>
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

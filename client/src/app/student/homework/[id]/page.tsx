'use client';

import { useState, useCallback, useEffect, use } from 'react';

import useSWR from 'swr';
import { HomeworkService } from '@/services/homework.service';
import { HomeworkAnswerService } from '@/services/homework-answer.service';
import type {
  HomeworkAnswer,
  HomeworkPuzzle,
  ProgressStatus,
  PuzzleAttempt,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Chess, Square } from 'chess.js';
import { PuzzleInfoCard } from './components/puzzle-info-card';
import { PuzzleNavigationCard } from './components/puzzle-navigation-card';
import {
  ManualVariation,
  ManualVariationsPanel,
  VariationState,
} from './components/manual-variations-panel';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ChessDiagram } from '@/components/chess-diagram';
import { formatMovesToText } from '@/lib/format-moves-to-text';

const statusConfig: Record<
  ProgressStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
  }
> = {
  PENDING: { label: 'Нове', variant: 'outline' },
  IN_PROGRESS: { label: 'В процесі', variant: 'secondary' },
  REVIEW_PENDING: { label: 'На перевірці', variant: 'default' },
  SOLVED: { label: 'Виконано', variant: 'default' },
  FAILED: { label: 'Не виконано', variant: 'destructive' },
};

export default function StudentHomeworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const homeworkId = parseInt(resolvedParams.id);

  const { data: homework, isLoading: homeworkLoading } = useSWR(
    homeworkId ? `homework-${homeworkId}` : null,
    () => HomeworkService.getById(homeworkId),
  );

  const {
    data: answer,
    isLoading: answerLoading,
    mutate: mutateAnswer,
  }: { data: HomeworkAnswer; isLoading: boolean; mutate: Function } = useSWR(
    homeworkId ? `my-homework-${homeworkId}` : null,
    () => HomeworkAnswerService.getMyHomework(homeworkId),
  );

  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [game, setGame] = useState<Chess | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState<string[]>([]);
  const [manualVariations, setManualVariations] = useState<VariationState>({
    variations: [],
    activeVariationId: null,
    currentMoves: [],
  });
  const [newVariationComment, setNewVariationComment] = useState('');

  const isLoading = homeworkLoading || answerLoading;

  const currentHomeworkPuzzle = homework?.puzzles?.[currentPuzzleIndex];
  const currentPuzzle = currentHomeworkPuzzle?.puzzle;
  const currentAttempt = answer?.puzzleAttempts?.find(
    (a: PuzzleAttempt) => a.homeworkPuzzleId === currentHomeworkPuzzle?.id,
  );

  const isLocked =
    currentAttempt?.status === 'SOLVED' ||
    currentAttempt?.status === 'REVIEW_PENDING';

  useEffect(() => {
    if (currentPuzzle?.fen) {
      try {
        const newGame = new Chess(currentPuzzle.fen);

        if (
          currentAttempt &&
          currentAttempt.currentStep > 0 &&
          currentPuzzle.solution
        ) {
          const moves = currentPuzzle.solution.split(' ').filter(Boolean);

          for (let i = 0; i < currentAttempt.currentStep; i++) {
            if (moves[i]) {
              newGame.move(moves[i]);
            }
          }
        }

        setGame(newGame);
        setShowHint(false);

        if (currentHomeworkPuzzle?.checkType === 'MANUAL') {
          setAttemptHistory(
            currentAttempt?.studentAnswer ? [currentAttempt.studentAnswer] : [],
          );
          setManualVariations({
            variations: [],
            activeVariationId: null,
            currentMoves: [],
          });
          setNewVariationComment('');
        } else {
          if (currentPuzzle.solution && currentAttempt) {
            const allMoves = currentPuzzle.solution.split(' ').filter(Boolean);
            setAttemptHistory(allMoves.slice(0, currentAttempt.currentStep));
          } else {
            setAttemptHistory([]);
          }
        }
      } catch (error) {
        console.error('Помилка ініціалізації FEN або історії ходів:', error);
        setGame(new Chess(currentPuzzle.fen));
        setAttemptHistory([]);
      }
    }
  }, [
    currentPuzzle?.id,
    currentPuzzle?.fen,
    currentPuzzleIndex,
    currentAttempt?.id,
  ]);

  const handleUndo = useCallback(() => {
    if (!game || currentHomeworkPuzzle?.checkType !== 'MANUAL') return;
    if (manualVariations.currentMoves.length === 0) return;

    const newGame = new Chess(currentPuzzle?.fen || '');

    const movesToReplay = manualVariations.currentMoves.slice(0, -1);
    for (const move of movesToReplay) {
      try {
        newGame.move(move);
      } catch (e) {
        console.error('Error replaying move:', move, e);
      }
    }

    setGame(newGame);
    setManualVariations((prev) => ({
      ...prev,
      currentMoves: movesToReplay,
      activeVariationId: null,
    }));
  }, [
    game,
    currentHomeworkPuzzle?.checkType,
    manualVariations.currentMoves,
    currentPuzzle?.fen,
  ]);

  const handleSaveVariation = useCallback(() => {
    if (manualVariations.currentMoves.length === 0) {
      toast.error('Спочатку зробіть хоча б один хід');
      return;
    }

    const currentMovesKey = manualVariations.currentMoves.join(',');

    const isDuplicate = manualVariations.variations.some((v) => {
      if (
        manualVariations.activeVariationId &&
        v.id === manualVariations.activeVariationId
      ) {
        return false;
      }
      return v.moves.join(',') === currentMovesKey;
    });

    if (isDuplicate) {
      toast.error('Такий варіант вже існує');
      return;
    }

    if (manualVariations.activeVariationId) {
      setManualVariations((prev) => ({
        ...prev,
        variations: prev.variations.map((v) =>
          v.id === prev.activeVariationId
            ? {
                ...v,
                moves: [...prev.currentMoves],
                comment: newVariationComment,
              }
            : v,
        ),
        activeVariationId: null,
        currentMoves: [],
      }));

      if (currentPuzzle?.fen) {
        setGame(new Chess(currentPuzzle.fen));
      }
      setNewVariationComment('');
      toast.success('Варіант оновлено!');
      return;
    }

    const newVariation: ManualVariation = {
      id: crypto.randomUUID(),
      moves: [...manualVariations.currentMoves],
      comment: newVariationComment,
      startFen: currentPuzzle?.fen || '',
    };

    setManualVariations((prev) => ({
      ...prev,
      variations: [...prev.variations, newVariation],
      activeVariationId: null,
      currentMoves: [],
    }));

    if (currentPuzzle?.fen) {
      setGame(new Chess(currentPuzzle.fen));
    }
    setNewVariationComment('');
    toast.success('Варіант збережено!');
  }, [
    manualVariations.currentMoves,
    manualVariations.activeVariationId,
    manualVariations.variations,
    newVariationComment,
    currentPuzzle?.fen,
  ]);

  const handleDeleteVariation = useCallback((variationId: string) => {
    setManualVariations((prev) => ({
      ...prev,
      variations: prev.variations.filter((v) => v.id !== variationId),
      activeVariationId:
        prev.activeVariationId === variationId ? null : prev.activeVariationId,
    }));
    toast.success('Варіант видалено');
  }, []);

  const handleDeleteVariationClick = useCallback(
    (variationId: string) => {
      handleDeleteVariation(variationId);
    },
    [handleDeleteVariation],
  );

  const handleLoadVariation = useCallback((variation: ManualVariation) => {
    if (!variation.startFen) return;

    const newGame = new Chess(variation.startFen);
    for (const move of variation.moves) {
      try {
        newGame.move(move);
      } catch (e) {
        console.error('Error loading move:', move, e);
        break;
      }
    }

    setGame(newGame);
    setManualVariations((prev) => ({
      ...prev,
      activeVariationId: variation.id,
      currentMoves: [...variation.moves],
    }));
    setNewVariationComment(variation.comment || '');
  }, []);

  const handleStartNewVariation = useCallback(() => {
    if (currentPuzzle?.fen) {
      setGame(new Chess(currentPuzzle.fen));
      setManualVariations((prev) => ({
        ...prev,
        activeVariationId: null,
        currentMoves: [],
      }));
      setNewVariationComment('');
    }
  }, [currentPuzzle?.fen]);

  const submitAttempt = async (moveNotation: string) => {
    if (!currentHomeworkPuzzle || !answer?.id) return null;

    try {
      const response = await HomeworkAnswerService.makeMove(answer.id, {
        homeworkPuzzleId: currentHomeworkPuzzle.id,
        move: moveNotation,
      });

      mutateAnswer();

      return response as {
        correct: boolean;
        serverMove: string | null;
        isFinished: boolean;
        message?: string;
      };
    } catch (error) {
      console.error('Failed to submit attempt:', error);
      return null;
    }
  };

  const handleMove = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      sourceSquare: Square;
      targetSquare: Square;
    }): boolean => {
      if (!game || !currentHomeworkPuzzle || isLocked) {
        return false;
      }

      try {
        const move = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q',
        });

        if (!move) return false;

        const moveNotation = move.san;

        if (currentHomeworkPuzzle.checkType === 'MANUAL') {
          setManualVariations((prev) => ({
            ...prev,
            currentMoves: [...prev.currentMoves, moveNotation],
            activeVariationId: null,
          }));
          setGame(new Chess(game.fen()));
          return true;
        }

        submitAttempt(moveNotation).then((result) => {
          if (!result) {
            game.undo();
            setGame(new Chess(game.fen()));
            return;
          }

          if (result.correct) {
            setAttemptHistory((prev) => [...prev, moveNotation]);

            if (result.isFinished) {
              toast.success('Задачу повністю вирішено!');
            } else if (result.serverMove) {
              setTimeout(() => {
                try {
                  const opponentMove = game.move(result.serverMove!);
                  if (opponentMove) {
                    setAttemptHistory((prev) => [...prev, opponentMove.san]);
                    setGame(new Chess(game.fen()));
                  }
                } catch (e) {
                  console.error('Помилка рендеру ходу сервера:', e);
                }
              }, 600);
            }

            setGame(new Chess(game.fen()));
          } else {
            toast.error(result.message || 'Неправильний хід.');
            game.undo();
            setTimeout(() => {
              setGame(new Chess(game.fen()));
            }, 300);
          }
        });

        return true;
      } catch {
        return false;
      }
    },
    [game, currentHomeworkPuzzle, isLocked, submitAttempt],
  );

  const handleSubmitForReview = async () => {
    try {
      mutateAnswer();
      toast.success('Завдання відправлено на перевірку');
      setShowSubmitDialog(false);
    } catch {
      toast.error('Помилка при відправці завдання');
    }
  };

  const handleSubmitAllVariations = useCallback(() => {
    const allVariationsText = manualVariations.variations
      .map((v, idx) => {
        const movesText = formatMovesToText(v.moves, currentPuzzle?.fen);
        return `Варіант ${idx + 1}: ${movesText}${v.comment ? ` (${v.comment})` : ''}`;
      })
      .join('\n');

    submitAttempt(allVariationsText).then(() => {
      toast.success('Всі варіанти збережено для перевірки!');
    });
  }, [manualVariations.variations, currentPuzzle?.fen, submitAttempt]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="aspect-square" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!homework) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">Завдання не знайдено</h2>
        <Link href="/student/homework">
          <Button>Повернутися до списку</Button>
        </Link>
      </div>
    );
  }

  const solvedCount =
    answer.puzzleAttempts?.filter((a: any) => a.status === 'SOLVED').length ??
    0;
  const totalPuzzles = homework.puzzles?.length ?? 0;

  const canSubmit =
    answer.status === 'IN_PROGRESS' &&
    homework.puzzles?.some((p: HomeworkPuzzle) => p.checkType === 'MANUAL');

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/student/homework">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {homework.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Badge variant={statusConfig[answer.status].variant}>
                {statusConfig[answer.status].label}
              </Badge>
              <span>•</span>
              <span className="font-medium">
                Виконано {solvedCount} з {totalPuzzles}
              </span>
            </div>
          </div>
        </div>
        {canSubmit && (
          <Button
            onClick={() => setShowSubmitDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Відправити на перевірку
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="aspect-square max-w-[500px] mx-auto">
              <ChessDiagram
                fen={game?.fen() || currentPuzzle?.fen}
                showNotation={true}
                orientation={
                  currentPuzzle?.fen?.includes(' b ') ? 'black' : 'white'
                }
                options={{
                  id: `homework-puzzle-${currentPuzzle?.id}`,
                  allowDragging: !isLocked,
                  onPieceDrop: handleMove,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <PuzzleNavigationCard
            currentIndex={currentPuzzleIndex}
            totalPuzzles={totalPuzzles}
            puzzles={homework.puzzles || []}
            puzzleAttempts={answer.puzzleAttempts || []}
            onNavigate={setCurrentPuzzleIndex}
          />

          <PuzzleInfoCard
            puzzleTitle={currentPuzzle?.title}
            puzzleId={currentPuzzle?.id}
            checkType={currentHomeworkPuzzle?.checkType}
            hint={currentPuzzle?.hint}
            attempt={currentAttempt}
            showHint={showHint}
            onShowHint={() => setShowHint(true)}
            attemptHistory={attemptHistory}
          />

          {currentHomeworkPuzzle?.checkType === 'MANUAL' && (
            <ManualVariationsPanel
              variationState={manualVariations}
              newVariationComment={newVariationComment}
              onCommentChange={setNewVariationComment}
              onUndo={handleUndo}
              onSaveVariation={handleSaveVariation}
              onDeleteVariation={handleDeleteVariationClick}
              onLoadVariation={handleLoadVariation}
              onStartNewVariation={handleStartNewVariation}
              onSubmitAllVariations={handleSubmitAllVariations}
              isSolved={isLocked}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        onConfirm={handleSubmitForReview}
        title="Відправити на перевірку?"
        description="Після відправки ви не зможете змінювати відповіді. Тренер перевірить ваше завдання та виставить оцінку."
        confirmLabel="Відправити"
        variant="destructive"
      />
    </div>
  );
}

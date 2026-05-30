'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { Chess, Square } from 'chess.js';
import { PuzzleTagService } from '@/services/puzzle-tag.service';
import { PuzzleService } from '@/services/puzzle.service';
import { toast } from 'sonner';
import type { PuzzleTag, Puzzle as PuzzleType } from '@/lib/types';

import { TrainingSettingsPanel } from './components/training-settings-panel';
import { TrainingBoardCard } from './components/training-board-card';
import { TrainingAnalysisPanel } from './components/training-analysis-panel';

export default function StudentTrainingPage() {
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [ratingRange, setRatingRange] = useState({ min: '1000', max: '1800' });

  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleType | null>(null);
  const [game, setGame] = useState<Chess | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isLoadingPuzzle, setIsLoadingPuzzle] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState<string[]>([]);
  const [puzzleSessionId, setPuzzleSessionId] = useState<string>('');

  const orientation = currentPuzzle?.fen.includes(' b ') ? 'чорних' : 'білих';

  const { data: tags } = useSWR<PuzzleTag[]>('puzzles-tags', () =>
    PuzzleTagService.getAll(),
  );

  const handleToggleTag = useCallback((tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  }, []);

  const handleRatingChange = useCallback(
    (type: 'min' | 'max', value: string) => {
      setRatingRange((prev) => ({ ...prev, [type]: value }));
    },
    [],
  );

  const handleFetchRandomPuzzle = async () => {
    setIsLoadingPuzzle(true);
    try {
      const puzzle = await PuzzleService.getRandomTrainingPuzzle({
        tagIds: selectedTagIds,
        minRating: Number(ratingRange.min) || 300,
        maxRating: Number(ratingRange.max) || 3000,
      });

      setCurrentPuzzle(puzzle);
      setPuzzleSessionId(puzzle ? crypto.randomUUID() : '');
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          'Не вдалося знайти задачу з такими параметрами',
      );
      setCurrentPuzzle(null);
      setGame(null);
    } finally {
      setIsLoadingPuzzle(false);
    }
  };

  useEffect(() => {
    if (currentPuzzle?.fen) {
      try {
        const newGame = new Chess(currentPuzzle.fen);
        setGame(newGame);
        setAttemptHistory([]);
        setCurrentStep(0);
        setIsPuzzleSolved(false);
        setShowHint(false);
      } catch (error) {
        console.error('Помилка ініціалізації FEN:', error);
        setGame(new Chess(currentPuzzle.fen));
        setAttemptHistory([]);
      }
    }
  }, [currentPuzzle?.fen, currentPuzzle?.id, puzzleSessionId]);

  const handlePieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      sourceSquare: Square;
      targetSquare: Square;
    }): boolean => {
      if (!game || isPuzzleSolved || !currentPuzzle) return false;

      try {
        const move = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q',
        });
        if (!move) return false;

        const moveNotation = move.san;
        const moves = currentPuzzle.solution.split(' ').filter(Boolean);
        const expectedMove = moves[currentStep];

        if (moveNotation === expectedMove) {
          setAttemptHistory((prev) => [...prev, moveNotation]);
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);

          if (nextStep >= moves.length) {
            setIsPuzzleSolved(true);
            toast.success('Задачу повністю вирішено! Чудова робота!');
            setGame(new Chess(game.fen()));
            return true;
          }

          const computerMove = moves[nextStep];

          setTimeout(() => {
            try {
              const opponentMove = game.move(computerMove);
              if (opponentMove) {
                setAttemptHistory((prev) => [...prev, opponentMove.san]);
                setCurrentStep(nextStep + 1);

                if (nextStep + 1 >= moves.length) {
                  setIsPuzzleSolved(true);
                  toast.success('Задачу повністю вирішено!');
                }
                setGame(new Chess(game.fen()));
              }
            } catch (e) {
              console.error('Помилка автоматичної відповіді:', e);
            }
          }, 600);

          setGame(new Chess(game.fen()));
        } else {
          toast.error('Неправильний хід. Спробуйте іншу ідею!');
          game.undo();
          setTimeout(() => {
            setGame(new Chess(game.fen()));
          }, 300);
        }

        return true;
      } catch {
        return false;
      }
    },
    [game, currentPuzzle, currentStep, isPuzzleSolved],
  );

  return (
    <div className="space-y-6 px-4 py-2 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 items-start">
        <TrainingSettingsPanel
          tags={tags}
          selectedTagIds={selectedTagIds}
          ratingRange={ratingRange}
          onToggleTag={handleToggleTag}
          onRatingChange={handleRatingChange}
          onStart={handleFetchRandomPuzzle}
          isLoadingPuzzle={isLoadingPuzzle}
          currentPuzzle={currentPuzzle}
          showHint={showHint}
          onToggleHint={() => setShowHint((prev) => !prev)}
        />

        <TrainingBoardCard
          game={game}
          currentPuzzle={currentPuzzle}
          isPuzzleSolved={isPuzzleSolved}
          orientation={orientation}
          onPieceDrop={handlePieceDrop}
        />

        {game && currentPuzzle && (
          <TrainingAnalysisPanel
            attemptHistory={attemptHistory}
            startFen={currentPuzzle.fen}
            isPuzzleSolved={isPuzzleSolved}
            isLoadingPuzzle={isLoadingPuzzle}
            onFetchNextPuzzle={handleFetchRandomPuzzle}
          />
        )}
      </div>
    </div>
  );
}

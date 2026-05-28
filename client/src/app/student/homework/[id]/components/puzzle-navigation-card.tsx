'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { HomeworkPuzzle, PuzzleAttempt } from '@/lib/types';

interface PuzzleNavigationCardProps {
  currentIndex: number;
  totalPuzzles: number;
  puzzles: HomeworkPuzzle[];
  puzzleAttempts: PuzzleAttempt[];
  onNavigate: (index: number) => void;
}

export function PuzzleNavigationCard({
  currentIndex,
  totalPuzzles,
  puzzles,
  puzzleAttempts,
  onNavigate,
}: PuzzleNavigationCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Задача {currentIndex + 1} / {totalPuzzles}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onNavigate(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                onNavigate(Math.min(totalPuzzles - 1, currentIndex + 1))
              }
              disabled={currentIndex === totalPuzzles - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {puzzles?.map((p: HomeworkPuzzle, index: number) => {
            const attempt = puzzleAttempts?.find(
              (a: PuzzleAttempt) => a.homeworkPuzzleId === p.id,
            );
            const isCurrent = index === currentIndex;

            return (
              <Button
                key={p.id}
                variant={isCurrent ? 'default' : 'outline'}
                size="sm"
                className="w-10 h-10 p-0"
                onClick={() => onNavigate(index)}
              >
                {attempt?.isSolved ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  index + 1
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

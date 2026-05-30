'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChessDiagram } from '@/components/chess-diagram';
import { Target } from 'lucide-react';
import type { Chess, Square } from 'chess.js';
import type { Puzzle as PuzzleType } from '@/lib/types';

interface TrainingBoardCardProps {
  game: Chess | null;
  currentPuzzle: PuzzleType | null;
  isPuzzleSolved: boolean;
  orientation: string;
  onPieceDrop: (args: {
    sourceSquare: Square;
    targetSquare: Square;
  }) => boolean;
}

export function TrainingBoardCard({
  game,
  currentPuzzle,
  isPuzzleSolved,
  orientation,
  onPieceDrop,
}: TrainingBoardCardProps) {
  if (!game || !currentPuzzle) {
    return (
      <Card className="border-dashed h-[428px] flex items-center justify-center bg-muted/10 lg:col-span-3">
        <div className="text-center space-y-2 max-w-xs px-4">
          <Target className="h-10 w-10 mx-auto text-muted-foreground opacity-40 animate-pulse" />
          <h3 className="font-semibold text-muted-foreground text-sm">
            Тренажер чекає на старт
          </h3>
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            Оберіть параметри та запустіть генерацію першої шахової задачі.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden lg:col-span-3">
      <CardHeader className="pt-2 flex flex-row items-center justify-center">
        <Badge
          variant={isPuzzleSolved ? 'secondary' : 'default'}
          className="text-lg px-3 py-3 transition-colors"
        >
          Хід {orientation}
        </Badge>
      </CardHeader>
      <CardContent className="pr-4 flex justify-center">
        <div className="w-full">
          <ChessDiagram
            fen={game.fen()}
            showNotation={true}
            orientation={currentPuzzle.fen.includes(' b ') ? 'black' : 'white'}
            options={{
              id: `training-puzzle-${currentPuzzle.id}`,
              allowDragging: !isPuzzleSolved,
              onPieceDrop: onPieceDrop,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Chess, Move } from 'chess.js';
import { Chessboard, ChessboardProvider } from 'react-chessboard';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Undo2, RotateCcw, Check } from 'lucide-react';
import { COLORS } from '@/lib/constants';

interface SolutionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFen: string;
  currentSolution: string;
  onSave: (solution: string) => void;
}

export function SolutionEditor({
  open,
  onOpenChange,
  initialFen,
  currentSolution,
  onSave,
}: SolutionEditorProps) {
  const chessGameRef = useRef<Chess | null>(null);
  const [position, setPosition] = useState(initialFen);
  const [moves, setMoves] = useState<Move[]>([]);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');

  useEffect(() => {
    if (open) {
      try {
        const game = new Chess(initialFen);
        chessGameRef.current = game;
        setPosition(initialFen);
        setMoves([]);

        const turn = initialFen.split(' ')[1];
        setOrientation(turn === 'b' ? COLORS.b : COLORS.w);

        if (currentSolution) {
          const solutionMoves = currentSolution.trim().split(/\s+/);
          const replayedMoves: Move[] = [];
          for (const san of solutionMoves) {
            try {
              const move = game.move(san);
              if (move) replayedMoves.push(move);
            } catch {
              break;
            }
          }
          setMoves(replayedMoves);
          setPosition(game.fen());
        }
      } catch {
        chessGameRef.current = new Chess();
        setPosition(chessGameRef.current.fen());
      }
    }
  }, [open, initialFen, currentSolution]);

  const handleMove = useCallback(({ sourceSquare, targetSquare }: any) => {
    const game = chessGameRef.current;
    if (!game) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move) {
        setMoves((prev) => [...prev, move]);
        setPosition(game.fen());
        return true;
      }
    } catch {
      return false;
    }

    return false;
  }, []);

  const handleUndo = () => {
    const game = chessGameRef.current;
    if (!game || moves.length === 0) return;

    game.undo();
    setMoves((prev) => prev.slice(0, -1));
    setPosition(game.fen());
  };

  const handleReset = () => {
    try {
      const game = new Chess(initialFen);
      chessGameRef.current = game;
      setMoves([]);
      setPosition(initialFen);
    } catch {
      console.log('Invalid FEN, cannot reset');
    }
  };

  const handleSave = () => {
    const solutionString = moves.map((m) => m.san).join(' ');
    onSave(solutionString);
    onOpenChange(false);
  };

  const getSolutionDisplay = () => {
    if (moves.length === 0) return null;

    const result: React.ReactNode[] = [];
    let moveNumber = 1;
    const startTurn = initialFen.split(' ')[1];
    let isWhiteTurn = startTurn === 'w';

    if (!isWhiteTurn && moves.length > 0) {
      result.push(
        <span key="first-num" className="text-muted-foreground mr-1">
          {moveNumber}...
        </span>,
      );
    }

    moves.forEach((move, index) => {
      if (isWhiteTurn) {
        result.push(
          <span key={`num-${index}`} className="text-muted-foreground mr-1">
            {moveNumber}.
          </span>,
        );
      }

      result.push(
        <Badge
          key={`move-${index}`}
          variant={isWhiteTurn ? 'outline' : 'secondary'}
          className="mr-1 mb-1"
        >
          {move.san}
        </Badge>,
      );

      if (!isWhiteTurn) {
        moveNumber++;
      }
      isWhiteTurn = !isWhiteTurn;
    });

    return result;
  };

  const chessboardOptions = {
    position,
    onPieceDrop: handleMove,
    id: 'solution-editor',
    boardOrientation: orientation,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Введення рішення</DialogTitle>
          <DialogDescription>
            Зробіть ходи на дошці, щоб ввести рішення задачі. Ходи будуть
            записані автоматично.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ChessboardProvider options={chessboardOptions}>
            <div className="max-w-md mx-auto border rounded-lg overflow-hidden">
              <Chessboard />
            </div>
          </ChessboardProvider>

          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={moves.length === 0}
            >
              <Undo2 className="h-4 w-4 mr-2" />
              Скасувати хід
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={moves.length === 0}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Спочатку
            </Button>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 min-h-[60px]">
            <p className="text-sm text-muted-foreground mb-2">Рішення:</p>
            <div className="flex flex-wrap items-center">
              {moves.length > 0 ? (
                getSolutionDisplay()
              ) : (
                <span className="text-muted-foreground text-sm">
                  Зробіть перший хід на дошці...
                </span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button onClick={handleSave} disabled={moves.length === 0}>
            <Check className="h-4 w-4 mr-2" />
            Зберегти рішення
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

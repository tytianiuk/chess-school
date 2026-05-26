'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square, Color, PieceSymbol } from 'chess.js';
import {
  Chessboard,
  ChessboardProvider,
  SparePiece,
  type PieceDropHandlerArgs,
} from 'react-chessboard';
import { Button } from '@/components/ui/button';
import { RotateCcw, FlipVertical } from 'lucide-react';
import { COLORS, FEN, PIECE_TYPES } from '@/lib/constants';

interface PuzzleBuilderProps {
  initialFen?: string;
  onFenChange: (fen: string) => void;
}

export function PuzzleBuilder({
  initialFen = FEN.EMPTY,
  onFenChange,
}: PuzzleBuilderProps) {
  const chessGameRef = useRef(new Chess(initialFen, { skipValidation: true }));
  const [chessPosition, setChessPosition] = useState(
    chessGameRef.current.fen(),
  );
  const [squareWidth, setSquareWidth] = useState<number | null>(null);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');

  useEffect(() => {
    const square = document
      .querySelector(`[data-square="a1"]`)
      ?.getBoundingClientRect();
    setSquareWidth(square?.width ?? null);
  }, []);

  useEffect(() => {
    onFenChange(chessPosition);
  }, [chessPosition, onFenChange]);

  const handlePieceDrop = useCallback(
    ({ sourceSquare, targetSquare, piece }: PieceDropHandlerArgs) => {
      const chessGame = chessGameRef.current;
      const color = piece.pieceType[0] as Color;
      const type = piece.pieceType[1].toLowerCase() as PieceSymbol;

      if (!targetSquare) {
        chessGame.remove(sourceSquare as Square);
        setChessPosition(chessGame.fen());
        return true;
      }

      if (!piece.isSparePiece) {
        chessGame.remove(sourceSquare as Square);
      }

      const success = chessGame.put({ color, type }, targetSquare as Square);

      if (!success) {
        return false;
      }

      setChessPosition(chessGame.fen());
      return true;
    },
    [],
  );

  const handleClear = () => {
    chessGameRef.current = new Chess(FEN.EMPTY, { skipValidation: true });
    setChessPosition(FEN.EMPTY);
  };

  const handleReset = () => {
    chessGameRef.current = new Chess(FEN.START, { skipValidation: true });
    setChessPosition(FEN.START);
  };

  const handleToggleTurn = () => {
    const parts = chessPosition.split(' ');
    parts[1] = parts[1] === 'w' ? 'b' : 'w';

    const newFen = parts.join(' ');

    chessGameRef.current = new Chess(newFen, { skipValidation: true });
    setChessPosition(newFen);
  };

  const currentTurn = chessPosition.split(' ')[1] === 'w' ? COLORS.w : COLORS.b;

  const chessboardOptions = {
    position: chessPosition,
    onPieceDrop: handlePieceDrop,
    id: 'puzzle-builder',
    boardOrientation: orientation,
  };

  const buttonsConfig = [
    {
      label: 'Очистити',
      icon: <RotateCcw className="h-4 w-4 mr-2" />,
      onClick: handleClear,
    },
    {
      label: 'Початкова позиція',
      onClick: handleReset,
    },
    {
      label: 'Перевернути',
      icon: <FlipVertical className="h-4 w-4 mr-2" />,
      onClick: () =>
        setOrientation((o) => (o === COLORS.w ? COLORS.b : COLORS.w)),
    },
    {
      label: `Хід ${currentTurn === COLORS.w ? 'білих' : 'чорних'}`,
      onClick: handleToggleTurn,
      className: 'relative pl-3 pr-4',
    },
  ];

  return (
    <div className="space-y-3 p">
      <ChessboardProvider options={chessboardOptions}>
        {squareWidth && (
          <div
            className="grid grid-cols-6 mx-auto w-fit rounded-t-lg overflow-hidden border border-b-0"
            style={{ backgroundColor: '#b58863' }}
          >
            {PIECE_TYPES.black.map((pieceType) => (
              <div
                key={pieceType}
                style={{
                  width: `${squareWidth}px`,
                  height: `${squareWidth}px`,
                }}
                className="flex items-center justify-center cursor-grab active:cursor-grabbing"
              >
                <SparePiece pieceType={pieceType} />
              </div>
            ))}
          </div>
        )}

        <div className="border rounded-lg overflow-hidden">
          <Chessboard />
        </div>

        {squareWidth && (
          <div
            className="grid grid-cols-6 mx-auto w-fit rounded-b-lg overflow-hidden border border-t-0"
            style={{ backgroundColor: '#f0d9b5' }}
          >
            {PIECE_TYPES.white.map((pieceType) => (
              <div
                key={pieceType}
                style={{
                  width: `${squareWidth}px`,
                  height: `${squareWidth}px`,
                }}
                className="flex items-center justify-center cursor-grab active:cursor-grabbing"
              >
                <SparePiece pieceType={pieceType} />
              </div>
            ))}
          </div>
        )}
      </ChessboardProvider>

      <div className="flex flex-wrap gap-2 justify-center">
        {buttonsConfig.map(({ label, icon, onClick, className = '' }) => (
          <Button
            key={label}
            type="button"
            size="sm"
            variant="outline"
            onClick={onClick}
            className={`basis-2/5 ${className}`}
          >
            {icon}
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}

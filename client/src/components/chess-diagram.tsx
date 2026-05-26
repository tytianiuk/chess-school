'use client';

import { Chessboard } from 'react-chessboard';

interface ChessDiagramProps {
  fen: string;
  size?: number;
  className?: string;
  showNotation?: boolean;
  orientation?: 'white' | 'black';
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export function ChessDiagram({
  fen,
  size = 320,
  className,
  showNotation = true,
}: ChessDiagramProps) {
  const notationSize = size / 10;

  const getOrientation = (fen: string): 'white' | 'black' => {
    const fenParts = fen.split(' ');
    if (fenParts.length < 2) return 'white';
    return fenParts[1] === 'w' ? 'white' : 'black';
  };

  const files = getOrientation(fen) === 'white' ? FILES : [...FILES].reverse();
  const ranks = getOrientation(fen) === 'white' ? RANKS : [...RANKS].reverse();

  const chessboardOptions = {
    position: fen,
    showNotation: false,
    allowDragging: false,
    boardOrientation: getOrientation(fen),
  };

  if (!showNotation) {
    return (
      <div
        className={className}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      >
        <Chessboard options={chessboardOptions} />
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        paddingRight: notationSize,
      }}
    >
      <div className="flex">
        <div
          className="flex flex-col items-center justify-around"
          style={{ minWidth: notationSize }}
        >
          {ranks.map((rank) => (
            <span
              key={rank}
              className="text-muted-foreground font-medium select-none"
              style={{ fontSize: Math.max(10, size / 16), lineHeight: 1 }}
            >
              {rank}
            </span>
          ))}
        </div>

        <div style={{ width: size, height: size }}>
          <Chessboard options={chessboardOptions} />
        </div>
      </div>

      <div
        className="flex justify-around items-center"
        style={{
          height: notationSize,
          marginLeft: notationSize,
        }}
      >
        {files.map((file) => (
          <span
            key={file}
            className="text-muted-foreground font-medium select-none"
            style={{ fontSize: Math.max(10, size / 16), lineHeight: 1 }}
          >
            {file}
          </span>
        ))}
      </div>
    </div>
  );
}

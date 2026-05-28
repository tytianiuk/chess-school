'use client';

import { Chessboard, ChessboardProvider } from 'react-chessboard';
interface ChessDiagramProps {
  fen: string;
  size?: number;
  className?: string;
  showNotation?: boolean;
  orientation?: 'white' | 'black';
  options?: Record<string, any>;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export function ChessDiagram({
  fen,
  size,
  className,
  showNotation = true,
  orientation,
  options = {},
}: ChessDiagramProps) {
  const getOrientation = (fenString: string): 'white' | 'black' => {
    if (orientation) return orientation;
    const fenParts = fenString.split(' ');
    if (fenParts.length < 2) return 'white';
    return fenParts[1] === 'w' ? 'white' : 'black';
  };

  const boardOrientation = getOrientation(fen);
  const files = boardOrientation === 'white' ? FILES : [...FILES].reverse();
  const ranks = boardOrientation === 'white' ? RANKS : [...RANKS].reverse();

  const currentSize = size || 320;
  const notationSize = currentSize / 10;

  const combinedOptions = {
    id: options.id || `chess-board-${fen.slice(0, 10)}`,
    position: fen,
    showNotation: false,
    allowDragging: false,
    boardOrientation,
    ...options,
  };

  const RenderBoard = () => <Chessboard options={combinedOptions} />;

  if (!showNotation) {
    return (
      <div
        className={className}
        style={
          size
            ? { width: size, height: size, minWidth: size, minHeight: size }
            : { width: '100%', height: '100%' }
        }
      >
        <RenderBoard />
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: size ? 'auto' : '100%',
      }}
    >
      <div className="flex w-full">
        <div
          className="flex flex-col items-center justify-around"
          style={{ minWidth: size ? notationSize : '10%' }}
        >
          {ranks.map((rank) => (
            <span
              key={rank}
              className="text-muted-foreground font-medium select-none"
              style={{
                fontSize: Math.max(10, currentSize / 16),
                lineHeight: 1,
              }}
            >
              {rank}
            </span>
          ))}
        </div>

        <div
          style={
            size
              ? { width: size, height: size }
              : { width: '100%', aspectRatio: '1/1' }
          }
        >
          <RenderBoard />
        </div>
      </div>

      <div
        className="flex justify-around items-center"
        style={{
          height: size ? notationSize : '20%',
          paddingLeft: size ? notationSize : '10%',
          width: size ? size : '100%',
        }}
      >
        {files.map((file) => (
          <span
            key={file}
            className="text-muted-foreground font-medium select-none"
            style={{ fontSize: Math.max(10, currentSize / 16), lineHeight: 2 }}
          >
            {file}
          </span>
        ))}
      </div>
    </div>
  );
}

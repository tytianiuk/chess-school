export const COLORS = { w: 'white', b: 'black' } as const;

export const FEN: { EMPTY: string; START: string } = {
  EMPTY: '8/8/8/8/8/8/8/8 w - - 0 1',
  START: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
} as const;

export const PIECE_TYPES = {
  black: ['bK', 'bQ', 'bR', 'bB', 'bN', 'bP'],
  white: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'],
} as const;

import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { ProgressStatus } from './types';

export const COLORS = { w: 'white', b: 'black' } as const;

export const FEN: { EMPTY: string; START: string } = {
  EMPTY: '8/8/8/8/8/8/8/8 w - - 0 1',
  START: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
} as const;

export const PIECE_TYPES = {
  black: ['bK', 'bQ', 'bR', 'bB', 'bN', 'bP'],
  white: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'],
} as const;

export const STATUS_CONFIG: Record<
  ProgressStatus,
  {
    label: string;
    color: string;
    icon: React.ElementType;
    activeColor?: string;
    inactiveColor?: string;
  }
> = {
  PENDING: { label: 'Очікує', color: 'bg-gray-500 text-white', icon: Clock },
  IN_PROGRESS: {
    label: 'В процесі',
    color: 'bg-blue-500 text-white',
    icon: Clock,
    activeColor: 'text-white/40',
    inactiveColor: 'text-gray-400',
  },
  REVIEW_PENDING: {
    label: 'На перевірці',
    color: 'bg-yellow-500 text-black',
    icon: AlertCircle,
    activeColor: 'text-white',
    inactiveColor: 'text-yellow-500',
  },
  SOLVED: {
    label: 'Виконано',
    color: 'bg-green-500 text-white',
    icon: CheckCircle2,
    activeColor: 'text-white',
    inactiveColor: 'text-green-600',
  },
  FAILED: {
    label: 'Не виконано',
    color: 'bg-red-500 text-white',
    icon: XCircle,
    activeColor: 'text-white/60',
    inactiveColor: 'text-red-500',
  },
};

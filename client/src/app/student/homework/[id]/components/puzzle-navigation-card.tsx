'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import type {
  HomeworkPuzzle,
  PuzzleAttempt,
  ProgressStatus,
} from '@/lib/types';

interface PuzzleNavigationCardProps {
  currentIndex: number;
  totalPuzzles: number;
  puzzles: HomeworkPuzzle[];
  puzzleAttempts: PuzzleAttempt[];
  onNavigate: (index: number) => void;
}

const puzzleNavConfig: Record<
  ProgressStatus,
  {
    icon: React.ElementType;
    activeClass: string;
    inactiveClass: string;
  }
> = {
  SOLVED: {
    icon: CheckCircle2,
    activeClass:
      'bg-green-600 hover:bg-green-700 text-white border-transparent',
    inactiveClass:
      'text-green-600 border-green-200 bg-green-50/50 hover:bg-green-50',
  },
  REVIEW_PENDING: {
    icon: AlertCircle,
    activeClass:
      'bg-yellow-500 hover:bg-yellow-600 text-black border-transparent',
    inactiveClass:
      'text-yellow-600 border-yellow-200 bg-yellow-50/50 hover:bg-yellow-50',
  },
  FAILED: {
    icon: XCircle,
    activeClass: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
    inactiveClass: 'text-red-600 border-red-200 bg-red-50/50 hover:bg-red-50',
  },
  PENDING: {
    icon: Clock,
    activeClass: 'bg-blue-600 text-white hover:bg-blue-700 border-transparent',
    inactiveClass: 'bg-background hover:bg-muted border-border text-foreground',
  },
  IN_PROGRESS: {
    icon: Clock,
    activeClass: 'bg-blue-600 text-white hover:bg-blue-700 border-transparent',
    inactiveClass: 'bg-background hover:bg-muted border-border text-foreground',
  },
};

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
            const status = (attempt?.status || 'PENDING') as ProgressStatus;
            const config = puzzleNavConfig[status];
            const Icon = config.icon;
            const statusColorClass = isCurrent
              ? config.activeClass
              : config.inactiveClass;

            const content =
              status === 'PENDING' ? index + 1 : <Icon className="h-4 w-4" />;

            return (
              <Button
                key={p.id}
                variant="outline"
                size="sm"
                className={`w-10 h-10 p-0 font-mono font-bold text-sm rounded-lg transition-all ${statusColorClass}`}
                onClick={() => onNavigate(index)}
              >
                {content}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

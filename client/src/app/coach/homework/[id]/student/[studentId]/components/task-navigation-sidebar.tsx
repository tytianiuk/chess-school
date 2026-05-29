'use client';

import { ChevronRight } from 'lucide-react';
import type { PuzzleAttempt, HomeworkPuzzle } from '@/lib/types';
import { STATUS_CONFIG } from '@/lib/constants';

interface TaskNavigationSidebarProps {
  puzzleAttempts: PuzzleAttempt[];
  activePuzzleIndex: number;
  homeworkPuzzles: HomeworkPuzzle[] | undefined;
  onSelectPuzzle: (index: number) => void;
}

export function TaskNavigationSidebar({
  puzzleAttempts,
  activePuzzleIndex,
  homeworkPuzzles,
  onSelectPuzzle,
}: TaskNavigationSidebarProps) {
  return (
    <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
      {puzzleAttempts.map((attempt, index) => {
        const isSelected = index === activePuzzleIndex;
        const p = attempt.homeworkPuzzle?.puzzle;
        const hp = homeworkPuzzles?.find(
          (item) => item.id === attempt.homeworkPuzzleId,
        );
        const isManual = hp?.checkType === 'MANUAL';
        const config = STATUS_CONFIG[attempt.status] || STATUS_CONFIG.PENDING;
        const StatusIcon = config.icon;

        const iconColorClass = isSelected
          ? config.activeColor || 'text-white'
          : config.inactiveColor || 'text-gray-400';
        return (
          <button
            key={attempt.id}
            type="button"
            onClick={() => onSelectPuzzle(index)}
            className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all group ${
              isSelected
                ? 'bg-blue-600 border-transparent text-white shadow-md ring-2 ring-blue-600/20'
                : 'bg-background hover:bg-muted border-border text-foreground'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`h-7 w-7 rounded-lg text-xs font-bold font-mono flex items-center justify-center shrink-0 ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-muted text-muted-foreground group-hover:bg-background'
                }`}
              >
                {index + 1}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate pr-2">
                  {p?.title || `Задача #${attempt.homeworkPuzzleId}`}
                </p>
                <p
                  className={`text-xs mt-0.5 ${isSelected ? 'text-blue-100' : 'text-muted-foreground'}`}
                >
                  {isManual
                    ? 'Ручна перевірка'
                    : `Спроб: ${attempt.attemptCount + 1}`}
                </p>
              </div>
            </div>

            <div className="flex items-center shrink-0">
              <StatusIcon
                className={`h-4 w-4 transition-colors ${iconColorClass}`}
              />
              <ChevronRight
                className={`h-4 w-4 ml-1 transition-transform ${
                  isSelected
                    ? 'text-white translate-x-0.5'
                    : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                }`}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

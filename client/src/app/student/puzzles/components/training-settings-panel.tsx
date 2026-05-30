'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Target, Lightbulb } from 'lucide-react';
import { TrainingSettingsCard } from './training-settings-card';
import type { PuzzleTag, Puzzle as PuzzleType } from '@/lib/types';

interface TrainingSettingsPanelProps {
  tags: PuzzleTag[] | undefined;
  selectedTagIds: number[];
  ratingRange: { min: string; max: string };
  onToggleTag: (id: number) => void;
  onRatingChange: (type: 'min' | 'max', value: string) => void;
  onStart: () => void;
  isLoadingPuzzle: boolean;
  currentPuzzle: PuzzleType | null;
  showHint: boolean;
  onToggleHint: () => void;
}

export function TrainingSettingsPanel({
  tags,
  selectedTagIds,
  ratingRange,
  onToggleTag,
  onRatingChange,
  onStart,
  isLoadingPuzzle,
  currentPuzzle,
  showHint,
  onToggleHint,
}: TrainingSettingsPanelProps) {
  return (
    <div className="space-y-4 self-start lg:col-span-2">
      <TrainingSettingsCard
        tags={tags}
        selectedTagIds={selectedTagIds}
        ratingRange={ratingRange}
        onToggleTag={onToggleTag}
        onRatingChange={onRatingChange}
        onStart={onStart}
        isLoadingPuzzle={isLoadingPuzzle}
      />

      {currentPuzzle && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1">
                <Target className="h-3.5 w-3.5 text-blue-500" />
                Рейтинг: {currentPuzzle.rating} ELO
              </span>
              {currentPuzzle.hint && (
                <button
                  onClick={onToggleHint}
                  className="text-blue-600 hover:underline flex items-center gap-1 transition-colors"
                >
                  <Lightbulb className="h-3 w-3" /> Підказка
                </button>
              )}
            </div>
            {showHint && currentPuzzle.hint && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2 leading-relaxed animate-in fade-in duration-200">
                {currentPuzzle.hint}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

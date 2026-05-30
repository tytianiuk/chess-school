'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Hash, Award, Play, Loader2 } from 'lucide-react';
import type { PuzzleTag } from '@/lib/types';

interface TrainingSettingsCardProps {
  tags: PuzzleTag[] | undefined;
  selectedTagIds: number[];
  ratingRange: { min: string; max: string };
  onToggleTag: (id: number) => void;
  onRatingChange: (type: 'min' | 'max', value: string) => void;
  onStart: () => void;
  isLoadingPuzzle: boolean;
}

export function TrainingSettingsCard({
  tags,
  selectedTagIds,
  ratingRange,
  onToggleTag,
  onRatingChange,
  onStart,
  isLoadingPuzzle,
}: TrainingSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Налаштування тренування</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-xs font-bold uppercase text-muted-foreground">
            <Award className="h-4 w-4 text-amber-500" />
            Діапазон рейтингу (ELO)
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Мін: 600"
              value={ratingRange.min}
              onChange={(e) => onRatingChange('min', e.target.value)}
              className="h-9 font-mono"
            />
            <span className="text-muted-foreground text-sm">—</span>
            <Input
              type="number"
              placeholder="Макс: 2500"
              value={ratingRange.max}
              onChange={(e) => onRatingChange('max', e.target.value)}
              className="h-9 font-mono"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-muted-foreground">
            Теми
          </Label>
          <div className="max-h-[200px] overflow-y-auto border rounded-lg p-2.5 bg-muted/20">
            {tags && tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <Badge
                      key={tag.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`cursor-pointer select-none px-2 py-0.5 text-[11px] rounded-full transition-colors ${
                        isSelected
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'hover:bg-muted text-muted-foreground'
                      }`}
                      onClick={() => onToggleTag(tag.id)}
                    >
                      <Hash className="h-2.5 w-2.5 mr-0.5 opacity-60" />
                      {tag.label}
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic text-center py-4">
                Теми завантажуються...
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={onStart}
          disabled={isLoadingPuzzle}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 gap-2"
        >
          {isLoadingPuzzle ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
          Генерувати випадкову задачу
        </Button>
      </CardContent>
    </Card>
  );
}

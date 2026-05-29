'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hash, Loader2 } from 'lucide-react';
import type { PuzzleTag } from '@/lib/types';

interface PuzzleTagsCardProps {
  availableTags: PuzzleTag[] | undefined;
  selectedTagIds: number[];
  fen: string;
  isSubmitting: boolean;
  onToggleTag: (tagId: number) => void;
}

export function PuzzleTagsCard({
  availableTags,
  selectedTagIds,
  fen,
  isSubmitting,
  onToggleTag,
}: PuzzleTagsCardProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Теми</CardTitle>
        </CardHeader>
        <CardContent>
          {availableTags && availableTags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <Badge
                    key={tag.id}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`cursor-pointer select-none px-2.5 py-0.5 text-xs transition-colors rounded-full ${
                      isSelected
                        ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                    onClick={() => onToggleTag(tag.id)}
                  >
                    <Hash className="h-3 w-3 mr-0.5 opacity-60" />
                    {tag.label}
                  </Badge>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic text-center py-2">
              Довідник тактик порожній.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="text-xs font-mono text-muted-foreground truncate select-all bg-muted/60 p-2 rounded border">
            <span className="font-semibold select-none mr-2">FEN:</span>
            {fen}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href="/coach/puzzles" className="flex-1">
          <Button type="button" variant="outline" className="w-full">
            Скасувати
          </Button>
        </Link>
        <Button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Збереження...
            </>
          ) : (
            'Зберегти зміни'
          )}
        </Button>
      </div>
    </div>
  );
}

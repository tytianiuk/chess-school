'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { HomeworkPuzzle } from '@/lib/types';

interface HomeworkPuzzlesCardProps {
  puzzles: HomeworkPuzzle[] | undefined;
}

export function HomeworkPuzzlesCard({ puzzles }: HomeworkPuzzlesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Задачі в завданні</CardTitle>
      </CardHeader>
      <CardContent>
        {puzzles && puzzles.length > 0 ? (
          <div className="space-y-2">
            {puzzles.map((hp, index) => (
              <div
                key={hp.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-background"
              >
                <span className="text-sm font-semibold font-mono text-muted-foreground w-5 shrink-0">
                  {index + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {hp.puzzle?.title || `Задача #${hp.puzzleId}`}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono truncate mt-0.5 select-all max-w-md sm:max-w-xl">
                    {hp.puzzle?.fen}
                  </div>
                </div>
                <Badge
                  variant={hp.checkType === 'AUTO' ? 'secondary' : 'outline'}
                  className="shrink-0 text-xs"
                >
                  {hp.checkType === 'AUTO' ? 'Автоматична' : 'Ручна'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic text-center py-4">
            У цьому завданні немає прикріплених задач
          </p>
        )}
      </CardContent>
    </Card>
  );
}

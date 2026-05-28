'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Lightbulb } from 'lucide-react';
import type { CheckType, PuzzleAttempt } from '@/lib/types';

interface PuzzleInfoCardProps {
  puzzleTitle: string | undefined;
  puzzleId: number | undefined;
  checkType: CheckType;
  hint: string | undefined;
  attempt: PuzzleAttempt | undefined;
  showHint: boolean;
  onShowHint: () => void;
  attemptHistory: string[];
}

export function PuzzleInfoCard({
  puzzleTitle,
  puzzleId,
  checkType,
  hint,
  attempt,
  showHint,
  onShowHint,
  attemptHistory,
}: PuzzleInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {puzzleTitle || `Задача #${puzzleId}`}
          </CardTitle>
          <Badge variant={checkType === 'AUTO' ? 'secondary' : 'outline'}>
            {checkType === 'AUTO' ? 'Автоперевірка' : 'Ручна'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {attempt?.isSolved ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-green-600 font-medium">Вирішено</span>
              {attempt.solvedOnFirst && (
                <Badge className="bg-green-100 text-green-800">
                  З першої спроби
                </Badge>
              )}
            </>
          ) : (
            <>
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>Спроб: {attempt?.attemptCount ?? 0}</span>
            </>
          )}
        </div>

        {hint && !attempt?.isSolved && (
          <div>
            {showHint ? (
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
                <div className="flex items-center gap-2 font-medium mb-1">
                  <Lightbulb className="h-4 w-4" />
                  Підказка
                </div>
                <p className="text-sm">{hint}</p>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onShowHint}
                className="gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                Показати підказку
              </Button>
            )}
          </div>
        )}

        {attemptHistory.length > 0 && checkType === 'AUTO' && (
          <div>
            <div className="text-sm text-muted-foreground mb-2">Ваші ходи:</div>
            <div className="flex flex-wrap gap-1">
              {attemptHistory.map((move, index) => (
                <Badge key={index} variant="outline">
                  {move}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

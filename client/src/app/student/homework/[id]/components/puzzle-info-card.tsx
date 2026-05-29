'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Clock,
  Lightbulb,
  AlertCircle,
  XCircle,
} from 'lucide-react';
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
  const isManual = checkType === 'MANUAL';
  const currentStatus = attempt?.status || 'PENDING';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg truncate">
            {puzzleTitle || `Задача #${puzzleId}`}
          </CardTitle>
          <Badge
            variant={isManual ? 'outline' : 'secondary'}
            className={
              isManual
                ? 'border-yellow-500 text-yellow-700 bg-yellow-50/50'
                : ''
            }
          >
            {isManual ? 'Ручна' : 'Автоперевірка'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {currentStatus === 'SOLVED' && (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-green-600 font-medium">Вирішено</span>
              {!isManual && attempt?.solvedOnFirst && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  З першої спроби ✨
                </Badge>
              )}
            </>
          )}

          {currentStatus === 'REVIEW_PENDING' && (
            <>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-yellow-600 font-medium">
                На перевірці у тренера
              </span>
            </>
          )}

          {currentStatus === 'FAILED' && (
            <>
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-600 font-medium">Не зараховано</span>
            </>
          )}

          {currentStatus === 'PENDING' && (
            <>
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground font-medium">
                Ще не розв&apos;язано
              </span>
              {!isManual && (attempt?.attemptCount ?? 0) > 0 && (
                <span className="text-sm text-muted-foreground">
                  (Спроб: {attempt?.attemptCount})
                </span>
              )}
            </>
          )}
        </div>

        {hint &&
          currentStatus !== 'SOLVED' &&
          currentStatus !== 'REVIEW_PENDING' && (
            <div>
              {showHint ? (
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
                  <div className="flex items-center gap-2 font-medium mb-1">
                    <Lightbulb className="h-4 w-4" />
                    Підказка
                  </div>
                  <p className="text-sm leading-relaxed">{hint}</p>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShowHint}
                  className="gap-2 text-xs"
                >
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Показати підказку
                </Button>
              )}
            </div>
          )}

        {attemptHistory.length > 0 &&
          !isManual &&
          currentStatus !== 'SOLVED' && (
            <div>
              <div className="text-xs text-muted-foreground mb-1.5 font-medium">
                Введені ходи:
              </div>
              <div className="flex flex-wrap gap-1 font-mono">
                {attemptHistory.map((move, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs px-2 py-0"
                  >
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

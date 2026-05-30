'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, RefreshCw } from 'lucide-react';
import { ChessNotation } from '@/components/chess-notation';

interface TrainingAnalysisPanelProps {
  attemptHistory: string[];
  startFen: string;
  isPuzzleSolved: boolean;
  isLoadingPuzzle: boolean;
  onFetchNextPuzzle: () => void;
}

export function TrainingAnalysisPanel({
  attemptHistory,
  startFen,
  isPuzzleSolved,
  isLoadingPuzzle,
  onFetchNextPuzzle,
}: TrainingAnalysisPanelProps) {
  return (
    <Card className="h-full flex flex-col justify-between lg:col-span-1 self-stretch min-h-[460px]">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
        <History className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-base">Аналіз позиції</CardTitle>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-between min-h-0">
        <div className="flex-1 overflow-y-auto pr-1 max-h-[300px]">
          {attemptHistory.length > 0 ? (
            <ChessNotation moves={attemptHistory} startFen={startFen} />
          ) : (
            <div className="text-xs text-muted-foreground italic p-4 text-center border border-dashed rounded-lg bg-muted/10">
              Зробіть свій перший хід на дошці для запису варіанту.
            </div>
          )}
        </div>

        <div className="pt-4 border-t mt-4">
          <Button
            onClick={onFetchNextPuzzle}
            disabled={!isPuzzleSolved || isLoadingPuzzle}
            className={`w-full h-11 rounded-xl font-bold gap-2 transition-all shadow-sm ${
              isPuzzleSolved
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-100/50'
                : 'bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed border border-border'
            }`}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoadingPuzzle ? 'animate-spin' : ''}`}
            />
            {isPuzzleSolved ? 'Наступна' : 'Вирішіть задачу'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

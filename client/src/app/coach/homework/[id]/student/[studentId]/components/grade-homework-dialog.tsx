'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { ProgressStatus } from '@/lib/types';

interface GradeHomeworkDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  gradeData: { score: string; trainerComment: string; status: ProgressStatus };
  setGradeData: React.Dispatch<
    React.SetStateAction<{
      score: string;
      trainerComment: string;
      status: ProgressStatus;
    }>
  >;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

const homeworkStatusButtons = [
  {
    status: 'SOLVED' as ProgressStatus,
    label: 'Виконано',
    icon: CheckCircle2,
    activeVariant: 'default' as const,
  },
  {
    status: 'FAILED' as ProgressStatus,
    label: 'Не виконано',
    icon: XCircle,
    activeVariant: 'destructive' as const,
  },
];

export function GradeHomeworkDialog({
  isOpen,
  onOpenChange,
  gradeData,
  setGradeData,
  onSubmit,
  isSubmitting,
}: GradeHomeworkDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Оцінити роботу</DialogTitle>
          <DialogDescription>
            Виставте оцінку за шкалою 0-100 та залиште коментар з аналізом
            помилок.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="score">Оцінка (0-100) *</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="100"
              value={gradeData.score}
              onChange={(e) =>
                setGradeData({ ...gradeData, score: e.target.value })
              }
              placeholder="85"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Коментар тренера</Label>
            <Textarea
              id="comment"
              value={gradeData.trainerComment}
              onChange={(e) =>
                setGradeData({ ...gradeData, trainerComment: e.target.value })
              }
              placeholder="Гарна робота! Зверніть увагу на тактичні вилки..."
              rows={3}
              className="resize-none text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Фінальний статус</Label>
            <div className="flex gap-2">
              {homeworkStatusButtons.map((btn) => {
                const isActive = gradeData.status === btn.status;
                const Icon = btn.icon;

                return (
                  <Button
                    key={btn.status}
                    type="button"
                    variant={isActive ? btn.activeVariant : 'outline'}
                    className="flex-1"
                    onClick={() =>
                      setGradeData({ ...gradeData, status: btn.status })
                    }
                  >
                    <Icon className="h-4 w-4 mr-2 shrink-0" />
                    {btn.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Збереження...
              </>
            ) : (
              'Зберегти оцінку'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

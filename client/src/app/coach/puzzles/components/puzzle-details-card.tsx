'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Edit3 } from 'lucide-react';

interface PuzzleDetailsCardProps {
  title: string;
  rating: number | '';
  solution: string;
  hint: string;
  isPuzzleReady: boolean;
  onOpenSolutionEditor: () => void;
  onChange: (fields: {
    title?: string;
    rating?: number | '';
    hint?: string;
  }) => void;
}

export function PuzzleDetailsCard({
  title,
  rating,
  solution,
  hint,
  isPuzzleReady,
  onOpenSolutionEditor,
  onChange,
}: PuzzleDetailsCardProps) {
  return (
    <Card className="self-start">
      <CardHeader className="pb-3">
        <CardTitle>Деталі задачі</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Назва задачі</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Мат у 2 ходи"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating" className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-amber-500" />
            Складність задачі
          </Label>
          <Input
            id="rating"
            type="number"
            min={300}
            max={3000}
            value={rating}
            onChange={(e) =>
              onChange({
                rating:
                  e.target.value === '' ? '' : parseInt(e.target.value, 10),
              })
            }
            placeholder="1500"
          />
        </div>

        <div className="space-y-2">
          <Label>Рішення *</Label>
          <div className="flex-1 rounded-md border bg-muted/50 px-3 py-2 min-h-[50px] flex items-center mb-2">
            {solution ? (
              <div className="flex flex-wrap gap-1">
                {solution.split(' ').map((move, i) => (
                  <Badge key={i} variant="secondary" className="font-mono">
                    {move}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground text-xs italic">
                Рішення не введено
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full h-9 text-xs"
            onClick={onOpenSolutionEditor}
            disabled={!isPuzzleReady}
          >
            <Edit3 className="h-3.5 w-3.5 mr-1.5" />
            Редагувати ходи рішення
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hint">Підказка для учня</Label>
          <Textarea
            id="hint"
            value={hint}
            onChange={(e) => onChange({ hint: e.target.value })}
            placeholder="Зверніть увагу на слабкість поля f7"
            rows={2}
            className="resize-none text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}

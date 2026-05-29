'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { PuzzleService } from '@/services/puzzle.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Edit3, Award, Hash } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { SolutionEditor } from '@/components/solution-editor';
import { validateFEN } from '@/lib/fen-validator';
import { FEN } from '@/lib/constants';
import type { PuzzleTag } from '@/lib/types';
import { PuzzleTagService } from '@/services/puzzle-tag.service';

const PuzzleBuilder = dynamic(
  () => import('@/components/puzzle-builder').then((mod) => mod.PuzzleBuilder),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square bg-muted animate-pulse rounded-lg" />
    ),
  },
);

export default function NewPuzzlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    fen: FEN.EMPTY,
    solution: '',
    hint: '',
    rating: 0,
    tagIds: [] as number[],
  });

  const [solutionEditorOpen, setSolutionEditorOpen] = useState(false);

  const { data: availableTags, isLoading: tagsLoading } = useSWR<PuzzleTag[]>(
    'puzzles-tags',
    () => PuzzleTagService.getAll(),
  );

  const handleFenChange = useCallback((newFen: string) => {
    setFormData((prev) => ({ ...prev, fen: newFen, solution: '' }));
  }, []);

  const handleOpenSolutionEditor = () => {
    const { isValid, errorMessage } = validateFEN(formData.fen);

    if (!isValid) {
      toast.error(errorMessage);
      return;
    }
    setSolutionEditorOpen(true);
  };

  const handleSolutionSave = useCallback((solution: string) => {
    setFormData((prev) => ({ ...prev, solution }));
    toast.success('Рішення збережено');
  }, []);

  const handleToggleTag = (tagId: number) => {
    setFormData((prev) => {
      const isAlreadySelected = prev.tagIds.includes(tagId);
      return {
        ...prev,
        tagIds: isAlreadySelected
          ? prev.tagIds.filter((id) => id !== tagId)
          : [...prev.tagIds, tagId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fen || formData.fen === FEN.EMPTY) {
      toast.error('Виставте позицію на дошці');
      return;
    }

    if (!formData.solution) {
      toast.error('Введіть рішення задачі');
      return;
    }

    setIsSubmitting(true);

    try {
      await PuzzleService.create({
        title: formData.title || undefined,
        fen: formData.fen,
        solution: formData.solution,
        hint: formData.hint || undefined,
        rating: Number(formData.rating),
        tagIds: formData.tagIds,
      });
      toast.success('Задачу створено в загальному банку');
      router.push('/coach/puzzles');
    } catch {
      toast.error('Помилка при створенні задачі');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPuzzleReady = formData.fen && formData.fen !== FEN.EMPTY;

  return (
    <div className="mx-auto space-y-6 px-4 py-2">
      <div className="flex items-center gap-4">
        <Link href="/coach/puzzles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Нова задача</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Деталі задачі</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Назва задачі (необов&apos;язково)
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Наприклад: Реалізація зайвої фігури"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating" className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-amber-500" />
                    Складність задачі (Рейтинг ELO) *
                  </Label>
                  <Input
                    id="rating"
                    type="number"
                    min={300}
                    max={3000}
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rating: parseInt(e.target.value, 10) || 1500,
                      })
                    }
                    placeholder="1500"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Рішення задачі *</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-md border bg-muted/50 px-3 py-2 min-h-[50px] flex items-center">
                      {formData.solution ? (
                        <div className="flex flex-wrap gap-1">
                          {formData.solution.split(' ').map((move, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="font-mono"
                            >
                              {move}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">
                          Запишіть послідовність правильних ходів у редакторі
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-9 text-xs"
                    onClick={handleOpenSolutionEditor}
                    disabled={!isPuzzleReady}
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                    {formData.solution
                      ? 'Редагувати ходи рішення'
                      : 'Записати ходи рішення'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hint">Підказка для учня</Label>
                  <Textarea
                    id="hint"
                    value={formData.hint}
                    onChange={(e) =>
                      setFormData({ ...formData, hint: e.target.value })
                    }
                    placeholder="Яка ідея лежить на поверхні? Наприклад: Шукайте відкритий шах..."
                    rows={2}
                    className="resize-none text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Конструктор позиції</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PuzzleBuilder
                initialFen={FEN.EMPTY}
                onFenChange={handleFenChange}
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Теми</CardTitle>
              </CardHeader>
              <CardContent>
                {tagsLoading ? (
                  <div className="flex flex-wrap gap-1.5 animate-pulse">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-6 w-20 bg-muted rounded-full" />
                    ))}
                  </div>
                ) : availableTags && availableTags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {availableTags.map((tag) => {
                      const isSelected = formData.tagIds.includes(tag.id);
                      return (
                        <Badge
                          key={tag.id}
                          variant={isSelected ? 'default' : 'outline'}
                          className={`cursor-pointer select-none px-2.5 py-0.5 text-xs transition-colors rounded-full ${
                            isSelected
                              ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent'
                              : 'text-muted-foreground hover:bg-muted'
                          }`}
                          onClick={() => handleToggleTag(tag.id)}
                        >
                          <Hash className="h-3 w-3 mr-0.5 opacity-60" />
                          {tag.label}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic text-center py-2">
                    Теги не знайдені в системі. Запустіть сід-скрипт бази даних.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <div className="text-xs font-mono text-muted-foreground truncate select-all bg-muted/60 p-2 rounded border">
                  <span className="font-semibold select-none mr-2">FEN:</span>
                  {formData.fen}
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
                  'Зберегти задачу'
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <SolutionEditor
        open={solutionEditorOpen}
        onOpenChange={setSolutionEditorOpen}
        initialFen={formData.fen}
        currentSolution={formData.solution}
        onSave={handleSolutionSave}
      />
    </div>
  );
}

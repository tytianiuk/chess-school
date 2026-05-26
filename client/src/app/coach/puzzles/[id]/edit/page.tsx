'use client';

import { useState, useCallback, useEffect, use, useRef } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2, X, Plus, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { SolutionEditor } from '@/components/solution-editor';
import { validateFEN } from '@/lib/fen-validator';
import { FEN } from '@/lib/constants';

const PuzzleBuilder = dynamic(
  () => import('@/components/puzzle-builder').then((mod) => mod.PuzzleBuilder),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square bg-muted animate-pulse rounded-lg" />
    ),
  },
);

export default function EditPuzzlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const puzzleId = parseInt(resolvedParams.id);
  const router = useRouter();

  const initialFenRef = useRef<string | null>(null);

  const { data: puzzle, isLoading } = useSWR(
    puzzleId ? `puzzle-${puzzleId}` : null,
    () => PuzzleService.getById(puzzleId),
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    fen: FEN.EMPTY,
    solution: '',
    hint: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [solutionEditorOpen, setSolutionEditorOpen] = useState(false);

  useEffect(() => {
    if (puzzle) {
      initialFenRef.current = puzzle.fen;
      setFormData({
        title: puzzle.title || '',
        fen: puzzle.fen,
        solution: puzzle.solution,
        hint: puzzle.hint || '',
        tags: puzzle.tags,
      });
    }
  }, [puzzle]);

  const handleFenChange = useCallback((newFen: string) => {
    setFormData((prev) => {
      const shouldClearSolution =
        initialFenRef.current !== null &&
        newFen !== initialFenRef.current &&
        newFen !== prev.fen;

      return {
        ...prev,
        fen: newFen,
        solution: shouldClearSolution ? '' : prev.solution,
      };
    });
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

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
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
      await PuzzleService.update(puzzleId, {
        title: formData.title || undefined,
        fen: formData.fen,
        solution: formData.solution,
        hint: formData.hint || undefined,
        tags: formData.tags,
      });
      toast.success('Задачу оновлено');
      router.push('/coach/puzzles');
    } catch {
      toast.error('Помилка при оновленні задачі');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPuzzleReady = formData.fen && formData.fen !== FEN.EMPTY;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="aspect-square" />
          <div className="space-y-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">Задачу не знайдено</h2>
        <Link href="/coach/puzzles">
          <Button>Повернутися до списку</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/coach/puzzles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Редагування задачі
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Конструктор позиції</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PuzzleBuilder
                initialFen={puzzle.fen}
                onFenChange={handleFenChange}
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Деталі задачі</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Назва (необов&apos;язково)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Мат у 2 ходи"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Рішення *</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-md border bg-muted/50 px-3 py-2 min-h-[80px]">
                      {formData.solution ? (
                        <div className="flex flex-wrap gap-1">
                          {formData.solution.split(' ').map((move, i) => (
                            <Badge key={i} variant="secondary">
                              {move}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Рішення не введено
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleOpenSolutionEditor}
                    disabled={!isPuzzleReady}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {formData.solution
                      ? 'Редагувати рішення'
                      : 'Ввести рішення'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hint">Підказка (необов&apos;язково)</Label>
                  <Textarea
                    id="hint"
                    value={formData.hint}
                    onChange={(e) =>
                      setFormData({ ...formData, hint: e.target.value })
                    }
                    placeholder="Зверніть увагу на слабкість поля f7"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Теги</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Введіть тег"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>FEN позиція</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  id="fen"
                  value={formData.fen}
                  readOnly
                  className="font-mono text-xs bg-muted"
                />
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Link href="/coach/puzzles" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Скасувати
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
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

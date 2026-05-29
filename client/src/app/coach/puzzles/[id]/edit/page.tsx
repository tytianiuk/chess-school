'use client';

import { useState, useCallback, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { PuzzleService } from '@/services/puzzle.service';
import { PuzzleTagService } from '@/services/puzzle-tag.service';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { SolutionEditor } from '@/components/solution-editor';
import { validateFEN } from '@/lib/fen-validator';
import { FEN } from '@/lib/constants';
import type { PuzzleTag, Puzzle as PuzzleType } from '@/lib/types';

import { PuzzleDetailsCard } from '../../components/puzzle-details-card';
import { PuzzleBuilderCard } from '../../components/puzzle-builder-card';
import { PuzzleTagsCard } from '../../components/puzzle-tags-card';

export default function EditPuzzlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const puzzleId = parseInt(resolvedParams.id);
  const router = useRouter();

  const initialFenRef = useRef<string | null>(null);

  const { data: puzzle, isLoading: isPuzzleLoading } = useSWR<PuzzleType>(
    puzzleId ? `puzzle-${puzzleId}` : null,
    () => PuzzleService.getById(puzzleId),
  );

  const { data: availableTags, isLoading: isTagsLoading } = useSWR<PuzzleTag[]>(
    'puzzles-tags',
    () => PuzzleTagService.getAll(),
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [solutionEditorOpen, setSolutionEditorOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    fen: FEN.EMPTY,
    solution: '',
    hint: '',
    rating: '' as number | '',
    tagIds: [] as number[],
  });

  useEffect(() => {
    if (puzzle) {
      initialFenRef.current = puzzle.fen;
      setFormData({
        title: puzzle.title || '',
        fen: puzzle.fen,
        solution: puzzle.solution,
        hint: puzzle.hint || '',
        rating: puzzle.rating || 0,
        tagIds: puzzle.tags ? puzzle.tags.map((t) => t.id) : [],
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

  const handleDetailsChange = useCallback(
    (fields: Partial<typeof formData>) => {
      setFormData((prev) => ({ ...prev, ...fields }));
    },
    [],
  );

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

  const handleToggleTag = useCallback((tagId: number) => {
    setFormData((prev) => {
      const isAlreadySelected = prev.tagIds.includes(tagId);
      return {
        ...prev,
        tagIds: isAlreadySelected
          ? prev.tagIds.filter((id) => id !== tagId)
          : [...prev.tagIds, tagId],
      };
    });
  }, []);

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
        rating: Number(formData.rating),
        tagIds: formData.tagIds,
      });
      toast.success('Задачу успішно оновлено');
      router.push('/coach/puzzles');
    } catch {
      toast.error('Помилка при оновленні задачі');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPuzzleReady = formData.fen && formData.fen !== FEN.EMPTY;
  const isLoading = isPuzzleLoading || isTagsLoading;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 px-4 py-2">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
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
    <div className="mx-auto space-y-6 px-4 py-2">
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
        <div className="grid gap-6 lg:grid-cols-3">
          <PuzzleDetailsCard
            title={formData.title}
            rating={formData.rating}
            solution={formData.solution}
            hint={formData.hint}
            isPuzzleReady={isPuzzleReady as boolean}
            onOpenSolutionEditor={handleOpenSolutionEditor}
            onChange={handleDetailsChange}
          />

          <PuzzleBuilderCard
            initialFen={initialFenRef.current || puzzle.fen}
            onFenChange={handleFenChange}
          />

          <PuzzleTagsCard
            availableTags={availableTags}
            selectedTagIds={formData.tagIds}
            fen={formData.fen}
            isSubmitting={isSubmitting}
            onToggleTag={handleToggleTag}
          />
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

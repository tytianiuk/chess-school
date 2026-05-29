'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { PuzzleService } from '@/services/puzzle.service';
import { PuzzleTagService } from '@/services/puzzle-tag.service';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { SolutionEditor } from '@/components/solution-editor';
import { validateFEN } from '@/lib/fen-validator';
import { FEN } from '@/lib/constants';
import type { PuzzleTag } from '@/lib/types';

import { PuzzleDetailsCard } from '../components/puzzle-details-card';
import { PuzzleBuilderCard } from '../components/puzzle-builder-card';
import { PuzzleTagsCard } from '../components/puzzle-tags-card';

export default function NewPuzzlePage() {
  const router = useRouter();
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

  const { data: availableTags, isLoading: tagsLoading } = useSWR<PuzzleTag[]>(
    'puzzles-tags',
    () => PuzzleTagService.getAll(),
  );

  const handleFenChange = useCallback((newFen: string) => {
    setFormData((prev) => ({ ...prev, fen: newFen, solution: '' }));
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
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          <PuzzleDetailsCard
            title={formData.title}
            rating={formData.rating === 0 ? '' : formData.rating} // Щоб не світився нуль у плейсхолдері
            solution={formData.solution}
            hint={formData.hint}
            isPuzzleReady={isPuzzleReady as boolean}
            onOpenSolutionEditor={handleOpenSolutionEditor}
            onChange={handleDetailsChange}
          />

          <PuzzleBuilderCard
            initialFen={FEN.EMPTY}
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

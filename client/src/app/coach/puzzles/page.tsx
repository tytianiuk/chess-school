'use client';

import { useCallback, useState } from 'react';
import useSWR from 'swr';
import type {
  PaginatedResponse,
  PuzzleTag,
  Puzzle as PuzzleType,
} from '@/lib/types';
import Link from 'next/link';
import { PuzzleService } from '@/services/puzzle.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Puzzle,
  Loader2,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { ChessDiagram } from '@/components/chess-diagram';
import { ConfirmDialog } from '@/components/confirm-dialog';

const ITEMS_PER_PAGE = 8;

export default function PuzzlesPage() {
  const [page, setPage] = useState<number>(1);
  const [allPuzzles, setAllPuzzles] = useState<PuzzleType[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { isLoading, mutate } = useSWR<PaginatedResponse<PuzzleType>>(
    ['puzzles', 1],
    () => PuzzleService.getPaginated(1, ITEMS_PER_PAGE),
    {
      onSuccess: (response) => {
        setAllPuzzles(response.data);
        setHasMore(response.meta.page < response.meta.totalPages);
        setPage(1);
      },
    },
  );

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await PuzzleService.getPaginated(
        nextPage,
        ITEMS_PER_PAGE,
      );
      setAllPuzzles((prev) => [...prev, ...response.data]);
      setHasMore(response.meta.page < response.meta.totalPages);
      setPage(nextPage);
    } catch {
      toast.error('Помилка при завантаженні задач');
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore]);

  const filteredPuzzles = allPuzzles?.filter(
    (puzzle) =>
      puzzle.title?.toLowerCase().includes(search.toLowerCase()) ||
      puzzle.fen.toLowerCase().includes(search.toLowerCase()) ||
      puzzle.rating?.toString().includes(search) ||
      puzzle.tags?.some(
        (tag: PuzzleTag) =>
          tag.label.toLowerCase().includes(search.toLowerCase()) ||
          tag.name.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await PuzzleService.remove(deleteId);
      toast.success('Задачу видалено');
      setAllPuzzles((prev) => prev.filter((p) => p.id !== deleteId));
      mutate();
    } catch {
      toast.error(
        'Помилка при видаленні задачі. Можливо, вона використовується в домашніх завданнях.',
      );
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Усі задачі</h1>
        </div>
        <Link href="/coach/puzzles/new">
          <Button className="py-6 px-6 text-lg">
            <Plus className="!h-6 !w-6" />
            Створити задачу
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук за назвою, FEN, рейтингом чи темами..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPuzzles?.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPuzzles.map((puzzle: PuzzleType) => (
              <Card
                key={puzzle.id}
                className="group gap-2 flex flex-col justify-between"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between w-full gap-2">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-base line-clamp-1 font-bold">
                        {puzzle.title || `Задача #${puzzle.id}`}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                        <Award className="h-3.5 w-3.5 text-amber-500" />
                        <span>Рейтинг: {puzzle.rating || 1500}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Link href={`/coach/puzzles/${puzzle.id}/edit`}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 text-destructive p-0"
                        onClick={() => setDeleteId(puzzle.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <div className="pr-4">
                  <ChessDiagram
                    fen={puzzle.fen}
                    showNotation={true}
                    className="mx-auto"
                  />
                </div>

                <CardContent className="pt-2 pb-4 mt-auto">
                  {puzzle.tags && puzzle.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1 w-full justify-center">
                      {puzzle.tags.slice(0, 2).map((tag: PuzzleTag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200 text-[11px] px-2 py-0"
                        >
                          {tag.label}
                        </Badge>
                      ))}
                      {puzzle.tags.length > 2 && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 text-muted-foreground"
                        >
                          +{puzzle.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-xs text-muted-foreground italic">
                      Без тем
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMore && !search && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="min-w-[200px] py-6 px-6 text-lg"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="!h-6 !w-6 mr-2 animate-spin" />
                    Завантаження...
                  </>
                ) : (
                  'Завантажити ще'
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Puzzle className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {search ? 'Задач не знайдено' : 'Ще немає задач'}
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {search
                ? 'Спробуйте змінити пошуковий запит'
                : 'Створіть першу шахову задачу для використання у завданнях'}
            </p>
            {!search && (
              <Link href="/coach/puzzles/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Створити задачу
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Видалити задачу?"
        description="Цю дію неможливо скасувати. Задача буде видалена назавжди з банку даних."
        variant="destructive"
      />
    </div>
  );
}

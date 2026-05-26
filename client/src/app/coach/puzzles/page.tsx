'use client';

import { useCallback, useState } from 'react';
import useSWR from 'swr';
import type { PaginatedResponse, Puzzle as PuzzleType } from '@/lib/types';
import Link from 'next/link';
import { PuzzleService } from '@/services/puzzle.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Pencil, Trash2, Puzzle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ChessDiagram } from '@/components/chess-diagram';

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
      puzzle.tags.some((tag: string) =>
        tag.toLowerCase().includes(search.toLowerCase()),
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
      toast.error('Помилка при видаленні задачі');
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
          placeholder="Пошук за назвою, FEN або тегами..."
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
              <Card key={puzzle.id} className="group gap-2">
                <CardHeader>
                  <div className="flex items-start justify-around w-full">
                    <div className="space-y-1 pl-8">
                      <CardTitle className="w-full text-lg">
                        {puzzle.title || `Задача #${puzzle.id}`}
                      </CardTitle>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/coach/puzzles/${puzzle.id}/edit`}>
                        <Button variant="ghost" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteId(puzzle.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <ChessDiagram fen={puzzle.fen} size={240} className="mx-auto" />
                <CardContent>
                  {puzzle.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 w-full justify-center">
                      {puzzle.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} className="bg-blue-50 text-blue-700">
                          {tag}
                        </Badge>
                      ))}
                      {puzzle.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{puzzle.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMore && !search && (
            <div className="flex justify-center pt-4">
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити задачу?</AlertDialogTitle>
            <AlertDialogDescription>
              Цю дію неможливо скасувати. Задача буде видалена назавжди.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/70"
            >
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

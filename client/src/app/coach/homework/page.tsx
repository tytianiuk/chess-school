'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { HomeworkService } from '@/services/homework.service';
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
  Plus,
  Search,
  Trash2,
  BookOpen,
  ArrowRight,
  Users,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { Homework } from '@/lib/types';
import { ConfirmDialog } from '@/components/confirm-dialog';

export default function HomeworkPage() {
  const {
    data: homeworks,
    isLoading,
    mutate,
  } = useSWR('homeworks', HomeworkService.getAll);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredHomeworks = homeworks?.filter(
    (hw: Homework) =>
      hw.title.toLowerCase().includes(search.toLowerCase()) ||
      hw.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await HomeworkService.remove(deleteId);
      toast.success('Завдання видалено');
      mutate();
    } catch {
      toast.error('Помилка при видаленні завдання');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Завдання</h1>
        </div>
        <Link href="/coach/homework/new">
          <Button className="py-6 px-6 text-lg">
            <Plus className="!h-6 !w-6" />
            Створити завдання
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук за назвою або описом..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredHomeworks && filteredHomeworks.length > 0 ? (
        <div className="space-y-4">
          {filteredHomeworks.map((homework: Homework) => (
            <Card key={homework.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {homework.title}
                      {homework.groupId ? (
                        <Badge variant="secondary" className="gap-1">
                          <Users className="h-3 w-3" />
                          {homework.group?.name}
                        </Badge>
                      ) : homework.studentId ? (
                        <Badge variant="outline" className="gap-1">
                          <User className="h-3 w-3" />
                          {homework.student?.fullName}
                        </Badge>
                      ) : null}
                    </CardTitle>
                    <CardDescription>
                      {homework.puzzles?.length ?? 0} задач •{' '}
                      {new Date(homework.createdAt).toLocaleDateString('uk-UA')}
                    </CardDescription>
                  </div>
                  <div className=" opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteId(homework.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {homework.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {homework.description}
                  </p>
                )}
                <Link href={`/coach/homework/${homework.id}`}>
                  <Button variant="outline" className="gap-2">
                    Переглянути результати
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {search ? 'Завдань не знайдено' : 'Ще немає завдань'}
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {search
                ? 'Спробуйте змінити пошуковий запит'
                : 'Створіть перше завдання для учнів'}
            </p>
            {!search && (
              <Link href="/coach/homework/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Створити завдання
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
        title="Видалити завдання?"
        description="Цю дію неможливо скасувати. Завдання та всі пов'язані відповіді будуть видалені."
        confirmLabel="Видалити"
        variant="destructive"
      />
    </div>
  );
}

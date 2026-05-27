'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { GroupService } from '@/services/group.service';
import { Group } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Pencil, Trash2, Users, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';

export default function GroupsPage() {
  const {
    data: groups,
    isLoading,
    mutate,
  } = useSWR('groups', GroupService.getAll);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredGroups = groups?.filter((group: Group) =>
    group.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await GroupService.remove(deleteId);
      toast.success('Групу видалено');
      mutate();
    } catch {
      toast.error('Помилка при видаленні групи');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Групи учнів</h1>
        <Link href="/coach/groups/new">
          <Button className="py-6 px-6 text-lg">
            <Plus className="!h-6 !w-6" />
            Створити групу
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук за назвою групи..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredGroups.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group: Group) => (
            <Card key={group.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription>
                      {group._count?.members ?? 0} учнів
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteId(group.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={`/coach/groups/${group.id}`}>
                  <Button variant="outline" className="w-full gap-2">
                    Переглянути
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
            <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {search ? 'Груп не знайдено' : 'Ще немає груп'}
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {search
                ? 'Спробуйте змінити пошуковий запит'
                : 'Створіть першу групу для організації учнів'}
            </p>
            {!search && (
              <Link href="/coach/groups/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Створити групу
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
        title="Видалити групу?"
        description="Цю дію неможливо скасувати. Групу буде видалено назавжди."
        confirmLabel="Видалити"
        variant="destructive"
      />
    </div>
  );
}

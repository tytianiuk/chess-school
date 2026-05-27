'use client';

import { useState, use } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { GroupService } from '@/services/group.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  UserPlus,
  UserMinus,
  Search,
  Users,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { GroupMember, User } from '@/lib/types';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { InlineEditor } from '@/components/inline-editor';

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const groupId = parseInt(resolvedParams.id);

  const {
    data: group,
    isLoading,
    mutate,
  } = useSWR(groupId ? `group-${groupId}` : null, () =>
    GroupService.getById(groupId),
  );

  const { data: allStudents } = useSWR('students', GroupService.getStudents);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [removeStudentId, setRemoveStudentId] = useState<number | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleUpdateGroupName = async (newName: string) => {
    try {
      await GroupService.update(groupId, { name: newName });
      toast.success('Назву групи оновлено');
      mutate();
    } catch {
      toast.error('Помилка при оновленні назви групи');
      throw new Error();
    }
  };

  const handleAddStudents = async () => {
    setIsAdding(true);
    try {
      for (const studentId of selectedStudents) {
        await GroupService.addMember(groupId, studentId);
      }
      toast.success('Учнів додано до групи');
      mutate();
      setIsAddDialogOpen(false);
      setSelectedStudents([]);
    } catch {
      toast.error('Помилка при додаванні учнів');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveStudent = async () => {
    if (!removeStudentId) return;

    try {
      await GroupService.removeMember(groupId, removeStudentId);
      toast.success('Учня видалено з групи');
      mutate();
    } catch {
      toast.error('Помилка при видаленні учня');
    } finally {
      setRemoveStudentId(null);
    }
  };

  const handleToggleStudent = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

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

  const memberIds = group?.members?.map((m: GroupMember) => m.studentId) || [];
  const availableStudents = allStudents?.filter(
    (s: User) =>
      !memberIds.includes(s.id) &&
      (s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())),
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">Групу не знайдено</h2>
        <Link href="/coach/groups">
          <Button>Повернутися до списку</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Link href="/coach/groups">
            <Button variant="ghost" size="icon" shrink-0="true">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>

          <div className="flex-1 min-w-0">
            <InlineEditor
              initialValue={group.name}
              onSave={handleUpdateGroupName}
              className="!text-3xl"
            />

            <p className="text-muted-foreground">
              {group.members?.length ?? 0} учнів
            </p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Додати учнів
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Учні групи</CardTitle>
        </CardHeader>
        <CardContent>
          {group.members && group.members.length > 0 ? (
            <div className="space-y-2">
              {group.members.map((member: GroupMember) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <div className="font-medium">
                      {member.student?.fullName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.student?.email}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setRemoveStudentId(member.studentId)}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>У групі ще немає учнів</p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Додати учнів
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="w-full flex justify-center">
        <Button
          variant="ghost"
          className="h-8 text-destructive border-destructive hover:bg-destructive/10"
          onClick={() => setDeleteId(group.id)}
        >
          <Trash2 className="h-4 w-4" />
          Видалити групу
        </Button>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Видалити групу?"
        description="Цю дію неможливо скасувати. Групу буде видалено назавжди."
        confirmLabel="Видалити"
        variant="destructive"
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Додати учнів</DialogTitle>
            <DialogDescription>
              Виберіть учнів для додавання до групи
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Пошук учнів..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {availableStudents && availableStudents.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableStudents.map((student: User) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => handleToggleStudent(student.id)}
                  >
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => handleToggleStudent(student.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{student.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        {student.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Немає доступних учнів</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Скасувати
            </Button>
            <Button
              onClick={handleAddStudents}
              disabled={selectedStudents.length === 0 || isAdding}
            >
              {isAdding
                ? 'Додавання...'
                : `Додати (${selectedStudents.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!removeStudentId}
        onClose={() => setRemoveStudentId(null)}
        onConfirm={handleRemoveStudent}
        title="Видалити учня з групи?"
        description="Учня буде видалено з цієї групи. Це не видаляє акаунт учня."
        confirmLabel="Видалити"
        variant="destructive"
      />
    </div>
  );
}

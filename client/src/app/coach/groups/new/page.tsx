'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { GroupService } from '@/services/group.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { User } from '@/lib/types';

export default function NewGroupPage() {
  const router = useRouter();
  const { data: students, isLoading: studentsLoading } = useSWR(
    'students',
    GroupService.getStudents,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [search, setSearch] = useState('');

  const filteredStudents = students?.filter(
    (student: User) =>
      student.fullName.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggleStudent = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Введіть назву групи');
      return;
    }

    setIsSubmitting(true);

    try {
      const group = await GroupService.create({ name });

      for (const studentId of selectedStudents) {
        await GroupService.addMember(group.id, studentId);
      }

      toast.success('Групу створено');
      router.push('/coach/groups');
    } catch {
      toast.error('Помилка при створенні групи');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/coach/groups">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Нова група</h1>
          <p className="text-muted-foreground">
            Створіть групу та додайте учнів
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Назва групи</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="name">Назва *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Група початківців"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Учні</CardTitle>
            <CardDescription>
              Виберіть учнів для додавання до групи
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Пошук учнів..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {studentsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : filteredStudents && filteredStudents.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredStudents.map((student: User) => (
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
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{search ? 'Учнів не знайдено' : 'Немає доступних учнів'}</p>
              </div>
            )}

            {selectedStudents.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Вибрано: {selectedStudents.length} учнів
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link href="/coach/groups" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Скасувати
            </Button>
          </Link>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Створення...
              </>
            ) : (
              'Створити групу'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

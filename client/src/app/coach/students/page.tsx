'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { StudentService } from '@/services/student.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

import {
  Search,
  Mail,
  Loader2,
  Users,
  UserMinus,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/lib/types';
import { getStudentCountText } from '@/lib/get-count-text';
import Link from 'next/link';

export default function CoachStudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isActionPending, setIsActionPending] = useState<
    Record<number, boolean>
  >({});

  const {
    data: myStudents,
    isLoading: isMyStudentsLoading,
    mutate: mutateMyStudents,
  } = useSWR(['my-students', searchQuery], () =>
    StudentService.getMyStudents(searchQuery),
  );

  const handleUnassignStudent = async (studentId: number) => {
    setIsActionPending((prev) => ({ ...prev, [studentId]: true }));
    try {
      await StudentService.unassignStudent(studentId);
      toast.success('Учня успішно вилучено з вашого списку');
      mutateMyStudents();
    } catch {
      toast.error('Помилка при вилученні учня');
    } finally {
      setIsActionPending((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  return (
    <div className="space-y-6 px-4 py-2 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Мої учні</h1>
      </div>

      <Card>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Швидкий пошук серед своїх учнів за ім'ям або email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Список вихованців</CardTitle>
          <CardDescription>
            Загальна кількість активних учнів під вашим керівництвом:{' '}
            <span className="font-bold text-foreground">
              {myStudents?.length ?? 0}{' '}
              {getStudentCountText(myStudents?.length ?? 0)}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isMyStudentsLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Завантажуємо список ваших розрядників...
            </div>
          ) : myStudents && myStudents.length > 0 ? (
            <div className="space-y-3">
              {myStudents.map((student: User) => {
                const isPending = isActionPending[student.id];

                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 rounded-xl border bg-background hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {student.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">
                          {student.fullName}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{student.email}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => handleUnassignStudent(student.id)}
                      className="text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 gap-1.5 h-9 text-xs transition-colors"
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserMinus className="h-3.5 w-3.5" />
                      )}
                      Відкріпити
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed rounded-xl">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-30 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                {searchQuery
                  ? "Учня з таким ім'ям не знайдено серед ваших підопічних"
                  : 'У вас ще немає закріплених учнів. Натисніть кнопку "Додати учня" знизу.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <Link href="/coach/students/new" className="flex justify-center">
        <Button className="w-3/4 bg-blue-600 hover:bg-blue-700 text-white text-md py-4">
          <UserPlus className="mr-2 !h-5 !w-5" />
          Додати учня
        </Button>
      </Link>
    </div>
  );
}

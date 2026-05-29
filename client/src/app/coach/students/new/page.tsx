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
import { UserPlus, Search, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@/lib/types';

export default function CoachStudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmittingMap, setIsSubmittingMap] = useState<
    Record<number, boolean>
  >({});
  const {
    data: students,
    isLoading,
    mutate,
  } = useSWR(
    ['unassigned-students', searchQuery],
    () => StudentService.getUnassignedStudents(searchQuery),
    { keepPreviousData: true },
  );

  const handleAssignStudent = async (studentId: number) => {
    setIsSubmittingMap((prev) => ({ ...prev, [studentId]: true }));
    try {
      await StudentService.assignStudent(studentId);
      toast.success('Учня успішно додано до вашого списку!');
      mutate();
    } catch {
      toast.error('Помилка при додаванні учня');
    } finally {
      setIsSubmittingMap((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  return (
    <div className="space-y-6 px-4 py-2 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Шукай нових учнів</h1>
      </div>

      <Card>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Введіть ім'я, прізвище або email учня..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Доступні учні</CardTitle>
          <CardDescription>
            Шахісти, які зареєструвалися на платформі та ще не обрали тренера
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Шукаємо вільних гросмейстерів...
            </div>
          ) : students && students.length > 0 ? (
            <div className="space-y-3">
              {students.map((student: User) => {
                const isPending = isSubmittingMap[student.id];

                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 rounded-xl border bg-background hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
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
                      disabled={isPending}
                      onClick={() => handleAssignStudent(student.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 h-9 text-xs"
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserPlus className="h-3.5 w-3.5" />
                      )}
                      Прикріпити
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed rounded-xl">
              <UserPlus className="h-10 w-10 mx-auto mb-2 opacity-30 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                {searchQuery
                  ? 'Нікого не знайдено за цим запитом'
                  : "Почніть вводити ім'я для пошуку учнів"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

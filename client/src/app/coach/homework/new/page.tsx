'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { HomeworkService } from '@/services/homework.service';
import { PuzzleService } from '@/services/puzzle.service';
import { GroupService } from '@/services/group.service';
import type { CheckType, Group, Puzzle, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Loader2,
  Search,
  Plus,
  X,
  Puzzle as PuzzleIcon,
  Users,
  User as UserIcon,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface SelectedPuzzle {
  puzzleId: number;
  checkType: CheckType;
}

export default function NewHomeworkPage() {
  const router = useRouter();

  const { data: puzzles, isLoading: puzzlesLoading } = useSWR(
    'puzzles',
    PuzzleService.getAll,
  );
  const { data: groups, isLoading: groupsLoading } = useSWR(
    'groups',
    GroupService.getAll,
  );
  const { data: students, isLoading: studentsLoading } = useSWR(
    'students',
    GroupService.getStudents,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignType: 'group' as 'group' | 'student',
    groupId: '',
    studentId: '',
  });
  const [selectedPuzzles, setSelectedPuzzles] = useState<SelectedPuzzle[]>([]);
  const [puzzleSearch, setPuzzleSearch] = useState('');

  // ✨ ОНОВЛЕНО: Безпечний пошук за новими об'єктами тегів (за label та name) + за рейтингом складності
  const filteredPuzzles = puzzles?.data?.filter(
    (puzzle: any) =>
      !selectedPuzzles.some((sp) => sp.puzzleId === puzzle.id) &&
      (puzzle.title?.toLowerCase().includes(puzzleSearch.toLowerCase()) ||
        puzzle.fen.toLowerCase().includes(puzzleSearch.toLowerCase()) ||
        puzzle.rating?.toString().includes(puzzleSearch) ||
        puzzle.tags?.some(
          (tag: any) =>
            tag.label.toLowerCase().includes(puzzleSearch.toLowerCase()) ||
            tag.name.toLowerCase().includes(puzzleSearch.toLowerCase()),
        )),
  );

  const handleAddPuzzle = (puzzleId: number) => {
    setSelectedPuzzles((prev) => [...prev, { puzzleId, checkType: 'AUTO' }]);
    setPuzzleSearch('');
  };

  const handleRemovePuzzle = (puzzleId: number) => {
    setSelectedPuzzles((prev) => prev.filter((p) => p.puzzleId !== puzzleId));
  };

  const handleChangeCheckType = (puzzleId: number, checkType: CheckType) => {
    setSelectedPuzzles((prev) =>
      prev.map((p) => (p.puzzleId === puzzleId ? { ...p, checkType } : p)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Введіть назву завдання');
      return;
    }

    if (selectedPuzzles.length === 0) {
      toast.error('Додайте хоча б одну задачу');
      return;
    }

    if (formData.assignType === 'group' && !formData.groupId) {
      toast.error('Виберіть групу');
      return;
    }

    if (formData.assignType === 'student' && !formData.studentId) {
      toast.error('Виберіть учня');
      return;
    }

    setIsSubmitting(true);

    try {
      await HomeworkService.create({
        title: formData.title,
        description: formData.description || undefined,
        groupId:
          formData.assignType === 'group'
            ? parseInt(formData.groupId)
            : undefined,
        studentId:
          formData.assignType === 'student'
            ? parseInt(formData.studentId)
            : undefined,
        puzzles: selectedPuzzles,
      });
      toast.success('Завдання створено');
      router.push('/coach/homework');
    } catch {
      toast.error('Помилка при створенні завдання');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = puzzlesLoading || groupsLoading || studentsLoading;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-2">
      <div className="flex items-center gap-4">
        <Link href="/coach/homework">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Нове завдання</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основна інформація</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Назва *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Домашнє завдання #1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Опис (необов&apos;язково)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Виконайте всі задачі до наступного заняття"
                rows={3}
                className="resize-none text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Призначення</CardTitle>
            <CardDescription>Виберіть кому призначити завдання</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={formData.assignType}
              onValueChange={(value: 'group' | 'student') =>
                setFormData({
                  ...formData,
                  assignType: value,
                  groupId: '',
                  studentId: '',
                })
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="group" id="group" />
                <Label
                  htmlFor="group"
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Групі
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <Label
                  htmlFor="student"
                  className="cursor-pointer flex items-center gap-2"
                >
                  <UserIcon className="h-4 w-4" />
                  Індивідуально
                </Label>
              </div>
            </RadioGroup>

            {formData.assignType === 'group' ? (
              <div className="space-y-2">
                <Label>Група *</Label>
                {groupsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    key="group-select"
                    value={formData.groupId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        groupId: value ?? '',
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Виберіть групу" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups?.map((group: Group) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name} ({group._count?.members ?? 0} учнів)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Учень *</Label>
                {studentsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    key="student-select"
                    value={formData.studentId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        studentId: value ?? '',
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Виберіть учня" />
                    </SelectTrigger>
                    <SelectContent>
                      {students?.map((student: User) => (
                        <SelectItem
                          key={student.id}
                          value={student.id.toString()}
                        >
                          {student.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Задачі</CardTitle>
            <CardDescription>
              Виберіть задачі та тип перевірки для кожної
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Пошук задач за назвою, FEN, рейтингом чи тегами..."
                value={puzzleSearch}
                onChange={(e) => setPuzzleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Випадаючий список пошуку задач */}
            {puzzleSearch && (
              <div className="border rounded-lg max-h-56 overflow-y-auto bg-background shadow-md">
                {puzzlesLoading ? (
                  <div className="p-4">
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : filteredPuzzles && filteredPuzzles.length > 0 ? (
                  filteredPuzzles.slice(0, 10).map((puzzle: any) => (
                    <div
                      key={puzzle.id}
                      className="flex items-center justify-between p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 gap-4"
                      onClick={() => handleAddPuzzle(puzzle.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm flex items-center gap-2">
                          <span className="truncate">
                            {puzzle.title || `Задача #${puzzle.id}`}
                          </span>
                          <span className="text-[11px] font-mono bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded border border-amber-200 flex items-center shrink-0">
                            <Award className="h-3 w-3 mr-0.5" />
                            {puzzle.rating || 1500}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono truncate max-w-xl mt-0.5">
                          {puzzle.fen}
                        </div>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Задач не знайдено
                  </div>
                )}
              </div>
            )}

            {/* Список уже вибраних задач */}
            {selectedPuzzles.length > 0 ? (
              <div className="space-y-2 pt-2">
                <Label className="text-sm font-semibold">
                  Вибрані задачі ({selectedPuzzles.length})
                </Label>
                <div className="space-y-2">
                  {selectedPuzzles.map((sp, index) => {
                    const puzzle = puzzles?.data?.find(
                      (p: any) => p.id === sp.puzzleId,
                    ) as any;
                    return (
                      <div
                        key={sp.puzzleId}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border bg-background"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm font-semibold text-muted-foreground w-5 shrink-0">
                            {index + 1}.
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm flex items-center gap-2">
                              <span className="truncate">
                                {puzzle?.title || `Задача #${sp.puzzleId}`}
                              </span>
                              {puzzle?.rating && (
                                <span className="text-[10px] font-mono font-medium text-amber-600 bg-amber-50 px-1.5 rounded shrink-0">
                                  {puzzle.rating} ELO
                                </span>
                              )}
                            </div>

                            {/* ✨ ОНОВЛЕНО: Відображення реляційних тегів (label) для вибраних задач */}
                            {puzzle?.tags && puzzle.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {puzzle.tags.slice(0, 3).map((tag: any) => (
                                  <Badge
                                    key={tag.id}
                                    variant="secondary"
                                    className="text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-100 px-1.5 py-0"
                                  >
                                    {tag.label}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 justify-end shrink-0">
                          <Select
                            value={sp.checkType}
                            onValueChange={(value) =>
                              handleChangeCheckType(sp.puzzleId, value!)
                            }
                          >
                            <SelectTrigger className="w-36 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AUTO">Автоматична</SelectItem>
                              <SelectItem value="MANUAL">Ручна</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemovePuzzle(sp.puzzleId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <PuzzleIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  Почніть пошук за назвою або тактикою, щоб додати задачі
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Панель дій форми */}
        <div className="flex gap-3">
          <Link href="/coach/homework" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Скасувати
            </Button>
          </Link>
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Створення...
              </>
            ) : (
              'Створити завдання'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

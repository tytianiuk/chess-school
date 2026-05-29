'use client';

import useSWR from 'swr';
import { PuzzleService } from '@/services/puzzle.service';
import { GroupService } from '@/services/group.service';
import { HomeworkService } from '@/services/homework.service';
import { DashboardStats } from './components/dashboard-stats';
import { DashboardQuickActions } from './components/dashboard-quick-actions';
import { RecentHomeworksCard } from './components/recent-homeworks-card';
import { StudentService } from '@/services/student.service';

export default function CoachDashboardPage() {
  const { data: puzzles, isLoading: puzzlesLoading } = useSWR(
    'puzzles',
    PuzzleService.getAll,
  );
  const { data: groups, isLoading: groupsLoading } = useSWR(
    'groups',
    GroupService.getAll,
  );
  const { data: homeworks, isLoading: homeworksLoading } = useSWR(
    'homeworks',
    HomeworkService.getAll,
  );
  const { data: students, isLoading: studentsLoading } = useSWR(
    'students',
    () => StudentService.getMyStudents(''),
  );

  const isStatsLoading =
    puzzlesLoading || homeworksLoading || groupsLoading || studentsLoading;

  return (
    <div className="space-y-6 px-4 py-2 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Панель тренера</h1>
        <p className="text-sm text-muted-foreground">
          Огляд бази даних задач, навчальних груп та статусів здачі завдань.
        </p>
      </div>

      <DashboardStats
        puzzlesCount={puzzles?.meta.total ?? 0}
        homeworksCount={homeworks?.length ?? 0}
        groupsCount={groups?.length ?? 0}
        studentsCount={students?.length ?? 0}
        isLoading={isStatsLoading}
      />

      <DashboardQuickActions />

      <RecentHomeworksCard homeworks={homeworks} isLoading={homeworksLoading} />
    </div>
  );
}

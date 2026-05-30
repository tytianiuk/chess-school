'use client';

import { LayoutDashboard, BookOpen, Puzzle, User } from 'lucide-react';
import { BaseLayout } from '@/components/layouts/base-layout';

const studentNavItems = [
  { href: '/student', label: 'Головна', icon: LayoutDashboard, exact: true },
  { href: '/student/homework', label: 'Завдання', icon: BookOpen },
  { href: '/student/puzzles', label: 'Задачі', icon: Puzzle },
  { href: '/student/coaches', label: 'Тренери', icon: User },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BaseLayout allowedRole="STUDENT" navItems={studentNavItems}>
      {children}
    </BaseLayout>
  );
}

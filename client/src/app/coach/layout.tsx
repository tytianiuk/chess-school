'use client';

import { LayoutDashboard, Puzzle, BookOpen, Users } from 'lucide-react';
import { BaseLayout } from '@/components/layouts/base-layout';

const coachNavItems = [
  { href: '/coach', label: 'Головна', icon: LayoutDashboard, exact: true },
  { href: '/coach/puzzles', label: 'Задачі', icon: Puzzle },
  { href: '/coach/homework', label: 'Завдання', icon: BookOpen },
  { href: '/coach/groups', label: 'Групи', icon: Users },
];

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BaseLayout allowedRole="COACH" navItems={coachNavItems}>
      {children}
    </BaseLayout>
  );
}

'use client';

import { LayoutDashboard, BookOpen } from 'lucide-react';
import { BaseLayout } from '@/components/layouts/base-layout';

const studentNavItems = [
  { href: '/student', label: 'Головна', icon: LayoutDashboard, exact: true },
  { href: '/student/homework', label: 'Завдання', icon: BookOpen },
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

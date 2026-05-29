'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Users } from 'lucide-react';

export function DashboardQuickActions() {
  const actions = [
    {
      href: '/coach/puzzles/new',
      icon: Plus,
      title: 'Створити задачу',
      description: 'Додати нову шахову задачу',
    },
    {
      href: '/coach/homework/new',
      icon: BookOpen,
      title: 'Створити завдання',
      description: 'Призначити задачі учням',
    },
    {
      href: '/coach/groups/new',
      icon: Users,
      title: 'Створити групу',
      description: "Об'єднати учнів",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Швидкі дії</CardTitle>
        <CardDescription>
          Почніть роботу з основними функціями платформи
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 px-4 hover:bg-accent/60 group border-muted transition-all"
            >
              <action.icon className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="text-left min-w-0">
                <div className="font-medium text-sm group-hover:text-primary transition-colors">
                  {action.title}
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  {action.description}
                </div>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PuzzleBuilder = dynamic(
  () => import('@/components/puzzle-builder').then((mod) => mod.PuzzleBuilder),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square bg-muted animate-pulse rounded-lg" />
    ),
  },
);

interface PuzzleBuilderCardProps {
  initialFen: string;
  onFenChange: (newFen: string) => void;
}

export function PuzzleBuilderCard({
  initialFen,
  onFenChange,
}: PuzzleBuilderCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Конструктор позиції</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PuzzleBuilder initialFen={initialFen} onFenChange={onFenChange} />
      </CardContent>
    </Card>
  );
}

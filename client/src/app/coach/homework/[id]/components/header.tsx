import { Button } from '@/components/ui/button';
import { getPuzzleCountText } from '@/lib/get-count-text';
import { Homework } from '@/lib/types';
import { ArrowLeft, User, Users } from 'lucide-react';
import Link from 'next/dist/client/link';

export function HomeworkHeader({ homework }: { homework: Homework }) {
  return (
    <div className="flex items-center gap-4">
      <Link href="/coach/homework">
        <Button variant="ghost" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{homework.title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
          {homework.groupId ? (
            <>
              <Users className="h-4 w-4 text-blue-500" />
              <span>{homework.group?.name}</span>
            </>
          ) : homework.studentId ? (
            <>
              <User className="h-4 w-4 text-emerald-500" />
              <span>{homework.student?.fullName}</span>
            </>
          ) : null}
          <span>•</span>
          <span>
            {homework.puzzles?.length ?? 0}{' '}
            {getPuzzleCountText(homework.puzzles?.length ?? 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

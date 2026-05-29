-- DropForeignKey
ALTER TABLE "PuzzleAttempt" DROP CONSTRAINT "PuzzleAttempt_homeworkPuzzleId_fkey";

-- AddForeignKey
ALTER TABLE "PuzzleAttempt" ADD CONSTRAINT "PuzzleAttempt_homeworkPuzzleId_fkey" FOREIGN KEY ("homeworkPuzzleId") REFERENCES "HomeworkPuzzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

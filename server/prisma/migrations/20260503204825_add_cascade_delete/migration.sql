-- DropForeignKey
ALTER TABLE "StudentProgress" DROP CONSTRAINT "StudentProgress_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "StudentPuzzleStatus" DROP CONSTRAINT "StudentPuzzleStatus_progressId_fkey";

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPuzzleStatus" ADD CONSTRAINT "StudentPuzzleStatus_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "StudentProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

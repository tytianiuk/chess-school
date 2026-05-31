/*
  Warnings:

  - The `status` column on the `PuzzleAttempt` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PuzzleAttempt" DROP COLUMN "status",
ADD COLUMN     "status" "ProgressStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "PuzzleStatus";

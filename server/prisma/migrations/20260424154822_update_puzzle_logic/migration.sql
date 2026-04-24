-- CreateEnum
CREATE TYPE "PuzzleType" AS ENUM ('AUTO', 'MANUAL');

-- AlterTable
ALTER TABLE "Puzzle" ADD COLUMN     "type" "PuzzleType" NOT NULL DEFAULT 'AUTO';

-- AlterTable
ALTER TABLE "StudentProgress" ADD COLUMN     "currentStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isFirstTryFail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "studentAnswer" TEXT;

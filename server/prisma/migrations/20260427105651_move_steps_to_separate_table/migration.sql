/*
  Warnings:

  - You are about to drop the column `currentStep` on the `StudentProgress` table. All the data in the column will be lost.
  - You are about to drop the column `isFirstTryFail` on the `StudentProgress` table. All the data in the column will be lost.
  - You are about to drop the column `studentAnswer` on the `StudentProgress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StudentProgress" DROP COLUMN "currentStep",
DROP COLUMN "isFirstTryFail",
DROP COLUMN "studentAnswer";

-- CreateTable
CREATE TABLE "StudentPuzzleStatus" (
    "id" SERIAL NOT NULL,
    "progressId" INTEGER NOT NULL,
    "puzzleId" INTEGER NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "isFirstTryFail" BOOLEAN NOT NULL DEFAULT false,
    "isSolved" BOOLEAN NOT NULL DEFAULT false,
    "studentAnswer" TEXT,

    CONSTRAINT "StudentPuzzleStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentPuzzleStatus_progressId_puzzleId_key" ON "StudentPuzzleStatus"("progressId", "puzzleId");

-- AddForeignKey
ALTER TABLE "StudentPuzzleStatus" ADD CONSTRAINT "StudentPuzzleStatus_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "StudentProgress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPuzzleStatus" ADD CONSTRAINT "StudentPuzzleStatus_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

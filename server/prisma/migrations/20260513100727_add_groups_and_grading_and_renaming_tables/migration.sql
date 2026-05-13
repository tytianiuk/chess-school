/*
  Warnings:

  - You are about to drop the column `type` on the `Puzzle` table. All the data in the column will be lost.
  - You are about to drop the `Assignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentPuzzleStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AssignmentToPuzzle` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CheckType" AS ENUM ('AUTO', 'MANUAL');

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_coachId_fkey";

-- DropForeignKey
ALTER TABLE "StudentProgress" DROP CONSTRAINT "StudentProgress_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "StudentProgress" DROP CONSTRAINT "StudentProgress_studentId_fkey";

-- DropForeignKey
ALTER TABLE "StudentPuzzleStatus" DROP CONSTRAINT "StudentPuzzleStatus_progressId_fkey";

-- DropForeignKey
ALTER TABLE "StudentPuzzleStatus" DROP CONSTRAINT "StudentPuzzleStatus_puzzleId_fkey";

-- DropForeignKey
ALTER TABLE "_AssignmentToPuzzle" DROP CONSTRAINT "_AssignmentToPuzzle_A_fkey";

-- DropForeignKey
ALTER TABLE "_AssignmentToPuzzle" DROP CONSTRAINT "_AssignmentToPuzzle_B_fkey";

-- AlterTable
ALTER TABLE "Puzzle" DROP COLUMN "type";

-- DropTable
DROP TABLE "Assignment";

-- DropTable
DROP TABLE "StudentProgress";

-- DropTable
DROP TABLE "StudentPuzzleStatus";

-- DropTable
DROP TABLE "_AssignmentToPuzzle";

-- DropEnum
DROP TYPE "PuzzleType";

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "coachId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Homework" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coachId" INTEGER NOT NULL,
    "groupId" INTEGER,
    "studentId" INTEGER,

    CONSTRAINT "Homework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeworkPuzzle" (
    "id" SERIAL NOT NULL,
    "homeworkId" INTEGER NOT NULL,
    "puzzleId" INTEGER NOT NULL,
    "checkType" "CheckType" NOT NULL DEFAULT 'AUTO',

    CONSTRAINT "HomeworkPuzzle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeworkAnswer" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "homeworkId" INTEGER NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'PENDING',
    "trainerComment" TEXT,
    "score" INTEGER,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "HomeworkAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuzzleAttempt" (
    "id" SERIAL NOT NULL,
    "homeworkAnswerId" INTEGER NOT NULL,
    "homeworkPuzzleId" INTEGER NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "solvedOnFirst" BOOLEAN NOT NULL DEFAULT false,
    "isSolved" BOOLEAN NOT NULL DEFAULT false,
    "studentAnswer" TEXT,

    CONSTRAINT "PuzzleAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_studentId_key" ON "GroupMember"("groupId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeworkPuzzle_homeworkId_puzzleId_key" ON "HomeworkPuzzle"("homeworkId", "puzzleId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeworkAnswer_studentId_homeworkId_key" ON "HomeworkAnswer"("studentId", "homeworkId");

-- CreateIndex
CREATE UNIQUE INDEX "PuzzleAttempt_homeworkAnswerId_homeworkPuzzleId_key" ON "PuzzleAttempt"("homeworkAnswerId", "homeworkPuzzleId");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkPuzzle" ADD CONSTRAINT "HomeworkPuzzle_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES "Homework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkPuzzle" ADD CONSTRAINT "HomeworkPuzzle_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkAnswer" ADD CONSTRAINT "HomeworkAnswer_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkAnswer" ADD CONSTRAINT "HomeworkAnswer_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES "Homework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuzzleAttempt" ADD CONSTRAINT "PuzzleAttempt_homeworkAnswerId_fkey" FOREIGN KEY ("homeworkAnswerId") REFERENCES "HomeworkAnswer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuzzleAttempt" ADD CONSTRAINT "PuzzleAttempt_homeworkPuzzleId_fkey" FOREIGN KEY ("homeworkPuzzleId") REFERENCES "HomeworkPuzzle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

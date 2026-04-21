-- CreateEnum
CREATE TYPE "Role" AS ENUM ('COACH', 'STUDENT');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SOLVED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "lichessUsername" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coachId" INTEGER NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Puzzle" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "fen" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "hint" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Puzzle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProgress" (
    "id" SERIAL NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "studentId" INTEGER NOT NULL,
    "assignmentId" INTEGER NOT NULL,

    CONSTRAINT "StudentProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AssignmentToPuzzle" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProgress_studentId_assignmentId_key" ON "StudentProgress"("studentId", "assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "_AssignmentToPuzzle_AB_unique" ON "_AssignmentToPuzzle"("A", "B");

-- CreateIndex
CREATE INDEX "_AssignmentToPuzzle_B_index" ON "_AssignmentToPuzzle"("B");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignmentToPuzzle" ADD CONSTRAINT "_AssignmentToPuzzle_A_fkey" FOREIGN KEY ("A") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignmentToPuzzle" ADD CONSTRAINT "_AssignmentToPuzzle_B_fkey" FOREIGN KEY ("B") REFERENCES "Puzzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

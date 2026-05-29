/*
  Warnings:

  - You are about to drop the column `isSolved` on the `PuzzleAttempt` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PuzzleStatus" AS ENUM ('PENDING', 'REVIEW_PENDING', 'SOLVED', 'FAILED');

-- AlterTable
ALTER TABLE "PuzzleAttempt" DROP COLUMN "isSolved",
ADD COLUMN     "status" "PuzzleStatus" NOT NULL DEFAULT 'PENDING';

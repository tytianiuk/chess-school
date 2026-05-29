/*
  Warnings:

  - You are about to drop the column `tags` on the `Puzzle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Puzzle" DROP COLUMN "tags",
ADD COLUMN     "rating" INTEGER NOT NULL DEFAULT 1500;

-- CreateTable
CREATE TABLE "PuzzleTag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "PuzzleTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuzzleTagAssignment" (
    "puzzleId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "PuzzleTagAssignment_pkey" PRIMARY KEY ("puzzleId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PuzzleTag_name_key" ON "PuzzleTag"("name");

-- AddForeignKey
ALTER TABLE "PuzzleTagAssignment" ADD CONSTRAINT "PuzzleTagAssignment_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuzzleTagAssignment" ADD CONSTRAINT "PuzzleTagAssignment_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "PuzzleTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "coachId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

import { Module } from '@nestjs/common';
import { StudentProgressService } from './student-progress.service';
import { StudentProgressController } from './student-progress.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StudentProgressController],
  providers: [StudentProgressService],
})
export class StudentProgressModule {}

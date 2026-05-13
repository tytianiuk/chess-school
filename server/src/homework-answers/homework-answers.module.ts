import { Module } from '@nestjs/common';
import { HomeworkAnswersService } from './homework-answers.service';
import { HomeworkAnswersController } from './homework-answers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HomeworkAnswersController],
  providers: [HomeworkAnswersService],
})
export class HomeworkAnswersModule {}

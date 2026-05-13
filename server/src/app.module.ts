import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PuzzlesModule } from './puzzles/puzzles.module';
import { HomeworksModule } from './homework/homeworks.module';
import { StudentsModule } from './students/students.module';
import { HomeworkAnswersModule } from './homework-answers/homework-answers.module';
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PuzzlesModule,
    HomeworksModule,
    HomeworkAnswersModule,
    StudentsModule,
    GroupsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

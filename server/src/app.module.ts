import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PuzzlesModule } from './puzzles/puzzles.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { StudentProgressModule } from './student-progress/student-progress.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PuzzlesModule,
    AssignmentsModule,
    StudentProgressModule,
    StudentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

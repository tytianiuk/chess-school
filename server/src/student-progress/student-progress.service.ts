import { Injectable } from '@nestjs/common';
import { CreateStudentProgressDto } from './dto/create-student-progress.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressStatus } from '@prisma/client';

@Injectable()
export class StudentProgressService {
  constructor(private prisma: PrismaService) {}

  async assignToStudent(dto: CreateStudentProgressDto) {
    return this.prisma.studentProgress.create({
      data: {
        studentId: dto.studentId,
        assignmentId: dto.assignmentId,
        status: ProgressStatus.PENDING,
      },
    });
  }

  async unassign(id: number) {
    return this.prisma.studentProgress.delete({
      where: { id },
    });
  }

  async updateStatus(id: number, status: ProgressStatus) {
    return this.prisma.studentProgress.update({
      where: { id },
      data: {
        status,
        completedAt: status === ProgressStatus.SOLVED ? new Date() : null,
      },
    });
  }

  async findByStudent(studentId: number) {
    return this.prisma.studentProgress.findMany({
      where: { studentId },
      include: {
        assignment: {
          include: { puzzles: true },
        },
      },
    });
  }
}

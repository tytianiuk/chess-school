import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async findAllStudents() {
    return this.prisma.user.findMany({
      where: {
        role: 'STUDENT',
      },
      select: { id: true, email: true, fullName: true },
    });
  }

  async findUnassignedStudents() {
    return this.prisma.user.findMany({
      where: {
        role: 'STUDENT',
        coachId: null,
      },
      select: { id: true, email: true, fullName: true },
    });
  }

  async getMyStudents(coachId: number) {
    return this.prisma.user.findMany({
      where: { coachId },
      select: { id: true, email: true, fullName: true },
    });
  }

  async assignStudentToCoach(coachId: number, studentId: number) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }

    if (student.coachId && student.coachId !== coachId) {
      throw new BadRequestException(
        'This student is already working with a different coach',
      );
    }

    return this.prisma.user.update({
      where: { id: studentId },
      data: { coachId },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async unassignStudent(coachId: number, studentId: number) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.coachId !== coachId) {
      throw new ForbiddenException(
        'You cannot unassign a student who is assigned to a different coach',
      );
    }

    return this.prisma.user.update({
      where: { id: studentId },
      data: { coachId: null },
    });
  }
}

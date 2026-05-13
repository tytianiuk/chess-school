import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomeworksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateHomeworkDto, coachId: number) {
    return this.prisma.$transaction(async (tx) => {
      const homework = await tx.homework.create({
        data: {
          title: dto.title,
          description: dto.description,
          coachId,
          groupId: dto.groupId,
          studentId: dto.studentId,
          puzzles: {
            create: dto.puzzles.map((p) => ({
              puzzleId: p.puzzleId,
              checkType: p.checkType ?? 'AUTO',
            })),
          },
        },
      });

      let studentIds: number[] = [];

      if (dto.groupId) {
        const groupMembers = await tx.groupMember.findMany({
          where: { groupId: dto.groupId },
          select: { studentId: true },
        });
        studentIds = groupMembers.map((m) => m.studentId);
      } else if (dto.studentId) {
        studentIds = [dto.studentId];
      }

      if (studentIds.length > 0) {
        await tx.homeworkAnswer.createMany({
          data: studentIds.map((id) => ({
            studentId: id,
            homeworkId: homework.id,
            status: 'PENDING',
          })),
          skipDuplicates: true,
        });
      }

      return homework;
    });
  }

  async findAll(coachId: number) {
    return this.prisma.homework.findMany({
      where: { coachId },
      orderBy: { createdAt: 'desc' },
      include: {
        puzzles: {
          include: { puzzle: true },
        },
        group: true,
        student: true,
      },
    });
  }

  async findOne(id: number) {
    const homework = await this.prisma.homework.findUnique({
      where: { id },
      include: {
        puzzles: {
          include: { puzzle: true },
        },
        group: true,
        student: true,
      },
    });

    if (!homework) {
      throw new NotFoundException(`Homework with id ${id} not found`);
    }

    return homework;
  }

  async findStudentHomeworks(studentId: number) {
    return this.prisma.homeworkAnswer.findMany({
      where: { studentId },
      include: {
        homework: {
          include: {
            coach: {
              select: { fullName: true },
            },
            puzzles: {
              include: { puzzle: true },
            },
          },
        },
      },
      orderBy: { homework: { createdAt: 'desc' } },
    });
  }

  async update(id: number, dto: UpdateHomeworkDto) {
    await this.findOne(id);

    const { puzzles, ...rest } = dto;

    return this.prisma.homework.update({
      where: { id },
      data: {
        ...rest,
        ...(puzzles && {
          puzzles: {
            deleteMany: {},
            create: puzzles.map((p) => ({
              puzzleId: p.puzzleId,
              checkType: p.checkType ?? 'AUTO',
            })),
          },
        }),
      },
      include: {
        puzzles: {
          include: { puzzle: true },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.homework.delete({
      where: { id },
    });
  }
}

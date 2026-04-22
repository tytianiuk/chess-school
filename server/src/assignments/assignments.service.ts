import { Injectable } from '@nestjs/common';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAssignmentDto, coachId: number) {
    return this.prisma.assignment.create({
      data: {
        title: dto.title,
        description: dto.description,
        coachId,
        puzzles: {
          connect: dto.puzzleIds.map((id) => ({ id })),
        },
      },
      include: { puzzles: true },
    });
  }

  async findAll() {
    return this.prisma.assignment.findMany({
      include: { puzzles: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.assignment.findUnique({
      where: { id },
      include: { puzzles: true },
    });
  }

  async update(id: number, dto: UpdateAssignmentDto) {
    const { puzzleIds, ...rest } = dto;

    return this.prisma.assignment.update({
      where: { id },
      data: {
        ...rest,
        puzzles: puzzleIds
          ? {
              set: puzzleIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: { puzzles: true },
    });
  }

  remove(id: number) {
    return this.prisma.assignment.delete({
      where: { id },
    });
  }
}

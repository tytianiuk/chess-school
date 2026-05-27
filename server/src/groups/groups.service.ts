import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGroupDto, coachId: number) {
    return this.prisma.group.create({
      data: {
        name: dto.name,
        coachId,
        members: {
          create: dto.studentIds?.map((id) => ({
            studentId: id,
          })),
        },
      },
      include: {
        members: { include: { student: true } },
      },
    });
  }

  async findAll(coachId: number) {
    return this.prisma.group.findMany({
      where: { coachId },
      include: {
        _count: { select: { members: true } },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            student: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
      },
    });
  }

  async update(id: number, dto: UpdateGroupDto) {
    return this.prisma.group.update({
      where: { id },
      data: {
        name: dto.name,
      },
    });
  }

  async addMember(groupId: number, studentId: number) {
    return this.prisma.groupMember.create({
      data: { groupId, studentId },
    });
  }

  async removeMember(groupId: number, studentId: number) {
    return this.prisma.groupMember.delete({
      where: {
        groupId_studentId: { groupId, studentId },
      },
    });
  }

  async remove(id: number) {
    return this.prisma.group.delete({ where: { id } });
  }
}

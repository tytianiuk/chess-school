import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTagDto) {
    const existing = await this.prisma.puzzleTag.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(
        `A tag named "${dto.name}" already exists in the database`,
      );
    }

    return this.prisma.puzzleTag.create({ data: dto });
  }

  async findAll() {
    return this.prisma.puzzleTag.findMany({
      orderBy: { label: 'asc' },
    });
  }

  async findOne(id: number) {
    const tag = await this.prisma.puzzleTag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`The tag with ID: ${id} not found`);
    }
    return tag;
  }

  async update(id: number, dto: UpdateTagDto) {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.puzzleTag.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(
          `The system name "${dto.name}" is already taken by another tag`,
        );
      }
    }

    return this.prisma.puzzleTag.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.puzzleTag.delete({ where: { id } });
  }
}

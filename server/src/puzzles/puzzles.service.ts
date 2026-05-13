import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PuzzlesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePuzzleDto) {
    return this.prisma.puzzle.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.puzzle.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const puzzle = await this.prisma.puzzle.findUnique({
      where: { id },
    });

    if (!puzzle) {
      throw new NotFoundException(`Puzzle with id ${id} not found`);
    }

    return puzzle;
  }

  async update(id: number, dto: UpdatePuzzleDto) {
    await this.findOne(id);

    return this.prisma.puzzle.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.puzzle.delete({
      where: { id },
    });
  }
}

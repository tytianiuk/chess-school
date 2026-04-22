import { Injectable } from '@nestjs/common';
import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PuzzlesService {
  constructor(private prisma: PrismaService) {}

  async create(createPuzzleDto: CreatePuzzleDto) {
    return this.prisma.puzzle.create({
      data: createPuzzleDto,
    });
  }

  async findAll() {
    return this.prisma.puzzle.findMany();
  }

  async findOne(id: number) {
    return this.prisma.puzzle.findUnique({
      where: { id },
    });
  }

  async update(id: number, updatePuzzleDto: UpdatePuzzleDto) {
    return this.prisma.puzzle.update({
      where: { id },
      data: updatePuzzleDto,
    });
  }

  async remove(id: number) {
    return this.prisma.puzzle.delete({
      where: { id },
    });
  }
}

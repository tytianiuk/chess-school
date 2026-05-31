import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GetPuzzlesDto } from './dto/get-puzzles.dto';

@Injectable()
export class PuzzlesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePuzzleDto) {
    const { tagIds, ...puzzleData } = dto;

    return this.prisma.puzzle.create({
      data: {
        ...puzzleData,
        tags:
          tagIds && tagIds.length > 0
            ? {
                create: tagIds.map((id) => ({
                  tag: { connect: { id } },
                })),
              }
            : undefined,
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });
  }

  async findAll(dto: GetPuzzlesDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.puzzle.findMany({
        skip,
        take: limit,
        include: {
          tags: {
            include: { tag: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.puzzle.count(),
    ]);

    const formattedData = data.map((puzzle) => ({
      ...puzzle,
      tags: puzzle.tags.map((t) => t.tag),
    }));

    return {
      data: formattedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const puzzle = await this.prisma.puzzle.findUnique({
      where: { id },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!puzzle) {
      throw new NotFoundException(`Puzzle with id ${id} not found`);
    }

    return {
      ...puzzle,
      tags: puzzle.tags.map((t) => t.tag),
    };
  }

  async update(id: number, dto: UpdatePuzzleDto) {
    await this.findOne(id);
    const { tagIds, ...puzzleData } = dto;

    return this.prisma.puzzle.update({
      where: { id },
      data: {
        ...puzzleData,
        tags: tagIds
          ? {
              deleteMany: {},
              create: tagIds.map((id) => ({
                tag: { connect: { id } },
              })),
            }
          : undefined,
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.puzzle.delete({
      where: { id },
    });
  }

  async findRandomPuzzleForTraining(
    tagIds?: number[],
    minRating?: number,
    maxRating?: number,
  ) {
    const whereClause: any = {};

    if (minRating || maxRating) {
      whereClause.rating = {
        ...(minRating ? { gte: minRating } : {}),
        ...(maxRating ? { lte: maxRating } : {}),
      };
    }

    if (tagIds && tagIds.length > 0) {
      whereClause.tags = {
        some: {
          tagId: { in: tagIds },
        },
      };
    }
    const count = await this.prisma.puzzle.count({ where: whereClause });

    if (count === 0) {
      throw new NotFoundException('Puzzles with these parameters not found');
    }
    const randomIndex = Math.floor(Math.random() * count);

    const randomPuzzles = await this.prisma.puzzle.findMany({
      where: whereClause,
      skip: randomIndex,
      take: 1,
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    return randomPuzzles[0];
  }
}

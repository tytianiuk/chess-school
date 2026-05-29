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

  async findForSelfStudy(query: {
    tagIds?: string;
    minRating?: string;
    maxRating?: string;
  }) {
    const { tagIds, minRating, maxRating } = query;
    const where: any = {};

    if (minRating || maxRating) {
      where.rating = {
        gte: minRating ? parseInt(minRating, 10) : 0,
        lte: maxRating ? parseInt(maxRating, 10) : 3000,
      };
    }

    if (tagIds) {
      const ids = tagIds.split(',').map((id) => parseInt(id, 10));
      where.tags = {
        some: {
          tagId: { in: ids },
        },
      };
    }

    const puzzles = await this.prisma.puzzle.findMany({
      where,
      include: {
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return puzzles.map((puzzle) => ({
      ...puzzle,
      tags: puzzle.tags.map((t) => t.tag),
    }));
  }
}

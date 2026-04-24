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

  async handleMove(id: number, puzzleId: number, playerMove: string) {
    const progress = await this.prisma.studentProgress.findUnique({
      where: { id },
      include: {
        assignment: { include: { puzzles: true } },
      },
    });
    if (!progress) throw new Error('Progress record not found');

    const puzzle = progress.assignment.puzzles.find((p) => p.id === puzzleId);
    if (!puzzle) throw new Error('Puzzle not found in assignment');

    if (puzzle.type === 'MANUAL') {
      return this.prisma.studentProgress.update({
        where: { id },
        data: { studentAnswer: playerMove, status: 'REVIEW_PENDING' },
      });
    }

    const moves = puzzle.solution.split(' ');
    const expectedMove = moves[progress.currentStep];

    if (playerMove !== expectedMove) {
      await this.prisma.studentProgress.update({
        where: { id },
        data: { isFirstTryFail: true },
      });
      return { correct: false, message: 'Wrong answer. Try again!' };
    }

    let nextStep = progress.currentStep + 1;
    let serverMove: string | null = null;

    if (nextStep < moves.length) {
      serverMove = moves[nextStep];
      nextStep += 1;
    }

    const isFinished = nextStep >= moves.length;

    const updatedProgress = await this.prisma.studentProgress.update({
      where: { id },
      data: {
        currentStep: isFinished ? 0 : nextStep,
        status: isFinished ? 'SOLVED' : 'IN_PROGRESS',
        completedAt: isFinished ? new Date() : null,
      },
    });

    return {
      correct: true,
      serverMove,
      isFinished,
      isFirstTryFail: updatedProgress.isFirstTryFail,
    };
  }

  async reviewAssignment(id: number, status: ProgressStatus, comment?: string) {
    return this.prisma.studentProgress.update({
      where: { id },
      data: {
        status: status,
        trainerComment: comment,
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

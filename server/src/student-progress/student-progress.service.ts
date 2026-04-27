import { Injectable } from '@nestjs/common';
import { CreateStudentProgressDto } from './dto/create-student-progress.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressStatus, PuzzleType } from '@prisma/client';

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

  async unassign(progressId: number) {
    return this.prisma.studentProgress.delete({
      where: { id: progressId },
    });
  }

  async handleMove(progressId: number, puzzleId: number, playerMove: string) {
    const mainProgress = await this.prisma.studentProgress.findUnique({
      where: { id: progressId },
      include: { assignment: { include: { puzzles: true } } },
    });

    if (!mainProgress) throw new Error('Progress not found');

    await this.markAssignmentAsInProgress(mainProgress);

    const puzzleStatus = await this.getOrCreatePuzzleStatus(
      progressId,
      puzzleId,
    );
    const { puzzle } = puzzleStatus;

    if (puzzle.type === PuzzleType.MANUAL) {
      return this.handleManualMove(progressId, puzzleStatus.id, playerMove);
    }

    return this.handleAutoMove(mainProgress, puzzleStatus, playerMove);
  }

  async reviewAssignment(
    progressId: number,
    status: ProgressStatus,
    comment?: string,
  ) {
    return this.prisma.studentProgress.update({
      where: { id: progressId },
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

  private async getOrCreatePuzzleStatus(progressId: number, puzzleId: number) {
    return this.prisma.studentPuzzleStatus.upsert({
      where: { progressId_puzzleId: { progressId, puzzleId } },
      update: {},
      create: { progressId, puzzleId },
      include: { puzzle: true },
    });
  }

  private async handleManualMove(
    progressId: number,
    statusId: number,
    answer: string,
  ) {
    await this.prisma.studentPuzzleStatus.update({
      where: { id: statusId },
      data: { studentAnswer: answer, isSolved: true },
    });

    await this.prisma.studentProgress.update({
      where: { id: progressId },
      data: { status: ProgressStatus.REVIEW_PENDING },
    });

    return {
      message: 'The answer has been saved for review. ',
      type: PuzzleType.MANUAL,
    };
  }

  private async handleAutoMove(
    mainProgress: any,
    puzzleStatus: any,
    playerMove: string,
  ) {
    const moves = puzzleStatus.puzzle.solution.split(' ');
    const expectedMove = moves[puzzleStatus.currentStep];

    if (playerMove !== expectedMove) {
      await this.markAsFailed(
        puzzleStatus.id,
        puzzleStatus.currentStep,
        puzzleStatus.isFirstTryFail,
      );
      return { correct: false, message: 'Incorrect.' };
    }

    let nextStep = puzzleStatus.currentStep + 1;
    let serverMove = null;

    if (nextStep < moves.length) {
      serverMove = moves[nextStep];
      nextStep += 1;
    }

    const isFinished = nextStep >= moves.length;

    await this.prisma.studentPuzzleStatus.update({
      where: { id: puzzleStatus.id },
      data: { currentStep: nextStep, isSolved: isFinished },
    });

    if (isFinished) {
      await this.checkAndFinishAssignment(
        mainProgress.id,
        mainProgress.assignment.puzzles.length,
      );
    }

    return { correct: true, serverMove, isFinished };
  }

  private async markAsFailed(
    statusId: number,
    step: number,
    alreadyFailed: boolean,
  ) {
    if (!alreadyFailed) {
      await this.prisma.studentPuzzleStatus.update({
        where: { id: statusId },
        data: { isFirstTryFail: true, failStep: step },
      });
    }
  }

  private async checkAndFinishAssignment(
    progressId: number,
    totalPuzzles: number,
  ) {
    const solvedCount = await this.prisma.studentPuzzleStatus.count({
      where: { progressId, isSolved: true },
    });

    if (solvedCount === totalPuzzles) {
      await this.prisma.studentProgress.update({
        where: { id: progressId },
        data: { status: ProgressStatus.SOLVED, completedAt: new Date() },
      });
    }
  }

  private async markAssignmentAsInProgress(mainProgress: any) {
    if (mainProgress.status === ProgressStatus.PENDING) {
      await this.prisma.studentProgress.update({
        where: { id: mainProgress.id },
        data: { status: ProgressStatus.IN_PROGRESS },
      });
      mainProgress.status = ProgressStatus.IN_PROGRESS;
    }
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateStudentProgressDto } from './dto/create-student-progress.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressStatus, PuzzleType } from '@prisma/client';
import { Chess } from 'chess.js';

@Injectable()
export class StudentProgressService {
  constructor(private prisma: PrismaService) {}

  async assignToStudent(dto: CreateStudentProgressDto, coachId: number) {
    const student = await this.prisma.user.findUnique({
      where: { id: dto.studentId },
    });

    if (!student || student.coachId !== coachId) {
      throw new ForbiddenException(
        'You can only assign puzzles to your own students',
      );
    }
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
    const { puzzle, currentStep, id: statusId, isFirstTryFail } = puzzleStatus;

    const validation = this.validateChessMove(
      puzzle.fen,
      puzzle.solution,
      currentStep,
      playerMove,
    );

    if (!validation.isValid) {
      return { correct: false, message: validation.error };
    }

    const moves = puzzle.solution.split(' ');
    const expectedMove = moves[currentStep];

    if (playerMove !== expectedMove) {
      await this.markAsFailed(statusId, currentStep, isFirstTryFail);
      return {
        correct: false,
        message: 'Incorrect.',
      };
    }

    let nextStep = currentStep + 1;
    let serverMove = null;

    if (nextStep < moves.length) {
      serverMove = moves[nextStep];
      nextStep += 1;
    }

    const isFinished = nextStep >= moves.length;

    await this.prisma.studentPuzzleStatus.update({
      where: { id: statusId },
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

  private validateChessMove(
    fen: string,
    solution: string,
    currentStep: number,
    playerMove: string,
  ) {
    try {
      const game = new Chess(fen);
      const moves = solution.split(' ');

      for (let i = 0; i < currentStep; i++) {
        const moveResult = game.move(moves[i]);
        if (!moveResult) {
          throw new Error(
            `The internal error: incorrect move in the solution (${moves[i]})`,
          );
        }
      }

      const moveAttempt = game.move(playerMove);

      if (!moveAttempt) {
        return {
          isValid: false,
          error: 'This move is not possible according to the rules of chess!',
        };
      }

      return { isValid: true, moveDetails: moveAttempt };
    } catch (e) {
      return {
        isValid: false,
        error: 'The internal error: incorrect move format or validation error.',
      };
    }
  }
}

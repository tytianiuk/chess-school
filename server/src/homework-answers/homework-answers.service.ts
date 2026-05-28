import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHomeworkAnswerDto } from './dto/create-homework-answer.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CheckType, ProgressStatus } from '@prisma/client';
import { Chess } from 'chess.js';

@Injectable()
export class HomeworkAnswersService {
  constructor(private prisma: PrismaService) {}

  async assignToStudent(dto: CreateHomeworkAnswerDto, coachId: number) {
    const student = await this.prisma.user.findUnique({
      where: { id: dto.studentId },
    });

    if (!student || student.coachId !== coachId) {
      throw new ForbiddenException(
        'You can only assign homeworks to your own students',
      );
    }

    const homework = await this.prisma.homework.findUnique({
      where: { id: dto.homeworkId },
    });

    if (!homework) {
      throw new NotFoundException(
        `Homework with id ${dto.homeworkId} not found`,
      );
    }

    return this.prisma.homeworkAnswer.create({
      data: {
        studentId: dto.studentId,
        homeworkId: dto.homeworkId,
        status: ProgressStatus.PENDING,
      },
    });
  }

  async unassign(answerId: number) {
    return this.prisma.homeworkAnswer.delete({
      where: { id: answerId },
    });
  }

  async findByStudent(studentId: number) {
    return this.prisma.homeworkAnswer.findMany({
      where: { studentId },
      include: {
        homework: {
          include: {
            puzzles: {
              include: { puzzle: true },
            },
          },
        },
        puzzleAttempts: true,
      },
    });
  }

  async findByHomework(homeworkId: number) {
    const homework = await this.prisma.homework.findUnique({
      where: { id: homeworkId },
    });

    if (!homework) {
      throw new NotFoundException(`Homework with id ${homeworkId} not found`);
    }

    return this.prisma.homeworkAnswer.findMany({
      where: { homeworkId },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        puzzleAttempts: true,
      },
      orderBy: {
        status: 'asc',
      },
    });
  }

  async findByHomeworkAndStudent(homeworkId: number, studentId: number) {
    const answer = await this.prisma.homeworkAnswer.findFirst({
      where: {
        homeworkId,
        studentId,
      },
      include: {
        student: {
          select: { id: true, fullName: true, email: true },
        },
        homework: {
          include: {
            puzzles: {
              include: { puzzle: true },
            },
          },
        },
        puzzleAttempts: {
          include: {
            homeworkPuzzle: {
              include: {
                puzzle: true,
              },
            },
          },
        },
      },
    });

    if (!answer) {
      throw new NotFoundException(
        `Homework answer for homework ${homeworkId} and student ${studentId} not found`,
      );
    }

    return answer;
  }

  async handleMove(
    answerId: number,
    homeworkPuzzleId: number,
    playerMove: string,
  ) {
    const homeworkAnswer = await this.prisma.homeworkAnswer.findUnique({
      where: { id: answerId },
      include: {
        homework: {
          include: {
            puzzles: {
              include: { puzzle: true },
            },
          },
        },
      },
    });

    if (!homeworkAnswer) {
      throw new NotFoundException(
        `HomeworkAnswer with id ${answerId} not found`,
      );
    }

    await this.markAsInProgress(homeworkAnswer);

    const homeworkPuzzle = await this.prisma.homeworkPuzzle.findUnique({
      where: { id: homeworkPuzzleId },
      include: { puzzle: true },
    });

    if (!homeworkPuzzle) {
      throw new NotFoundException(
        `HomeworkPuzzle with id ${homeworkPuzzleId} not found`,
      );
    }

    const puzzleAttempt = await this.getOrCreatePuzzleAttempt(
      answerId,
      homeworkPuzzleId,
    );

    if (homeworkPuzzle.checkType === CheckType.MANUAL) {
      return this.handleManualMove(answerId, puzzleAttempt.id, playerMove);
    }

    return this.handleAutoMove(
      homeworkAnswer,
      homeworkPuzzle,
      puzzleAttempt,
      playerMove,
    );
  }

  async reviewHomework(
    answerId: number,
    status: ProgressStatus,
    comment?: string,
    score?: number,
  ) {
    return this.prisma.homeworkAnswer.update({
      where: { id: answerId },
      data: {
        status,
        trainerComment: comment,
        score,
        completedAt: status === ProgressStatus.SOLVED ? new Date() : null,
      },
    });
  }

  async getPuzzleState(homeworkAnswerId: number, homeworkPuzzleId: number) {
    const attempt = await this.prisma.puzzleAttempt.findUnique({
      where: {
        homeworkAnswerId_homeworkPuzzleId: {
          homeworkAnswerId,
          homeworkPuzzleId,
        },
      },
      include: {
        homeworkPuzzle: {
          include: { puzzle: true },
        },
      },
    });

    if (!attempt) {
      const homeworkPuzzle = await this.prisma.homeworkPuzzle.findUnique({
        where: { id: homeworkPuzzleId },
        include: { puzzle: true },
      });

      if (!homeworkPuzzle) {
        throw new NotFoundException(
          `HomeworkPuzzle with id ${homeworkPuzzleId} not found`,
        );
      }

      return {
        currentStep: 0,
        isSolved: false,
        attemptCount: 0,
        fen: homeworkPuzzle.puzzle.fen,
        checkType: homeworkPuzzle.checkType,
      };
    }

    const { puzzle } = attempt.homeworkPuzzle;
    const currentFen = this.getFenAtStep(
      puzzle.fen,
      puzzle.solution,
      attempt.currentStep,
    );

    return {
      currentStep: attempt.currentStep,
      isSolved: attempt.isSolved,
      attemptCount: attempt.attemptCount,
      fen: currentFen,
      checkType: attempt.homeworkPuzzle.checkType,
    };
  }

  private async getOrCreatePuzzleAttempt(
    homeworkAnswerId: number,
    homeworkPuzzleId: number,
  ) {
    return this.prisma.puzzleAttempt.upsert({
      where: {
        homeworkAnswerId_homeworkPuzzleId: {
          homeworkAnswerId,
          homeworkPuzzleId,
        },
      },
      update: {},
      create: { homeworkAnswerId, homeworkPuzzleId },
    });
  }

  private async handleManualMove(
    answerId: number,
    attemptId: number,
    answer: string,
  ) {
    await this.prisma.puzzleAttempt.update({
      where: { id: attemptId },
      data: { studentAnswer: answer, isSolved: true },
    });

    await this.prisma.homeworkAnswer.update({
      where: { id: answerId },
      data: { status: ProgressStatus.REVIEW_PENDING },
    });

    return {
      message: 'The answer has been saved for review.',
      type: CheckType.MANUAL,
    };
  }

  private async handleAutoMove(
    homeworkAnswer: any,
    homeworkPuzzle: any,
    puzzleAttempt: any,
    playerMove: string,
  ) {
    const { puzzle } = homeworkPuzzle;
    const { id: attemptId, attemptCount, currentStep } = puzzleAttempt;

    const moves = puzzle.solution.split(' ');

    const validation = this.validateChessMove(
      puzzle.fen,
      puzzle.solution,
      currentStep,
      playerMove,
    );

    if (!validation.isValid) {
      return { correct: false, message: validation.error };
    }

    const expectedMove = moves[currentStep];

    if (playerMove !== expectedMove) {
      await this.prisma.puzzleAttempt.update({
        where: { id: attemptId },
        data: {
          attemptCount: { increment: 1 },
        },
      });

      return { correct: false, message: 'Incorrect move.' };
    }

    const nextStep = currentStep + 1;
    let serverMove = null;

    if (nextStep < moves.length) {
      serverMove = moves[nextStep];
    }

    const stepAfterServer = serverMove ? nextStep + 1 : nextStep;
    const isFinished = stepAfterServer >= moves.length;

    await this.prisma.puzzleAttempt.update({
      where: { id: attemptId },
      data: {
        currentStep: stepAfterServer,
        isSolved: isFinished,
        solvedOnFirst: attemptCount === 0 && isFinished,
      },
    });

    if (isFinished) {
      await this.checkAndFinishHomework(
        homeworkAnswer.id,
        homeworkAnswer.homework.puzzles.length,
      );
    }

    return { correct: true, serverMove, isFinished };
  }

  private getFenAtStep(
    initialFen: string,
    solution: string,
    step: number,
  ): string {
    if (step === 0) return initialFen;

    const game = new Chess(initialFen);
    const moves = solution.split(' ');

    for (let i = 0; i < step; i++) {
      game.move(moves[i]);
    }

    return game.fen();
  }

  private async checkAndFinishHomework(answerId: number, totalPuzzles: number) {
    const solvedCount = await this.prisma.puzzleAttempt.count({
      where: { homeworkAnswerId: answerId, isSolved: true },
    });

    if (solvedCount === totalPuzzles) {
      await this.prisma.homeworkAnswer.update({
        where: { id: answerId },
        data: {
          status: ProgressStatus.SOLVED,
          completedAt: new Date(),
        },
      });
    }
  }

  private async markAsInProgress(homeworkAnswer: any) {
    if (homeworkAnswer.status === ProgressStatus.PENDING) {
      await this.prisma.homeworkAnswer.update({
        where: { id: homeworkAnswer.id },
        data: { status: ProgressStatus.IN_PROGRESS },
      });
      homeworkAnswer.status = ProgressStatus.IN_PROGRESS;
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
            `Internal error: incorrect move in solution (${moves[i]})`,
          );
        }
      }

      const moveAttempt = game.move(playerMove);

      if (!moveAttempt) {
        return {
          isValid: false,
          error: 'This move is not allowed by chess rules.',
        };
      }

      return { isValid: true, moveDetails: moveAttempt };
    } catch (e) {
      return {
        isValid: false,
        error: 'Internal error: incorrect move format or validation error.',
      };
    }
  }
}

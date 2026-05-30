import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoachReviewsService {
  constructor(private prisma: PrismaService) {}
  async getStudentCoaches(studentId: number) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { coachId: true },
    });

    if (student && student.coachId) {
      const coach = await this.prisma.user.findUnique({
        where: { id: student.coachId },
        select: { id: true, fullName: true, email: true },
      });

      if (!coach) return { hasCoach: false, coaches: [] };

      const existingReview = await this.prisma.coachReview.findUnique({
        where: { studentId_coachId: { studentId, coachId: coach.id } },
      });

      return {
        hasCoach: true,
        coaches: [
          {
            id: coach.id,
            name: coach.fullName,
            email: coach.email,
            hasReviewed: !!existingReview,
          },
        ],
      };
    }

    const allCoaches = await this.prisma.user.findMany({
      where: { role: 'COACH' },
      select: {
        id: true,
        fullName: true,
        email: true,
        receivedReviews: {
          select: { rating: true },
        },
      },
    });

    const formattedCoaches = allCoaches.map((c) => {
      const totalReviews = c.receivedReviews.length;
      const avgRating =
        totalReviews > 0
          ? c.receivedReviews.reduce((sum, r) => sum + r.rating, 0) /
            totalReviews
          : 0;

      return {
        id: c.id,
        name: c.fullName,
        email: c.email,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewsCount: totalReviews,
        hasReviewed: false,
      };
    });

    return {
      hasCoach: false,
      coaches: formattedCoaches,
    };
  }

  async createReview(
    studentId: number,
    coachId: number,
    rating: number,
    comment: string,
  ) {
    const student = await this.prisma.user.findFirst({
      where: { id: studentId, coachId },
    });

    if (!student) {
      throw new BadRequestException(
        'You can only leave feedback to your coach.',
      );
    }

    const existingReview = await this.prisma.coachReview.findUnique({
      where: {
        studentId_coachId: { studentId, coachId },
      },
    });

    if (existingReview) {
      throw new ConflictException(
        'You have already left review for this coach.',
      );
    }

    return this.prisma.coachReview.create({
      data: {
        studentId,
        coachId,
        rating,
        comment,
      },
    });
  }

  async getCoachReviews(coachId: number) {
    return this.prisma.coachReview.findMany({
      where: { coachId },
      include: {
        student: {
          select: { fullName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCoachOwnProfileAndReviews(coachId: number) {
    const reviews = await this.prisma.coachReview.findMany({
      where: { coachId },
      include: {
        student: {
          select: { fullName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    return {
      avgRating: Math.round(avgRating * 10) / 10,
      reviewsCount: totalReviews,
      reviews,
    };
  }

  async deleteReview(studentId: number, coachId: number) {
    const review = await this.prisma.coachReview.findUnique({
      where: {
        studentId_coachId: { studentId, coachId },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.prisma.coachReview.delete({
      where: {
        studentId_coachId: { studentId, coachId },
      },
    });
  }
}

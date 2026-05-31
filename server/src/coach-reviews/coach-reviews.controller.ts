import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
  Delete,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CoachReviewsService } from './coach-reviews.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateReviewDto } from './dto/create-coach-review.dto';

@ApiTags('Coach Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('coach-reviews')
export class CoachReviewsController {
  constructor(private readonly coachReviewService: CoachReviewsService) {}

  @Get('my-coaches')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get a list of student coaches with review status' })
  @ApiResponse({
    status: 200,
    description: 'List of coaches retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Access allowed only for students' })
  getMyCoaches(@Request() req: any) {
    const studentId = req.user.userId;
    return this.coachReviewService.getStudentCoaches(studentId);
  }

  @Post()
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: 'Leave a review and rating for a coach (student only)',
  })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (rating 1-5, comment min 5 chars)',
  })
  @ApiResponse({
    status: 409,
    description: 'Review for this coach already exists',
  })
  createReview(@Request() req: any, @Body() dto: CreateReviewDto) {
    const studentId = req.user.userId;

    return this.coachReviewService.createReview(
      studentId,
      +dto.coachId,
      +dto.rating,
      dto.comment,
    );
  }

  @Get('coach/:coachId')
  @ApiOperation({ summary: 'Get all reviews and ratings for a specific coach' })
  @ApiParam({ name: 'coachId', description: 'Coach ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of reviews retrieved successfully',
  })
  getCoachReviews(@Param('coachId', ParseIntPipe) coachId: number) {
    return this.coachReviewService.getCoachReviews(coachId);
  }

  @Get('my-reviews')
  @Roles(Role.COACH)
  @ApiOperation({
    summary: 'Get all reviews and statistics for the logged-in coach',
  })
  @ApiResponse({
    status: 200,
    description: 'Coach reviews and stats retrieved successfully',
  })
  getMyReviews(@Request() req: any) {
    const coachId = req.user.userId;
    return this.coachReviewService.getCoachOwnProfileAndReviews(coachId);
  }

  @Delete('coach/:coachId')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Delete my review for a specific coach' })
  @ApiParam({ name: 'coachId', description: 'Coach ID', type: Number })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  deleteMyReview(
    @Request() req: any,
    @Param('coachId', ParseIntPipe) coachId: number,
  ) {
    const studentId = req.user.userId;
    return this.coachReviewService.deleteReview(studentId, coachId);
  }
}

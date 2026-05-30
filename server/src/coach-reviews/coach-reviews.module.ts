import { Module } from '@nestjs/common';
import { CoachReviewsService } from './coach-reviews.service';
import { CoachReviewsController } from './coach-reviews.controller';

@Module({
  controllers: [CoachReviewsController],
  providers: [CoachReviewsService],
})
export class CoachReviewsModule {}

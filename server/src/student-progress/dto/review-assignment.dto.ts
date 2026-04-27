import { ApiProperty } from '@nestjs/swagger';
import { ProgressStatus } from '@prisma/client';

export class ReviewAssignmentDto {
  @ApiProperty({ example: ProgressStatus.IN_PROGRESS })
  status!: ProgressStatus;

  @ApiProperty({ example: 'Feedback for the student' })
  comment?: string;
}

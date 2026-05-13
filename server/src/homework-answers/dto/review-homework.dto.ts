import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsEnum, IsOptional, IsString } from 'class-validator';
import { ProgressStatus } from '@prisma/client';

export class ReviewHomeworkDto {
  @IsEnum(ProgressStatus)
  @ApiProperty({
    enum: ProgressStatus,
    example: ProgressStatus.SOLVED,
    description: 'New status for the homework answer',
  })
  status!: ProgressStatus;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Good job! Work on your endgame.',
    description: 'Coach comment',
    required: false,
  })
  comment?: string;

  @IsInt()
  @IsOptional()
  @ApiProperty({
    example: 85,
    description: 'Score from coach (optional)',
    required: false,
  })
  score?: number;
}

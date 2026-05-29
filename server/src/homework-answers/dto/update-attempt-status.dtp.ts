import { IsEnum, IsNotEmpty } from 'class-validator';
import { PuzzleStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAttemptStatusDto {
  @IsEnum(PuzzleStatus, { message: 'Статус має бути SOLVED або FAILED' })
  @IsNotEmpty()
  @ApiProperty({ example: 'SOLVED', enum: PuzzleStatus })
  status!: PuzzleStatus;
}

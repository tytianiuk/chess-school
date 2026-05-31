import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProgressStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAttemptStatusDto {
  @IsEnum(ProgressStatus, { message: 'Статус має бути SOLVED або FAILED' })
  @IsNotEmpty()
  @ApiProperty({ example: 'SOLVED', enum: ProgressStatus })
  status!: ProgressStatus;
}

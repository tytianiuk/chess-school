import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CheckType } from '@prisma/client';

export class HomeworkPuzzleDto {
  @IsInt()
  @ApiProperty({ example: 1, description: 'Puzzle ID' })
  puzzleId!: number;

  @IsEnum(CheckType)
  @IsOptional()
  @ApiProperty({
    enum: CheckType,
    example: CheckType.AUTO,
    default: CheckType.AUTO,
    description: 'Check type: AUTO or MANUAL',
    required: false,
  })
  checkType?: CheckType;
}

export class CreateHomeworkDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Opening Puzzles', description: 'Homework title' })
  title!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Solve these puzzles to practice openings',
    description: 'Homework description',
    required: false,
  })
  description?: string;

  @IsInt()
  @IsOptional()
  @ApiProperty({
    example: 3,
    description: 'Group ID — if assigning to a group',
    required: false,
  })
  groupId?: number;

  @IsInt()
  @IsOptional()
  @ApiProperty({
    example: 5,
    description: 'Student ID — if assigning individually',
    required: false,
  })
  studentId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HomeworkPuzzleDto)
  @IsNotEmpty()
  @ApiProperty({
    type: [HomeworkPuzzleDto],
    description: 'Array of puzzles with check type for this homework',
    example: [
      { puzzleId: 1, checkType: 'AUTO' },
      { puzzleId: 2, checkType: 'MANUAL' },
    ],
  })
  puzzles!: HomeworkPuzzleDto[];
}

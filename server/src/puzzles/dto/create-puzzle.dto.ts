import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PuzzleType } from '@prisma/client';

export class CreatePuzzleDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(PuzzleType)
  @IsOptional()
  type?: PuzzleType;

  @IsString()
  @IsNotEmpty({ message: 'FEN string is required' })
  fen!: string;

  @IsString()
  @IsNotEmpty({ message: 'Solution is required' })
  solution!: string;

  @IsString()
  @IsOptional()
  hint?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

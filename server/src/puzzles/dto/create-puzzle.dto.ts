import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PuzzleType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export class CreatePuzzleDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Mate in 1',
    description: 'Puzzle title',
    required: false,
  })
  title?: string;

  @IsEnum(PuzzleType)
  @IsOptional()
  @ApiProperty({
    enum: PuzzleType,
    example: PuzzleType.AUTO,
    default: PuzzleType.AUTO,
    description: 'Puzzle type: AUTO (automatic) or MANUAL (text)',
    required: false,
  })
  type?: PuzzleType;

  @IsString()
  @IsNotEmpty({ message: 'FEN string is required' })
  @ApiProperty({
    example: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    description: 'Puzzle position in FEN format',
    required: true,
  })
  fen!: string;

  @IsString()
  @IsNotEmpty({ message: 'Solution is required' })
  @ApiProperty({
    example: 'Nf7',
    description: 'Puzzle solution',
    required: true,
  })
  solution!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Consider the knight fork',
    description: 'Puzzle hint',
    required: false,
  })
  hint?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({
    example: ['mate', 'opening'],
    description: 'Tags for filtering puzzles',
    required: false,
  })
  tags?: string[];
}

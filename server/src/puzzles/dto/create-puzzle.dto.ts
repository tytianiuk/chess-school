import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePuzzleDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Mate in 1',
    description: 'Puzzle title',
    required: false,
  })
  title?: string;

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

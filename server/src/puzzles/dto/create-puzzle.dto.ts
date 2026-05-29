import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
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

  @IsNumber()
  @IsOptional()
  @Min(300, { message: 'Рейтинг не може бути меншим за 300' })
  @Max(3000, { message: 'Рейтинг не може бути більшим за 3000' })
  @ApiProperty({
    example: 1500,
    description: 'Шаховий рейтинг складності задачі (ELO)',
    required: false,
    default: 1500,
  })
  rating?: number;

  @IsArray()
  @IsNumber({}, { each: true, message: 'Кожен тег має бути числовим ID' })
  @IsOptional()
  @ApiProperty({
    example: [1, 3],
    description: 'Масив ідентифікаторів (ID) тегів тактики з бази даних',
    required: false,
    type: [Number],
  })
  tagIds?: number[];
}

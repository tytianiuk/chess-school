import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class MakeMoveDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: 'ID of HomeworkPuzzle (not Puzzle)',
  })
  homeworkPuzzleId!: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'e2e4', description: 'Move in SAN or UCI format' })
  move!: string;
}

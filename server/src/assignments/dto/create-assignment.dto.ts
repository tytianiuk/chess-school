import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Opening Puzzles', description: 'Assignment title' })
  title!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Puzzles for learning opening principles',
    description: 'Assignment description',
    required: false,
  })
  description?: string;

  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  @ApiProperty({
    example: [1, 2, 5],
    description: 'Array of puzzle IDs that belong to this assignment',
  })
  puzzleIds!: number[];
}

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateHomeworkAnswerDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 1, description: 'Student ID' })
  studentId!: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 1, description: 'Homework ID' })
  homeworkId!: number;
}

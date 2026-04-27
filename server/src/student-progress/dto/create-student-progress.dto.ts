import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateStudentProgressDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 1 })
  studentId!: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 1 })
  assignmentId!: number;
}

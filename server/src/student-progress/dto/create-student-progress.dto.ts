import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateStudentProgressDto {
  @IsInt()
  @IsNotEmpty()
  studentId!: number;

  @IsInt()
  @IsNotEmpty()
  assignmentId!: number;
}

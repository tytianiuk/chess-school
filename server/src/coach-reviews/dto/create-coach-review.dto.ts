export class CreateCoachReviewDto {}
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @ApiProperty({ example: 1, description: 'ID тренера, якого оцінюють' })
  coachId!: number;

  @IsInt()
  @ApiProperty({ example: 5, description: 'Оцінка роботи від 1 до 5 зірок' })
  rating!: number;

  @IsString()
  @ApiProperty({
    example: 'Чудовий тренер, дуже доступно пояснює ендшпілі!',
    description: 'Текстовий відгук учня',
  })
  comment!: string;
}

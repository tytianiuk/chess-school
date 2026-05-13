import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
  IsInt,
  IsNotEmpty,
} from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Група А - Ранкова зміна',
    description: 'Назва групи',
  })
  name!: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @ApiProperty({
    type: [Number],
    example: [1],
    description: 'Масив ID учнів, яких потрібно додати в групу при створенні',
    required: false,
  })
  studentIds?: number[];
}

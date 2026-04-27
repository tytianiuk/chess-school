import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @ApiProperty({ example: 'password123' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @ApiProperty({ example: 'John Doe' })
  fullName!: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'john_doe' })
  lichessUsername?: string;

  @IsEnum(Role, { message: 'Role must be either COACH or STUDENT' })
  @ApiProperty({ example: Role.STUDENT })
  role!: Role;
}

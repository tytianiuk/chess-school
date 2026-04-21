import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  fullName!: string;

  @IsOptional()
  @IsString()
  lichessUsername?: string;

  @IsEnum(Role, { message: 'Role must be either COACH or STUDENT' })
  role!: Role;
}

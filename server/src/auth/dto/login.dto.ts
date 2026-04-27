import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @IsString()
  @ApiProperty({ example: 'password123' })
  password!: string;
}

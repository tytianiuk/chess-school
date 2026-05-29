import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Системне ім’я має містити лише латинські літери, цифри та дефіси',
  })
  @ApiProperty({
    example: 'mate-in-1',
    description: 'Системна унікальна назва тегу',
  })
  name!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Відкритий напад',
    description: 'Красива назва для UI українською',
  })
  label!: string;
}

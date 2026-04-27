import { ApiProperty } from '@nestjs/swagger';

export class MakeMoveDto {
  @ApiProperty({ example: 1 })
  puzzleId!: number;

  @ApiProperty({ example: 'e2e4' })
  move!: string;
}

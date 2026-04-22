import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PuzzlesService } from './puzzles.service';
import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client/wasm';

@Controller('puzzles')
export class PuzzlesController {
  constructor(private readonly puzzlesService: PuzzlesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COACH)
  @Post()
  create(@Body() createPuzzleDto: CreatePuzzleDto) {
    return this.puzzlesService.create(createPuzzleDto);
  }

  @Get()
  findAll() {
    return this.puzzlesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.puzzlesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COACH)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePuzzleDto: UpdatePuzzleDto) {
    return this.puzzlesService.update(+id, updatePuzzleDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COACH)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.puzzlesService.remove(+id);
  }
}

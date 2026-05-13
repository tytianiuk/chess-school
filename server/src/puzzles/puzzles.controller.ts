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
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Puzzles')
@ApiBearerAuth()
@Controller('puzzles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PuzzlesController {
  constructor(private readonly puzzlesService: PuzzlesService) {}

  @Post()
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Create a new puzzle (coach only)' })
  @ApiResponse({ status: 201, description: 'Puzzle created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() dto: CreatePuzzleDto) {
    return this.puzzlesService.create(dto);
  }

  @Get()
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Get all puzzles from the bank (coach only)' })
  @ApiResponse({ status: 200, description: 'Puzzles retrieved successfully' })
  findAll() {
    return this.puzzlesService.findAll();
  }

  @Get(':id')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Get a puzzle by ID (coach only)' })
  @ApiParam({ name: 'id', description: 'Unique identifier of the puzzle' })
  @ApiResponse({ status: 200, description: 'Puzzle found' })
  @ApiResponse({ status: 404, description: 'Puzzle not found' })
  findOne(@Param('id') id: string) {
    return this.puzzlesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Update a puzzle (coach only)' })
  @ApiParam({ name: 'id', description: 'ID of the puzzle to update' })
  @ApiResponse({ status: 200, description: 'Puzzle updated successfully' })
  @ApiResponse({ status: 404, description: 'Puzzle not found' })
  update(@Param('id') id: string, @Body() dto: UpdatePuzzleDto) {
    return this.puzzlesService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Delete a puzzle (coach only)' })
  @ApiParam({ name: 'id', description: 'ID of the puzzle to delete' })
  @ApiResponse({ status: 200, description: 'Puzzle deleted successfully' })
  @ApiResponse({ status: 404, description: 'Puzzle not found' })
  remove(@Param('id') id: string) {
    return this.puzzlesService.remove(+id);
  }
}

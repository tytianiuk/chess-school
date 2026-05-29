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
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@ApiTags('Puzzle Tags')
@ApiBearerAuth()
@Controller('puzzles-tags')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Створити новий шаховий тег (тільки тренер)' })
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @Get()
  @Roles(Role.COACH, Role.STUDENT)
  @ApiOperation({ summary: 'Отримати список усіх тегів (коуч та учень)' })
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':id')
  @Roles(Role.COACH)
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.COACH)
  update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.tagsService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(Role.COACH)
  remove(@Param('id') id: string) {
    return this.tagsService.remove(+id);
  }
}

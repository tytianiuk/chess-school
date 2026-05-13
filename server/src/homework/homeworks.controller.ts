import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { HomeworksService } from './homeworks.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
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

@ApiTags('Homeworks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('homeworks')
export class HomeworksController {
  constructor(private readonly homeworksService: HomeworksService) {}

  @Post()
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Create a new homework (coach only)' })
  @ApiResponse({ status: 201, description: 'Homework created successfully' })
  @ApiResponse({ status: 403, description: 'Access allowed only for coaches' })
  create(@Body() dto: CreateHomeworkDto, @Request() req) {
    const coachId = req.user.userId;
    return this.homeworksService.create(dto, coachId);
  }

  @Get()
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Get all homeworks created by coach' })
  @ApiResponse({ status: 200, description: 'List retrieved successfully' })
  findAll(@Request() req) {
    const coachId = req.user.userId;
    return this.homeworksService.findAll(coachId);
  }

  @Get('my-homeworks')
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: 'Get all homeworks assigned to the current student',
  })
  findAllMy(@Request() req) {
    return this.homeworksService.findStudentHomeworks(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get homework by ID' })
  @ApiParam({ name: 'id', description: 'Unique identifier of the homework' })
  @ApiResponse({ status: 200, description: 'Homework found' })
  @ApiResponse({ status: 404, description: 'Homework not found' })
  findOne(@Param('id') id: string) {
    return this.homeworksService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Update homework (coach only)' })
  @ApiParam({ name: 'id', description: 'Homework ID' })
  @ApiResponse({ status: 200, description: 'Homework updated successfully' })
  @ApiResponse({ status: 404, description: 'Homework not found' })
  update(@Param('id') id: string, @Body() dto: UpdateHomeworkDto) {
    return this.homeworksService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Delete homework (coach only)' })
  @ApiParam({ name: 'id', description: 'Homework ID' })
  @ApiResponse({ status: 200, description: 'Homework deleted successfully' })
  @ApiResponse({ status: 404, description: 'Homework not found' })
  remove(@Param('id') id: string) {
    return this.homeworksService.remove(+id);
  }
}

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
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

ApiBearerAuth();
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Create new assignment (set of puzzles)' })
  @ApiResponse({ status: 201, description: 'Assignment created' })
  @ApiResponse({ status: 403, description: 'Access allowed only for coaches' })
  create(@Body() dto: CreateAssignmentDto, @Request() req) {
    const coachId = req.user.userId;
    return this.assignmentsService.create(dto, coachId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all available assignments' })
  @ApiResponse({ status: 200, description: 'List retrieved successfully' })
  findAll() {
    return this.assignmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment by ID' })
  @ApiParam({ name: 'id', description: 'Unique identifier of the puzzle' })
  @ApiResponse({
    status: 200,
    description: 'Assignment found',
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Update assignment data' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiResponse({ status: 200, description: 'Assignment updated' })
  update(@Param('id') id: string, @Body() dto: UpdateAssignmentDto) {
    return this.assignmentsService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Delete assignment' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiResponse({ status: 200, description: 'Assignment deleted' })
  remove(@Param('id') id: string) {
    return this.assignmentsService.remove(+id);
  }
}

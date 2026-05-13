import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
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

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Create a new group (coach only)' })
  @ApiResponse({ status: 201, description: 'Group created successfully' })
  @ApiResponse({ status: 403, description: 'Access allowed only for coaches' })
  create(@Body() dto: CreateGroupDto, @Request() req) {
    const coachId = req.user.userId;
    return this.groupsService.create(dto, coachId);
  }

  @Get()
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Get all groups created by coach' })
  @ApiResponse({
    status: 200,
    description: 'List of groups retrieved successfully',
  })
  findAll(@Request() req) {
    const coachId = req.user.userId;
    return this.groupsService.findAll(coachId);
  }

  @Get(':id')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Get group details with members' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Group found' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findOne(id);
  }

  @Post(':id/members/:studentId')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Add a student to a group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 201, description: 'Student added to group' })
  addMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.groupsService.addMember(id, studentId);
  }

  @Delete(':id/members/:studentId')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Remove a student from a group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Student removed from group' })
  removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.groupsService.removeMember(id, studentId);
  }

  @Delete(':id')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Delete a group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Group deleted successfully' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.remove(id);
  }
}

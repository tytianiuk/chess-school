import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'A list of all students' })
  getAll() {
    return this.studentsService.findAllStudents();
  }

  @Get('unassigned')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'A list of unassigned students' })
  getUnassigned() {
    return this.studentsService.findUnassignedStudents();
  }

  @Get('my-students')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'A list of my students' })
  getMyStudents(@Request() req) {
    return this.studentsService.getMyStudents(req.user.userId);
  }

  @Patch('assign/:studentId')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Assign a student to yourself' })
  @ApiResponse({
    status: 200,
    description: 'Student successfully added to your group',
  })
  assignStudent(@Param('studentId') studentId: string, @Request() req) {
    return this.studentsService.assignStudentToCoach(
      req.user.userId,
      +studentId,
    );
  }

  @Patch('unassign/:studentId')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Unassign a student from yourself' })
  @ApiResponse({ status: 200, description: 'Student successfully unassigned' })
  async unassignStudent(@Param('studentId') studentId: string, @Request() req) {
    return this.studentsService.unassignStudent(req.user.userId, +studentId);
  }
}

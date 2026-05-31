import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
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
  @ApiOperation({ summary: 'A list of unassigned students with search' })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or email',
  })
  getUnassigned(@Query('search') search?: string) {
    return this.studentsService.findUnassignedStudents(search);
  }

  @Get('my-students')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'A list of my students with search filtration' })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by student name or email',
  })
  getMyStudents(@Request() req: any, @Query('search') search?: string) {
    const coachId = req.user.userId;
    return this.studentsService.getMyStudents(coachId, search);
  }

  @Patch('assign/:studentId')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Assign a student to yourself' })
  @ApiResponse({
    status: 200,
    description: 'Student successfully added to your group',
  })
  assignStudent(@Param('studentId') studentId: string, @Request() req: any) {
    const coachId = req.user.userId;

    return this.studentsService.assignStudentToCoach(coachId, +studentId);
  }

  @Patch('unassign/:studentId')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Unassign a student from yourself' })
  @ApiResponse({ status: 200, description: 'Student successfully unassigned' })
  async unassignStudent(@Param('studentId') studentId: string, @Request() req) {
    return this.studentsService.unassignStudent(req.user.userId, +studentId);
  }
}

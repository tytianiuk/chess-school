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
import { StudentProgressService } from './student-progress.service';
import { CreateStudentProgressDto } from './dto/create-student-progress.dto';
import { Role } from '.prisma/client/edge';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { MakeMoveDto } from './dto/make-move.dto';
import { ReviewAssignmentDto } from './dto/review-assignment.dto';

@ApiBearerAuth()
@Controller('student-progress')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentProgressController {
  constructor(private readonly progressService: StudentProgressService) {}

  @Roles(Role.COACH)
  @Post('assign')
  @ApiOperation({ summary: 'Assign task to student (coach only)' })
  @ApiResponse({ status: 201, description: 'Task assigned successfully' })
  assign(@Body() dto: CreateStudentProgressDto, @Request() req) {
    return this.progressService.assignToStudent(dto, req.user.userId);
  }

  @Roles(Role.STUDENT)
  @Get('my-assignments')
  @ApiOperation({ summary: 'Get my assignments (student only)' })
  @ApiResponse({
    status: 200,
    description: 'Assignments retrieved successfully',
  })
  getMyAssignments(@Request() req) {
    return this.progressService.findByStudent(req.user.userId);
  }

  @Roles(Role.STUDENT)
  @Patch(':id/move')
  @ApiOperation({ summary: 'Make a move in the task (student only)' })
  @ApiParam({
    name: 'id',
    description: 'ID of the progress record (StudentProgress)',
  })
  @ApiBody({ type: MakeMoveDto })
  @ApiResponse({
    status: 200,
    description: 'Move processed successfully',
  })
  async makeMove(@Param('id') id: string, @Body() body: MakeMoveDto) {
    return this.progressService.handleMove(+id, body.puzzleId, body.move);
  }

  @Roles(Role.COACH)
  @Patch(':id/review')
  @ApiOperation({ summary: 'Review assignment (coach only)' })
  @ApiParam({
    name: 'id',
    description: 'ID of the progress record (StudentProgress)',
  })
  @ApiBody({ type: ReviewAssignmentDto })
  @ApiResponse({
    status: 200,
    description: 'Assignment reviewed successfully',
  })
  async review(@Param('id') id: string, @Body() body: ReviewAssignmentDto) {
    return this.progressService.reviewAssignment(
      +id,
      body.status,
      body.comment,
    );
  }

  @Roles(Role.COACH)
  @Delete(':id/unassign')
  @ApiOperation({ summary: 'Unassign assignment (coach only)' })
  @ApiParam({
    name: 'id',
    description: 'ID of the progress record (StudentProgress)',
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment unassigned successfully',
  })
  remove(@Param('id') id: string) {
    return this.progressService.unassign(+id);
  }
}

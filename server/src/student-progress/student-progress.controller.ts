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
import { ProgressStatus, Role } from '.prisma/client/edge';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('student-progress')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentProgressController {
  constructor(private readonly progressService: StudentProgressService) {}

  @Roles(Role.COACH)
  @Post('assign')
  assign(@Body() dto: CreateStudentProgressDto) {
    return this.progressService.assignToStudent(dto);
  }

  @Roles(Role.STUDENT)
  @Get('my-assignments')
  getMyAssignments(@Request() req) {
    return this.progressService.findByStudent(req.user.userId);
  }

  @Roles(Role.STUDENT)
  @Patch(':id/move')
  async makeMove(
    @Param('id') id: string,
    @Body() body: { puzzleId: number; move: string },
  ) {
    return this.progressService.handleMove(+id, body.puzzleId, body.move);
  }

  @Roles(Role.COACH)
  @Patch(':id/review')
  async review(
    @Param('id') id: string,
    @Body() body: { status: ProgressStatus; comment?: string },
  ) {
    return this.progressService.reviewAssignment(
      +id,
      body.status,
      body.comment,
    );
  }

  @Roles(Role.COACH)
  @Delete(':id/unassign')
  remove(@Param('id') id: string) {
    return this.progressService.unassign(+id);
  }
}

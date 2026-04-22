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
  @Get('my-assignments')
  @Roles(Role.STUDENT)
  getMyAssignments(@Request() req) {
    return this.progressService.findByStudent(req.user.userId);
  }

  @Patch(':id/status')
  @Roles(Role.STUDENT)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ProgressStatus,
  ) {
    return this.progressService.updateStatus(+id, status);
  }

  @Delete(':id/unassign')
  @Roles(Role.COACH)
  remove(@Param('id') id: string) {
    return this.progressService.unassign(+id);
  }
}

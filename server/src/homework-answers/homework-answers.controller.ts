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
  ParseIntPipe,
} from '@nestjs/common';
import { HomeworkAnswersService } from './homework-answers.service';
import { CreateHomeworkAnswerDto } from './dto/create-homework-answer.dto';
import { MakeMoveDto } from './dto/make-move.dto';
import { ReviewHomeworkDto } from './dto/review-homework.dto';
import { Role } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateAttemptStatusDto } from './dto/update-attempt-status.dtp';

@ApiTags('Homework Answers')
@ApiBearerAuth()
@Controller('homework-answers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HomeworkAnswersController {
  constructor(
    private readonly homeworkAnswersService: HomeworkAnswersService,
  ) {}

  @Post('assign')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Assign homework to student (coach only)' })
  @ApiResponse({ status: 201, description: 'Homework assigned successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Homework not found' })
  assign(@Body() dto: CreateHomeworkAnswerDto, @Request() req) {
    return this.homeworkAnswersService.assignToStudent(dto, req.user.userId);
  }

  @Get('homework/:homeworkId')
  @Roles(Role.COACH)
  @ApiOperation({
    summary: 'Get all student answers for a specific homework (coach only)',
  })
  @ApiParam({ name: 'homeworkId', description: 'ID of the homework' })
  @ApiResponse({
    status: 200,
    description: 'List of answers retrieved successfully',
  })
  async getAnswersForHomework(
    @Param('homeworkId', ParseIntPipe) homeworkId: number,
  ) {
    return this.homeworkAnswersService.findByHomework(homeworkId);
  }

  @Get('homework/:homeworkId/student/:studentId')
  @Roles(Role.COACH)
  @ApiOperation({
    summary:
      'Get a specific student answer for a specific homework (coach only)',
  })
  @ApiParam({ name: 'homeworkId', description: 'ID of the homework' })
  @ApiParam({ name: 'studentId', description: 'ID of the student' })
  @ApiResponse({
    status: 200,
    description: 'Student homework answer retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Answer not found' })
  async getStudentAnswer(
    @Param('homeworkId', ParseIntPipe) homeworkId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.homeworkAnswersService.findByHomeworkAndStudent(
      homeworkId,
      studentId,
    );
  }

  @Get('my-homeworks')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get my assigned homeworks (student only)' })
  @ApiResponse({ status: 200, description: 'Homeworks retrieved successfully' })
  getMyHomeworks(@Request() req) {
    return this.homeworkAnswersService.findByStudent(req.user.userId);
  }

  @Get('homework/:homeworkId/my-answer')
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary:
      'Get details of a specific homework for currently logged in student (student only)',
  })
  @ApiParam({ name: 'homeworkId', description: 'ID of the homework' })
  @ApiResponse({
    status: 200,
    description: 'Homework status retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Answer not found' })
  async getMyHomeworkDetail(
    @Param('homeworkId', ParseIntPipe) homeworkId: number,
    @Request() req,
  ) {
    const studentId = req.user.userId;
    return this.homeworkAnswersService.findByHomeworkAndStudent(
      homeworkId,
      studentId,
    );
  }

  @Patch('attempts/:id/status')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Change status of a specific attempt (coach only)' })
  updateAttemptStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAttemptStatusDto,
  ) {
    return this.homeworkAnswersService.updateAttemptStatus(+id, dto);
  }

  @Patch(':id/move')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Make a move in a puzzle (student only)' })
  @ApiParam({
    name: 'id',
    description: 'ID of the HomeworkAnswer record',
  })
  @ApiBody({ type: MakeMoveDto })
  @ApiResponse({ status: 200, description: 'Move processed successfully' })
  @ApiResponse({ status: 404, description: 'HomeworkAnswer not found' })
  async makeMove(@Param('id') id: string, @Body() body: MakeMoveDto) {
    return this.homeworkAnswersService.handleMove(
      +id,
      body.homeworkPuzzleId,
      body.move,
    );
  }

  @Patch(':id/review')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Review homework answer (coach only)' })
  @ApiParam({
    name: 'id',
    description: 'ID of the HomeworkAnswer record',
  })
  @ApiBody({ type: ReviewHomeworkDto })
  @ApiResponse({ status: 200, description: 'Homework reviewed successfully' })
  @ApiResponse({ status: 404, description: 'HomeworkAnswer not found' })
  async review(@Param('id') id: string, @Body() body: ReviewHomeworkDto) {
    return this.homeworkAnswersService.reviewHomework(
      +id,
      body.status,
      body.comment,
      body.score,
    );
  }

  @Get(':id/puzzle-state/:homeworkPuzzleId')
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: 'Get current state of a puzzle attempt (student only)',
  })
  @ApiParam({ name: 'id', description: 'HomeworkAnswer ID' })
  @ApiParam({ name: 'homeworkPuzzleId', description: 'HomeworkPuzzle ID' })
  @ApiResponse({ status: 200, description: 'Puzzle state retrieved' })
  async getPuzzleState(
    @Param('id') id: string,
    @Param('homeworkPuzzleId') homeworkPuzzleId: string,
  ) {
    return this.homeworkAnswersService.getPuzzleState(+id, +homeworkPuzzleId);
  }

  @Delete(':id/unassign')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Unassign homework from student (coach only)' })
  @ApiParam({
    name: 'id',
    description: 'ID of the HomeworkAnswer record',
  })
  @ApiResponse({ status: 200, description: 'Homework unassigned successfully' })
  remove(@Param('id') id: string) {
    return this.homeworkAnswersService.unassign(+id);
  }
}

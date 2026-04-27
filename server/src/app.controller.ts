import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Check system status' })
  @ApiResponse({
    status: 200,
    description: 'System is running stable',
    schema: {
      example: {
        name: 'Chess School API',
        status: 'OK',
        timestamp: '2024-05-20T12:00:00.000Z',
        documentation: '/api',
      },
    },
  })
  getHello() {
    return this.appService.getSystemStatus();
  }
}

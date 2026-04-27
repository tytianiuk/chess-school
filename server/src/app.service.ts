import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getSystemStatus() {
    return {
      name: 'Chess School API',
      status: 'OK',
      timestamp: new Date().toISOString(),
      documentation: '/api',
    };
  }
}

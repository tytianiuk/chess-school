import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { PuzzlesModule } from './puzzles/puzzles.module';

@Module({
  imports: [PrismaModule, AuthModule, PuzzlesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

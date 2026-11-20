import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AccountModule } from './account/account.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    AuthModule, 
    PrismaModule, 
    AccountModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

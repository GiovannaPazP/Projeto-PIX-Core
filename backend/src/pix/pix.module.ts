import { Module } from '@nestjs/common';
import { PixController } from './pix.controller.js';
import { PixService } from './pix.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule
  ],
  controllers: [PixController],
  providers: [PixService]
})
export class PixModule {}

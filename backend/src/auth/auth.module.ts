import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard.js';

@Module({
  imports: [
    PrismaModule, 
    JwtModule.registerAsync({
      inject: [ConfigService],
      //função que utiliza a instancia para produzir as configurações do JWT
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {expiresIn: '10m'},
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtModule, JwtAuthGuard]
})
export class AuthModule {}

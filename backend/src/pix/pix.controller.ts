import { Body, Req, Controller, Post, UseGuards, Headers, BadRequestException, Get } from '@nestjs/common';
import { PixService } from './pix.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard.js';
import { CreatePixKeyDto } from './dto/create-pix-key.dto/create-pix-key.dto.js';
import { TransferPixDto } from './dto/transfer-pix.dto/transfer-pix.dto.js';
import { isUUID } from 'class-validator';

@Controller('pix')
export class PixController {
    constructor(private readonly pixService: PixService){}

    @Post('keys')
    @UseGuards(JwtAuthGuard)
    createPixKey(
        @Req() request: {user: {sub: number}},
        @Body() data: CreatePixKeyDto
    ){
        const userId = request.user.sub;
        return this.pixService.createPixKey(userId, data.keyType, data.keyValue)
    }

    @Post('transfer')
    @UseGuards(JwtAuthGuard)
    transferPix(
        @Req() request: {user: {sub: number}},
        @Headers('idempotency-key') idempotencyKey: string | undefined,
        @Body() data: TransferPixDto
    ){
        if (!idempotencyKey || !isUUID(idempotencyKey, '4')) {
            throw new BadRequestException('Idempotency-Key inválida ou ausente.');
        }

        const userId = request.user.sub;
        return this.pixService.transferPix(userId, idempotencyKey, data.pixKeyReceiver, data.amount)
    }

    @Get('transfers')
    @UseGuards(JwtAuthGuard)
    getTransfers(
        @Req() request: {user: {sub: number}}
    ){
        const userId = request.user.sub;
        return this.pixService.getTransfers(userId)
    }
}

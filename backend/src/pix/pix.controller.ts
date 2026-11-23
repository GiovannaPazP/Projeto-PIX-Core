import { Body, Req, Controller, Post, UseGuards } from '@nestjs/common';
import { PixService } from './pix.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard.js';
import { CreatePixKeyDto } from './dto/create-pix-key.dto/create-pix-key.dto.js';

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
}

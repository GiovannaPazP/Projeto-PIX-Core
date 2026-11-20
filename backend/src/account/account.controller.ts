import { Controller, Req, Get, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard.js';

@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService){};
    
    @Get('balance')
    @UseGuards(JwtAuthGuard)
    // req acesso ao objeto da requisição http
    // {user: ...} são as propriedades que podemos acessar
    getBalance(@Req() request: {user: {sub: number}}){
        const userId = request.user.sub;
        return this.accountService.getBalance(userId);
    }

}

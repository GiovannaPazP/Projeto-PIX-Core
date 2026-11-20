import { Controller, Body, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto/login.dto.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('login')
    @HttpCode(HttpStatus.OK) //alterando a resposta de sucesso para 200
    //body acesso ao corpo da requisição
    signIn(@Body() data: LoginDto){
        return this.authService.signIn(data.cpf, data.pass);
    }

}

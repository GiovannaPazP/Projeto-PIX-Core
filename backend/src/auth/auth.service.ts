import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { compare } from 'bcrypt-ts';
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private jwtService: JwtService
    ){}

    async signIn(cpf: string, pass: string): Promise<{ access_token: string }>{
        const user = await this.prisma.user.findUnique({
            where: {cpf:cpf},
        });

        // usuário não existe ou a senha foi inválida
        if(!user || !(await compare(pass, user.hashedPassword))){
            // responde a request http com 401 - não autorizado
            throw new UnauthorizedException('Credenciais inválidas');
        }

        //informações incluidas no JWT
        const payload = { sub: user.id};
        return{
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}

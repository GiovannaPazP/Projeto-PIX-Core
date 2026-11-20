import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AccountService {
    constructor(
        private readonly prisma: PrismaService,
    ){}

    async getBalance(userId: number){
        const user = await this.prisma.user.findUnique({
            where: {id: userId},
            select: {
                cpf: true,
                balance: true
            }
        });

        if(!user){
            throw new NotFoundException('Usuário não encontrado.');
        }

        return user;
    }

}

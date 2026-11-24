import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { cpf } from 'cpf-cnpj-validator';
import { isEmail } from 'class-validator';
import { randomUUID } from 'node:crypto';

@Injectable()
export class PixService {
    constructor(
        private readonly prisma: PrismaService,
    ){}


    //criação de chave
    pixRandomKey(){
        // 36 caracteres gerados aleatoriamente
        return randomUUID(); 
    }

    pixKeyValidation(keyType: string, keyValue: string): void{
        if(keyType === 'CPF'){
            //verifica se tem 11 digítos
            if(!/^\d{11}$/.test(keyValue) || !cpf.isValid(keyValue)){
                throw new BadRequestException('CPF inválido.');
            }
        }
        else if(keyType === 'EMAIL'){
            if(!isEmail(keyValue)){
                throw new BadRequestException('Email inválido.');
            }
        }
    }

    async createPixKey(userId: number, keyType: string, keyValue?: string){
        
        if(keyType === 'ALEATORIA'){
            keyValue = this.pixRandomKey()
        }
        else{
            //estou supondo/garantindo que a criação de uma nova chave sempre passa pelo DTO
            this.pixKeyValidation(keyType, keyValue!) 
        }
        
        try{
            return await this.prisma.pixKey.create({
                data:{
                    keyType: keyType,
                    keyValue: keyValue!,
                    user: { //relação enter PixKey e User
                        connect:{id: userId} //tenta associar o userId a um existente
                    }
                }
            });
        } catch(error){
            if(error instanceof Prisma.PrismaClientKnownRequestError){
                // erro de conflito, violação da unicidade
                if(error.code === 'P2002'){
                    throw new ConflictException('Chave Pix já cadastrada.');
                }
                if(error.code === 'P2025'){
                    throw new NotFoundException('Usuário não encontrado.');
                }
            }
            // para caso seja um erro não identificado
            throw error;
        }
    }


    //transferencia
    async findUserId(pixKey: string): Promise<number>{
        const key = await this.prisma.pixKey.findUnique({
            where: {keyValue: pixKey},
            select: {
                userId: true
            }
        });

        if(!key){
            throw new NotFoundException('Chave pix não encontrada.');
        }

        return key.userId;
    }

    async idempotencyVerify(idempotencyKey: string){
        const transfer = await this.prisma.transfer.findUnique({
            where: {idempotencyKey,},
        });

        if(transfer){
            return transfer;
        }

        return;
    }

    async transferPix(userId: number, idempotencyKey: string, pixKeyReceiver: string, amount: string){

        //verificando se houve uma transação anterior com a mesma chave
        const previousTransfer = await this.idempotencyVerify(idempotencyKey);

        if (previousTransfer) {
            //se por algum motivo a transação não pertencer ao remetente atual
            if(previousTransfer.senderId !== userId){
                throw new ConflictException('Chave de idempotência indisponível.');
            }

            return previousTransfer;
        }

        //transformando de string para decimal
        const amountDecimal = new Prisma.Decimal(amount);

        //garantindo que a transferencia é maior que zero
        if (amountDecimal.lte(0)) { //como estamos usando decimal (Prisma), conferimos com função propria
            throw new BadRequestException('O valor deve ser maior que zero.');
        }

        // buscando o id do destinatario
        const receiverId = await this.findUserId(pixKeyReceiver);

        if(receiverId === userId){
            throw new BadRequestException('Não é possível transferir para si mesmo.');
        }

        //realizando a transferência em uma operação atomica (faz debito, credito e registro como um só, ou reverte
        // todos se um deles falhar)
        try{
            return await this.prisma.$transaction(async (tx) => {

                //diminuindo o saldo do remetente
                await tx.user.update({
                    where: {
                        id: userId,
                        // verifica se o saldo atual >= valor enviado
                        balance: { gte: amountDecimal},
                    },
                    data: {
                        balance: { decrement: amountDecimal}
                    }
                });

                //acrescentado o saldo do destinatario
                await tx.user.update({
                    where: {
                        id: receiverId,
                    },
                    data: {
                        balance: { increment: amountDecimal}
                    }
                });

                //registrando a transferencia
                const transfer = await tx.transfer.create({
                    data: {
                        idempotencyKey: idempotencyKey,
                        senderId: userId,
                        receiverId: receiverId,
                        amount: amountDecimal
                    }
                });

                return transfer;
            })
        } catch(error){
            if(
                error instanceof Prisma.PrismaClientKnownRequestError
                && error.code === 'P2025' //registro necessário não encontrado
            ){
                throw new BadRequestException('Saldo insuficiente ou conta indisponível');
            }

            throw error;
        }
    }


    //retornar a lista de transferencias
    async getTransfers(userId: number){
        return this.prisma.transfer.findMany({
            where: {
                OR: [
                    {senderId: userId},
                    {receiverId: userId}
                ]
            }
        });

    }
}

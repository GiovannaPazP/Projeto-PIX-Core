import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { Prisma } from "../src/generated/prisma/browser.js";
import { hash } from "bcrypt-ts";

// enderço do banco na variável ambiente 
const url = process.env.DATABASE_URL;

//verificando se a variavel existe
if ( !url ){
    throw new Error('DATABASE_URL não definida.'); //throw lança exceção
}

// cria o adaptador para a conexão com o arquivo sqlite
const adapter = new PrismaBetterSqlite3({ url });
// cria a instância para inserir os dados
const prisma = new PrismaClient({ adapter });


async function createUser(cpf: string, password: string, balance: string = '1000.00') {
    
    const user = await prisma.user.upsert({ //atualiza user e não cria user já existente
        where: {cpf: cpf},
        update: {},
        create: {
            cpf: cpf,
            hashedPassword: await hash(password, 10), //10 = fator de custo 
            balance: new Prisma.Decimal(balance),
        }
    });
    console.log(`User ${user.id} created successfully.`);

}

async function main() {
    await createUser("58371309007", "12345678");
    await createUser("63523759013", "123abcde", "640.00");
}

main()
    .catch((error) => { // se acontecer erro não tratado enquanto tenta executar
        console.error('Seed failed: ', error);
        process.exitCode=1;
    })
    .finally(async () => { // encerra a conexão com o client, independente de ter ou não erro
        await prisma.$disconnect();
    })
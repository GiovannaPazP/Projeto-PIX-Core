# Projeto-PIX-Core
Desafio Prático — Protótipo de transferências Pix

Simulação de operações Pix, com API em NestJS e interface em Vue 3. O projeto permite autenticar usuários de teste, consultar saldo, cadastrar chaves Pix, realizar transferências e visualizar o histórico de movimentações.


## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Backend | Node.js, TypeScript, NestJS |
| Autenticação | JWT, hash de senhas com bcrypt |
| Banco de dados | SQLite, Prisma ORM e adaptador `better-sqlite3` |
| Frontend | Vue 3, TypeScript, Vite, Vue Router |
| Testes manuais da API | Insomnia (collection versionada em `collections/`) |

## Funcionalidades

- Login com CPF e senha, retornando um JWT.
- Proteção de endpoints no NestJS com JWT.
- Proteção de navegação do Dashboard no Vue Router.
- Consulta de CPF e saldo da conta autenticada.
- Cadastro de chaves Pix dos tipos **CPF**, **EMAIL** e **ALEATORIA** (gerada no backend).
- Transferência Pix por chave do destinatário, com validação de saldo e idempotência.
- Consulta do histórico de transferências.
- Logout, removendo o token da sessão do navegador.

## Estrutura do repositório

```text
.
├── backend/
│   ├── src/                 # Módulos, controllers, services, DTOs e guards
│   ├── prisma/              # Schema, migrações e dados iniciais (seed)
│   ├── .env.example         # Exemplo das variáveis de ambiente
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Login, Dashboard e blocos do Dashboard
│   │   ├── router/          # Rotas e proteção de navegação
│   │   ├── App.vue
│   │   └── main.ts
│   └── package.json
├── collections/             # Collection de testes da API no Insomnia
└── README.md
```

## Pré-requisitos

- Node.js e npm instalados (o desenvolvimento foi feito com Node.js 26).
- Git, para clonar o repositório.
- Não é necessário instalar um servidor de banco de dados: usamos SQLite local.

## Como executar localmente

Os comandos abaixo partem da raiz do repositório clonado.

### 1. Instalar as dependências e preparar o backend**

```bash
cd backend
npm ci
```


Editar `backend/.env` a partir de `backend/.env.example` e configurar os valores para seu ambiente.

| Variável | Finalidade |
| --- | --- |
| `DATABASE_URL` | Caminho/URL de conexão com o arquivo SQLite utilizado pelo Prisma. |
| `JWT_SECRET` | Segredo de assinatura e verificação dos tokens JWT. |


### 2. Preparar banco de dados e Prisma

Ainda dentro de `backend/`:

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

- `migrate dev`: aplica as migrações versionadas ao banco local.
- `generate`: gera o Prisma Client utilizado pelo backend.
- `db seed`: executa o preenchimento inicial para criar as contas fictícias de teste.

É **obrigatório** executar `npx prisma db seed` antes de iniciar os testes, pois ele cria as contas fictícias necessárias para utilizar a aplicação.

> É possível adicionar ou editar as contas fictícias modificando o arquivo `seed.ts` em `backend/prisma`.

### 3. Iniciar o backend
Ainda dentro de `backend/`:

```bash
npm run start:dev
```

A API ficará disponível em **http://localhost:3000**.

### 4. Preparar e iniciar o frontend

Abra outro terminal, a partir da raiz do repositório:

```bash
cd frontend
npm ci
npm run dev
```

Abra **http://localhost:5173/login** no navegador. Após autenticar, a aplicação navega para **`/dashboard`**.

> A interface usa a URL local `http://localhost:3000` nas requisições. Se o backend for executado em outro endereço, atualize as URLs utilizadas nos componentes. O CORS do NestJS está configurado para permitir a origem local `http://localhost:5173`.

## API HTTP

| Método | Rota | Autenticação | Finalidade |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Não | Login com `cpf` e `pass`, retornando `access_token`. |
| `GET` | `/account/balance` | JWT | Consulta CPF e saldo da conta. |
| `POST` | `/pix/keys` | JWT | Cadastra chave Pix. |
| `POST` | `/pix/transfer` | JWT | Realiza transferência com idempotência. |
| `GET` | `/pix/transfers` | JWT | Lista transferências do usuário. |


***
## Sobre a idempotência da transferência:

**Idempotência:** a repetição da mesma operação com a mesma chave deve devolver a transferência já registrada, sem novo débito/crédito. Uma nova operação precisa de um novo UUID. Em caso de resultado incerto (por exemplo, falha de rede), a interface procura conservar a chave para repetir a **mesma** operação. A checagem do backend continua sendo necessária mesmo quando a interface bloqueia envios simultâneos.

O frontend gera um UUID v4 utilizando `crypto.randomUUID()` e o envia no cabeçalho configurado atualmente como:

```http
idempotency-key: <UUID-v4>
```

> Nos testes do insomnia vale notar que, ao reutilizar uma chave de idempotencia temos dois resultados:
> - Recebemos os dados da transferência
> - Recebemos uma exceção tipo conflito (Chave de idempotência indisponível.).
> Isso acontece porque, seguindo o planejamento, ao reutilizar uma chave deve ser retornada os dados da transação e não fazer nenhuma operação de débito/crédito no banco. Porém, colocamos uma etapa de verificação para que ao reutilizar uma chave essa transação seja retornada apenas se quem está reutilizando é o remetente da transação anterior. Assim não acontece, por acaso ou não, de pessoas não autorizadas terem acesso a transações de terceiros.

## Autenticação e segurança

- O Vue armazena o JWT em `sessionStorage` durante a sessão da aba.
- O guard do Vue Router apenas verifica a **presença** do token para controlar a navegação.
- A **validação real** do JWT acontece nos endpoints protegidos do NestJS.
- Um retorno `401` faz o frontend remover o token e redirecionar para `/login`.
- O logout remove o token do navegador.

## Testes manuais

A pasta `collections/` contém uma collection do Insomnia para testar a API. Configure a URL-base `http://localhost:3000` e faça login com uma conta fictícia criada pelo seed para obter o JWT.


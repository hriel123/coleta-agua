# API do Coleta de Água

Servidor que guarda as contas e os registros do site Coleta de Água. Cada conta vê e salva só os próprios dados.

## Stack

- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT (autenticação) + bcrypt (hash de senha)

## Rotas

| Método | Rota | O que faz |
|--------|------|-----------|
| GET | `/health` | Responde `{ ok: true }`. Usada pelo Render para saber se o servidor está no ar |
| POST | `/auth/register` | Cria a conta (`name`, `email`, `password`) |
| POST | `/auth/login` | Devolve o token (`email`, `password`). Vale 30 dias |
| GET | `/auth/me` | Dados da conta logada |
| GET | `/dados` | Configuração dos pontos e todos os dias da conta |
| PUT | `/dados/config` | Salva a configuração dos pontos |
| PUT | `/dados/dias/:data` | Salva um dia (`AAAA-MM-DD`) |
| DELETE | `/dados/dias/:data` | Apaga um dia |
| POST | `/dados/importar` | Importa um backup (`config`, `dias`) |

As rotas de `/dados` exigem o cabeçalho `Authorization: Bearer <token>`.

## Rodar localmente

Na raiz do repositório:

```bash
docker run -d --name coleta-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=coleta -p 5432:5432 postgres:15-alpine
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npm run dev
```

A API sobe em `http://localhost:3001`. Para o site usar essa API, coloque o endereço na tag `<meta name="coleta-api" content="...">` do `index.html`.

## Publicar (Neon + Render, gratuito)

### 1. Banco (Neon)

1. Crie um projeto gratuito em [neon.tech](https://neon.tech), na região **AWS US East (N. Virginia)**.
2. Em **Connection string**, desligue a opção **Pooled connection** e copie o endereço (formato `postgresql://usuario:senha@host/banco?sslmode=require`).

### 2. Servidor (Render)

1. No [Render](https://render.com), clique em **New** > **Blueprint** e escolha o repositório `hriel123/coleta-agua`.
2. O Render lê o `render.yaml` da raiz e cria o serviço `coleta-agua-api`. Ele pede o valor de `DATABASE_URL`: cole o endereço do Neon.
3. O `JWT_SECRET` é gerado sozinho, e o `CORS_ORIGIN` já vem como `https://hriel123.github.io`.
4. Clique em **Apply**. Quando o deploy terminar, abra `https://<nome-do-serviço>.onrender.com/health`. Deve aparecer `{"ok":true}`.

No plano gratuito o servidor dorme depois de 15 minutos sem uso. O primeiro acesso depois disso leva de 30 a 60 segundos. Enquanto isso, o site mostra os dados guardados no aparelho e envia as alterações quando o servidor responde.

### 3. Ligar o login no site

No `index.html`, troque `<meta name="coleta-api" content="">` pelo endereço do serviço, por exemplo `<meta name="coleta-api" content="https://coleta-agua-api.onrender.com">`, e publique.

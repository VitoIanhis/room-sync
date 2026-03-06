# RoomSync – AC1

Projeto acadêmico de sistema web para reserva de salas, dividido em **backend (Node.js + Express + PostgreSQL)** e **frontend (Next.js App Router)**.

## Estrutura de pastas

- `backend/`: API REST (Express, PostgreSQL, JWT).
- `frontend/`: Interface web (Next.js com App Router).

## Pré-requisitos

- Node.js (versão LTS recomendada)
- npm
- PostgreSQL instalado e em execução

## Banco de dados (PostgreSQL)

1. Crie o banco e o usuário (no terminal ou no pgAdmin):

   ```bash
   # No psql ou terminal com cliente PostgreSQL:
   createdb roomsync
   ```

   Ou, conectado ao PostgreSQL:

   ```sql
   CREATE DATABASE roomsync;
   ```

2. Execute o script de criação das tabelas:

   ```bash
   cd backend
   psql -U seu_usuario -d roomsync -f scripts/schema.sql
   ```

   No Windows (prompt do PostgreSQL ou Git Bash), use o caminho completo do `psql` se necessário. Em clientes gráficos (pgAdmin, DBeaver, etc.), abra o arquivo `backend/scripts/schema.sql` e execute o conteúdo no banco `roomsync`.

3. Configure a `DATABASE_URL` no `.env` do backend no formato:

   ```
   DATABASE_URL=postgres://usuario:senha@localhost:5432/roomsync
   ```

O script `backend/scripts/schema.sql` cria as tabelas **usuarios** (id, nome, email, senha_hash, created_at) e **salas** (id, nome, capacidade, descricao, created_at), conforme a modelagem da AC1.

## Como rodar o backend

1. Acesse a pasta do backend:

   ```bash
   cd backend
   ```

2. Crie um arquivo `.env` baseado em `.env.example` e ajuste:

   - `PORT`
   - `DATABASE_URL`
   - `JWT_SECRET`

3. Instale as dependências (já feito uma vez, repetir apenas se necessário):

   ```bash
   npm install
   ```

4. Inicie o servidor:

   ```bash
   npm run dev
   ```

O backend irá subir, por padrão, em `http://localhost:3333`.

## Como rodar o frontend

1. Acesse a pasta do frontend:

   ```bash
   cd frontend
   ```

2. Crie um arquivo `.env.local` baseado em `.env.example` e ajuste:

   - `NEXT_PUBLIC_API_BASE_URL`

3. Instale as dependências (já feito uma vez, repetir apenas se necessário):

   ```bash
   npm install
   ```

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

O frontend irá subir, por padrão, em `http://localhost:3000`.

## Funcionalidades implementadas na AC1

- Cadastro de usuário (`POST /register`)
- Login com JWT (`POST /login`)
- Middleware de autenticação protegendo rotas de salas
- CRUD básico de salas:
  - `GET /salas` (listar salas – requer token)
  - `POST /salas` (criar sala – requer token)
- Frontend com páginas:
  - `/register` – formulário de registro
  - `/login` – formulário de login (salva token)
  - `/dashboard` – rota protegida, acessível apenas logado
  - `/salas` – rota protegida com listagem e criação de salas

> Importante: não há implementação de reservas nesta fase (AC1), apenas cadastro/login e gerenciamento básico de salas.

## Estrutura resumida de pastas

```text
roomsync/
  backend/
    src/
      config/
        database.js
      controllers/
        authController.js
        salaController.js
      middlewares/
        auth.js
      models/
        usuarioModel.js
        salaModel.js
      routes/
        authRoutes.js
        salasRoutes.js
      app.js
    server.js
    .env.example
    scripts/
      schema.sql

  frontend/
    src/
      app/
        layout.js
        page.js
        login/
          page.jsx
        register/
          page.jsx
        dashboard/
          page.jsx
        salas/
          page.jsx
      services/
        api.js
      utils/
        auth.js
    .env.example
```

## Fluxo completo esperado (AC1)

1. Usuário acessa `/register` e realiza o cadastro.
2. Usuário acessa `/login`, informa email/senha e recebe um token JWT.
3. O token é salvo no `localStorage` do navegador.
4. Com o token, o usuário acessa `/dashboard` (rota protegida).
5. Pelo menu, o usuário acessa `/salas`, onde pode:
   - Listar salas cadastradas (requisição `GET /salas` com token).
   - Criar novas salas (requisição `POST /salas` com token).
6. Sem token válido, `/dashboard` e `/salas` redirecionam automaticamente para `/login`.



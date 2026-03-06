-- RoomSync AC1 - Schema do banco de dados PostgreSQL
-- Execute este script após criar o banco (ex: createdb roomsync)

-- Tabela de usuários (cadastro e login)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de salas (CRUD básico na AC1; reservas em entregas futuras)
CREATE TABLE IF NOT EXISTS salas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  capacidade INTEGER NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para buscas por email no login
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- RoomSync - Schema do banco de dados PostgreSQL
-- Execute este script após criar o banco (ex: createdb roomsync)

-- Tabela de usuários (cadastro e login)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de salas (CRUD básico; reservas em entregas futuras)
CREATE TABLE IF NOT EXISTS salas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  capacidade INTEGER NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para buscas por email no login
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Tabela de reservas
CREATE TABLE IF NOT EXISTS reservas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  sala_id INTEGER NOT NULL,
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE CASCADE
);

-- Índice para consultas de disponibilidade por sala e data
CREATE INDEX IF NOT EXISTS idx_reservas_sala_data ON reservas (sala_id, data);

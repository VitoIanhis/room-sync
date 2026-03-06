const { query } = require('../config/database');

/**
 * Insere um novo usuário. A senha já deve vir em hash.
 * Retorna o usuário criado SEM senha_hash (para resposta da API).
 */
async function create(nome, email, senhaHash) {
  const res = await query(
    `INSERT INTO usuarios (nome, email, senha_hash)
     VALUES ($1, $2, $3)
     RETURNING id, nome, email, created_at`,
    [nome, email, senhaHash]
  );
  return res.rows[0];
}

/**
 * Busca usuário por email. Retorna a linha completa (incluindo senha_hash)
 * para uso no login (comparação com bcrypt). Não expor senha_hash em respostas.
 */
async function findByEmail(email) {
  const res = await query(
    'SELECT id, nome, email, senha_hash, created_at FROM usuarios WHERE email = $1',
    [email]
  );
  return res.rows[0] || null;
}

/**
 * Busca usuário por id (sem senha). Útil após validar JWT.
 */
async function findById(id) {
  const res = await query(
    'SELECT id, nome, email, created_at FROM usuarios WHERE id = $1',
    [id]
  );
  return res.rows[0] || null;
}

module.exports = { create, findByEmail, findById };

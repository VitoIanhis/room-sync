const { query } = require('../config/database');

/**
 * Insere uma nova sala e retorna os dados criados.
 */
async function create(nome, capacidade, descricao) {
  const res = await query(
    `INSERT INTO salas (nome, capacidade, descricao)
     VALUES ($1, $2, $3)
     RETURNING id, nome, capacidade, descricao, created_at`,
    [nome, capacidade, descricao ?? null]
  );
  return res.rows[0];
}

/**
 * Lista todas as salas, ordenadas por nome.
 */
async function findAll() {
  const res = await query(
    'SELECT id, nome, capacidade, descricao, created_at FROM salas ORDER BY nome'
  );
  return res.rows;
}

module.exports = { create, findAll };

const { query } = require('../config/database');

/**
 * Verifica se já existe uma reserva idêntica (mesmo sala_id, data, hora_inicio e hora_fim).
 */
async function findExact(sala_id, data, hora_inicio, hora_fim) {
  const res = await query(
    `SELECT id FROM reservas
     WHERE sala_id = $1
       AND data = $2
       AND hora_inicio = $3
       AND hora_fim = $4
     LIMIT 1`,
    [sala_id, data, hora_inicio, hora_fim]
  );
  return res.rows[0] ?? null;
}

/**
 * Insere uma nova reserva e retorna os dados criados.
 */
async function create(usuario_id, sala_id, data, hora_inicio, hora_fim) {
  const res = await query(
    `INSERT INTO reservas (usuario_id, sala_id, data, hora_inicio, hora_fim)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, usuario_id, sala_id, data, hora_inicio, hora_fim, created_at`,
    [usuario_id, sala_id, data, hora_inicio, hora_fim]
  );
  return res.rows[0];
}

/**
 * Lista todas as reservas de um usuário, ordenadas por data e hora de início.
 */
async function findByUser(usuario_id) {
  const res = await query(
    `SELECT r.id, r.sala_id, s.nome AS sala_nome, r.data, r.hora_inicio, r.hora_fim, r.created_at
     FROM reservas r
     JOIN salas s ON s.id = r.sala_id
     WHERE r.usuario_id = $1
     ORDER BY r.data, r.hora_inicio`,
    [usuario_id]
  );
  return res.rows;
}

module.exports = { findExact, create, findByUser };

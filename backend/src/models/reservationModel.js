const { query } = require('../config/database');

async function findConflict(sala_id, data, hora_inicio, hora_fim) {
  const res = await query(
    `SELECT id FROM reservas
     WHERE sala_id = $1
       AND data = $2
       AND ($3 < hora_fim AND $4 > hora_inicio)
     LIMIT 1`,
    [sala_id, data, hora_inicio, hora_fim]
  );
  return res.rows[0] ?? null;
}

async function create(usuario_id, sala_id, data, hora_inicio, hora_fim) {
  const res = await query(
    `INSERT INTO reservas (usuario_id, sala_id, data, hora_inicio, hora_fim)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, usuario_id, sala_id, data, hora_inicio, hora_fim, created_at`,
    [usuario_id, sala_id, data, hora_inicio, hora_fim]
  );
  return res.rows[0];
}

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

async function deleteById(id, usuario_id) {
  const res = await query(
    `DELETE FROM reservas
     WHERE id = $1 AND usuario_id = $2
     RETURNING id`,
    [id, usuario_id]
  );
  return res.rows[0] ?? null;
}

module.exports = { findConflict, create, findByUser, deleteById };

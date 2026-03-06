const { Pool } = require('pg');

/**
 * Pool de conexões com o PostgreSQL.
 * Usa a variável DATABASE_URL do .env (ex: postgres://user:senha@localhost:5432/roomsync)
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Log de erro em conexões ociosas (útil em desenvolvimento)
pool.on('error', (err) => {
  console.error('Erro inesperado no pool do PostgreSQL:', err.message);
});

/**
 * Executa uma query usando o pool.
 * @param {string} text - SQL (pode usar $1, $2 para parâmetros)
 * @param {Array} params - Parâmetros da query
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test' && duration > 100) {
      console.warn('Query lenta (ms):', duration, { text: text.substring(0, 80) });
    }
    return res;
  } catch (err) {
    console.error('Erro na query:', { text: text.substring(0, 80), err: err.message });
    throw err;
  }
}

/**
 * Obtém um cliente do pool para transações (begin/commit/rollback).
 * Lembre-se de chamar client.release() ao final.
 */
function getClient() {
  return pool.connect();
}

module.exports = { pool, query, getClient };

const salaModel = require('../models/salaModel');

/**
 * POST /salas (protegido)
 * Body: { nome, capacidade, descricao? }
 * Cria uma nova sala.
 */
async function createSala(req, res) {
  try {
    const { nome, capacidade, descricao } = req.body;

    if (!nome || capacidade === undefined || capacidade === null) {
      return res.status(400).json({
        erro: 'Campos obrigatórios: nome e capacidade',
      });
    }

    const nomeTrim = String(nome).trim();
    if (nomeTrim.length < 2) {
      return res.status(400).json({ erro: 'Nome da sala deve ter ao menos 2 caracteres.' });
    }

    const cap = parseInt(capacidade, 10);
    if (Number.isNaN(cap) || cap < 1) {
      return res.status(400).json({ erro: 'Capacidade deve ser um número inteiro maior que zero.' });
    }

    const desc = descricao != null ? String(descricao).trim() : null;

    const sala = await salaModel.create(nomeTrim, cap, desc || null);
    return res.status(201).json({
      mensagem: 'Sala criada com sucesso.',
      sala,
    });
  } catch (err) {
    console.error('Erro ao criar sala:', err);
    return res.status(500).json({ erro: 'Erro ao criar sala.' });
  }
}

/**
 * GET /salas (protegido)
 * Retorna a listagem de todas as salas.
 */
async function listSalas(req, res) {
  try {
    const salas = await salaModel.findAll();
    return res.status(200).json({ salas });
  } catch (err) {
    console.error('Erro ao listar salas:', err);
    return res.status(500).json({ erro: 'Erro ao listar salas.' });
  }
}

module.exports = { createSala, listSalas };

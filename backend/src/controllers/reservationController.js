const reservationModel = require('../models/reservationModel');

/**
 * POST /reservas (protegido)
 * Body: { sala_id, data, hora_inicio, hora_fim }
 * Cria uma nova reserva para o usuário autenticado.
 */
async function createReserva(req, res) {
  try {
    const usuario_id = req.user.id;
    const { sala_id, data, hora_inicio, hora_fim } = req.body;

    if (!sala_id || !data || !hora_inicio || !hora_fim) {
      return res.status(400).json({
        erro: 'Campos obrigatórios: sala_id, data, hora_inicio, hora_fim',
      });
    }

    if (hora_fim <= hora_inicio) {
      return res.status(400).json({ erro: 'hora_fim deve ser maior que hora_inicio.' });
    }

    const conflito = await reservationModel.findConflict(sala_id, data, hora_inicio, hora_fim);
    if (conflito) {
      return res.status(400).json({ erro: 'Conflito de horário: já existe uma reserva para essa sala nesse intervalo.' });
    }

    const reserva = await reservationModel.create(usuario_id, sala_id, data, hora_inicio, hora_fim);
    return res.status(201).json({ mensagem: 'Reserva criada com sucesso.', reserva });
  } catch (err) {
    console.error('Erro ao criar reserva:', err);
    return res.status(500).json({ erro: 'Erro ao criar reserva.' });
  }
}

/**
 * GET /reservas (protegido)
 * Retorna apenas as reservas do usuário autenticado.
 */
async function listReservas(req, res) {
  try {
    const usuario_id = req.user.id;
    const reservas = await reservationModel.findByUser(usuario_id);
    return res.status(200).json({ reservas });
  } catch (err) {
    console.error('Erro ao listar reservas:', err);
    return res.status(500).json({ erro: 'Erro ao listar reservas.' });
  }
}

async function deleteReserva(req, res) {
  try {
    const usuario_id = req.user.id;
    const { id } = req.params;

    const deletada = await reservationModel.deleteById(id, usuario_id);
    if (!deletada) {
      return res.status(404).json({ erro: 'Reserva não encontrada ou sem permissão para excluí-la.' });
    }

    return res.status(200).json({ mensagem: 'Reserva excluída com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir reserva:', err);
    return res.status(500).json({ erro: 'Erro ao excluir reserva.' });
  }
}

module.exports = { createReserva, listReservas, deleteReserva };

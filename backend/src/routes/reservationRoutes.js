const express = require('express');
const auth = require('../middlewares/auth');
const reservationController = require('../controllers/reservationController');

const router = express.Router();

// Todas as rotas de reservas exigem autenticação (JWT)
router.post('/', auth, reservationController.createReserva);
router.get('/', auth, reservationController.listReservas);
router.delete('/:id', auth, reservationController.deleteReserva);

module.exports = router;

const express = require('express');
const auth = require('../middlewares/auth');
const reservationController = require('../controllers/reservationController');

const router = express.Router();

// Todas as rotas de reservas exigem autenticação (JWT)
router.post('/', auth, reservationController.createReserva);
router.get('/', auth, reservationController.listReservas);

module.exports = router;

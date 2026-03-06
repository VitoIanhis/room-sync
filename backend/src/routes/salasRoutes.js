const express = require('express');
const auth = require('../middlewares/auth');
const salaController = require('../controllers/salaController');

const router = express.Router();

// Todas as rotas de salas exigem autenticação (JWT)
router.get('/', auth, salaController.listSalas);
router.post('/', auth, salaController.createSala);

module.exports = router;

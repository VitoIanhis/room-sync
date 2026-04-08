const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const salasRoutes = require('./routes/salasRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

app.use('/', authRoutes);
app.use('/salas', salasRoutes);
app.use('/reservas', reservationRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'RoomSync API backend iniciado' });
});

module.exports = app;


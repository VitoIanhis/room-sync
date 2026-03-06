const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const salasRoutes = require('./routes/salasRoutes');

app.use('/', authRoutes);
app.use('/salas', salasRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'RoomSync API - AC1 backend iniciado' });
});

module.exports = app;


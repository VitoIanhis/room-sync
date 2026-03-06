const http = require('http');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente em modo silencioso (sem logs do dotenv)
dotenv.config({ quiet: true });

const app = require('./src/app');

const PORT = process.env.PORT || 3333;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`RoomSync backend rodando na porta ${PORT}`);
});


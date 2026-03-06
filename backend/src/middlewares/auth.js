const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticação: valida o JWT no header Authorization (Bearer <token>).
 * Em caso de sucesso, define req.user com { id, email } e chama next().
 * Em caso de erro (token ausente/inválido/expirado), responde com 401.
 */
function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação não informado.' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('JWT_SECRET não configurado no .env');
    return res.status(500).json({ erro: 'Configuração do servidor incompleta.' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ erro: 'Token expirado. Faça login novamente.' });
    }
    return res.status(401).json({ erro: 'Token inválido.' });
  }
}

module.exports = auth;

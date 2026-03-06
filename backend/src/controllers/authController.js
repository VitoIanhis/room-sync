const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');

/** Número de rounds do bcrypt (custo do hash) */
const SALT_ROUNDS = 10;

/**
 * POST /register
 * Body: { nome, email, senha }
 * Criptografa a senha, insere usuário e retorna dados sem senha.
 */
async function register(req, res) {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: 'Campos obrigatórios: nome, email e senha',
      });
    }

    const emailTrim = String(email).trim().toLowerCase();
    const nomeTrim = String(nome).trim();

    if (nomeTrim.length < 2) {
      return res.status(400).json({ erro: 'Nome deve ter ao menos 2 caracteres.' });
    }
    if (senha.length < 6) {
      return res.status(400).json({ erro: 'Senha deve ter ao menos 6 caracteres.' });
    }

    const existente = await usuarioModel.findByEmail(emailTrim);
    if (existente) {
      return res.status(409).json({ erro: 'Este email já está cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    const usuario = await usuarioModel.create(nomeTrim, emailTrim, senhaHash);

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso.',
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });
  } catch (err) {
    console.error('Erro no register:', err);
    return res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
  }
}

/**
 * POST /login
 * Body: { email, senha }
 * Compara senha com bcrypt, gera JWT e retorna token + dados do usuário (sem senha).
 */
async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        erro: 'Campos obrigatórios: email e senha',
      });
    }

    const emailTrim = String(email).trim().toLowerCase();
    const usuario = await usuarioModel.findByEmail(emailTrim);

    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }

    const senhaOk = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaOk) {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET não configurado no .env');
      return res.status(500).json({ erro: 'Configuração do servidor incompleta.' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso.',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ erro: 'Erro ao fazer login.' });
  }
}

module.exports = { register, login };

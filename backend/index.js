const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const app = express();

const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// --- ROTAS DE TESTE ---

app.get('/health', (req, res) => {
  res.json({
    status: 'Operacional',
    database: 'Conectado',
    timestamp: new Date(),
  });
});

// --- ROTAS DE AUTENTICAÇÃO ---

app.post('/auth/register', async (req, res) => {
  const { name, email, password, family_id } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        family_id: family_id,
      },
    });
    res
      .status(201)
      .json({ message: 'Usuário criado com sucesso!', userId: user.id });
  } catch (error) {
    console.error('ERRO DETALHADO:', error);
    res.status(500).json({
      error: 'Erro ao criar usuário.',
      details: error.message,
      code: error.code,
    });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password_hash))) {
      const token = jwt.sign(
        { userId: user.id, familyId: user.family_id, userName: user.name },
        JWT_SECRET,
        { expiresIn: '30d' },
      );
      res.json({
        token,
        user: { id: user.id, name: user.name, familyId: user.family_id },
      });
    } else {
      res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// --- ROTAS DE TRANSAÇÕES ---

// Alterar uma transação
app.put('/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { description, amount, type, date, category_id, currency_id, is_paid } =
    req.body;

  try {
    const updated = await prisma.transactions.update({
      where: {
        id: id,
      },
      data: {
        description,
        amount: parseFloat(amount),
        type,
        date: new Date(date),
        is_paid: is_paid ?? false,
        category_id: category_id || null,
        currency_id: currency_id,
      },
    });
    res.json(updated);
  } catch (error) {
    console.error('ERRO DETALHADO:', error);
    res.status(500).json({
      error: 'Erro ao atualizar a transação.',
      details: error.message,
      code: error.code,
    });
  }
});

// Excluir uma transação
app.delete('/transactions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.transactions.delete({
      where: { id: id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('ERRO DETALHADO:', error);
    res.status(500).json({
      error: 'Erro ao excluir a transação.',
      details: error.message,
      code: error.code,
    });
  }
});

// Criar uma nova transação
app.post('/transactions', async (req, res) => {
  const {
    description,
    amount,
    type,
    date,
    family_id,
    currency_id,
    user_id,
    category_id,
    is_paid,
  } = req.body;

  if (!description || !amount || !family_id || !currency_id || !user_id) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  try {
    const newTransaction = await prisma.transactions.create({
      data: {
        description,
        amount: parseFloat(amount),
        type,
        is_paid: is_paid ?? false,
        date: new Date(date),
        families: { connect: { id: family_id } },
        users: { connect: { id: user_id } },
        currency: { connect: { id: currency_id } },
        categories: category_id ? { connect: { id: category_id } } : undefined,
      },
    });
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('ERRO DETALHADO:', error);
    res.status(500).json({
      error: 'Erro ao salvar transação.',
      details: error.message,
      code: error.code,
    });
  }
});

// Buscar todas as transações de uma família
app.get('/transactions/:familyId', async (req, res) => {
  const { familyId } = req.params;
  const { month, year } = req.query;

  try {
    const now = new Date();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const targetYear = parseInt(year) || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const transactions = await prisma.transactions.findMany({
      where: {
        family_id: familyId,
        date: { gte: startDate, lte: endDate },
      },
      include: {
        currency: true,
        categories: true,
      },
      orderBy: { date: 'desc' },
    });
    res.json(transactions);
  } catch (error) {
    console.error('ERRO DETALHADO:', error);
    res.status(500).json({
      error: 'Erro ao buscar transações.',
      details: error.message,
      code: error.code,
    });
  }
});

// Alterar uma categoria
app.put('/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updated = await prisma.categories.update({
      where: { id: Number(id) },
      data: { name },
    });
    res.json(updated);
  } catch (error) {
    console.error('ERRO DETALHADO:', error);
    res.status(500).json({
      error: 'Erro ao atualizar categoria',
      details: error.message,
      code: error.code,
    });
  }
});

// Excluir uma categoria
app.delete('/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.categories.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('ERRO DETALHADO:', error);
    res.status(500).json({
      error:
        'Erro ao excluir. Verifique se há transações usando esta categoria.',
      details: error.message,
      code: error.code,
    });
  }
});

// Criar uma nova categoria
app.post('/categories', async (req, res) => {
  const { name } = req.body;
  try {
    const newCategory = await prisma.categories.create({
      data: { name },
    });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('ERRO DETALHADO:', error);
    res.status(500).json({
      error: 'Erro ao criar categoria',
      details: error.message,
      code: error.code,
    });
  }
});

// Buscar todas as categorias
app.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.categories.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    console.error('ERRO DETALHADO:', error);
    res.status(500).json({
      error: 'Erro ao buscar categorias',
      details: error.message,
      code: error.code,
    });
  }
});

// Buscar todas as famílias
app.get('/families', async (req, res) => {
  try {
    const families = await prisma.families.findMany();
    res.json(families);
  } catch (error) {
    console.error('ERRO DETALHADO:', error);
    res.status(500).json({
      error: 'Erro ao buscar famílias',
      details: error.message,
      code: error.code,
    });
  }
});

// Buscar todas as moedas
app.get('/currencies', async (req, res) => {
  try {
    const currencies = await prisma.currencies.findMany();
    res.json(currencies);
  } catch (error) {
    console.error('ERRO DETALHADO:', error);
    res.status(500).json({
      error: 'Erro ao buscar moedas',
      details: error.message,
      code: error.code,
    });
  }
});

// --- INICIALIZAÇÃO ---

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

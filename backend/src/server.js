require('dotenv').config();
const express = require('express');
const cors = require('cors');
const plantsRoutes = require('./routes/plants');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas
app.use('/plants', plantsRoutes);

// Inicializa dados (warm-up)
const PlantsService = require('./services/plantsService');
console.log('🔄 Loading plants data...');
PlantsService.loadPlants();

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Start
app.listen(PORT, () => {
  console.log(`🌱 PetFlora API rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 Documentação: http://localhost:${PORT}/api/plants`);
});

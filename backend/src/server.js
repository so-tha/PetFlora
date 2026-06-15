require('dotenv').config();
const express = require('express');
const cors = require('cors');
const plantsRoutes = require('./routes/plants');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.path}`);
  next();
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    req.url = req.url.replace('/api', '');
    console.log(`🔄 Rewritten URL to: ${req.url}`);
  }
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo à PetFlora API! 🌿',
    version: '1.0.0',
    endpoints: {
      plants: '/api/plants',
      toxic: '/api/plants/toxic',
      nonToxic: '/api/plants/non-toxic',
      stats: '/api/plants/stats',
      search: '/api/plants/search?q={nome}',
      filterByFamily: '/api/plants/family?family={familia}',
      getById: '/api/plants/{id}',
      health: '/health'
    }
  });
});

app.use('/plants', plantsRoutes);

const PlantsService = require('./services/plantsService');
console.log('🔄 Loading plants data...');
PlantsService.loadPlants();

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`🌱 PetFlora API rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 Documentação: http://localhost:${PORT}/api/plants`);
});

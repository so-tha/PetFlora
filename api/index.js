require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Importar dados do backend
const plantsDataFile = require('../backend/src/data/plants.json');
const plantsData = plantsDataFile.plants || [];

// Health check
app.get('^/health$', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// GET todos os dados
app.get('/plants/?$', (req, res) => {
  res.json(plantsDataFile);
});

// GET plantas tóxicas
app.get('/plants/toxic/?$', (req, res) => {
  const toxic = plantsData.filter(p => p.toxic === true);
  res.json({ 
    total: toxic.length,
    plants: toxic 
  });
});

// GET plantas não-tóxicas
app.get('/plants/non-toxic/?$', (req, res) => {
  const nonToxic = plantsData.filter(p => p.toxic === false);
  res.json({ 
    total: nonToxic.length,
    plants: nonToxic 
  });
});

// GET planta por ID
app.get('/plants/:id/?$', (req, res) => {
  const plant = plantsData.find(p => p.id.toString() === req.params.id);
  if (plant) {
    res.json(plant);
  } else {
    res.status(404).json({ error: 'Plant not found' });
  }
});

// GET buscar por nome (search)
app.get('/plants/search/?$', (req, res) => {
  const query = req.query.q?.toLowerCase();
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  
  const results = plantsData.filter(p => {
    const commonNameMatch = p.commonNames?.some(n => n.toLowerCase().includes(query));
    const scientificMatch = p.scientificName?.toLowerCase().includes(query);
    return commonNameMatch || scientificMatch;
  });
  
  res.json({ 
    total: results.length,
    plants: results 
  });
});

// GET estatísticas
app.get('/plants/stats/?$', (req, res) => {
  const stats = {
    total: plantsData.length,
    toxic: plantsData.filter(p => p.toxic === true).length,
    nonToxic: plantsData.filter(p => p.toxic === false).length,
  };
  res.json(stats);
});

// GET filtrar por família
app.get('/plants/family/?$', (req, res) => {
  const family = req.query.family?.toLowerCase();
  if (!family) {
    return res.status(400).json({ error: 'Query parameter "family" is required' });
  }
  
  const results = plantsData.filter(p =>
    p.family?.toLowerCase().includes(family)
  );
  
  res.json({ 
    total: results.length,
    plants: results 
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;

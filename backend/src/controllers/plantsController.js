const PlantsService = require('../services/plantsService');

class PlantsController {
  static async getAllPlants(req, res) {
    try {
      const plants = PlantsService.getAllPlants();
      res.json({
        total: plants.length,
        plants
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getToxicPlants(req, res) {
    try {
      const plants = PlantsService.getToxicPlants();
      res.json({
        total: plants.length,
        plants
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getNonToxicPlants(req, res) {
    try {
      const plants = PlantsService.getNonToxicPlants();
      res.json({
        total: plants.length,
        plants
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async searchPlants(req, res) {
    try {
      const { q } = req.query;
      if (!q || q.length < 2) {
        return res.status(400).json({ error: 'Query deve ter pelo menos 2 caracteres' });
      }
      
      const plants = PlantsService.searchPlants(q);
      res.json({
        query: q,
        total: plants.length,
        plants
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getPlantById(req, res) {
    try {
      const { id } = req.params;
      const plant = PlantsService.getPlantById(parseInt(id));
      
      if (!plant) {
        return res.status(404).json({ error: 'Planta não encontrada' });
      }
      
      res.json(plant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = PlantsService.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async filterByFamily(req, res) {
    try {
      const { family } = req.query;
      if (!family) {
        return res.status(400).json({ error: 'Family query é obrigatório' });
      }
      
      const plants = PlantsService.filterByFamily(family);
      res.json({
        family,
        total: plants.length,
        plants
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PlantsController;

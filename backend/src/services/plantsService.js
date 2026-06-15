const fs = require('fs');
const path = require('path');

class PlantsService {
  static plants = null;

  static loadPlants() {
    if (this.plants) return this.plants;

    try {
      const filePath = path.join(__dirname, '../data/plants.json');
      const content = fs.readFileSync(filePath, 'utf-8');
      this.plants = JSON.parse(content);
      console.log(`✅ ${this.plants.plants.length} plantas carregadas`);
      return this.plants;
    } catch (error) {
      console.error('❌ Erro ao carregar plantas:', error.message);
      console.log('Run: npm run parse');
      return { plants: [], total: 0 };
    }
  }

  static getAllPlants() {
    const data = this.loadPlants();
    return data.plants || [];
  }

  static getToxicPlants() {
    const data = this.loadPlants();
    return (data.plants || []).filter(p => p.toxic === true);
  }

  static getNonToxicPlants() {
    const data = this.loadPlants();
    return (data.plants || []).filter(p => p.toxic === false);
  }

  static searchPlants(query) {
    const plants = this.getAllPlants();
    const q = query.toLowerCase();

    return plants.filter(plant => {
      return (
        plant.commonNames?.some(name => name.toLowerCase().includes(q)) ||
        plant.scientificName?.toLowerCase().includes(q) ||
        plant.family?.toLowerCase().includes(q)
      );
    });
  }

  static getPlantById(id) {
    const plants = this.getAllPlants();
    return plants.find(p => p.id === id);
  }

  static getStats() {
    const data = this.loadPlants();
    const all = data.plants || [];
    
    const families = {};
    all.forEach(plant => {
      const fam = plant.family || 'Unknown';
      families[fam] = (families[fam] || 0) + 1;
    });

    return {
      total: all.length,
      toxic: all.filter(p => p.toxic).length,
      nonToxic: all.filter(p => !p.toxic).length,
      families: families,
      topFamilies: Object.entries(families)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))
    };
  }

  static filterByFamily(family) {
    const plants = this.getAllPlants();
    return plants.filter(p => p.family?.toLowerCase().includes(family.toLowerCase()));
  }

  static updatePlantImage(id, { imageUrl, imageSource, imageSourceUrl }) {
    const data = this.loadPlants();
    const plants = data.plants || [];
    const plant = plants.find(p => p.id === id);
    
    if (plant) {
      plant.imageUrl = imageUrl;
      if (imageSource) plant.imageSource = imageSource;
      if (imageSourceUrl) plant.imageSourceUrl = imageSourceUrl;
      
      try {
        const filePath = path.join(__dirname, '../data/plants.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
      } catch (error) {
        console.error('❌ Erro ao salvar imagem no JSON:', error.message);
        return false;
      }
    }
    return false;
  }
}

// Carregar dados ao iniciar
PlantsService.loadPlants();

module.exports = PlantsService;

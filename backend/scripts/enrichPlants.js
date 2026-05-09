const fs = require('fs');
const path = require('path');

const PLANTS_JSON = path.join(__dirname, '../src/data/plants.json');
const DELAY_MS = 300;

// Dados padrão para filtros
const DEFAULT_SIZE = 'medium';
const DEFAULT_LIGHT = 'medium';

/**
 * Busca imagem no iNaturalist
 */
async function fetchImageFromINaturalist(scientificName) {
  try {
    const response = await fetch(
      `https://api.inaturalist.org/v1/taxa/autocomplete?q=${encodeURIComponent(scientificName)}`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const taxon = data.results[0];
      if (taxon.default_photo) {
        return taxon.default_photo.medium_url;
      }
    }
    return null;
  } catch (error) {
    console.error(`Erro ao buscar imagem para ${scientificName}:`, error.message);
    return null;
  }
}

/**
 * Enriquece plantas com imagens e filtros
 */
async function enrichPlants() {
  try {
    console.log('📖 Lendo plants.json...');
    const plantsData = JSON.parse(fs.readFileSync(PLANTS_JSON, 'utf-8'));
    
    let enriched = 0;
    let failed = 0;
    
    for (let i = 0; i < plantsData.plants.length; i++) {
      const plant = plantsData.plants[i];
      
      // Adiciona imagem se não tiver
      if (!plant.imageUrl && plant.scientificName) {
        process.stdout.write(`\r🖼️  Buscando imagens: ${i + 1}/${plantsData.plants.length}`);
        
        const imageUrl = await fetchImageFromINaturalist(plant.scientificName);
        if (imageUrl) {
          plant.imageUrl = imageUrl;
          enriched++;
        } else {
          failed++;
        }
        
        // Delay entre requisições
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
      
      // Adiciona filtros padrão se não tiverem
      if (!plant.size) plant.size = DEFAULT_SIZE;
      if (!plant.light) plant.light = DEFAULT_LIGHT;
    }
    
    console.log(`\n✅ Enriquecimento concluído!`);
    console.log(`🖼️  Imagens encontradas: ${enriched}`);
    console.log(`❌ Imagens não encontradas: ${failed}`);
    console.log(`📊 Filtros adicionados/atualizados para todas as plantas`);
    
    // Salva de volta
    fs.writeFileSync(PLANTS_JSON, JSON.stringify(plantsData, null, 2));
    console.log(`💾 Arquivo atualizado: ${PLANTS_JSON}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

enrichPlants();

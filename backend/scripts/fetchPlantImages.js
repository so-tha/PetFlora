const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Caminho dos arquivos
const PLANTS_JSON = path.join(__dirname, '../src/data/plants.json');
const PROGRESS_FILE = path.join(__dirname, '.image-fetch-progress.json');
const DELAY_MS = 500; // Delay entre requisições para não sobrecarregar API

// URL base do iNaturalist
const INATURALIST_API = 'https://api.inaturalist.org/v1/taxa/autocomplete';

/**
 * Busca imagem no iNaturalist usando nome científico
 */
async function getPlantImageFromiNaturalist(scientificName) {
  try {
    const response = await fetch(
      `${INATURALIST_API}?q=${encodeURIComponent(scientificName)}&limit=1`
    );
    
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const taxon = data.results[0];
      if (taxon.default_photo && taxon.default_photo.medium_url) {
        return {
          imageUrl: taxon.default_photo.medium_url,
          source: 'iNaturalist',
          sourceUrl: `https://www.inaturalist.org/taxa/${taxon.id}`,
          success: true
        };
      }
    }
    
    return { success: false, reason: 'No image found' };
  } catch (error) {
    console.error(`❌ Erro ao buscar imagem para "${scientificName}":`, error.message);
    return { success: false, reason: error.message };
  }
}

/**
 * Carrega progresso anterior (para retomação)
 */
function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
      console.log(`📋 Retomando de ${progress.processedCount} plantas...`);
      return progress;
    }
  } catch (error) {
    console.warn('⚠️  Não foi possível carregar progresso anterior');
  }
  
  return {
    processedCount: 0,
    successCount: 0,
    failureCount: 0,
    plantIds: []
  };
}

/**
 * Salva progresso atual
 */
function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

/**
 * Aguarda um tempo em ms
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Função principal
 */
async function fetchAllPlantImages() {
  console.log('🌿 Iniciando busca de imagens de plantas no iNaturalist...\n');
  
  // Carrega dados existentes
  if (!fs.existsSync(PLANTS_JSON)) {
    console.error('❌ Arquivo plants.json não encontrado. Execute parse.js primeiro.');
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(PLANTS_JSON, 'utf-8'));
  let plants = data.plants || data;  // Suporta ambos formatos
  let progress = loadProgress();
  
  const totalPlants = plants.length;
  const skipCount = progress.processedCount;
  
  console.log(`📊 Total de plantas: ${totalPlants}`);
  console.log(`✅ Já processadas: ${progress.successCount}`);
  console.log(`❌ Falhadas: ${progress.failureCount}\n`);
  
  // Processa plantas não processadas
  for (let i = skipCount; i < totalPlants; i++) {
    const plant = plants[i];
    
    // Pula se já tem imagem
    if (plant.imageUrl) {
      console.log(`⏭️  [${i + 1}/${totalPlants}] ${plant.commonNames?.[0] || plant.scientificName} (já tem imagem)`);
      progress.processedCount = i + 1;
      continue;
    }
    
    const scientificName = plant.scientificName;
    
    if (!scientificName) {
      console.log(`⏭️  [${i + 1}/${totalPlants}] Sem nome científico`);
      progress.processedCount = i + 1;
      progress.failureCount++;
      continue;
    }
    
    process.stdout.write(`⏳ [${i + 1}/${totalPlants}] ${plant.commonNames?.[0] || scientificName}... `);
    
    const result = await getPlantImageFromiNaturalist(scientificName);
    
    if (result.success) {
      plants[i].imageUrl = result.imageUrl;
      plants[i].imageSource = result.source;
      plants[i].imageSourceUrl = result.sourceUrl;
      console.log('✅');
      progress.successCount++;
    } else {
      console.log(`❌ (${result.reason})`);
      progress.failureCount++;
    }
    
    progress.processedCount = i + 1;
    progress.plantIds.push(plant.id);
    
    // Salva progresso a cada 10 plantas
    if ((i + 1) % 10 === 0) {
      saveProgress(progress);
      const progressData = {
        total: plants.length,
        toxic: plants.filter(p => p.toxic).length,
        nonToxic: plants.filter(p => !p.toxic).length,
        lastUpdated: new Date().toISOString(),
        plants: plants
      };
      fs.writeFileSync(PLANTS_JSON, JSON.stringify(progressData, null, 2));
      console.log(`   📁 Progresso salvo: ${i + 1}/${totalPlants}`);
    }
    
    // Aguarda antes da próxima requisição
    await delay(DELAY_MS);
  }
  
  // Salva resultado final
  const finalData = {
    total: plants.length,
    toxic: plants.filter(p => p.toxic).length,
    nonToxic: plants.filter(p => !p.toxic).length,
    lastUpdated: new Date().toISOString(),
    plants: plants
  };
  fs.writeFileSync(PLANTS_JSON, JSON.stringify(finalData, null, 2));
  progress.processedCount = totalPlants;
  saveProgress(progress);
  
  console.log('\n✨ Busca concluída!\n');
  console.log(`📊 Resumo Final:`);
  console.log(`   ✅ Imagens encontradas: ${progress.successCount}`);
  console.log(`   ❌ Sem imagem: ${progress.failureCount}`);
  console.log(`   📊 Taxa de sucesso: ${((progress.successCount / totalPlants) * 100).toFixed(2)}%\n`);
  
  // Remove arquivo de progresso
  if (fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
  }
}

// Executa
fetchAllPlantImages().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Caminhos dos arquivos
const PLANTS_JSON = path.join(__dirname, '../src/data/plants.json');
const PROGRESS_FILE = path.join(__dirname, '.image-fetch-progress-v2.json');
const DELAY_MS = 300; // Delay entre requisições

// URLs das APIs
const INATURALIST_API = 'https://api.inaturalist.org/v1/taxa/autocomplete';
const UNSPLASH_API = 'https://api.unsplash.com/search/photos';
const PEXELS_API = 'https://api.pexels.com/v1/search';

/**
 * Extrai nome base da planta (remove variedade)
 * Ex: "Peperomia serpens variegata" -> "Peperomia serpens"
 */
function getBaseName(scientificName) {
  if (!scientificName) return null;
  const parts = scientificName.trim().split(/\s+/);
  if (parts.length > 2) {
    return parts.slice(0, 2).join(' ');
  }
  return scientificName;
}

/**
 * Busca imagem no iNaturalist
 */
async function getImageFromiNaturalist(scientificName) {
  try {
    let names = [scientificName];
    
    // Se tem variedade, também tenta nome base
    const baseName = getBaseName(scientificName);
    if (baseName !== scientificName) {
      names.push(baseName);
    }

    for (const name of names) {
      const response = await fetch(
        `${INATURALIST_API}?q=${encodeURIComponent(name)}&limit=1`
      );
      
      if (!response.ok) continue;
      
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
    }
    
    return { success: false, reason: 'iNaturalist: No image found' };
  } catch (error) {
    return { success: false, reason: `iNaturalist: ${error.message}` };
  }
}

/**
 * Busca imagem no Unsplash (sem API key necessária para search básico)
 */
async function getImageFromUnsplash(plantName, commonName) {
  try {
    const searchQuery = commonName || plantName;
    const response = await fetch(
      `https://source.unsplash.com/600x400/?${encodeURIComponent(searchQuery)},plant`,
      { redirect: 'follow' }
    );
    
    if (response.ok && response.url) {
      return {
        imageUrl: response.url,
        source: 'Unsplash',
        sourceUrl: 'https://unsplash.com',
        success: true
      };
    }
    
    return { success: false, reason: 'Unsplash: No image' };
  } catch (error) {
    return { success: false, reason: `Unsplash: ${error.message}` };
  }
}

/**
 * Busca imagem no Pexels (API pública)
 */
async function getImageFromPexels(plantName, commonName) {
  try {
    const searchQuery = commonName || plantName;
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1`,
      {
        headers: {
          'Authorization': 'Basic cGV4ZWxzOjU2MzQ1NjM0NTYzNDU2MzQ1Ng==' // Public access
        }
      }
    );
    
    if (!response.ok) {
      // Fallback: tenta sem auth (algumas queries funcionam)
      return await getImageFromUnsplash(plantName, commonName);
    }
    
    const data = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      return {
        imageUrl: data.photos[0].src.medium,
        source: 'Pexels',
        sourceUrl: data.photos[0].url,
        success: true
      };
    }
    
    return { success: false, reason: 'Pexels: No image' };
  } catch (error) {
    return { success: false, reason: `Pexels: ${error.message}` };
  }
}

/**
 * Busca imagem com múltiplas fontes em cascata
 */
async function getPlantImageWithFallback(plant) {
  const scientificName = plant.scientificName;
  const commonName = plant.commonNames?.[0];
  
  if (!scientificName && !commonName) {
    return { success: false, reason: 'No name provided' };
  }

  // 1. Tenta iNaturalist
  let result = await getImageFromiNaturalist(scientificName);
  if (result.success) return result;

  // 2. Pequeno delay
  await delay(300);

  // 3. Tenta Unsplash
  result = await getImageFromUnsplash(scientificName, commonName);
  if (result.success) return result;

  // 4. Pequeno delay
  await delay(300);

  // 5. Tenta Pexels
  result = await getImageFromPexels(scientificName, commonName);
  if (result.success) return result;

  return { success: false, reason: 'All sources failed' };
}

/**
 * Carrega progresso anterior
 */
function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
      console.log(`📋 Retomando de ${progress.processedCount} plantas...\n`);
      return progress;
    }
  } catch (error) {
    console.warn('⚠️  Iniciando novo progresso\n');
  }
  
  return {
    processedCount: 0,
    successCount: 0,
    failureCount: 0,
    sources: {
      iNaturalist: 0,
      Unsplash: 0,
      Pexels: 0
    }
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
async function fetchAllPlantImagesV2() {
  console.log('🌿 Iniciando busca de imagens (3 fontes: iNaturalist + Unsplash + Pexels)...\n');
  
  // Valida arquivo
  if (!fs.existsSync(PLANTS_JSON)) {
    console.error('❌ Arquivo plants.json não encontrado.');
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(PLANTS_JSON, 'utf-8'));
  let plants = data.plants || data;
  let progress = loadProgress();
  
  const totalPlants = plants.length;
  const skipCount = progress.processedCount;
  
  // Conta quantas já têm imagem
  const alreadyWithImages = plants.filter(p => p.imageUrl).length;
  const needImages = totalPlants - alreadyWithImages;
  
  console.log(`📊 Status Atual:`);
  console.log(`   Total: ${totalPlants} plantas`);
  console.log(`   ✅ Com imagem: ${alreadyWithImages}`);
  console.log(`   ⏳ Sem imagem: ${needImages}`);
  console.log(`   Já processadas nesta sessão: ${skipCount}\n`);
  
  // Processa plantas
  for (let i = skipCount; i < totalPlants; i++) {
    const plant = plants[i];
    
    // Pula se já tem imagem
    if (plant.imageUrl) {
      console.log(`⏭️  [${i + 1}/${totalPlants}] ${plant.commonNames?.[0] || plant.scientificName} ✓`);
      progress.processedCount = i + 1;
      continue;
    }
    
    const scientificName = plant.scientificName;
    const displayName = plant.commonNames?.[0] || scientificName;
    
    if (!scientificName) {
      console.log(`⏭️  [${i + 1}/${totalPlants}] ${displayName} (sem nome científico)`);
      progress.processedCount = i + 1;
      progress.failureCount++;
      continue;
    }
    
    process.stdout.write(`⏳ [${i + 1}/${totalPlants}] ${displayName}... `);
    
    const result = await getPlantImageWithFallback(plant);
    
    if (result.success) {
      plants[i].imageUrl = result.imageUrl;
      plants[i].imageSource = result.source;
      plants[i].imageSourceUrl = result.sourceUrl;
      console.log(`✅ (${result.source})`);
      progress.successCount++;
      progress.sources[result.source] = (progress.sources[result.source] || 0) + 1;
    } else {
      console.log(`❌`);
      progress.failureCount++;
    }
    
    progress.processedCount = i + 1;
    
    // Salva progresso a cada 15 plantas
    if ((i + 1) % 15 === 0) {
      saveProgress(progress);
      const progressData = {
        total: plants.length,
        toxic: plants.filter(p => p.toxic).length,
        nonToxic: plants.filter(p => !p.toxic).length,
        lastUpdated: new Date().toISOString(),
        plants: plants
      };
      fs.writeFileSync(PLANTS_JSON, JSON.stringify(progressData, null, 2));
      console.log(`   📁 Progresso salvo: ${i + 1}/${totalPlants}\n`);
    }
    
    // Delay para não sobrecarregar
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
  console.log(`   ✅ Imagens encontradas nesta sessão: ${progress.successCount}`);
  console.log(`   ❌ Sem imagem: ${progress.failureCount}`);
  
  // Mostra distribuição por fonte
  const totalImages = plants.filter(p => p.imageUrl).length;
  console.log(`\n📸 Total com imagem: ${totalImages}/${totalPlants} (${((totalImages / totalPlants) * 100).toFixed(2)}%)`);
  console.log(`\n🔍 Distribuição por Fonte:`);
  console.log(`   iNaturalist: ${progress.sources.iNaturalist}`);
  console.log(`   Unsplash: ${progress.sources.Unsplash}`);
  console.log(`   Pexels: ${progress.sources.Pexels}\n`);
  
  // Remove arquivo de progresso
  if (fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
  }
}

// Executa
fetchAllPlantImagesV2().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

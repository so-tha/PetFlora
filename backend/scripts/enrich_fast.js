const fs = require('fs');
const path = require('path');

const PLANTS_JSON = path.join(__dirname, '../src/data/plants.json');
const BATCH_SIZE = 15;
const DELAY_BETWEEN_BATCHES_MS = 250;

const DEFAULT_SIZE = 'medium';
const DEFAULT_LIGHT = 'medium';

let isINaturalistDisabled = false;
let inaturalist429Count = 0;

function cleanScientificName(name) {
  if (!name) return '';
  // Remove content in parentheses
  let cleaned = name.replace(/\([^)]*\)/g, '');
  // Remove common suffixes like spp., spp, sp., sp, species, cv., cv, var., subsp.
  cleaned = cleaned.replace(/\s+\b(spp\b\.?|spp\b|sp\b\.?|species|cv\b\.?|cv|var\b\.?|subsp\b\.?)\s*$/gi, '');
  return cleaned.trim();
}

async function fetchImageFromINaturalist(query) {
  if (isINaturalistDisabled || !query) return null;
  try {
    const response = await fetch(
      `https://api.inaturalist.org/v1/taxa/autocomplete?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      if (response.status === 429) {
        inaturalist429Count++;
        console.log(`\n⚠️ iNaturalist 429 (Too Many Requests) para: "${query}" (Contador: ${inaturalist429Count})`);
        if (inaturalist429Count >= 3) {
          isINaturalistDisabled = true;
          console.log(`\n🚨 Circuito de segurança: iNaturalist bloqueou requisições. Migrando exclusivamente para Pexels!`);
        }
      }
      return null;
    }
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const taxon = data.results[0];
      if (taxon.default_photo && taxon.default_photo.medium_url) {
        return {
          imageUrl: taxon.default_photo.medium_url,
          source: 'iNaturalist',
          sourceUrl: `https://www.inaturalist.org/taxa/${taxon.id}`
        };
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function fetchImageFromPexels(query) {
  if (!query) return null;
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
      {
        headers: {
          'Authorization': 'Basic cGV4ZWxzOjU2MzQ1NjM0NTYzNDU2MzQ1Ng=='
        }
      }
    );
    if (!response.ok) {
      if (response.status === 429) {
        console.log(`\n⚠️ Pexels 429 (Too Many Requests) para: "${query}"`);
      }
      return null;
    }
    const data = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      return {
        imageUrl: data.photos[0].src.medium,
        source: 'Pexels',
        sourceUrl: data.photos[0].url
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function enrichFast() {
  console.log('🌿 Iniciando enriquecimento inteligente de imagens...');
  
  if (!fs.existsSync(PLANTS_JSON)) {
    console.error('❌ Arquivo plants.json não encontrado!');
    process.exit(1);
  }
  
  const plantsData = JSON.parse(fs.readFileSync(PLANTS_JSON, 'utf-8'));
  const plants = plantsData.plants || [];
  
  console.log(`📊 Total de plantas no JSON: ${plants.length}`);
  const alreadyHasImage = plants.filter(p => p.imageUrl).length;
  console.log(`   ✅ Já possuem imagem: ${alreadyHasImage}`);
  console.log(`   ⏳ Precisam de imagem: ${plants.length - alreadyHasImage}`);
  
  let newImagesFromINaturalist = 0;
  let newImagesFromPexels = 0;
  let notFoundCount = 0;
  
  // Dividir em lotes (batches)
  for (let i = 0; i < plants.length; i += BATCH_SIZE) {
    const batch = plants.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (plant, index) => {
      // Sempre preencher filtros padrão se não existirem
      if (!plant.size) plant.size = DEFAULT_SIZE;
      if (!plant.light) plant.light = DEFAULT_LIGHT;
      if (!plant.lightRequirements) plant.lightRequirements = DEFAULT_LIGHT;
      
      // Se já possui imagem, ignora busca
      if (plant.imageUrl) {
        return;
      }
      
      const sciNameCleaned = cleanScientificName(plant.scientificName);
      const firstCommonName = plant.commonNames?.[0];
      
      // Estratégia em cascata:
      // 1. iNaturalist com nome científico limpo
      let result = null;
      if (!isINaturalistDisabled) {
        result = await fetchImageFromINaturalist(sciNameCleaned);
      }
      
      // 2. iNaturalist com nome comum (se o primeiro falhar)
      if (!result && firstCommonName && !isINaturalistDisabled) {
        result = await fetchImageFromINaturalist(firstCommonName);
      }
      
      if (result) {
        plant.imageUrl = result.imageUrl;
        plant.imageSource = result.source;
        plant.imageSourceUrl = result.sourceUrl;
        newImagesFromINaturalist++;
        return;
      }
      
      // 3. Pexels com nome comum
      if (firstCommonName) {
        result = await fetchImageFromPexels(firstCommonName);
      }
      
      // 4. Pexels com nome científico
      if (!result && sciNameCleaned) {
        result = await fetchImageFromPexels(sciNameCleaned);
      }
      
      if (result) {
        plant.imageUrl = result.imageUrl;
        plant.imageSource = result.source;
        plant.imageSourceUrl = result.sourceUrl;
        newImagesFromPexels++;
        return;
      }
      
      // Se falhar tudo
      notFoundCount++;
    });
    
    process.stdout.write(`\r⏳ Processando plantas: ${Math.min(i + BATCH_SIZE, plants.length)}/${plants.length}...`);
    await Promise.all(promises);
    
    // Pequeno delay entre lotes para não estourar rate-limiting
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
  }
  
  const totalWithImage = plants.filter(p => p.imageUrl).length;
  console.log(`\n\n✨ Enriquecimento concluído!`);
  console.log(`   🖼️  Novas imagens encontradas via iNaturalist: ${newImagesFromINaturalist}`);
  console.log(`   📸 Novas imagens encontradas via Pexels: ${newImagesFromPexels}`);
  console.log(`   ❌ Imagens não encontradas/erros: ${notFoundCount}`);
  console.log(`   📊 Total geral com imagem: ${totalWithImage}/${plants.length} (${((totalWithImage/plants.length)*100).toFixed(1)}%)`);
  
  // Salva resultado final
  plantsData.lastUpdated = new Date().toISOString();
  fs.writeFileSync(PLANTS_JSON, JSON.stringify(plantsData, null, 2));
  console.log(`💾 Arquivo atualizado com sucesso: ${PLANTS_JSON}\n`);
}

enrichFast().catch(err => {
  console.error('❌ Erro fatal:', err);
});

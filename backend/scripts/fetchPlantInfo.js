const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Caminhos dos arquivos
const PLANTS_JSON = path.join(__dirname, '../src/data/plants.json');
const PROGRESS_FILE = path.join(__dirname, '.plant-info-progress.json');
const DELAY_MS = 500;

// URLs das APIs
const TREFLE_API = 'https://trefle.io/api/v1/plants';
const GBIF_API = 'https://api.gbif.org/v1/species';

// Mapeamento de Light Requirements
const LIGHT_MAPPING = {
  'low': 'low',
  'low light': 'low',
  'shade': 'low',
  'partial shade': 'low',
  'medium': 'medium',
  'medium light': 'medium',
  'partial sun': 'medium',
  'high': 'high',
  'high light': 'high',
  'full sun': 'high',
  'sun': 'high'
};

// Mapeamento de Size
const SIZE_MAPPING = {
  'small': 'small',
  'compact': 'small',
  'mini': 'small',
  'dwarf': 'small',
  'medium': 'medium',
  'large': 'large',
  'tall': 'large',
  'tree': 'large'
};

/**
 * Normaliza string para lowercase e remove acentos
 */
function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Mapeia luz de texto para categoria
 */
function mapLight(text) {
  if (!text) return null;
  const normalized = normalize(text);
  
  for (const [key, value] of Object.entries(LIGHT_MAPPING)) {
    if (normalized.includes(key)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Mapeia tamanho de texto para categoria
 */
function mapSize(text) {
  if (!text) return null;
  const normalized = normalize(text);
  
  for (const [key, value] of Object.entries(SIZE_MAPPING)) {
    if (normalized.includes(key)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Busca informações no Trefle API
 */
async function getInfoFromTrefle(scientificName) {
  try {
    // Trefle não requer API key para consultas básicas
    const response = await fetch(
      `${TREFLE_API}/search?q=${encodeURIComponent(scientificName)}&limit=1`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const plant = data.data[0];
      
      return {
        light: mapLight(plant.light_needs),
        size: mapSize(plant.growth_habit),
        source: 'Trefle',
        raw: {
          light_needs: plant.light_needs,
          growth_habit: plant.growth_habit,
          max_height: plant.max_height
        }
      };
    }
    
    return null;
  } catch (error) {
    console.error(`   Trefle erro: ${error.message}`);
    return null;
  }
}

/**
 * Busca informações no GBIF
 */
async function getInfoFromGBIF(scientificName) {
  try {
    const response = await fetch(
      `${GBIF_API}?name=${encodeURIComponent(scientificName)}&limit=1`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const plant = data.results[0];
      
      // GBIF tem informações básicas mas não tão detalhadas quanto Trefle
      // Usamos aqui como fallback
      return {
        light: null, // GBIF não tem light info tão clara
        size: null,
        source: 'GBIF',
        raw: {
          kingdom: plant.kingdom,
          phylum: plant.phylum
        }
      };
    }
    
    return null;
  } catch (error) {
    console.error(`   GBIF erro: ${error.message}`);
    return null;
  }
}

/**
 * Função auxiliar para obter info por família conhecida
 * (Fallback com conhecimento horticultural)
 */
function getDefaultsByFamily(family) {
  const defaults = {
    'Araceae': { light: 'medium', size: 'medium' },
    'Cactaceae': { light: 'high', size: 'small' },
    'Succulent': { light: 'high', size: 'small' },
    'Fern': { light: 'low', size: 'medium' },
    'Orchidaceae': { light: 'medium', size: 'small' },
    'Bromeliad': { light: 'medium', size: 'medium' },
    'Arecaceae': { light: 'medium', size: 'large' }, // Palms
    'Liliaceae': { light: 'medium', size: 'small' },
    'Rosaceae': { light: 'high', size: 'large' },
    'Solanaceae': { light: 'high', size: 'medium' },
    'Fabaceae': { light: 'high', size: 'large' },
    'Verbenaceae': { light: 'high', size: 'medium' },
    'Lamiaceae': { light: 'high', size: 'medium' },
    'Asclepiadaceae': { light: 'medium', size: 'medium' },
    'Apocynaceae': { light: 'medium', size: 'medium' },
    'Malvaceae': { light: 'high', size: 'large' }
  };
  
  if (!family) return null;
  
  for (const [key, value] of Object.entries(defaults)) {
    if (family.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return null;
}

/**
 * Busca informações com múltiplas fontes
 */
async function getPlantInfo(plant) {
  const scientificName = plant.scientificName;
  
  if (!scientificName) return null;

  // 1. Tenta Trefle
  let result = await getInfoFromTrefle(scientificName);
  if (result && (result.light || result.size)) {
    return result;
  }

  await delay(300);

  // 2. Tenta GBIF (menos detalhado)
  result = await getInfoFromGBIF(scientificName);
  if (result && (result.light || result.size)) {
    return result;
  }

  // 3. Fallback: usa padrões por família
  const familyDefaults = getDefaultsByFamily(plant.family);
  if (familyDefaults) {
    return {
      light: familyDefaults.light,
      size: familyDefaults.size,
      source: `Family-based (${plant.family})`,
      raw: null
    };
  }

  return null;
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
      'Trefle': 0,
      'GBIF': 0,
      'Family-based': 0
    }
  };
}

/**
 * Salva progresso
 */
function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

/**
 * Aguarda
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Função principal
 */
async function fetchPlantInfo() {
  console.log('🌿 Buscando Light Requirements e Size em Bancos de Dados...\n');
  
  if (!fs.existsSync(PLANTS_JSON)) {
    console.error('❌ Arquivo plants.json não encontrado.');
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(PLANTS_JSON, 'utf-8'));
  let plants = data.plants || data;
  let progress = loadProgress();
  
  const totalPlants = plants.length;
  const skipCount = progress.processedCount;
  
  // Conta quantas já têm info
  const alreadyWithInfo = plants.filter(p => p.lightRequirements && p.size).length;
  
  console.log(`📊 Status Atual:`);
  console.log(`   Total: ${totalPlants} plantas`);
  console.log(`   ✅ Com info completa: ${alreadyWithInfo}`);
  console.log(`   ⏳ Sem info: ${totalPlants - alreadyWithInfo}\n`);
  
  // Processa plantas
  for (let i = skipCount; i < totalPlants; i++) {
    const plant = plants[i];
    
    // Pula se já tem info
    if (plant.lightRequirements && plant.size) {
      console.log(`⏭️  [${i + 1}/${totalPlants}] ${plant.commonNames?.[0] || plant.scientificName} ✓`);
      progress.processedCount = i + 1;
      continue;
    }
    
    const displayName = plant.commonNames?.[0] || plant.scientificName;
    process.stdout.write(`🔍 [${i + 1}/${totalPlants}] ${displayName}... `);
    
    const info = await getPlantInfo(plant);
    
    if (info) {
      plants[i].lightRequirements = info.light || 'medium';
      plants[i].size = info.size || 'medium';
      plants[i].infoSource = info.source;
      console.log(`✅ (${info.source})`);
      
      // Conta por fonte
      const source = info.source.split('(')[0].trim();
      progress.sources[source] = (progress.sources[source] || 0) + 1;
      progress.successCount++;
    } else {
      // Padrão neutral
      plants[i].lightRequirements = 'medium';
      plants[i].size = 'medium';
      plants[i].infoSource = 'Default';
      console.log(`⚠️  (Padrão)`);
    }
    
    progress.processedCount = i + 1;
    
    // Salva a cada 20 plantas
    if ((i + 1) % 20 === 0) {
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
    
    await delay(DELAY_MS);
  }
  
  // Salva final
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
  console.log(`   ✅ Plantas com informação: ${totalPlants}`);
  console.log(`\n🔍 Distribuição por Fonte:`);
  console.log(`   Trefle: ${progress.sources['Trefle'] || 0}`);
  console.log(`   GBIF: ${progress.sources['GBIF'] || 0}`);
  console.log(`   Family-based: ${progress.sources['Family-based'] || 0}`);
  console.log(`   Default: ${totalPlants - (progress.sources['Trefle'] || 0) - (progress.sources['GBIF'] || 0) - (progress.sources['Family-based'] || 0)}\n`);
  
  if (fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
  }
}

// Executa
fetchPlantInfo().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

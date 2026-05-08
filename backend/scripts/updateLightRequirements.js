const fs = require('fs');
const path = require('path');

// Caminho do arquivo
const PLANTS_JSON = path.join(__dirname, '../src/data/plants.json');

/**
 * Identifica plantas com baixa luminosidade baseado em:
 * 1. Nome comum (contém "fern", "moss", "orchid", "violet", etc)
 * 2. Família botânica conhecida por viver em sombra
 * 3. Nome científico
 */
function isLowLightPlant(plant) {
  const commonNames = plant.commonNames?.join(' ').toLowerCase() || '';
  const family = (plant.family || '').toLowerCase();
  const scientificName = (plant.scientificName || '').toLowerCase();

  // Palavras-chave que indicam baixa luminosidade
  const lowLightKeywords = [
    'fern', 'moss', 'orchid', 'violet', 'gloxinia',
    'african violet', 'begonia', 'episcia', 'peperomia',
    'philodendron', 'pothos', 'anthurium', 'alocasia',
    'calathea', 'maranta', 'stromanthe', 'fittonia',
    'pilea', 'hoya', 'rhaphidophora', 'monstera',
    'syngonium', 'scindapsus', 'rhaphidophora',
    'cryptanthus', 'bromeliad', 'neoregelia',
    'tillandsia', 'guzmania', 'selaginella',
    'asplenium', 'davallia', 'platycerium',
    'pteris', 'cyrtomium', 'nephrolepis',
    'polystichum', 'dryopteris'
  ];

  // Famílias botânicas de baixa luminosidade
  const lowLightFamilies = [
    'polypodiaceae',
    'pteridaceae',
    'dryopteridaceae',
    'adiantaceae',
    'aspleniaceae',
    'selaginellaceae',
    'orchidaceae',
    'gesneriaceae',
    'begoniaceae',
    'acanthaceae',
    'urticaceae',
    'araceae',
    'asclepiadaceae',
    'piperaceae'
  ];

  // Verifica palavras-chave nos nomes comuns
  for (const keyword of lowLightKeywords) {
    if (commonNames.includes(keyword) || scientificName.includes(keyword)) {
      return true;
    }
  }

  // Verifica se a família é de baixa luz
  for (const fam of lowLightFamilies) {
    if (family.includes(fam)) {
      return true;
    }
  }

  return false;
}

/**
 * Identifica plantas com alta luminosidade
 */
function isHighLightPlant(plant) {
  const commonNames = plant.commonNames?.join(' ').toLowerCase() || '';
  const family = (plant.family || '').toLowerCase();
  const scientificName = (plant.scientificName || '').toLowerCase();

  // Palavras-chave que indicam alta luminosidade
  const highLightKeywords = [
    'cactus', 'succulents', 'aloe', 'echeveria',
    'haworthia', 'sempervivum', 'sedum',
    'rose', 'bougainvillea', 'helianthus',
    'sunflower', 'solar', 'sun',
    'palm tree', 'coconut', 'date palm',
    'agave', 'yucca', 'daylily',
    'hibiscus', 'lantana', 'salvia',
    'rosemary', 'lavender', 'sage'
  ];

  // Famílias de alta luminosidade
  const highLightFamilies = [
    'cactaceae',
    'aizoaceae',
    'crassulaceae',
    'agavaceae',
    'rosaceae',
    'asteraceae',
    'lamiaceae',
    'fabaceae',
    'malvaceae'
  ];

  // Verifica palavras-chave
  for (const keyword of highLightKeywords) {
    if (commonNames.includes(keyword) || scientificName.includes(keyword)) {
      return true;
    }
  }

  // Verifica famílias
  for (const fam of highLightFamilies) {
    if (family.includes(fam)) {
      return true;
    }
  }

  return false;
}

/**
 * Função principal
 */
function updatePlantLightRequirements() {
  console.log('🌿 Atualizando Light Requirements baseado em inteligência botânica...\n');

  if (!fs.existsSync(PLANTS_JSON)) {
    console.error('❌ Arquivo plants.json não encontrado.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(PLANTS_JSON, 'utf-8'));
  let plants = data.plants || data;

  let lowCount = 0;
  let mediumCount = 0;
  let highCount = 0;
  let updatedCount = 0;

  console.log('📊 Analisando 983 plantas...\n');

  // Processa cada planta
  for (let i = 0; i < plants.length; i++) {
    const plant = plants[i];
    const displayName = plant.commonNames?.[0] || plant.scientificName;

    // Verifica se encontramos um padrão mais específico
    if (isLowLightPlant(plant)) {
      if (plants[i].lightRequirements !== 'low') {
        console.log(`✅ [${i + 1}] ${displayName} → LOW LIGHT`);
        plants[i].lightRequirements = 'low';
        plants[i].infoSource = 'Botanical-Based';
        updatedCount++;
      }
      lowCount++;
    } else if (isHighLightPlant(plant)) {
      if (plants[i].lightRequirements !== 'high') {
        console.log(`✅ [${i + 1}] ${displayName} → HIGH LIGHT`);
        plants[i].lightRequirements = 'high';
        plants[i].infoSource = 'Botanical-Based';
        updatedCount++;
      }
      highCount++;
    } else {
      // Mantém como Medium (padrão)
      mediumCount++;
    }
  }

  // Salva resultado
  const finalData = {
    total: plants.length,
    toxic: plants.filter(p => p.toxic).length,
    nonToxic: plants.filter(p => !p.toxic).length,
    lastUpdated: new Date().toISOString(),
    plants: plants
  };
  fs.writeFileSync(PLANTS_JSON, JSON.stringify(finalData, null, 2));

  console.log('\n✨ Atualização concluída!\n');
  console.log(`📊 Distribuição Final de Light Requirements:`);
  console.log(`   🌑 Low Light: ${lowCount} plantas`);
  console.log(`   🌤️  Medium Light: ${mediumCount} plantas`);
  console.log(`   🌞 High Light: ${highCount} plantas`);
  console.log(`\n🔄 Atualizadas nesta sessão: ${updatedCount} plantas\n`);
}

// Executa
updatePlantLightRequirements();

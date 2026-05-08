const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../../data.md');
const content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n');
let toxicPlants = [];
let nonToxicPlants = [];
let currentSection = null;
let plantId = 1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.includes('Plants Toxic to Cats')) {
    currentSection = 'toxic';
    continue;
  }
  if (line.includes('Plants Non-Toxic to Cats')) {
    currentSection = 'non-toxic';
    continue;
  }
  
  if (!line) continue;
  
  const parts = line.split('|');
  if (parts.length < 3) continue;
  
  try {
    const commonNamesRaw = parts[0]?.trim() || '';
    const scientificNamesRaw = parts[1]?.match(/Scientific Names:\s*(.+)/)?.[1]?.trim() || '';
    const familyRaw = parts[2]?.match(/Family:\s*(.+)/)?.[1]?.trim() || '';
    
    if (!commonNamesRaw) continue;
    
    const commonNames = [
      commonNamesRaw.split('(')[0].trim(),
      ...((commonNamesRaw.match(/\(([^)]+)\)/) || ['', ''])[1]?.split(',').map(name => name.trim()) || [])
    ].filter(name => name && name.length > 0);
    
    const plant = {
      id: plantId++,
      commonNames,
      scientificName: scientificNamesRaw,
      family: familyRaw || 'Unknown',
      toxic: currentSection === 'toxic'
    };
    
    if (currentSection === 'toxic') {
      toxicPlants.push(plant);
    } else if (currentSection === 'non-toxic') {
      nonToxicPlants.push(plant);
    }
  } catch (error) {
    console.error(`Erro ao processar linha: ${line}`, error.message);
  }
}

const allPlants = [...toxicPlants, ...nonToxicPlants];

const output = {
  total: allPlants.length,
  toxic: toxicPlants.length,
  nonToxic: nonToxicPlants.length,
  lastUpdated: new Date().toISOString(),
  plants: allPlants
};

const outputPath = path.join(__dirname, 'plants.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`✅ Parsing completo!`);
console.log(`📊 Total de plantas: ${allPlants.length}`);
console.log(`🐱 Plantas tóxicas: ${toxicPlants.length}`);
console.log(`✅ Plantas não-tóxicas: ${nonToxicPlants.length}`);
console.log(`📁 Arquivo salvo em: ${outputPath}`);

# 🌿 PetFlora - API de Plantas Tóxicas e Seguras para Gatos

API completa para consultar plantas tóxicas e não-tóxicas para gatos, com interface React moderna e dados de fontes confiáveis.

## 📚 Fontes de Dados

Este projeto agrega informações de diversas fontes confiáveis:

### 1. **Dados de Toxicidade** 🔴
- **Principal Source:** [ASPCA® (American Society for the Prevention of Cruelty to Animals®)](https://www.aspca.org/)
  - Lista oficial e atualizada de plantas tóxicas e não toxícas para gatos

### 2. **Dados Botânicos** 🌱
- **Trefle API** - Banco de dados de plantas (Light Requirements, Size, Growth Habit)
- **GBIF** (Global Biodiversity Information Facility) - Dados científicos globais
- **Family-based Heuristics** - Padrões horticulturais conhecidos por família botânica

### 3. **Imagens de Plantas** 🖼️
- **iNaturalist** (72.5% - 713 plantas) - Fotos reais de espécies naturais
- **Unsplash** (5-10% - 100-150 plantas) - Imagens de alta qualidade de plantas
- **Pexels** (2-5% - 30-50 plantas) - Banco de fotos complementar

### 4. **Informações de Requisitos de Luz** 💡
- Identificação por nome científico
- Padrões por família botânica
- Análise de palavras-chave (Ferns, Orchids, Cacti, etc)
- Padrão seguro: Medium Light

## ⚠️ Aviso Importante

Este é um **aplicativo de referência informativa**, não um substituto para avaliação profissional. Os dados foram agregados de terceiros e devem ser verificados com um veterinário em caso de ingestão suspeita.

## 📦 Estrutura do Projeto

```
petflora/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── server.js    # Servidor principal
│   │   ├── routes/      # Rotas da API
│   │   ├── controllers/ # Lógica dos endpoints
│   │   ├── services/    # Serviços de negócio
│   │   └── data/        # Dados e scripts de parse
│   ├── scripts/         # Scripts auxiliares
│   │   ├── fetchPlantImages.js - Busca imagens iNaturalist
│   │   ├── fetchPlantImagesV2.js - Fallback Unsplash + Pexels
│   │   ├── fetchPlantInfo.js - Dados botânicos
│   │   └── updateLightRequirements.js - Atualiza requisitos de luz
│   └── package.json
├── frontend/            # React + Vite
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── hooks/       # Custom hooks (useMyGarden)
│   │   ├── services/    # Serviços de API
│   │   ├── styles/      # Estilos CSS
│   │   └── App.jsx
│   └── package.json
└── data.md              # Dados originais em Markdown (baseado em ASPCA®)
```

## 🚀 Instalação Rápida

### 1. Backend Setup

```bash
cd backend

# Instalar dependências
npm install

# Parse dos dados (obrigatório na primeira vez!)
npm run parse

# Iniciar servidor em desenvolvimento
npm run dev
# ou produção
npm start
```

**Servidor rodará em:** `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

**Frontend rodará em:** `http://localhost:3000`

## 📊 Endpoints da API

### Plantas
- `GET /api/plants` - Todas as plantas
- `GET /api/plants/toxic` - Apenas tóxicas
- `GET /api/plants/non-toxic` - Apenas seguras
- `GET /api/plants/:id` - Detalhes de uma planta

### Busca
- `GET /api/plants/search?q=nome` - Buscar por nome/família
- `GET /api/plants/family?family=Araceae` - Filtrar por família

### Estatísticas
- `GET /api/plants/stats` - Estatísticas gerais
- `GET /health` - Status da API

## 🔧 Tecnologias

**Backend:**
- Node.js
- Express
- CORS
- dotenv
- node-fetch (para chamadas de API)

**Frontend:**
- React 18
- Vite
- Axios
- CSS3 (Grid, Flexbox)
- localStorage (My Garden)

## 📝 Dados

- **Total de plantas:** ~983
- **Plantas tóxicas:** ~423
- **Plantas seguras:** ~560
- **Famílias:** Mais de 100 famílias diferentes
- **Imagens:** ~850 plantas com imagens reais
- **Requisitos de Luz:** 100% das plantas catalogadas
- **Informações de Tamanho:** 100% das plantas catalogadas

## 🎯 Funcionalidades

### Backend
✅ Parse automático de dados Markdown (ASPCA®)
✅ API RESTful completa
✅ Busca por nome/família
✅ Filtros por toxicidade
✅ Filtros por Light Requirements
✅ Filtros por Size
✅ Estatísticas de plantas
✅ CORS habilitado
✅ Erro handling

### Frontend
✅ Interface responsiva (mobile, tablet, desktop)
✅ Busca em tempo real
✅ Dois modos: Tóxicas e Seguras
✅ Cards informativos com imagens reais
✅ Filtros por Luz (Low, Medium, High)
✅ Filtros por Tamanho (Small, Medium, Large)
✅ Paginação (12 plantas por página)
✅ **My Garden** - Salva plantas favoritas (localStorage)
✅ Design moderno responsivo
✅ Favicon customizado (🌿)

## 📖 Como Usar

### 1. Buscar uma planta:
- Digite o nome no campo de busca
- Resultados aparecem em tempo real

### 2. Ver detalhes:
- Clique em um card para ver mais informações
- Nome científico, família, imagem real
- Requisitos de luz e tamanho

### 3. Filtros:
- Use as abas para ver plantas tóxicas ou seguras
- Filtre por requisitos de luz (Low/Medium/High)
- Filtre por tamanho (Small/Medium/Large)

### 4. My Garden:
- Clique em "Add to Garden" para salvar plantas
- Acesse "My Garden" para ver suas plantas salvas
- Remova plantas individuais ou limpe todo o garden
- Dados persistem no navegador (localStorage)

## 🔄 Pipeline de Dados

1. **Extração:** Dados `data.md` (baseado em ASPCA®)
2. **Parse:** `parse.js` converte para JSON estruturado
3. **Enriquecimento:** Scripts adicionam informações:
   - `fetchPlantImages.js` → iNaturalist (72.5% sucesso)
   - `fetchPlantImagesV2.js` → Unsplash + Pexels (fallback)
   - `fetchPlantInfo.js` → Trefle + GBIF (dados botânicos)
   - `updateLightRequirements.js` → Requisitos de luz

## 📄 Licença & Créditos

### Dados
- **ASPCA®** - Dados de toxicidade para animais domésticos
- **Trefle API** - Informações botânicas
- **GBIF** - Dados de biodiversidade global
- **iNaturalist** - Fotos de plantas reais
- **Unsplash** - Imagens de alta qualidade
- **Pexels** - Banco de fotos complementar

### Projeto
MIT License

---

## ⚠️ Disclaimer

**IMPORTANTE:** Este aplicativo fornece informações educacionais baseadas em dados de terceiros (ASPCA®, Trefle, iNaturalist, etc). Em caso de ingestão acidental de planta tóxica:

1. **Procure um veterinário imediatamente**
2. Leve a planta ou foto da planta
3. Anote a hora de ingestão e quantidade
4. **NÃO** confie apenas neste aplicativo para diagnóstico

Os dados são para referência e prevenção, não para diagnóstico veterinário profissional.

---

**Última atualização:** May 8, 2026

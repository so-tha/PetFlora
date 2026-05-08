# 🌿 Script de Busca de Imagens - iNaturalist

## Como Funciona

Este script busca automaticamente imagens de cada planta usando a **API do iNaturalist** e o **nome científico** de cada planta.

### Características:
- ✅ Busca 100% automatizada via iNaturalist API
- ✅ Gratuito e sem limite de requisições
- ✅ Salva progresso (pode retomar se falhar no meio)
- ✅ Delay entre requisições (500ms) para não sobrecarregar API
- ✅ Atualiza `plants.json` com URLs de imagens real
- ✅ Mostra progresso em tempo real

---

## 📋 Passo 1: Pré-requisitos

Certifique-se de ter executado `parse.js` primeiro:

```bash
cd backend/src/data
node parse.js
```

Isso gera o arquivo `backend/src/data/plants.json` necessário.

---

## 🚀 Passo 2: Executar o Script

Dentro do diretório `backend`:

```bash
node scripts/fetchPlantImages.js
```

### O que acontece:
1. Lê `plants.json` com todos os nomes científicos
2. Para cada planta, consulta a API do iNaturalist
3. Se encontrar uma imagem, salva a URL em `plants.json`
4. Mostra progresso em tempo real: `✅` (encontrou), `❌` (não encontrou)
5. A cada 10 plantas, salva o progresso automaticamente

### Exemplo de saída:
```
🌿 Iniciando busca de imagens de plantas no iNaturalist...

📊 Total de plantas: 1000
✅ Já processadas: 0
❌ Falhadas: 0

⏳ [1/1000] Adam-and-Eve... ✅
⏳ [2/1000] African Wonder Tree... ✅
⏳ [3/1000] Alocasia... ✅
...
📁 Progresso salvo: 10/1000
```

---

## ⏸️ Retomar de Interrupções

Se o script falhar ou você interromper:

```bash
node scripts/fetchPlantImages.js
```

Ele **automaticamente** retoma de onde parou! 📁

---

## 📊 Resultado Final

Após a conclusão, você verá algo como:

```
✨ Busca concluída!

📊 Resumo Final:
   ✅ Imagens encontradas: 847
   ❌ Sem imagem: 153
   📊 Taxa de sucesso: 84.7%
```

O arquivo `plants.json` será atualizado com:
```json
{
  "id": "...",
  "commonNames": ["..."],
  "scientificName": "Arum maculatum",
  "family": "Araceae",
  "toxic": true,
  "imageUrl": "https://...",           // ← NOVO
  "imageSource": "iNaturalist",        // ← NOVO
  "imageSourceUrl": "https://..."      // ← NOVO
}
```

---

## 🖼️ Exibir Imagens no Frontend

As imagens são exibidas **automaticamente** no componente `PlantCard`:

```jsx
<PlantCard plant={plant} />
// Se plant.imageUrl existir, mostra a imagem
// Caso contrário, mostra o placeholder 🌿
```

---

## ⏱️ Tempo de Execução

Com 1000 plantas:
- ~500 ms de delay entre requisições
- **Tempo total: ~8-10 minutos**

Você pode reduzir o delay em `fetchPlantImages.js`:
```javascript
const DELAY_MS = 250;  // Reduz de 500ms para 250ms
```

⚠️ Mas cuidado: a API do iNaturalist é livre, então não sobrecarregue!

---

## 🔧 Como Funciona Internamente

1. **Busca iNaturalist**: Envia nome científico para API
2. **Extrai imagem**: Pega a URL da foto de melhor qualidade
3. **Armazena**: Salva em `plants.json`
4. **Retomação**: Usa `.image-fetch-progress.json` para rastrear progresso
5. **Cleanup**: Remove arquivo de progresso ao terminar

---

## ✅ Próximos Passos

1. ✅ Execute o script: `node scripts/fetchPlantImages.js`
2. 🎨 Inicie o frontend: `npm run dev`
3. 🌿 As imagens aparecerão nos cards automaticamente!

---

## 📝 Notas

- Algumas plantas podem não ter imagem no iNaturalist (153 sem sucesso esperado para ~1000 plantas)
- O placeholder 🌿 aparece para plantas sem imagem
- As imagens são otimizadas em resolução media pelo iNaturalist

Pronto! 🚀

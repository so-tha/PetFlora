#!/bin/bash

# 🚀 Script de Deploy do PetFlora para Vercel
# Execute este script para preparar e fazer deploy

set -e

echo "🌿 PetFlora - Deploy Helper"
echo "================================"
echo ""

# 1. Verificar dados
echo "📊 Verificando dados..."
if [ ! -f "backend/src/data/plants.json" ]; then
    echo "⚠️  plants.json não encontrado. Rodando parse..."
    cd backend/src/data
    node parse.js
    cd ../../..
    echo "✅ Dados parseados!"
else
    echo "✅ plants.json encontrado"
fi

# 2. Verificar build
echo ""
echo "🔨 Testando build local..."
npm run build
echo "✅ Build OK!"

# 3. Verificar estrutura
echo ""
echo "📁 Verificando estrutura..."
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json não encontrado!"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json na raiz não encontrado!"
    exit 1
fi

if [ ! -f ".env.example" ]; then
    echo "❌ .env.example não encontrado!"
    exit 1
fi

echo "✅ Estrutura OK!"

# 4. Git status
echo ""
echo "📦 Status Git..."
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "⚠️  Não é um repositório git. Inicializando..."
    git init
    git remote add origin "https://github.com/seu-usuario/petflora.git" || true
fi

# 5. Verificar se há perda de dados
echo ""
echo "📋 Arquivos a commitar:"
git status --short || echo "Nada a fazer"

echo ""
echo "================================"
echo "✅ Tudo pronto para deploy!"
echo ""
echo "Próximos passos:"
echo "1. git add ."
echo "2. git commit -m 'Deploy para Vercel'"
echo "3. git push origin main"
echo "4. Ir para https://vercel.com/new"
echo "5. Importar repositório"
echo ""
echo "Ou use: npm i -g vercel && vercel --prod"

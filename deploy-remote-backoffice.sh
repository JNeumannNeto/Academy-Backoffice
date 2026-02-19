#!/bin/bash
set -e

echo "🔄 Iniciando deployment do Academy Backoffice..."
echo "=================================================="

cd /var/www/academia/backoffice

# ============================================
# 1. Limpar builds antigos
# ============================================
echo "📦 Limpando builds antigos..."
rm -rf .next public .env.local 2>/dev/null || true

# ============================================
# 2. Extrair novo código
# ============================================
echo "📥 Extraindo código do backoffice..."

if [ -f /tmp/backoffice-build.tar.gz ]; then
  tar -xzf /tmp/backoffice-build.tar.gz -C .
  rm -f /tmp/backoffice-build.tar.gz
  echo "✅ Arquivo tar.gz extraído com sucesso"
elif [ -f /tmp/backoffice-build.zip ]; then
  unzip -o /tmp/backoffice-build.zip -d .
  rm -f /tmp/backoffice-build.zip
  echo "✅ Arquivo zip extraído com sucesso"
else
  echo "❌ ERRO: Nenhum arquivo de build encontrado!"
  echo "   Procurando em /tmp:"
  ls -la /tmp/ | grep backoffice || echo "Nenhum arquivo backoffice encontrado"
  exit 1
fi

# ============================================
# 3. Validar que os arquivos foram extraídos
# ============================================
echo "🔍 Validando arquivos extraídos..."

if [ ! -d ".next" ]; then
  echo "❌ ERRO: Pasta .next não foi extraída!"
  echo "   Verifique se o build foi completado corretamente"
  exit 1
fi

if [ ! -f ".env.local" ]; then
  echo "❌ ERRO: Arquivo .env.local não foi extraído!"
  exit 1
fi

echo "✅ Arquivos validados com sucesso"

# ============================================
# 4. Ajustar permissões
# ============================================
echo "🔐 Ajustando permissões..."
sudo chown -R ubuntu:ubuntu .next public .env.local || true
sudo chmod -R 755 .next public || true
chmod 644 .env.local || true

echo "✅ Permissões ajustadas"

# ============================================
# 5. Exibir configuração
# ============================================
echo ""
echo "📋 Configuração do Backoffice:"
cat .env.local || true
echo ""

# ============================================
# 6. Reiniciar processo com PM2
# ============================================
echo "🔄 Reiniciando processo..."
pm2 restart academia-backoffice || pm2 start npm --name academia-backoffice -- start

# ============================================
# 7. Aguardar inicialização
# ============================================
sleep 3

# ============================================
# 8. Verificar status
# ============================================
echo ""
echo "📊 Status do Processo:"
pm2 status || true
echo ""

# ============================================
# 9. Teste de health check (porta 3002)
# ============================================
echo "🏥 Testando saúde da aplicação..."
if curl -s http://localhost:3002 >/dev/null 2>&1; then
  echo "✅ Backoffice respondendo na porta 3002"
else
  echo "⚠️  Backoffice pode estar demorando para iniciar"
  echo "   Tente novamente em alguns segundos: curl http://localhost:3002"
fi

# ============================================
# 10. Exibir logs
# ============================================
echo ""
echo "📋 Últimas linhas do log:"
pm2 logs academia-backoffice --lines 10 2>/dev/null || true
echo ""

# ============================================
# Conclusão
# ============================================
echo "✅ Backoffice atualizado e reiniciado com sucesso!"
echo "=================================================="
echo ""
echo "📊 Verificações recomendadas:"
echo "  1. curl http://localhost:3002 (local, porta 3002)"
echo "  2. https://effortbackoffice.jneumann.com.br (acesso remoto)"
echo "  3. pm2 logs academia-backoffice (monitorar erros)"
echo ""
echo "⏱️  O restart pode levar 10-15 segundos"
echo ""
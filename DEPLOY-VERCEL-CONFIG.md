# Documentação de Deploy - TukTuk Milfontes no Vercel

**Data:** 09/08/2025  
**Status:** ✅ Deploy funcionando corretamente  
**URL de Produção:** https://tuktuk-milfontes.vercel.app/

## 📋 Resumo da Configuração

Esta documentação descreve a configuração funcional que resolveu todos os problemas de deploy no Vercel para o projeto TukTuk Milfontes.

## 🔧 Configurações de Arquivos

### 1. `vercel.json` - Configuração Principal do Vercel

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Pontos Críticos:**

- ✅ `outputDirectory: "dist"` - Especifica onde o Vite gera os arquivos
- ✅ `buildCommand: "npm run build"` - Comando explícito para build
- ✅ `installCommand: "npm install"` - Instalação de dependências
- ✅ `rewrites` - Redirecionamento para SPA (Single Page Application)

### 2. `vite.config.ts` - Configuração Simplificada do Vite

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
  build: {
    chunkSizeWarningLimit: 1200,
  },
});
```

**Pontos Críticos:**

- ✅ **Sem chunking manual** - Evita problemas de React Context
- ✅ **Configuração minimalista** - Reduz possibilidade de erros
- ✅ **Plugin React SWC** - Build mais rápido
- ✅ **Alias @** - Importações relativas simplificadas

### 3. `.vercelignore` - Exclusões de Deploy

```
# Documentation files
*.md
!README.md

# Development files
scripts/
.env.local

# Cache and temporary files
.cache/
.vite/
*.tmp
```

**Pontos Críticos:**

- ✅ **Documentação excluída** - Reduz tamanho do upload
- ✅ **Scripts de desenvolvimento** - Não necessários em produção
- ✅ **Arquivos de cache** - Evita conflitos

### 4. `package.json` - Scripts de Build (Fragmento)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview",
    "vercel-build": "npm run optimize:images && vite build",
    "optimize:images": "node scripts/optimize-images.mjs public"
  }
}
```

## 🚨 Problemas Resolvidos

### Erro: "Missing public directory"

- **Causa:** Vercel procurava pasta `public`, mas Vite gera `dist`
- **Solução:** Especificar `outputDirectory: "dist"` no vercel.json

### Erro: "Cannot read properties of undefined (reading 'createContext')"

- **Causa:** Chunking manual estava separando React em múltiplas instâncias
- **Solução:** Remover configuração `manualChunks` do Vite

### Erro: "All checks have failed"

- **Causa:** Configurações complexas causando conflitos
- **Solução:** Simplificar todas as configurações para o mínimo necessário

## 🌍 Variáveis de Ambiente no Vercel

**IMPORTANTE:** Configurar no Dashboard do Vercel → Settings → Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://iweurnqdomiqlohvaoat.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Environment Settings
NODE_VERSION=18
```

**Configuração por Ambiente:**

- ✅ **Production** - Para site principal
- ✅ **Preview** - Para branches de teste
- ✅ **Development** - Para desenvolvimento local

## 📊 Estrutura de Build Gerada

Após `npm run build`, a pasta `dist/` contém:

```
dist/
├── assets/              # JS/CSS bundles otimizados
│   ├── index-[hash].js
│   └── index-[hash].css
├── lovable-uploads/     # Imagens da aplicação
├── index.html          # Ponto de entrada principal
├── favicon.ico         # Ícone do site
├── robots.txt          # SEO
├── sitemap.xml         # SEO
└── outros assets...    # PWA manifests, etc.
```

## 🔄 Processo de Deploy

1. **Git Push** → Repositório GitHub
2. **Vercel detecta** mudanças automaticamente
3. **Install:** `npm install`
4. **Build:** `npm run build`
5. **Output:** Pasta `dist/` é publicada
6. **Deploy:** Site fica disponível

## 🛠️ Dashboard do Vercel - Configurações Importantes

### Framework Preset

- **Selecionado:** Vite
- **Auto-detectado:** ✅

### Build & Development Settings

- **Build Command:** npm run build
- **Output Directory:** dist
- **Install Command:** npm install
- **Development Command:** npm run dev

### Domains

- **Production:** tuktuk-milfontes.vercel.app
- **Custom Domain:** (se configurado)

## 🧪 Testes de Validação

### Build Local

```bash
npm run build
# Verificar se pasta dist/ é criada
# Verificar se index.html existe em dist/
```

### Preview Local

```bash
npm run preview
# Testa build em servidor local
```

### Deploy Test

```bash
git add .
git commit -m "Test deploy"
git push origin main
# Verificar logs no Dashboard Vercel
```

## 📝 Notas Importantes

### ✅ O que Funciona

- Build determinístico e rápido
- SPA routing correto
- Assets estáticos servidos corretamente
- Variáveis de ambiente carregadas
- SEO meta tags configuradas

### ⚠️ Cuidados Futuros

- **Não alterar** `outputDirectory` sem necessidade
- **Manter** vite.config.ts simples
- **Testar localmente** antes de fazer push
- **Verificar variáveis** de ambiente em novos branches

### 🔧 Troubleshooting Rápido

**Deploy falha:**

1. Verificar logs no Dashboard Vercel
2. Testar `npm run build` localmente
3. Verificar se `dist/` contém `index.html`

**Página em branco:**

1. Verificar variáveis de ambiente
2. Verificar console do browser
3. Verificar se assets carregam corretamente

**Erro 404 em rotas:**

1. Verificar `rewrites` no vercel.json
2. Confirmar que é SPA routing

## 📚 Recursos de Referência

- [Documentação Vercel](https://vercel.com/docs)
- [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [React Router SPA](https://reactrouter.com/en/main/routers/create-browser-router)

---

**Autor:** GitHub Copilot  
**Projeto:** TukTuk Milfontes  
**Última Atualização:** 09/08/2025

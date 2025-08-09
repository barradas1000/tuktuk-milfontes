# Quick Deploy Reference - TukTuk Milfontes

> **Status:** ✅ Funcionando (09/08/2025)  
> **URL:** https://tuktuk-milfontes.vercel.app/

## 🚀 Configuração Essencial

### vercel.json (Mínimo Necessário)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### vite.config.ts (Simplificado)

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: { chunkSizeWarningLimit: 1200 },
});
```

### .vercelignore (Otimizado)

```
*.md
!README.md
scripts/
.env.local
.cache/
.vite/
*.tmp
```

## ⚡ Comandos Rápidos

```bash
# Test local build
npm run build

# Deploy
git add . && git commit -m "Deploy update" && git push origin main

# Check if dist folder is created correctly
ls dist/
```

## 🔑 Variáveis de Ambiente (Vercel Dashboard)

```
VITE_SUPABASE_URL=https://iweurnqdomiqlohvaoat.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

## 🛠️ Troubleshooting

| Problema                   | Solução                             |
| -------------------------- | ----------------------------------- |
| "Missing public directory" | Verificar `outputDirectory: "dist"` |
| "createContext error"      | Não usar `manualChunks` no Vite     |
| "All checks failed"        | Simplificar configurações           |
| Página em branco           | Configurar variáveis de ambiente    |

---

📖 **Documentação completa:** [DEPLOY-VERCEL-CONFIG.md](./DEPLOY-VERCEL-CONFIG.md)

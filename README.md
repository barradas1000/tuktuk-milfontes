# TukTuk Milfontes

Plataforma web para reservas e gestão de passeios de tuk-tuk em Vila Nova de Milfontes.

## 🚀 Deploy Status

- **Última atualização**: 09/08/2025
- **Status**: Corrigindo problemas de deploy no Vercel

## Sumário

- [Atualizações Recentes](#atualizações-recentes)
- [Deploy no Vercel](#deploy-no-vercel)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Funcionalidades Detalhadas](#funcionalidades-detalhadas)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Como rodar localmente](#como-rodar-localmente)
- [Segurança e Boas Práticas](#segurança-e-boas-práticas)
- [Diagrama de Funcionalidades](#diagrama-de-funcionalidades)

## Atualizações Recentes

- Implementada a atualização em tempo real da localização do passageiro no mapa.
- Corrigido erro de página branca causado por variáveis de ambiente ausentes.
- Otimização do sistema de tracking e integração Supabase.
- Ajustado `.gitignore` para garantir deploy correto na Vercel.
- Documentação e exemplos de configuração `.env` adicionados.

## Deploy no Vercel

O deploy é feito automaticamente a cada push no branch `main`.  
**Atenção:** As variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` devem ser configuradas no painel do projeto na Vercel.

## Como rodar localmente

1. Instale as dependências:
   ```
   npm install
   ```
2. Crie um arquivo `.env.local` na raiz do projeto com:
   ```
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=SEU_ANON_KEY
   ```
3. Inicie o servidor de desenvolvimento:
   ```
   npm run dev
   ```
4. Para build de produção:
   ```
   npm run build
   ```

## Funcionalidades Principais

- Mapa interativo com localização em tempo real do TukTuk e do passageiro.
- Sistema de reservas e gestão de disponibilidade.
- Painel administrativo para condutores e gestão de reservas.
- Internacionalização (i18n) em múltiplos idiomas.
- Deploy automatizado na Vercel.

## Tecnologias Utilizadas

- React + Vite
- Tailwind CSS
- Supabase (Database, Auth, Realtime)
- React Leaflet (mapas)
- Vercel (deploy)

## Segurança e Boas Práticas

- As variáveis de ambiente sensíveis não são versionadas.
- Recomenda-se manter políticas RLS ativas no Supabase.
- O `.gitignore` está configurado para evitar leaks de dados sensíveis e arquivos desnecessários no deploy.

## Diagrama de Funcionalidades

```
[Passageiro] --reserva--> [Supabase] <--gestão-- [Admin/Condutor]
      |                                         |
      +---localização em tempo real---Mapa---<---+
```

---

**Dúvidas ou problemas?**  
Consulte os logs do Vercel em caso de erro de deploy e verifique se as variáveis de ambiente estão corretamente configuradas. Para questões sobre o código, consulte a documentação das tecnologias utilizadas ou entre em contato com o desenvolvedor responsável.

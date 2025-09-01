# TukTuk Milfontes

Plataforma web para reservas e gestão de passeios de tuk-tuk em Vila Nova de Milfontes, construída com React, Vite, e Supabase.

## 🚀 Status do Projeto

- **Última atualização**: 01/09/2025
- **Status**: Otimizado para deploy na Vercel.

## Sumário

- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Como Executar Localmente](#como-executar-localmente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Deploy na Vercel](#deploy-na-vercel)
- [Segurança e Boas Práticas](#segurança-e-boas-práticas)

---

## Tecnologias Utilizadas

- **Framework**: React com Vite
- **Linguagem**: TypeScript
- **Backend & Base de Dados**: Supabase (Database, Auth, Realtime)
- **UI**: Tailwind CSS com shadcn/ui e Radix UI
- **Mapas**: React Leaflet
- **Gestão de Estado**: TanStack Query (React Query)
- **Formulários**: React Hook Form com Zod para validação
- **Internacionalização (i18n)**: i18next
- **Deploy**: Vercel

---

## Estrutura de Pastas

O projeto segue uma estrutura modular para facilitar a manutenção e o desenvolvimento.

```
/
├── public/         # Ficheiros estáticos
├── src/
│   ├── app/        # Lógica principal da aplicação
│   ├── assets/     # Imagens, ícones, etc.
│   ├── components/ # Componentes reutilizáveis (UI)
│   ├── constants/  # Constantes globais
│   ├── data/       # Dados estáticos ou mocks
│   ├── hooks/      # Hooks customizados
│   ├── i18n/       # Configuração de internacionalização
│   ├── lib/        # Funções utilitárias e helpers
│   ├── pages/      # Componentes de página (rotas)
│   ├── services/   # Comunicação com APIs (ex: Supabase)
│   └── types/      # Definições de tipos TypeScript
└── ...
```

---

## Como Executar Localmente

**Pré-requisitos:**
- Node.js (versão 18 ou superior)
- npm

**Passos:**

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/barradas1000/tuktuk-milfontes.git
    cd tuktuk-milfontes
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um ficheiro `.env.local` na raiz do projeto e adicione as chaves do Supabase.
    ```
    VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
    VITE_SUPABASE_ANON_KEY=SEU_ANON_KEY
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    A aplicação estará disponível em `http://localhost:5173` (ou outra porta, se a 5173 estiver ocupada)....

---

## Scripts Disponíveis

-   `npm run dev`: Inicia o servidor de desenvolvimento com Hot-Reload.
-   `npm run build`: Gera a versão de produção otimizada na pasta `dist/`.
-   `npm run preview`: Inicia um servidor local para pré-visualizar a versão de produção.
-   `npm run lint`: Executa o linter (ESLint) para verificar a qualidade do código.
-   `npm run clean`: Remove o diretório `dist/` para uma limpeza completa.

---

## Deploy na Vercel

O deploy é feito automaticamente a cada `push` no branch `main`.

-   **Configuração**: O ficheiro `vercel.json` define o `buildCommand` e o `outputDirectory`.
-   **Variáveis de Ambiente**: As chaves `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` devem ser configuradas no painel do projeto na Vercel para que o deploy funcione corretamente.
-   **Otimização**: O ficheiro `.vercelignore` está configurado para excluir ficheiros desnecessários (documentação, testes, configurações locais), garantindo um deploy mais rápido e leve.

---

## Segurança e Boas Práticas

-   **Variáveis de Ambiente**: Chaves sensíveis são geridas através de variáveis de ambiente e nunca são versionadas, graças ao `.gitignore`.
-   **Supabase RLS**: Recomenda-se manter as políticas de Row Level Security (RLS) ativas no Supabase para garantir o acesso seguro aos dados.

---

**Dúvidas ou problemas?**
Consulte os logs do Vercel em caso de erro de deploy e verifique se as variáveis de ambiente estão corretamente configuradas.
# TukTuk Milfontes

Plataforma web para reservas e gestão de passeios de tuk-tuk em Vila Nova de Milfontes.

## Funcionalidades Principais

- **Página inicial** com apresentação dos passeios, preços, destaques turísticos e depoimentos de clientes.
- **Reserva online**: formulário intuitivo, integração direta com WhatsApp para confirmação rápida e consulta de disponibilidade em tempo real.
- **Tipos de passeio**: panorâmico, praia das Furnas, travessia da ponte, pôr do sol, noturno e rota dos pescadores.
- **Gestão administrativa**: área de login para administradores, painel para gerir reservas, calendário de disponibilidade e relatórios.
- **Mapa interativo** com pontos de interesse turísticos.
- **Multilingue**: suporte a vários idiomas (Português, Inglês, Espanhol, Francês, Alemão, Holandês, Italiano).
- **Preços transparentes** e exemplos de cálculo.
- **Informações de contacto** e destaques como seguro e fotos incluídos.

## Funcionalidades Detalhadas

- **Reservas online de passeios de Tuk Tuk:** Permite ao utilizador reservar facilmente um passeio, escolhendo data, hora e número de pessoas, com confirmação via WhatsApp.
- **Mapa interativo com pontos de interesse:** Visualize no mapa os principais pontos turísticos, praias, restaurantes, alojamentos e atividades de Milfontes, com descrições em vários idiomas.
- **Calendário de disponibilidade:** Consulte em tempo real os horários disponíveis para reservas, evitando conflitos e sobreposições.
- **Painel administrativo:** Área exclusiva para administradores, com login, gestão de reservas, visualização de calendário e lista de clientes.
- **Internacionalização (PT, EN, ES, FR, DE, IT, NL):** Toda a aplicação pode ser utilizada em 7 idiomas, com tradução automática dos conteúdos e dos pontos de interesse.
- **Preços transparentes:** Tabela de preços clara, exemplos de cálculo e simulação de valores para diferentes tipos de passeio e número de pessoas.
- **Testemunhos de clientes:** Secção com avaliações reais de clientes, para aumentar a confiança dos novos utilizadores.
- **FAQ (Perguntas Frequentes):** Respostas às dúvidas mais comuns sobre os passeios, reservas, segurança e condições.
- **Contactos e integração WhatsApp:** Botão para contacto direto via WhatsApp, telefone e email.
- **Acessibilidade e responsividade:** Interface adaptada a dispositivos móveis, tablets e desktop, com navegação intuitiva.

## Tecnologias Utilizadas

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Supabase (reservas e autenticação)
- **Integração:** WhatsApp para confirmação de reservas
- **Internacionalização:** i18next

## Como rodar localmente

1. **Pré-requisitos:**

   - Node.js 18.x LTS
   - npm

2. **Instalação:**

   ```sh
   npm install --legacy-peer-deps
   ```

3. **Configuração de variáveis de ambiente:**

   - Crie um ficheiro `.env` na raiz do projeto **(NUNCA publique este ficheiro no git)**.
   - Adicione as seguintes variáveis (obtenha os valores no painel do Supabase):
     ```
     VITE_SUPABASE_URL=https://<teu-projeto>.supabase.co
     VITE_SUPABASE_ANON_KEY=<a-tua-anon-key>
     ```

4. **Executar em modo desenvolvimento:**

   ```sh
   npm run dev
   ```

5. **Aceder:**
   - [http://localhost:5173](http://localhost:5173)

## Segurança e Boas Práticas

- **NUNCA exponha chaves ou tokens sensíveis no código-fonte ou em repositórios públicos.**
- Use sempre variáveis de ambiente para segredos e dados sensíveis.
- O ficheiro `.env` já está incluído no `.gitignore` por padrão.
- Em produção (Vercel, etc.), defina as variáveis de ambiente no painel da plataforma.
- Se algum segredo for exposto, revogue-o imediatamente e gere um novo.

## Diagrama de Funcionalidades

```mermaid
graph TD;
  A[Usuário] -->|Reserva| B[Formulário de Reserva]
  B -->|Confirmação| C[WhatsApp]
  A -->|Consulta| D[Calendário de Disponibilidade]
  A -->|Explora| E[Mapa Interativo]
  A -->|Visualiza| F[Tipos de Passeio]
  A -->|Lê| G[Testemunhos]
  A -->|Admin| H[Painel Administrativo]
  H -->|Gestão| I[Reservas]
  H -->|Gestão| J[Disponibilidade]
  H -->|Relatórios| K[Análises]
```

## Deploy na Vercel

1. Faça login em https://vercel.com/ e crie um novo projeto.
2. Ligue o repositório GitHub à Vercel.
3. Escolha framework: **Vite**.
4. Defina as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel da Vercel.
5. O comando de build é detectado automaticamente (`vite build`).
6. O output será servido automaticamente.

---
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: nome },
    redirectTo: `${window.location.origin}/auth` // ou /login, conforme sua rota
  }
});

© 2025 TukTuk Milfontes. Todos os direitos reservados.
Criado por Carlos Barradas.

#   t u k t u k - m i l f o n t e s 
 
 

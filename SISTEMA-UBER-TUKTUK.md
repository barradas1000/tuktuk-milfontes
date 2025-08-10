# Sistema estilo Uber – Estado atual do Tracking (/tracking)

Este documento descreve a implementação atual do sistema de tracking visível na página `/tracking`, incluindo componentes, integrações, comportamento em tempo real, dependências e pontos críticos para manutenção/rollback.

## Visão geral

- Único TukTuk exposto ao público. Quando online, é mostrado em um mapa OpenStreetMap via react-leaflet.
- Estado e posição vêm do Supabase: tabelas `conductors` (posição e ativação) e `active_conductors` (disponibilidade/ocupação).
- Página de passageiro (`/tracking`) consome em tempo real via Supabase Realtime e renderiza o mapa, status e ações.
- Admin controla o rastreio no painel via botão Ligar/Desligar que ativa o envio contínuo de geolocalização para o Supabase.

## Snapshot do Passageiro (estado funcional atual)

Objetivo: congelar a configuração que já funciona no terreno para o marcador do passageiro se mover em tempo real sem refresh.

- Origem dos dados: geolocalização do próprio dispositivo (browser), via `navigator.geolocation.watchPosition`.
- Atualização do UI: estado local do React (ex.: `passengerPosition`) atualiza o `Marker` no mapa a cada leitura.
- Sem dependência de Supabase para o marcador do passageiro (funciona offline, exceto o mapa/tile).
- Requisitos: HTTPS em telemóvel; permissão de localização concedida.

Ficheiros essenciais (lado Passageiro):
- `src/components/PassengerMap.tsx` — inicia `watchPosition`, guarda `{ lat, lng }` em estado e move o marcador; render do mapa e controlos.
- `src/components/UserLocationMarker.tsx` — gestão do `Marker` (ícone, popup) para a posição do utilizador.
- `src/components/LocationPermissionButton.tsx` — pedido/gestão de permissões de localização com UX de ajuda.
- `src/utils/locationUtils.ts` — utilitários (ex.: cálculo de distância) usados por componentes do tracking.

Configuração recomendada do `watchPosition` (conceito):
- `enableHighAccuracy: true`, `maximumAge: ~2000ms`, `timeout: ~10000ms`.
- Cleanup no unmount com `navigator.geolocation.clearWatch`.

Pontos críticos de prevenção (não alterar):
- Não substituir `watchPosition` por `getCurrentPosition` para o passageiro.
- Não mover a posição do passageiro para Supabase/Realtime; manter local ao dispositivo.
- Não remover o cleanup (`clearWatch`) no unmount do componente.
- Não aplicar throttling agressivo que cause saltos grandes no marcador.
- Não remover o fluxo de permissões/ajuda (`LocationPermissionButton`) sem equivalente.

Teste rápido:
- Abrir `/tracking` em produção (HTTPS) num telemóvel; permitir localização; andar alguns metros — o marcador deve mover sem refresh.

Rollback rápido (apenas lado Passageiro):
- Restaurar o `PassengerMap.tsx` para o último estado bom:
  - `git restore --source=HEAD -- src/components/PassengerMap.tsx`
- Opcional: criar tag de checkpoint após validar no terreno:
  - `git tag passenger-ok-<AAAAmmdd-HHmm>` e `git push origin passenger-ok-<AAAAmmdd-HHmm>`

## Rotas e páginas

- `src/App.tsx`
  - Rota: `<Route path="/tracking" element={<PassengerView />} />`
- `src/pages/PassengerView.tsx`
  - Page-shell com título, cards informativos e o componente principal `PassengerMap`.

## Componentes da página /tracking

1. `src/components/PassengerMap.tsx`

   - Mapa: `MapContainer`, `TileLayer` (OSM), marcador do TukTuk com ícone customizado, e marcador do utilizador opcional.
   - Estado em tempo real:
     - Lê `conductors` ativos (is_active = true) para posição/nome.
     - Enriquecimento com `active_conductors` para status: `available` ou `busy` e `occupied_until`.
     - Subscrições:
       - Canal 1: `postgres_changes` UPDATE em `conductors` para alterações de posição/ativação.
       - Canal 2: `postgres_changes` para `active_conductors` (qualquer evento) para alterações de disponibilidade/occupied_until.
   - UX complementares:
     - Card arrastável com `DistanceCalculator` quando há posição do utilizador e do TukTuk; caso contrário, `LocationPermissionButton` para pedir permissão.
     - Botão “Centrar mapa” (redefine userInteracted para recenter automático no TukTuk).
     - Botão “Fazer reserva” abre `ReservationForm` em `Dialog`.
     - Banner de estado do TukTuk: Disponível/Indisponível e quando volta (se `occupied_until` no futuro).
     - `LocationDebug` no modo DEV.
   - Salvaguardas:
     - Validação estrita de coordenadas antes de renderizar marcadores.
     - Vista inicial: Milfontes `[37.725, -8.783]`, zoom 14.

2. `src/components/ToggleTrackingButton.tsx`

   - Uso no Admin (ex.: `AdminCalendar.tsx`) para Ligar/Desligar o tracking de um `conductorId`.
   - Ligar:
     - Marca `conductors.is_active = true` e inicia `navigator.geolocation.watchPosition`.
     - A cada update, faz `update` de `latitude`, `longitude`, `updated_at` na linha do condutor.
   - Desligar:
     - Para o watch e faz `update { is_active: false }`.
   - UI: estado de carregamento, rótulos e feedback “enviando localização”.

3. `src/components/UserLocationMarker.tsx`

   - Adiciona/remover dinamicamente um `L.marker` com ícone próprio para a posição do utilizador, com popup (coords e precisão).

4. `src/components/LocationPermissionButton.tsx`

   - Abstrai a gestão de permissões de geolocalização com `useGeolocation`.
   - Mostra botão/estado e guia de ajuda para Android/iOS/Desktop quando a permissão é negada/indisponível.

5. `src/components/DistanceCalculator.tsx`

   - Calcula distância e tempo estimado entre utilizador e TukTuk (`utils/locationUtils`).
   - Realça quando o TukTuk está a ≤ 100 m e pode disparar Notification API (se permitido).

6. Outros relacionados
   - `src/components/MilfontesLeafletMap.tsx`: mapa informativo usado na landing (Index) e não no tracking, mas compartilha fixes de ícones/OSM.
   - `src/components/admin/AdminCalendar.tsx`: usa `ToggleTrackingButton` para o condutor selecionado.

## Backend (Supabase) – Tabelas relevantes

- `public.conductors`

  - Campos utilizados: `id: uuid`, `is_active: boolean`, `latitude: float8`, `longitude: float8`, `name: text`, `updated_at: timestamptz`.
  - Semântica: quando `is_active = true`, o TukTuk é elegível para aparecer no mapa de passageiros. Posição atualizada via Admin.

- `public.active_conductors`

  - Campos utilizados: `conductor_id: uuid`, `is_available: boolean`, `occupied_until: timestamptz | null`.
  - Semântica: estado operacional para UX (banner verde/vermelho e "disponível novamente às"). Não controla o envio de posição.

- Realtime

  - Canais criados com `supabase.channel(name).on('postgres_changes', ...)` para ambas as tabelas.
  - A página `/tracking` reage e atualiza o UI sem refresh.

- Auth e RLS (expectativas)
  - O Admin deve ter permissão de UPDATE na linha do seu `conductor`.
  - Leitura pública dos campos mínimos necessários para `/tracking` (ou via key pública + RLS read-only). Garanta que dados sensíveis não são expostos.

## Fluxos principais

- Passageiro (/tracking)

  - Entra na página → carrega condutores ativos e subscreve realtime.
  - Pode conceder localização → aparece marcador do utilizador e o card de distância.
  - Vê estado Disponível/Ocupado e horário de retorno, se definido.
  - Pode recentrar o mapa no TukTuk.

- Admin
  - No painel, clica Ligar → `conductors.is_active = true` + inicia watchPosition e updates de `latitude/longitude`.
  - Clica Desligar → para watch e `is_active = false`.

## Dependências e integrações

- Mapas: `react-leaflet` v4 e `leaflet` (CSS importado em componentes de mapa).
- UI: shadcn/ui (Dialog, Button, Card), Tailwind.
- Tradução: i18next (chaves `tracking.*`, `locationPermission.*`).
- Supabase JS: client em `src/lib/supabase` (URL/anon key via `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).

## Pontos críticos e práticas de segurança

- Variáveis de ambiente

  - Necessário: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` no ambiente de build (local e Vercel). Sem eles, `/tracking` entra em modo seguro (lista vazia e sem subscrições).

- Ícones do Leaflet

  - Corrigidos manualmente importando `marker-icon.png` e `marker-shadow.png` e configurando `L.Marker.prototype.options.icon` em mapas. Não remover esses imports.

- Validação de coordenadas

  - O UI só renderiza marcadores quando `lat/lng` são números válidos e dentro de [-90..90], [-180..180]. Previna dados inválidos no Supabase.

- Realtime

  - Os nomes dos canais são livres; se alterados, atualize em `PassengerMap.tsx`.
  - Certifique RLS para não permitir UPDATE por usuários anónimos.

- Permissões de geolocalização

  - `LocationPermissionButton` e `useGeolocation` exibem ajuda quando negado. Em iOS/Android, instruções específicas. Não remova sem substituir UX equivalente.

- Notificações

  - `DistanceCalculator` pode usar Notification API. Use com cautela e sob permissão do utilizador.

- Unificação de termos
  - O projeto usa `conductors`/`active_conductors` (não `drivers`). Manter consistência em schema, código e docs.

## Rollback e checkpoints (como voltar a este estado)

- Código fonte

  - Branch: `main` no repositório barradas1000/tuktuk-milfontes.
  - Arquivos chaves deste tracking:
    - `src/pages/PassengerView.tsx`
    - `src/components/PassengerMap.tsx`
    - `src/components/ToggleTrackingButton.tsx`
    - `src/components/UserLocationMarker.tsx`
    - `src/components/LocationPermissionButton.tsx`
    - `src/components/DistanceCalculator.tsx`
    - `src/utils/locationUtils.ts`
    - `src/lib/supabase.ts`
  - Build: Vite com `manualChunks` e `chunkSizeWarningLimit` configurados em `vite.config.ts`.

- Base de dados Supabase

  - Tabelas mínimas: `conductors`, `active_conductors` com colunas listadas acima.
  - Realtime ativo para ambas. Confirmar em Database → Replication → WALRUS/Realtime.
  - Policies RLS: leitura pública segura para `/tracking`; updates restritos ao Admin.

- Ambiente

  - Vercel: projeto ligado ao repo, variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` definidas.
  - Local: `.env.local` com as mesmas chaves.

- Teste rápido de sanidade
  - Admin: clique em Ligar no painel; ver se posição começa a atualizar no Supabase.
  - Passageiro: abrir `/tracking`, ver TukTuk no mapa; conceder localização e ver card de distância.
  - Alterar `active_conductors.is_available` e `occupied_until` para testar banners de estado.

## Possíveis problemas e mitigação

- TukTuk não aparece no mapa

  - Verifique `conductors.is_active = true` e `latitude/longitude` válidos.
  - Confirmar variáveis de ambiente e conectividade Supabase no cliente.

- Realtime não atualiza

  - Checar permissões RLS; confirmar que o projeto tem Realtime ativo nas tabelas.
  - Revisar canais/filters em `PassengerMap.tsx`.

- Permissão de localização negada

  - UX orienta a reativação nas definições; não bloqueia o mapa, apenas oculta o marcador do utilizador e o card de distância.

- Bundle grande/lento

  - Vite com `manualChunks` para `react`, `leaflet`, `@supabase`, `i18n` e limite de aviso ajustado. Evite imports dinâmicos desnecessários.

- Dados inválidos no Supabase
  - Há validações no UI, mas recomende-se constraints/checks no DB (por exemplo, range de coordenadas) e sanitização nos updates.

## Anexos e referências

- OSM/Leaflet: tiles `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`.
- Ícone do TukTuk: `src/assets/tuktuk-icon.png`.
- Posições iniciais (fallback) usadas: `[37.725, -8.783]` (Vila Nova de Milfontes).

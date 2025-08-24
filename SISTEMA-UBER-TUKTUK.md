---

## Snapshot Técnico — Agosto/2025 (Configuração Atual)


### 1. Estrutura de Dados e Tracking

- **active_conductors** é a única tabela usada para tracking dinâmico (posição, status, disponibilidade, precisão, sessão).
- **conductors** armazena apenas dados estáticos (nome, tuktuk_id, whatsapp, etc).
- O frontend e o backend nunca fazem update/insert/subscribe de tracking em `conductors`.

#### Interface TypeScript (frontend)

```ts
interface ActiveConductorRow {
  conductor_id: string;
  current_latitude?: number | null;
  current_longitude?: number | null;
  is_available: boolean;
  is_active: boolean;
  occupied_until?: string | null;
  updated_at?: string;
  accuracy?: number | null;
}
```
- Esta interface garante que o frontend manipula apenas dados válidos e tipados, alinhados com o schema do Supabase.




- **Desativar Tracking**:
  - Faz `update` em `active_conductors` com:
    - `is_active: false`, `is_available: false`, `updated_at`.
  - Para o envio de localização.
  - Sincroniza UI via evento customizado.

### 3. Sincronização Realtime

- O frontend (`PassengerMap.tsx`) subscreve apenas eventos da tabela `active_conductors` via canal realtime.
- O array `activeConductors` é atualizado em tempo real e re-renderiza o mapa e os marcadores.
- O TukTuk só aparece se houver registro válido em `active_conductors` com `is_active = true`, `is_available = true` e coordenadas válidas (com precisão ≤ 50m).

### 4. Validação e Filtragem

- Antes de renderizar marcadores, o código valida:
  - Latitude/longitude são números válidos e dentro dos limites [-90, 90], [-180, 180].
  - Precisão (`accuracy`) ≤ 50m.
- Registros inválidos são filtrados e não aparecem no mapa.

### 5. Policies RLS (Supabase)

- Policies garantem que:
  - O condutor só pode alterar o próprio registro.
  - O admin pode ativar/desativar qualquer condutor.
  - Leitura pública dos campos necessários para o mapa.
- Função auxiliar `get_user_role()` define permissões dinâmicas.

### 6. Componentes e Arquitetura do Frontend

- **PassengerMap.tsx**:
  - Renderiza o mapa, marcador do TukTuk (ícone customizado), marcador do usuário, card de distância, banners de status.
  - Subscrição realtime e validação de dados.
  - Suporte a múltiplos condutores ativos (exibe todos no mapa).
  - Recenter automático no TukTuk, exceto se o usuário interagir manualmente.
  - Card de distância calcula tempo estimado com velocidade média de 15 km/h.

- **ToggleTrackingButton.tsx**:
  - Ativa/desativa tracking do condutor/admin.
  - Upsert/update apenas em `active_conductors`.
  - Usa `useDriverTracking` para envio periódico de localização.

- **UserLocationMarker.tsx**:
  - Renderiza marcador customizado para posição do usuário.

- **LocationPermissionButton.tsx**:
  - Gerencia permissões de localização e UX de ajuda.

- **DistanceCalculator.tsx**:
  - Calcula distância e tempo estimado entre usuário e TukTuk.

### 7. Checklist de Diagnóstico

- Se o TukTuk não aparece:
  - Verifique se há registro válido em `active_conductors` com status/disponibilidade e coordenadas corretas.
  - Confirme variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  - Teste o fluxo completo: admin ativa/desativa, passageiro vê atualização em tempo real.

### 8. Boas Práticas e Garantias

- Nunca misture tracking dinâmico em `conductors`.
- Toda lógica dinâmica isolada em `active_conductors`.
- Policies e roles implementados conforme especificação.
- Validação estrita de coordenadas e precisão.
- Build limpo e deploy atualizado para evitar artefatos antigos.

---

## Resumo Final

- **active_conductors** = tracking dinâmico (posição, status, disponibilidade, precisão, realtime)
- **conductors** = dados estáticos (nome, tuktuk_id, whatsapp, etc)
- O frontend e backend estão alinhados para garantir atualização em tempo real, validação de dados e separação total entre dados dinâmicos e estáticos.
- O sistema está pronto para múltiplos condutores ativos, com filtragem por precisão e status, e UX otimizada para passageiro e admin.

---

Se precisar de rollback, restaure os arquivos listados e valide policies e variáveis de ambiente.  
Para dúvidas ou bugs, revise logs do Supabase e do frontend, e siga o checklist acima.

**Atualização técnica concluída — Agosto/2025.**

### Fluxo Crítico do Toggle

1. **Ativar Tracking**

   - O botão chama `navigator.geolocation.getCurrentPosition` para obter a localização atual.
   - Faz `upsert` em `active_conductors` com:
     - `conductor_id`
     - `is_active: true`
     - `is_available: true`
     - `current_latitude`, `current_longitude`
     - `updated_at`
   - Inicia o envio periódico de localização via `useDriverTracking`.
   - Dispara evento customizado para sincronizar UI.

2. **Desativar Tracking**

   - Faz `update` em `active_conductors` com:
     - `is_active: false`
     - `is_available: false`
     - `updated_at`
   - Para o envio de localização.
   - Dispara evento customizado para sincronizar UI.

3. **Sincronização e Realtime**

   - O estado do toggle é sincronizado por:
     - Subscrição realtime (Postgres Changes) em `active_conductors`.
     - Polling periódico (5s) como fallback.
     - Evento customizado `conductorStatusChanged` para atualização instantânea em múltiplos painéis.

4. **Requisitos para o TukTuk aparecer no mapa**
   - Registro em `active_conductors` com:
     - `is_active = true`
     - `is_available = true`
     - Coordenadas válidas (`current_latitude`, `current_longitude`)
   - O passageiro vê o TukTuk em tempo real via `PassengerMap.tsx`.

### Pontos Críticos e Boas Práticas

- Nunca fazer update/insert/subscribe de tracking dinâmico em `conductors`.
- Toda lógica dinâmica (tracking, status, disponibilidade) deve ser feita exclusivamente em `active_conductors`.
- Policies RLS garantem que apenas o próprio condutor ou admin podem alterar o status.
- O botão de toggle nunca altera dados estáticos do condutor.
- Sempre validar coordenadas antes de atualizar o mapa.
- Se o TukTuk não aparece, verifique se as coordenadas foram enviadas corretamente no momento da ativação.

### Rollback e Diagnóstico

- Se houver problemas, restaurar os ficheiros:
  - `src/components/ToggleTrackingButton.tsx`
  - `src/components/admin/AdminCalendar.tsx`
  - `src/components/PassengerMap.tsx`
- Validar policies RLS e variáveis de ambiente.
- Testar fluxo completo: admin ativa/desativa, passageiro vê atualização em tempo real.

---

**Atualização aplicada em agosto/2025.**  
Se houver problemas futuros, volte a este ponto de configuração para garantir o funcionamento correto do toggle e do tracking.

#

# Colunas de Localização e Sessão em active_conductors

- As colunas `current_latitude` e `current_longitude` existem em `active_conductors` com o tipo `float8` (double precision), garantindo precisão para tracking.
- A coluna `session_start` (tipo `timestamptz`) registra o início da sessão de tracking do condutor/admin, útil para auditoria e controle de sessões ativas.
- Uma migration garante que essas colunas serão criadas ou alteradas conforme necessário:

```sql
ALTER TABLE public.active_conductors
ADD COLUMN IF NOT EXISTS current_latitude float8,
ADD COLUMN IF NOT EXISTS current_longitude float8,
ADD COLUMN IF NOT EXISTS session_start timestamptz;
```

#

# Biblioteca de Mapa

- O sistema utiliza **react-leaflet v4** para renderização e atualização do mapa em tempo real, conforme confirmado no snapshot técnico e nas importações do código (`MapContainer`, `Marker`, `useMap`, etc).
- Isso garante compatibilidade com recursos modernos do React e do Leaflet, além de reatividade eficiente para o frontend do passageiro.
- O array `activeConductors` é controlado por `useState` e atualizado por subscriptions realtime e polling.
- Sempre que `activeConductors` muda, o componente re-renderiza e o marcador do TukTuk é atualizado no mapa (`react-leaflet`).
- O componente `TukTukMarker` recebe a posição do TukTuk diretamente desse estado, garantindo atualização visual imediata.
- Assim, qualquer update válido em `active_conductors` (via tracking do condutor) é refletido em tempo real para o passageiro no mapa.

# Snapshot Técnico Atual – Agosto/2025

## 1. Estrutura de Dados

- **conductors**: Apenas dados estáticos (`id`, `name`, `tuktuk_id`, `whatsapp`, etc).
- **active_conductors**: Tracking dinâmico (`conductor_id`, `current_latitude`, `current_longitude`, `is_active`, `is_available`, `status`, `occupied_until`, `session_start`, etc).

## 2. Queries Essenciais

- **Query recomendada para o mapa:**

  ```sql
  SELECT ac.conductor_id, ac.current_latitude, ac.current_longitude, ac.is_available, ac.status, ac.occupied_until, ac.session_start, c.name, c.tuktuk_id
  FROM active_conductors ac
  JOIN conductors c ON ac.conductor_id = c.id
  WHERE ac.is_active = true AND ac.status = 'available';
  ```

- **Realtime (frontend):**
  ```js
  supabase.channel('realtime:active_conductors').on('postgres_changes', ...)
  ```

## 3. Função e Policies RLS (atualizadas)

```sql
-- Função para obter o papel do usuário autenticado
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Policy: condutor pode alterar o próprio registro
DROP POLICY IF EXISTS "Conductor manages own status" ON public.active_conductors;
CREATE POLICY "Conductor manages own status"
ON public.active_conductors
FOR UPDATE
TO authenticated
USING (auth.uid() = conductor_id);

-- Policy: admin pode alterar qualquer registro
DROP POLICY IF EXISTS "Admins can update any conductor" ON public.active_conductors;
CREATE POLICY "Admins can update any conductor"
ON public.active_conductors
FOR UPDATE
TO authenticated
USING (get_user_role() = 'admin');


-- Policy: INSERT pelo próprio condutor OU por admin
DROP POLICY IF EXISTS "Allow conductor to insert own status" ON public.active_conductors;
CREATE POLICY "Allow conductor to insert own status"
ON public.active_conductors
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = conductor_id);

DROP POLICY IF EXISTS "Admins can insert any conductor" ON public.active_conductors;
CREATE POLICY "Admins can insert any conductor"
ON public.active_conductors
FOR INSERT
TO authenticated
WITH CHECK (get_user_role() = 'admin');

-- Policy: SELECT pública (ajuste conforme sensibilidade dos dados)
DROP POLICY IF EXISTS "Public read access" ON public.active_conductors;
CREATE POLICY "Public read access"
ON public.active_conductors
FOR SELECT
TO public
USING (true);
```

## Observação importante sobre permissões de INSERT

Se o admin precisar ativar o tracking de um condutor que ainda não tem registro em `active_conductors`, é necessário permitir que o admin faça INSERT para qualquer condutor. Por padrão, apenas o próprio condutor pode inserir seu status. Com a policy acima, tanto o condutor quanto o admin podem criar registros em `active_conductors`.

## 4. Lógica de Frontend e Componentes Envolvidos

- **src/components/PassengerMap.tsx**

  - Lê apenas `active_conductors` para posição/status/disponibilidade/sessão.
  - Subscrição realtime apenas em `active_conductors`.
  - Renderiza marcador do TukTuk e do passageiro.
  - Usa: `UserLocationMarker`, `LocationPermissionButton`, `DistanceCalculator`, `ReservationForm`.

**src/components/ToggleTrackingButton.tsx**

- Permite que **admin** ative/desative qualquer condutor e que **condutor** ative/desative o próprio status.
- Toda lógica de ativação/desativação, status e disponibilidade é feita **exclusivamente** em `active_conductors`.
- O botão executa:
  - **Upsert** em `active_conductors` para ativar (define `is_active: true`, `is_available: true`, atualiza `updated_at`, e define `session_start` se necessário). Usa `{ onConflict: 'conductor_id' }` para garantir que não haja duplicidade.
  - **Update** em `active_conductors` para desativar (define `is_active: false`, `is_available: false`, atualiza `updated_at`).
- Usa o hook `useDriverTracking` para enviar localização quando ativo, que também faz upsert com status, disponibilidade e posição.
- O envio de localização implementa **throttling**: só envia update se o condutor se moveu mais que `minDeltaMeters` (ex: 8 metros) ou se passou o tempo mínimo `minIntervalMs` (ex: 3 segundos) desde o último envio. Isso evita updates excessivos e economiza recursos, sem prejudicar o tracking em tempo real para o passageiro.
- Sincroniza estado entre dispositivos via **realtime** (canal Postgres Changes em `active_conductors` para o `conductor_id` correspondente).
- Implementa **polling** a cada 5s como fallback caso realtime falhe, sempre lendo de `active_conductors`.
- Nunca faz update, insert ou subscribe em `conductors` para tracking dinâmico.
- Exemplo simplificado do fluxo:

  ```js
  // Ativar tracking
  await supabase.from("active_conductors").upsert(
    {
      conductor_id,
      is_active: true,
      is_available: true,
      updated_at: new Date().toISOString(),
      session_start: new Date().toISOString(), // Definir início da sessão
    },
    { onConflict: "conductor_id" }
  );

  // Desativar tracking
  await supabase
    .from("active_conductors")
    .update({
      is_active: false,
      is_available: false,
      updated_at: new Date().toISOString(),
      session_start: null, // Finaliza sessão
    })
    .eq("conductor_id", conductor_id);
  ```

- O estado do botão é sincronizado por:
  - Subscrição realtime (Postgres Changes) em `active_conductors`.
  - Polling periódico em `active_conductors`.
  - Eventos customizados para atualização de UI.
- **Nunca** faz update em `conductors.is_active` para tracking dinâmico.

- **src/components/UserLocationMarker.tsx**

  - Renderiza marcador customizado para a posição do usuário no mapa.

- **src/components/LocationPermissionButton.tsx**

  - Gerencia permissões de localização e UX de ajuda.

- **src/components/DistanceCalculator.tsx**

  - Calcula distância e tempo estimado entre usuário e TukTuk.

- **src/lib/supabase.ts**

  - Instancia e configura o cliente Supabase, incluindo fallback seguro para ambiente local.

- **src/utils/locationUtils.ts**
  - Funções para cálculo de distância, tempo estimado, validação de coordenadas.

## 5. Processo e Fluxo Atual

> **Alerta de Bug Crítico:** Toda lógica dinâmica (tracking, status, disponibilidade) deve ser feita exclusivamente em `active_conductors`. Qualquer update em `conductors` para tracking é um erro grave.

---

---

## Histórico de Mudanças

### Mudanças de 2024 (Obsoletas)

- As seções "Policies RLS (atualizadas 2024)", "Resumo das mudanças recentes (2024)", "Garantias e Checklist (2024)", "Checklist de Atualização do Ambiente de Produção (2024)", "Resumo (2024)", "Erros comuns e como resolver (2024)" foram consolidadas ou substituídas pelas práticas e políticas de Agosto/2025.
- Consulte apenas as seções principais deste documento para a configuração vigente.

---

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
     - Lê apenas `active_conductors` para posição, status (`available` ou `busy`), disponibilidade e `occupied_until`.
     - Subscrições:
       - Canal: `postgres_changes` para `active_conductors` (qualquer evento) para alterações de posição, disponibilidade ou `occupied_until`.
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
     - Cria ou atualiza registro em `active_conductors` com `is_active = true` e inicia `navigator.geolocation.watchPosition`.
     - A cada update, faz `update` de `current_latitude`, `current_longitude`, `updated_at` na linha de `active_conductors`.
   - Desligar:
     - Para o watch e faz `update` de `is_active = false` em `active_conductors`.
   - ⚠️ **Importante:** O botão de controlo do condutor (ToggleTrackingButton) nunca modifica a tabela `conductors`, apenas `active_conductors`.
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

  - **Apenas dados estáticos**: `id: uuid`, `name: text`, `tuktuk_id: uuid`, `whatsapp: text`, etc.
  - Não é mais usada para tracking dinâmico, posição ou status em tempo real.

- `public.active_conductors`

  - **Tracking dinâmico**: `conductor_id: uuid`, `current_latitude: float8`, `current_longitude: float8`, `is_active: boolean`, `is_available: boolean`, `status: conductor_status`, `occupied_until: timestamptz | null`, `session_start: timestamptz | null`, etc.
  - Todos os dados de posição, status e disponibilidade do TukTuk vêm desta tabela.

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

-- Admin

- No painel, clica Ligar → faz upsert em `active_conductors` com `is_active = true`, `is_available = true` e inicia watchPosition.
- Clica Desligar → faz update em `active_conductors` com `is_active = false`, `is_available = false` e para o envio de localização.

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

  - Verifique se há registro válido em `active_conductors` com `is_active = true`, `is_available = true`, `status = 'available'` e coordenadas válidas.
  - Confirmar variáveis de ambiente e conectividade Supabase no cliente.

- Realtime não atualiza

  - Checar permissões RLS; confirmar que o projeto tem Realtime ativo na tabela `active_conductors`.
  - Revisar canais/filters em `PassengerMap.tsx` e garantir que **apenas** `active_conductors` está sendo ouvido para eventos de posição/status.
  - Se o canal estiver ouvindo `conductors`, o marcador do TukTuk não irá se mover.

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

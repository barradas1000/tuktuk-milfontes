# Estrutura das Tabelas no Supabase - Projeto TukTuk Milfontes

## Tabela: reservations

Armazena todas as reservas de passeios dos clientes.

| Coluna                | Tipo          | Obrigatório | Descrição                                        |
| --------------------- | ------------- | ----------- | ------------------------------------------------ |
| id                    | uuid          | SIM         | Identificador único (chave primária)             |
| customer_name         | varchar(255)  | SIM         | Nome do cliente                                  |
| customer_email        | varchar(255)  | SIM         | Email do cliente                                 |
| customer_phone        | varchar(20)   | SIM         | Telefone do cliente                              |
| reservation_date      | date          | SIM         | Data da reserva                                  |
| reservation_time      | time          | SIM         | Hora da reserva                                  |
| number_of_people      | integer       | SIM         | Número de pessoas (1-6)                          |
| tour_type             | varchar(100)  | SIM         | Tipo de passeio                                  |
| special_requests      | text          | NÃO         | Pedidos especiais do cliente                     |
| status                | varchar(50)   | NÃO         | Status (pending/confirmed/cancelled/completed)   |
| total_price           | decimal(10,2) | NÃO         | Preço total da reserva                           |
| assigned_conductor_id | uuid          | NÃO         | Condutor atribuído (FK para conductors.id)       |
| created_at            | timestamptz   | NÃO         | Data de criação                                  |
| updated_at            | timestamptz   | NÃO         | Data de atualização (atualizada automaticamente) |

---

## Tabela: tuk_tuk_availability

Controla a disponibilidade dos tuk-tuks por data e horários.

| Coluna         | Tipo        | Obrigatório | Descrição                            |
| -------------- | ----------- | ----------- | ------------------------------------ |
| id             | uuid        | SIM         | Identificador único (chave primária) |
| tuk_tuk_id     | varchar(50) | SIM         | Identificador do tuk-tuk             |
| available_date | date        | SIM         | Data disponível                      |
| time_slots     | jsonb       | SIM         | Horários disponíveis em formato JSON |
| max_capacity   | integer     | NÃO         | Capacidade máxima (padrão: 4)        |
| created_at     | timestamptz | NÃO         | Data de criação                      |

**Constraint:** UNIQUE(tuk_tuk_id, available_date)

---

## Tabela: tour_types

Define os tipos de passeios disponíveis e seus preços.

| Coluna           | Tipo          | Obrigatório | Descrição                            |
| ---------------- | ------------- | ----------- | ------------------------------------ |
| id               | uuid          | SIM         | Identificador único (chave primária) |
| name             | varchar(100)  | SIM         | Nome do passeio (único)              |
| description      | text          | NÃO         | Descrição do passeio                 |
| duration_minutes | integer       | SIM         | Duração em minutos                   |
| base_price       | decimal(10,2) | SIM         | Preço base                           |
| max_people       | integer       | NÃO         | Máximo de pessoas (padrão: 4)        |
| is_active        | boolean       | NÃO         | Ativo/inativo (padrão: true)         |
| created_at       | timestamptz   | NÃO         | Data de criação                      |

### Passeios Pré-configurados:

- **Passeio panorâmico pela vila** (60min, €10, máx 4 pessoas)
- **Vila Nova de Milfontes → Praia das Furnas** (90min, €14, máx 4 pessoas)
- **Travessia pela ponte** (45min, €10, máx 4 pessoas)
- **Pôr-do-Sol Romântico** (120min, €25, máx 2 pessoas)
- **Passeio noturno** (90min, €8, máx 4 pessoas)
- **Rota dos Pescadores** (75min, €10, máx 4 pessoas)

---

## Tabela: profiles

Armazena perfis de utilizadores do sistema (ligada ao auth.users do Supabase). Cada registro representa um utilizador autenticado, podendo ser cliente, condutor ou administrador. A tabela é central para autenticação, autorização e gestão de permissões.

| Coluna       | Tipo        | Obrigatório | Descrição detalhada                                                            |
| ------------ | ----------- | ----------- | ------------------------------------------------------------------------------ |
| id           | uuid        | SIM         | Identificador único do perfil. Igual ao id do utilizador no Supabase Auth.     |
| email        | text        | SIM         | Email do utilizador. Usado para login, comunicação e identificação.            |
| full_name    | text        | NÃO         | Nome completo do utilizador. Exibido na interface e usado para personalização. |
| role         | text        | SIM         | Papel do utilizador: 'admin', 'condutor', 'user'. Define permissões e acesso.  |
| admin_level  | text        | NÃO         | Nível administrativo: 'super_admin', 'admin_local', etc. (apenas para admins). |
| region       | text        | NÃO         | Região administrativa do utilizador/admin.                                     |
| permissions  | jsonb       | NÃO         | Permissões granulares (ex: can_create_admins, can_view_audit_logs, etc).       |
| conductor_id | uuid        | NÃO         | Referência para conductors.id (se for condutor).                               |
| created_at   | timestamptz | SIM         | Data de criação do perfil.                                                     |
| updated_at   | timestamptz | NÃO         | Data da última atualização do perfil.                                          |
| created_by   | uuid        | NÃO         | Usuário que criou este perfil (útil para admins).                              |
| zone         | text        | NÃO         | Zona geográfica ou operacional (se aplicável).                                 |

### Exemplo de dados reais (consulta MCP server):

- **Admin:**

  - id: c2b84b4e-ecbf-47d1-adc0-f3d7549829b3
  - email: carlosbarradas111@gmail.com
  - full_name: Carlos Barradas
  - role: admin
  - admin_level: super_admin
  - region: milfontes
  - permissions: { can_create_admins, can_view_audit_logs, can_delete_conductors, can_manage_all_conductors }

- **Condutor:**

  - id: c4c9a172-92c2-410e-a671-56b443fc093d
  - email: sonia.santos.scps82@gmail.com
  - full_name: Sónia Cristina Pinto dos Santos Carias
  - role: condutor
  - admin_level: admin_local
  - region: milfontes

- **Condutor:**
  - id: e4b3296c-13eb-4faa-aead-e246ddb2bf66
  - email: diogo.carias@outlook.pt
  - full_name: Diogo Miguel da Conceição silva Carias
  - role: condutor
  - admin_level: admin_local
  - region: milfontes

#### Utilidade geral da tabela:

- Centraliza dados de autenticação e papéis dos utilizadores.
- Permite controle granular de permissões e acesso por região/nível.
- Relaciona condutores ao perfil autenticado.
- Suporta auditoria e gestão administrativa avançada.

---

## Tabela: conductors

Armazena os condutores (motoristas) disponíveis para o serviço.

| Coluna     | Tipo        | Obrigatório | Descrição                            |
| ---------- | ----------- | ----------- | ------------------------------------ |
| id         | uuid        | SIM         | Identificador único (chave primária) |
| name       | text        | SIM         | Nome do condutor                     |
| whatsapp   | text        | SIM         | Número do WhatsApp internacional     |
| is_active  | boolean     | NÃO         | Indica se está ativo (padrão: true)  |
| created_at | timestamptz | NÃO         | Data de criação                      |
| updated_at | timestamptz | NÃO         | Data de atualização                  |

### Condutores Pré-configurados:

- **Condutor 1** (ID: 550e8400-e29b-41d4-a716-446655440001, WhatsApp: 351963496320)
- **Condutor 2** (ID: 550e8400-e29b-41d4-a716-446655440002, WhatsApp: 351968784043)

---

## Tabela: active_conductors

Controla quais condutores estão ativos no momento.

| Coluna         | Tipo        | Obrigatório | Descrição                                 |
| -------------- | ----------- | ----------- | ----------------------------------------- |
| id             | uuid        | SIM         | Identificador único (chave primária)      |
| conductor_id   | uuid        | SIM         | Referência ao id do condutor (conductors) |
| is_active      | boolean     | NÃO         | Indica se está ativo (padrão: true)       |
| activated_at   | timestamptz | NÃO         | Data/hora de ativação                     |
| deactivated_at | timestamptz | NÃO         | Data/hora de desativação                  |
| created_at     | timestamptz | NÃO         | Data de criação                           |

---

## Tabela: blocked_periods

Armazena períodos bloqueados (dias ou horários específicos).

| Coluna     | Tipo        | Obrigatório | Descrição                              |
| ---------- | ----------- | ----------- | -------------------------------------- |
| id         | uuid        | SIM         | Identificador único (chave primária)   |
| date       | text        | SIM         | Data bloqueada (formato yyyy-MM-dd)    |
| start_time | text        | NÃO         | Hora inicial bloqueada (formato HH:mm) |
| end_time   | text        | NÃO         | Hora final bloqueada (formato HH:mm)   |
| reason     | text        | NÃO         | Motivo do bloqueio                     |
| created_by | text        | SIM         | Usuário/admin que criou o bloqueio     |
| created_at | timestamptz | NÃO         | Data de criação                        |

---

## Funcionalidades Automáticas

### Triggers e Funções

- **update_updated_at_column()**: Função que atualiza automaticamente o campo `updated_at`
- **handle_new_user()**: Função que cria automaticamente um perfil quando um novo utilizador se regista
- **Trigger on_auth_user_created**: Executa a função handle_new_user após inserção em auth.users

### Row Level Security (RLS)

Todas as tabelas têm RLS ativado com políticas específicas:

#### Administradores (role = 'admin'):

- Acesso completo a todas as tabelas (SELECT, INSERT, UPDATE, DELETE)

#### Condutores (role = 'condutor'):

- **conductors**: Podem ver apenas o seu próprio perfil
- **active_conductors**: Podem gerir apenas o seu próprio status ativo
- **blocked_periods**: Podem gerir apenas os seus próprios períodos bloqueados
- **reservations**: Podem ver apenas reservas atribuídas a eles

#### Utilizadores (role = 'user'):

- **profiles**: Podem ver e atualizar apenas o seu próprio perfil
- Acesso limitado às outras tabelas conforme necessário

---

## Configuração do Projeto

### URLs e Chaves:

- **Supabase URL**: https://cqnahwnnqzraqcslljaz.supabase.co
- **Project ID**: cqnahwnnqzraqcslljaz
- **Dashboard**: https://supabase.com/dashboard/project/cqnahwnnqzraqcslljaz

### Administradores Autorizados:

- sonia.santos.scps82@gmail.com
- diogo.carias@outlook.pt
- carlosbarradas111@gmail.com

---

## Observações Importantes

- **Sistema de Produção**: Todas as tabelas estão configuradas para ambiente de produção
- **Segurança**: RLS implementado com políticas robustas para diferentes tipos de utilizadores
- **Integridade**: Chaves estrangeiras e constraints implementadas para manter consistência
- **Auditoria**: Campos created_at e updated_at em todas as tabelas principais
- **Flexibilidade**: Sistema preparado para múltiplos condutores e tipos de passeios

---

**Sistema completo e pronto para produção!**

---

## Fluxo de Autenticação e Uso da Tabela profiles

1. **Signup/Login:**

   - O utilizador se registra ou faz login via Supabase Auth (email/senha).
   - Ao criar conta, um registro correspondente é criado na tabela `profiles` com o mesmo UUID do Auth.
   - Campos como `email`, `full_name` e `role` são preenchidos conforme o tipo de utilizador.

2. **Carregamento do Perfil:**

   - Após login, o sistema busca o perfil do utilizador na tabela `profiles` usando o id autenticado.
   - O campo `role` define o acesso: 'admin' (painel administrativo), 'condutor' (dashboard condutor), 'user' (cliente).
   - Para condutores, o campo `conductor_id` referencia o registro na tabela `conductors`.

3. **Autorização e Permissões:**

   - O campo `admin_level` diferencia super admins de admins locais.
   - O campo `region` restringe ou expande o acesso administrativo por área geográfica.
   - O campo `permissions` (jsonb) permite granularidade: ex. admins podem ter permissões específicas como criar outros admins, visualizar logs, etc.

4. **Gestão e Auditoria:**

   - O campo `created_by` registra quem criou o perfil (útil para rastreamento administrativo).
   - O campo `zone` pode ser usado para segmentação operacional ou geográfica.
   - Datas de criação e atualização permitem auditoria e controle de alterações.

5. **Fluxo de Navegação:**

   - Após autenticação, o sistema verifica o papel do utilizador e direciona para a interface correta:
     - Admin: acesso total ao backoffice, gestão de condutores, reservas e auditoria.
     - Condutor: acesso ao dashboard próprio, ativação/desativação de status, visualização de reservas atribuídas.
     - Cliente: acesso ao mapa, reservas e perfil pessoal.

6. **Políticas de Segurança (RLS):**
   - Cada utilizador só pode ver e editar seu próprio perfil, exceto admins que podem gerir todos.
   - Condutores só veem dados próprios e reservas atribuídas.
   - Clientes só veem dados próprios e informações públicas.

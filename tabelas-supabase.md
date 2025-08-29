# Documentação das Tabelas do Supabase

Este documento fornece uma visão geral completa de todas as tabelas no banco de dados Supabase, organizadas por esquema. Inclui detalhes sobre colunas, chaves primárias, chaves estrangeiras e políticas de segurança.

## Esquema: auth

### Tabela: audit_log_entries

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| instance_id | uuid | YES | null | - |
| id | uuid | NO | null | - |
| payload | json | YES | null | - |
| created_at | timestamp with time zone | YES | null | - |
| ip_address | character varying | NO | ''::character varying | - |

**Chave Primária:** id

**Chaves Estrangeiras:** Nenhuma

**Políticas:** Nenhuma

### Tabela: flow_state

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| id | uuid | NO | null | - |
| user_id | uuid | YES | null | - |
| auth_code | text | NO | null | - |
| code_challenge_method | USER-DEFINED | NO | null | - |
| code_challenge | text | NO | null | - |
| provider_type | text | NO | null | - |
| provider_access_token | text | YES | null | - |
| provider_refresh_token | text | YES | null | - |
| created_at | timestamp with time zone | YES | null | - |
| updated_at | timestamp with time zone | YES | null | - |
| authentication_method | text | NO | null | - |
| auth_code_issued_at | timestamp with time zone | YES | null | - |

**Chave Primária:** id

**Chaves Estrangeiras:** Nenhuma

**Políticas:** Nenhuma

### Tabela: identities

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| provider_id | text | NO | null | - |
| user_id | uuid | NO | null | - |
| identity_data | jsonb | NO | null | - |
| provider | text | NO | null | - |
| last_sign_in_at | timestamp with time zone | YES | null | - |
| created_at | timestamp with time zone | YES | null | - |
| updated_at | timestamp with time zone | YES | null | - |
| email | text | YES | null | Auth: Email is a generated column that references the optional email property in the identity_data |
| id | uuid | NO | gen_random_uuid() | - |

**Chave Primária:** id

**Chaves Estrangeiras:** Nenhuma

**Políticas:** Nenhuma

### Tabela: instances

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| id | uuid | NO | null | - |
| uuid | uuid | YES | null | - |
| raw_base_config | text | YES | null | - |
| created_at | timestamp with time zone | YES | null | - |
| updated_at | timestamp with time zone | YES | null | - |

**Chave Primária:** id

**Chaves Estrangeiras:** Nenhuma

**Políticas:** Nenhuma

### Tabela: mfa_amr_claims

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| session_id | uuid | NO | null | - |
| created_at | timestamp with time zone | NO | null | - |
| updated_at | timestamp with time zone | NO | null | - |
| authentication_method | text | NO | null | - |
| id | uuid | NO | null | - |

**Chave Primária:** id

**Chaves Estrangeiras:** Nenhuma

**Políticas:** Nenhuma

### Tabela: mfa_challenges

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| id | uuid | NO | null | - |
| factor_id | uuid | NO | null | - |
| created_at | timestamp with time zone | NO | null | - |
| verified_at | timestamp with time zone | YES | null | - |
| ip_address | inet | NO | null | - |
| otp_code | text | YES | null | - |
| web_authn_session_data | jsonb | YES | null | - |

**Chave Primária:** id

**Chaves Estrangeiras:** Nenhuma

**Políticas:** Nenhuma

### Tabela: mfa_factors

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| id | uuid | NO | null | - |
| user_id | uuid | NO | null | - |
| friendly_name | text | YES | null | - |
| factor_type | USER-DEFINED | NO | null | - |
| status | USER-DEFINED | NO | null | - |
| created_at | timestamp with time zone | NO | null | - |
| updated_at | timestamp with time zone | NO | null | - |
| secret | text | YES | null | - |
| phone | text | YES | null | - |
| last_challenged_at | timestamp with time zone | YES | null | - |
| web_authn_credential | jsonb | YES | null | - |
| web_authn_aaguid | uuid | YES | null | - |

**Chave Primária:** id

**Chaves Estrangeiras:** Nenhuma

**Políticas:** Nenhuma

### Tabela: one_time_tokens

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| id | uuid | NO | null | - |
| user_id | uuid | NO | null | - |
| token_type | USER-DEFINED | NO | null | - |
| token_hash | text | NO | null | - |
| relates_to | text | NO | null | - |
| created_at | timestamp without time zone | NO | now() | - |
| updated_at | timestamp without time zone | NO | now() | - |

**Chave Primária:** id

**Chaves Estrangeiras:** Nenhuma

**Políticas:** Nenhuma

### Tabela: refresh_tokens

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| instance_id | uuid | YES | null | - |
| id | bigint | NO | nextval('auth.refresh_tokens_id_seq'::regclass) | - |
| token | character varying | YES | null | - |
| user_id | character varying | YES | null | - |
| revoked | boolean | YES | null | - |
| created_at | timestamp with time zone | YES | null | - |
| updated_at | timestamp with time zone | YES | null | - |
| parent | character varying | YES | null | - |
| session_id | uuid | YES | null | - |

**Chave Primária:** id

**Chaves Estrangeiras:** Nenhuma

**Políticas:** Nenhuma

### Tabela: saml_providers

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| id | uuid | NO | null | - |
| sso_provider_id | uuid | NO | null | - |
| entity_id | text | NO | null | - |
| metadata_xml | text | NO | null | - |
| metadata_url | text | YES | null | - |
| attribute_mapping | jsonb | YES | null | - |
| created_at | timestamp with time zone | YES | null | - |
| updated_at | timestamp with time zone | YES | null | - |
| name_id_format | text | YES | null | - |

**Chave Primária:** id

**Chaves Estrangeiras:** Nenhuma

**Políticas:** Nenhuma

### Tabela: saml_relay_states

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| id | uuid | NO | null | - |
| sso_provider_id | uuid | NO | null | - |
| request_id | text | NO | null | - |
| for_email | text | YES | null | - |
| redirect_to | text | YES | null | - |
| created_at | timestamp with time zone | YES | null | - |
| updated_at | timestamp with time zone | YES | null | - |
| flow_state_id | uuid | YES | null | - |

**Chave Primária:** id

**Chaves Estrangeiras:** Nenhuma

**Políticas:** Nenhuma

### Tabela: schema_migrations

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| version | character varying | NO | null | - |

**Chave Primária:** Nenhuma

**Chaves Estrangeiras:** Nenhuma

**Políticas:** Nenhuma

### Tabela: sessions

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| id | uuid | NO | null | - |
| user_id | uuid | NO | null | - |
| created_at | timestamp with time zone | YES | null | - |
| updated_at | timestamp with time zone | YES | null | - |
| factor_id | uuid | YES | null | - |
| aal | USER-DEFINED | YES | null | - |
| not_after | timestamp with time zone | YES | null | Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired. |
| refreshed_at | timestamp without time zone | YES | null | - |
| user_agent | text | YES | null | - |
| ip | inet | YES | null | - |
| tag | text | YES | null | - |

**Chave Primária:** id

**Chaves Estrangeiras:** Nenhuma

**Políticas:** Nenhuma

### Tabela: sso_domains

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| id | uuid | NO | null | - |
| sso_provider_id | uuid | NO | null | - |
| domain | text | NO | null | - |
| created_at | timestamp with time zone | YES | null | - |
| updated_at | timestamp with time zone | YES | null | - |

**Chave Primária:** id

**Chaves Estrangeiras:** Nenhuma

**Políticas:** Nenhuma

### Tabela: sso_providers

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| id | uuid | NO | null | - |
| resource_id | text | YES | null | Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code. |
| created_at | timestamp with time zone | YES | null | - |
| updated_at | timestamp with time zone | YES | null | - |
| disabled | boolean | YES | null | - |

**Chave Primária:** id

**Chaves Estrangeiras:** Nenhuma

**Políticas:** Nenhuma

### Tabela: users

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| instance_id | uuid | YES | null | - |
| id | uuid | NO | null | - |
| aud | character varying | YES | null | - |
| role | character varying | YES | null | - |
| email | character varying | YES | null | - |
| encrypted_password | character varying | YES | null | - |
| email_confirmed_at | timestamp with time zone | YES | null | - |
| invited_at | timestamp with time zone | YES | null | - |
| confirmation_token | character varying | YES | null | - |
| confirmation_sent_at | timestamp with time zone | YES | null | - |
| recovery_token | character varying | YES | null | - |
| recovery_sent_at | timestamp with time zone | YES | null | - |
| email_change_token_new | character varying | YES | null | - |
| email_change | character varying | YES | null | - |
| email_change_sent_at | timestamp with time zone | YES | null | - |
| last_sign_in_at | timestamp with time zone | YES | null | - |
| raw_app_meta_data | jsonb | YES | null | - |
| raw_user_meta_data | jsonb | YES | null | - |
| is_super_admin | boolean | YES | null | - |
| created_at | timestamp with time zone | YES | null | - |
| updated_at | timestamp with time zone | YES | null | - |
| phone | text | YES | NULL::character varying | - |
| phone_confirmed_at | timestamp with time zone | YES | null | - |
| phone_change | text | YES | ''::character varying | - |
| phone_change_token | character varying | YES | ''::character varying | - |
| phone_change_sent_at | timestamp with time zone | YES | null | - |
| confirmed_at | timestamp with time zone | YES | null | - |
| email_change_token_current | character varying | YES | ''::character varying | - |
| email_change_confirm_status | smallint | YES | 0 | - |
| banned_until | timestamp with time zone | YES | null | - |
| reauthentication_token | character varying | YES | ''::character varying | - |
| reauthentication_sent_at | timestamp with time zone | YES | null | - |
| is_sso_user | boolean | NO | false | Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails. |
| deleted_at | timestamp with time zone | YES | null | - |
| is_anonymous | boolean | NO | false | - |

**Chave Primária:** id

**Chaves Estrangeiras:** Nenhuma

**Políticas:** Nenhuma

## Esquema: extensions

### Tabela: pg_stat_statements

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| userid | oid | YES | null | - |
| dbid | oid | YES | null | - |
| toplevel | boolean | YES | null | - |
| queryid | bigint | YES | null | - |
| query | text | YES | null | - |
| plans | bigint | YES | null | - |
| total_plan_time | double precision | YES | null | - |
| min_plan_time | double precision | YES | null | - |
| max_plan_time | double precision | YES | null | - |
| mean_plan_time | double precision | YES | null | - |
| stddev_plan_time | double precision | YES | null | - |
| calls | bigint | YES | null | - |
| total_exec_time | double precision | YES | null | - |
| min_exec_time | double precision | YES | null | - |
| max_exec_time | double precision | YES | null | - |
| mean_exec_time | double precision | YES | null | - |
| stddev_exec_time | double precision | YES | null | - |
| rows | bigint | YES | null | - |
| shared_blks_hit | bigint | YES | null | - |
| shared_blks_read | bigint | YES | null | - |
| shared_blks_dirtied | bigint | YES | null | - |
| shared_blks_written | bigint | YES | null | - |
| local_blks_hit | bigint | YES | null | - |
| local_blks_read | bigint | YES | null | - |
| local_blks_dirtied | bigint | YES | null | - |
| local_blks_written | bigint | YES | null | - |
| temp_blks_read | bigint | YES | null | - |
| temp_blks_written | bigint | YES | null | - |
| shared_blk_read_time | double precision | YES | null | - |
| shared_blk_write_time | double precision | YES | null | - |
| local_blk_read_time | double precision | YES | null | - |
| local_blk_write_time | double precision | YES | null | - |
| temp_blk_read_time | double precision | YES | null | - |
| temp_blk_write_time | double precision | YES | null | - |
| wal_records | bigint | YES | null | - |
| wal_fpi | bigint | YES | null | - |
| wal_bytes | numeric | YES | null | - |
| jit_functions | bigint | YES | null | - |
| jit_generation_time | double precision | YES | null | - |
| jit_inlining_count | bigint | YES | null | - |
| jit_inlining_time | double precision | YES | null | - |
| jit_optimization_count | bigint | YES | null | - |
| jit_optimization_time | double precision | YES | null | - |
| jit_emission_count | bigint | YES | null | - |
| jit_emission_time | double precision | YES | null | - |
| jit_deform_count | bigint | YES | null | - |
| jit_deform_time | double precision | YES | null | - |
| stats_since | timestamp with time zone | YES | null | - |
| minmax_stats_since | timestamp with time zone | YES | null | - |

**Chave Primária:** Nenhuma

**Chaves Estrangeiras:** Nenhuma

**Políticas:** Nenhuma

### Tabela: pg_stat_statements_info

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| dealloc | bigint | YES | null | - |
| stats_reset | timestamp with time zone | YES | null | - |

**Chave Primária:** Nenhuma

**Chaves Estrangeiras:** Nenhuma

**Políticas:** Nenhuma

## Esquema: public

### Tabela: active_conductors

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| id | uuid | NO | uuid_generate_v4() | - |
| conductor_id | uuid | NO | null | - |
| session_start | timestamp with time zone | NO | now() | - |
| session_end | timestamp with time zone | YES | null | - |
| last_ping | timestamp with time zone | NO | now() | - |
| is_available | boolean | NO | true | - |
| current_latitude | double precision | NO | null | - |
| current_longitude | double precision | NO | null | - |
| updated_at | timestamp with time zone | NO | now() | - |
| occupied_until | timestamp with time zone | YES | null | - |
| is_active | boolean | NO | true | - |
| status | USER-DEFINED | NO | 'available'::conductor_status | - |
| accuracy | numeric | YES | null | - |
| last_seen | timestamp with time zone | YES | null | - |
| name | text | YES | null | - |

**Chave Primária:** id

**Chaves Estrangeiras:**
- conductor_id → public.conductors (id)

**Políticas:**
- Driver inserts only their own position
- Public read access to active conductors
- Admins manage all active conductors
- Driver updates only their own position

### Tabela: activity_logs

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| id | uuid | NO | uuid_generate_v4() | - |
| user_id | uuid | YES | null | - |
| action | text | NO | null | - |
| resource_type | text | NO | null | - |
| resource_id | text | YES | null | - |
| old_values | jsonb | YES | null | - |
| new_values | jsonb | YES | null | - |
| ip_address | inet | YES | null | - |
| user_agent | text | YES | null | - |
| timestamp | timestamp with time zone | YES | now() | - |
| session_id | text | YES | null | - |
| additional_data | jsonb | YES | null | - |

**Chave Primária:** id

**Chaves Estrangeiras:** Nenhuma

**Políticas:**
- Allow admins to view all activity logs
- Allow authenticated users to insert activity logs
- Allow users to view their own activity logs

### Tabela: blocked_periods

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| id | uuid | NO | uuid_generate_v4() | - |
| date | date | NO | null | - |
| start_time | time without time zone | YES | null | - |
| end_time | time without time zone | YES | null | - |
| reason | text | YES | null | - |
| created_by | text | NO | null | - |
| created_at | timestamp with time zone | YES | now() | - |
| createdBy | text | YES | null | - |

**Chave Primária:** id

**Chaves Estrangeiras:** Nenhuma

**Políticas:**
- Allow authenticated manage blocked_periods

### Tabela: conductor_applications

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| id | uuid | NO | uuid_generate_v4() | - |
| full_name | text | NO | null | - |
| email | text | NO | null | - |
| phone | text | NO | null | - |
| whatsapp | text | YES | null | - |
| experience_years | integer | YES | null | - |
| driver_license_number | text | YES | null | - |
| driver_license_expiry | date | YES | null | - |
| has_own_vehicle | boolean | YES | false | - |
| vehicle_details | jsonb | YES | null | - |
| availability_hours | jsonb | YES | null | - |
| preferred_zones | ARRAY | YES | null | - |
| status | text | YES | 'pending'::text | - |
| submitted_at | timestamp with time zone | YES | now() | - |
| reviewed_at | timestamp with time zone | YES | null | - |
| reviewed_by | uuid | YES | null | - |
| review_notes | text | YES | null | - |
| documents | jsonb | YES | null | - |
| created_at | timestamp with time zone | YES | now() | - |
| updated_at | timestamp with time zone | YES | now() | - |

**Chave Primária:** id

**Chaves Estrangeiras:** Nenhuma

**Políticas:**
- Allow admins to manage conductor applications
- Allow users to view their own applications

### Tabela: conductor_locations

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| id | uuid | NO | uuid_generate_v4() | - |
| conductor_id | uuid | YES | null | - |
| latitude | double precision | NO | null | - |
| longitude | double precision | NO | null | - |
| accuracy | double precision | YES | null | - |
| altitude | double precision | YES | null | - |
| heading | double precision | YES | null | - |
| speed | double precision | YES | null | - |
| timestamp | timestamp with time zone | YES | now() | - |
| is_active | boolean | YES | true | - |
| created_at | timestamp with time zone | YES | now() | - |

**Chave Primária:** id

**Chaves Estrangeiras:**
- conductor_id → public.conductors (id)

**Políticas:**
- Allow authenticated users to view active conductor locations
- Allow conductors to manage their own locations
- Allow admins to view all conductor locations

### Tabela: conductor_status_audit

**Colunas:**
| Nome da Coluna | Tipo de Dados | Pode ser Nulo | Valor Padrão | Descrição |
|----------------|---------------|---------------|--------------|-----------|
| id | uuid | NO | uuid_generate_v4() | - |
| conductor_id | uuid | YES | null | - |
| old_status | text | YES | null | - |
| new_status |
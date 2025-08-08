# Gestão de Condutores — Situação Atual e Opções de Otimização

## 📌 Situação Atual do Sistema

- **Mapa do Passageiro**

  - Passageiro vê sua localização (ícone personalizado) e a localização do TukTuk (ícone próprio).
  - Apenas o primeiro motorista ativo (TukTuk online) é exibido.
  - Distância e tempo estimado até o TukTuk são calculados.
  - Se não houver TukTuk online, aparece mensagem "TukTuk offline".

- **Rastreamento em Tempo Real**

  - A posição do TukTuk é atualizada em tempo real via Supabase, usando a tabela `conductors` e o campo `is_active`.
  - O passageiro só vê o TukTuk se houver pelo menos um motorista ativo.

- **Administração**
  - O painel admin permite ativar/desativar o rastreamento de condutores.
  - Toda a gestão de condutores agora é feita exclusivamente na tabela `conductors`.
  - O botão de controle de rastreamento funciona para qualquer condutor cadastrado na tabela `conductors`.

---

## ⚠️ Desafios Identificados

- **Sincronização:** Falta integração entre o cadastro/admin de condutores e o sistema de rastreamento.
- **Fluxo de ativação:** O admin pode tentar ativar/desativar um condutor que não existe na tabela de rastreamento.
- **Escalabilidade:** O modelo atual pode gerar problemas se o número de condutores crescer ou se houver necessidade de controle mais refinado (escala, permissões, etc).

---

## 💡 Opções para Otimizar a Gestão de Condutores

### 1. Gestão Manual via Painel Admin

- O admin cadastra, ativa e desativa condutores manualmente.
- **Prós:** Controle total, fácil de implementar.
- **Contras:** Não escala bem, depende do admin para refletir o status real.

### 2. Gestão Automática pelo App do Condutor

- O condutor faz login em um app próprio e ativa/desativa seu status.
- **Prós:** Reflete o status real, menos trabalho manual.
- **Contras:** Depende do uso correto do app pelo condutor.

### 3. Gestão Híbrida (Admin + App)

- O admin gerencia cadastro e permissões, mas o condutor só aparece online se estiver logado no app.
- **Prós:** Segurança, controle e status confiável.
- **Contras:** Exige integração entre painel admin e app do condutor.

### 4. Gestão por Escala/Agenda

- O admin define uma escala de trabalho dos condutores.
- **Prós:** Organização operacional, evita sobreposição.
- **Contras:** Mais complexo de implementar.

### 5. Gestão por Aprovação

- O condutor solicita ficar online e o admin aprova manualmente.
- **Prós:** Controle total do admin.
- **Contras:** Pode gerar atrasos e depender de ação manual constante.

---

## ✅ Recomendações

- **Unificar ou sincronizar as tabelas de condutores e rastreamento** para garantir que todo condutor cadastrado/admin possa ser rastreado.
- **Definir o fluxo de ativação:** O condutor só aparece como online se estiver logado no app? O admin pode forçar o status online/offline?
- **Implementar lógica de criação automática** de registro na tabela de rastreamento ao ativar um condutor pelo admin, ou exibir aviso se não existir.
- **Adicionar recursos de escala, permissões e histórico** para uma gestão mais avançada (opcional).

---

## 📝 Resumo

A aplicação está funcional para o passageiro, mas a gestão de condutores precisa ser aprimorada para garantir confiabilidade e escalabilidade no controle de quem pode ser rastreado e aparecer como TukTuk online

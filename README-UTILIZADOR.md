# Guia do Utilizador - TukTuk Milfontes

Este documento explica o funcionamento do sistema TukTuk Milfontes do ponto de vista do utilizador (cliente e administrador), incluindo reservas, gestão, condutores e mensagens automáticas.

---

## 1. Criação de Conta e Login

- **Cliente:**

  - Não é necessário criar conta para fazer uma reserva. O cliente apenas preenche o formulário de reserva e confirma via WhatsApp.

- **Administrador:**
  - O acesso ao backoffice requer uma conta de administrador.
  - Para criar uma conta de admin, contacte a equipa de gestão do TukTuk Milfontes, que irá fornecer as credenciais de acesso (email e password) ou criar a conta para si.
  - Após receber as credenciais, aceda ao painel administrativo através do link:
    - **Backoffice/Admin:** [https://tuktuk-milfontes.vercel.app/admin](https://tuktuk-milfontes.vercel.app/admin)
  - Introduza o seu email e password para iniciar sessão.
  - Após login, será automaticamente direcionado para a aba "Reservas" do painel.

---

## 2. Backoffice/Admin

- **Acesso:**

  - O backoffice é acessível apenas a administradores autenticados.
  - O painel apresenta três abas principais:
    - **Reservas:** Lista e gestão de todas as reservas (pendentes, confirmadas, concluídas, canceladas).
    - **Calendário:** Visualização das reservas por data/hora, facilitando a gestão de horários e disponibilidade.
    - **Relatórios:** Estatísticas e análises de reservas, desempenho e faturação.

- **Funcionalidades:**
  - Ver, confirmar, cancelar e concluir reservas.
  - Eliminar reservas (independentemente do estado).
  - Enviar mensagens de WhatsApp para clientes com templates automáticos e personalizados.
  - Ver estatísticas de reservas e desempenho.
  - Gerir condutores/motoristas ativos (ver abaixo).

---

## 3. Escolha e Importância do Motorista Disponível

- O sistema permite associar cada reserva a um condutor/motorista disponível.
- **Importância:**
  - Cada condutor tem um número de WhatsApp associado, utilizado para comunicação direta com o cliente.
  - O sistema pode atribuir reservas ao condutor ativo, garantindo que o cliente recebe informações e confirmações do motorista correto.
  - Se houver mais do que um condutor disponível, o admin pode selecionar qual está ativo para cada serviço.
  - A escolha correta do condutor é fundamental para garantir o bom funcionamento do serviço e a satisfação do cliente.

---

## 4. Fluxo de Reserva (Cliente)

1. O cliente acede ao site e preenche o formulário de reserva:

   - Nome, email, telefone
   - Data e hora pretendida
   - Tipo de tour (cada tour tem duração diferente)
   - Número de pessoas
   - Mensagem adicional (opcional)

2. **Verificação automática de disponibilidade:**

   - Assim que o cliente escolhe o tour, o sistema verifica se o horário está disponível para a duração do percurso.
   - Se o horário estiver ocupado, o sistema sugere automaticamente a próxima hora disponível para o tour escolhido.
   - O cliente pode aceitar a sugestão ou escolher outro horário.

3. **Confirmação via WhatsApp:**
   - Se o horário estiver disponível, o cliente é redirecionado para o WhatsApp com uma mensagem pré-preenchida contendo todos os dados da reserva.
   - O cliente só precisa enviar a mensagem para concluir o pedido.

---

## 5. Gestão e Confirmação de Reservas (Admin)

- O admin vê todas as reservas na aba "Reservas" ou "Calendário".
- **Passos para gerir e confirmar reservas:**
  1. Analise as reservas pendentes na lista.
  2. Clique em "Confirmar" para aprovar uma reserva (o cliente recebe mensagem de confirmação via WhatsApp, enviada pelo condutor ativo).
  3. Se necessário, pode cancelar ou eliminar reservas.
  4. Após o serviço, marque a reserva como "Concluída" para manter o histórico organizado.
  5. Utilize a aba "Calendário" para visualizar todos os serviços agendados e evitar sobreposição de horários.
- Ao confirmar ou cancelar, o sistema permite enviar mensagens automáticas para o cliente, com todos os dados interpolados (nome, tour, data, hora, etc).
- **Nota:** Certifique-se de que o condutor correto está selecionado/ativo antes de enviar mensagens ao cliente.

---

## 6. Mensagens Pré-definidas

### **Do Cliente para o Admin (via WhatsApp):**

- Mensagem simples de contacto: "Olá, gostaria de fazer uma reserva!"
- Mensagem de pedido de reserva com todos os dados:
  - "Olá, gostaria de reservar o passeio '{{tour_type}}' para o dia {{reservation_date}} às {{reservation_time}} para {{number_of_people}} pessoas.\nNome: {{name}}\nEmail: {{email}}\nTelefone: {{phone}}\nMensagem: {{message}}\nPedido feito em: {{created_at}}"

### **Do Admin para o Cliente (via WhatsApp):**

- Confirmação: "Olá {{name}}, a sua reserva para o passeio '{{tour_type}}' está confirmada para o dia {{reservation_date}} às {{reservation_time}}. Encontre-nos no centro de Milfontes, junto ao jardim público. Qualquer dúvida, estamos à disposição!"
- Cancelamento: "Olá {{name}}, lamentamos informar que a sua reserva para o passeio '{{tour_type}}' no dia {{reservation_date}} às {{reservation_time}} foi cancelada. Se precisar reagendar ou tiver alguma dúvida, entre em contacto connosco."
- Lembrete de pagamento, atualização meteorológica, lembrete de pickup, etc. (todas as mensagens são automáticas e traduzidas para o idioma do cliente)

---

## 7. Funcionamento da Lógica de Reservas (Evitar Sobreposição)

- O sistema impede reservas sobrepostas automaticamente:
  - Cada tour tem uma duração específica.
  - Ao escolher data, hora e tour, o sistema verifica todas as reservas já existentes para o dia.
  - Só permite reservar se houver tempo suficiente para o tour escolhido, sem sobrepor outros serviços.
  - Se não houver espaço, o sistema sugere automaticamente a próxima hora disponível.
- O cliente só consegue reservar horários realmente livres, evitando conflitos e garantindo uma experiência profissional.
- O admin pode sempre consultar o calendário para garantir que todos os serviços estão bem distribuídos e sem conflitos.

---

Se tiver dúvidas ou sugestões, contacte a equipa de suporte TukTuk Milfontes.

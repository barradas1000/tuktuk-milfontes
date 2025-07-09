import React from "react";

export default function Instrucoes() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">
        Instruções de uso do sistema de reservas
      </h1>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-2">
          1. Criação de Conta e Login
        </h2>
        <ul className="list-disc ml-6 text-gray-800">
          <li>
            <strong>Cliente:</strong> Não é necessário criar conta para fazer
            uma reserva. Basta preencher o formulário e confirmar via WhatsApp.
          </li>
          <li>
            <strong>Administrador:</strong> O acesso ao backoffice requer uma
            conta de admin. Solicite as credenciais à equipa de gestão. Aceda ao
            painel em{" "}
            <a
              href="https://tuktuk-milfontes.vercel.app/admin"
              className="text-blue-700 underline"
            >
              https://tuktuk-milfontes.vercel.app/admin
            </a>{" "}
            e faça login. Após autenticação, será direcionado para a aba{" "}
            <b>Reservas</b>.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-2">
          2. Backoffice/Admin
        </h2>
        <p className="mb-2">
          O painel administrativo apresenta três abas principais:
        </p>
        <ul className="list-disc ml-6 text-gray-800">
          <li>
            <b>Reservas:</b> Lista e gestão de todas as reservas (pendentes,
            confirmadas, concluídas, canceladas).
          </li>
          <li>
            <b>Calendário:</b> Visualização das reservas por data/hora,
            facilitando a gestão de horários e disponibilidade.
          </li>
          <li>
            <b>Relatórios:</b> Estatísticas e análises de reservas, desempenho e
            faturação.
          </li>
        </ul>
        <p className="mt-2">
          Funcionalidades principais: gerir reservas, eliminar, enviar mensagens
          automáticas, ver estatísticas e gerir condutores ativos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-2">
          3. Escolha e Importância do Motorista Disponível
        </h2>
        <ul className="list-disc ml-6 text-gray-800">
          <li>
            Cada reserva pode ser associada a um condutor/motorista disponível.
          </li>
          <li>
            Cada condutor tem um número de WhatsApp para comunicação direta com
            o cliente.
          </li>
          <li>
            O admin pode selecionar o condutor ativo para cada serviço,
            garantindo que o cliente recebe informações do motorista correto.
          </li>
          <li>
            A escolha correta do condutor é fundamental para o bom funcionamento
            do serviço e satisfação do cliente.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-2">
          4. Fluxo de Reserva (Cliente)
        </h2>
        <ol className="list-decimal ml-6 text-gray-800">
          <li>
            O cliente preenche o formulário: nome, email, telefone, data, hora,
            tipo de tour, nº de pessoas e mensagem (opcional).
          </li>
          <li>
            Assim que escolhe o tour, o sistema verifica automaticamente a
            disponibilidade para a duração do percurso.
          </li>
          <li>
            Se o horário estiver ocupado, o sistema sugere a próxima hora
            disponível para o tour escolhido. O cliente pode aceitar ou escolher
            outro horário.
          </li>
          <li>
            Se o horário estiver livre, o cliente é redirecionado para o
            WhatsApp com a mensagem de reserva pronta a enviar.
          </li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-2">
          5. Gestão e Confirmação de Reservas (Admin)
        </h2>
        <ol className="list-decimal ml-6 text-gray-800">
          <li>
            Analise as reservas pendentes na aba <b>Reservas</b>.
          </li>
          <li>
            Clique em <b>Confirmar</b> para aprovar uma reserva (o cliente
            recebe mensagem de confirmação via WhatsApp, enviada pelo condutor
            ativo).
          </li>
          <li>Se necessário, cancele ou elimine reservas.</li>
          <li>
            Após o serviço, marque como <b>Concluída</b> para manter o histórico
            organizado.
          </li>
          <li>
            Use a aba <b>Calendário</b> para garantir que não há sobreposição de
            horários.
          </li>
        </ol>
        <p className="mt-2">
          Ao confirmar ou cancelar, o sistema permite enviar mensagens
          automáticas para o cliente, com todos os dados interpolados (nome,
          tour, data, hora, etc).{" "}
          <b>
            Certifique-se de que o condutor correto está selecionado/ativo antes
            de enviar mensagens ao cliente.
          </b>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-2">
          6. Mensagens Pré-definidas
        </h2>
        <div className="mb-2">
          <b>Do Cliente para o Admin (via WhatsApp):</b>
          <ul className="list-disc ml-6">
            <li>
              Mensagem simples:{" "}
              <span className="bg-gray-100 px-2 py-1 rounded">
                Olá, gostaria de fazer uma reserva!
              </span>
            </li>
            <li>
              Mensagem completa:{" "}
              <span className="bg-gray-100 px-2 py-1 rounded">
                Olá, gostaria de reservar o passeio '{{ tour_type }}' para o dia{" "}
                {{ reservation_date }} às {{ reservation_time }} para{" "}
                {{ number_of_people }} pessoas. Nome: {{ name }} Email:{" "}
                {{ email }} Telefone: {{ phone }} Mensagem: {{ message }} Pedido
                feito em: {{ created_at }}
              </span>
            </li>
          </ul>
        </div>
        <div className="mb-2">
          <b>Do Admin para o Cliente (via WhatsApp):</b>
          <ul className="list-disc ml-6">
            <li>
              Confirmação:{" "}
              <span className="bg-gray-100 px-2 py-1 rounded">
                Olá {{ name }}, a sua reserva para o passeio '{{ tour_type }}'
                está confirmada para o dia {{ reservation_date }} às{" "}
                {{ reservation_time }}. Encontre-nos no centro de Milfontes,
                junto ao jardim público. Qualquer dúvida, estamos à disposição!
              </span>
            </li>
            <li>
              Cancelamento:{" "}
              <span className="bg-gray-100 px-2 py-1 rounded">
                Olá {{ name }}, lamentamos informar que a sua reserva para o
                passeio '{{ tour_type }}' no dia {{ reservation_date }} às{" "}
                {{ reservation_time }} foi cancelada. Se precisar reagendar ou
                tiver alguma dúvida, entre em contacto connosco.
              </span>
            </li>
            <li>
              Lembrete de pagamento, atualização meteorológica, lembrete de
              pickup, etc. (todas as mensagens são automáticas e traduzidas para
              o idioma do cliente)
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-2">
          7. Funcionamento da Lógica de Reservas (Evitar Sobreposição)
        </h2>
        <ul className="list-disc ml-6 text-gray-800">
          <li>
            O sistema impede reservas sobrepostas automaticamente, considerando
            a duração de cada tour.
          </li>
          <li>
            Ao escolher data, hora e tour, o sistema verifica todas as reservas
            já existentes para o dia.
          </li>
          <li>
            Só permite reservar se houver tempo suficiente para o tour
            escolhido, sem sobrepor outros serviços.
          </li>
          <li>
            Se não houver espaço, o sistema sugere automaticamente a próxima
            hora disponível.
          </li>
          <li>
            O admin pode sempre consultar o calendário para garantir que todos
            os serviços estão bem distribuídos e sem conflitos.
          </li>
        </ul>
      </section>

      <div className="mt-10 text-center text-gray-500 text-sm">
        Se tiver dúvidas ou sugestões, contacte a equipa de suporte TukTuk
        Milfontes.
      </div>
    </div>
  );
}

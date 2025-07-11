import React from "react";

const TermosCondicoes = () => (
  <div
    className="container"
    style={{ maxWidth: 800, margin: "40px auto", padding: 24 }}
  >
    <a
      href="/"
      style={{
        display: "inline-block",
        marginBottom: 24,
        color: "#2563eb",
        textDecoration: "underline",
        fontWeight: 500,
      }}
    >
      ← Voltar à página inicial
    </a>
    <h1>Termos e Condições</h1>
    <p>
      Bem-vindo ao nosso serviço de reservas de passeios de tuk tuk em Vila Nova
      de Milfontes. Ao efetuar uma reserva, o cliente concorda com os seguintes
      termos e condições, em conformidade com a legislação portuguesa:
    </p>
    <h2>1. Reservas</h2>
    <ul>
      <li>
        As reservas podem ser efetuadas online, por telefone ou presencialmente.
      </li>
      <li>
        O cliente deve fornecer informações corretas e completas no momento da
        reserva.
      </li>
      <li>
        A confirmação da reserva será enviada por email ou outro meio indicado
        pelo cliente.
      </li>
    </ul>
    <h2>2. Pagamentos</h2>
    <ul>
      <li>
        O pagamento pode ser realizado online, por transferência bancária ou
        presencialmente, conforme as opções disponíveis.
      </li>
      <li>
        O valor total e as condições de pagamento serão comunicados no momento
        da reserva.
      </li>
    </ul>
    <h2>3. Alterações e Cancelamentos</h2>
    <ul>
      <li>
        O cliente pode solicitar alterações ou cancelamentos conforme a nossa
        Política de Cancelamento.
      </li>
      <li>
        Reservamo-nos o direito de cancelar ou alterar reservas por motivos de
        força maior, condições meteorológicas adversas ou motivos operacionais,
        com reembolso total ao cliente, se aplicável.
      </li>
    </ul>
    <h2>4. Responsabilidade</h2>
    <ul>
      <li>
        Os participantes devem cumprir as instruções do condutor e respeitar as
        normas de segurança.
      </li>
      <li>
        Não nos responsabilizamos por objetos pessoais perdidos ou danos
        causados por negligência do cliente.
      </li>
    </ul>
    <h2>5. Proteção de Dados</h2>
    <ul>
      <li>
        Os dados pessoais fornecidos serão tratados de acordo com a nossa
        Política de Privacidade e a legislação em vigor (RGPD).
      </li>
    </ul>
    <h2>6. Disposições Finais</h2>
    <ul>
      <li>Estes termos regem-se pela lei portuguesa.</li>
      <li>
        Em caso de litígio, pode recorrer ao Livro de Reclamações Eletrónico ou
        aos meios legais disponíveis.
      </li>
    </ul>
    <p>
      Para mais informações, contacte-nos através dos meios indicados no site.
    </p>
  </div>
);

export default TermosCondicoes;

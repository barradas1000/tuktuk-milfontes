import React from "react";

const PoliticaCancelamento = () => (
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
    <h1>Política de Cancelamento</h1>
    <p>
      A nossa política de cancelamento segue as melhores práticas do setor
      turístico em Portugal, garantindo transparência e respeito pelos direitos
      dos clientes.
    </p>
    <h2>1. Cancelamento pelo Cliente</h2>
    <ul>
      <li>
        O cliente pode cancelar a reserva sem custos até 24 horas antes da
        data/hora marcada para o passeio.
      </li>
      <li>
        Cancelamentos efetuados com menos de 24 horas de antecedência poderão
        não ser reembolsados, salvo situações de força maior devidamente
        justificadas.
      </li>
      <li>
        Para cancelar, o cliente deve contactar-nos pelos meios indicados no
        site, indicando o nome e os dados da reserva.
      </li>
    </ul>
    <h2>2. Cancelamento pela Empresa</h2>
    <ul>
      <li>
        Reservamo-nos o direito de cancelar passeios por motivos de força maior,
        condições meteorológicas adversas, motivos de segurança ou operacionais.
      </li>
      <li>
        Nestes casos, o cliente será informado o mais rapidamente possível e
        terá direito ao reembolso total do valor pago ou à remarcação da
        experiência.
      </li>
    </ul>
    <h2>3. Alterações à Reserva</h2>
    <ul>
      <li>
        O cliente pode solicitar alterações à reserva (data, hora, percurso) até
        24 horas antes do passeio, sujeitas a disponibilidade.
      </li>
    </ul>
    <h2>4. Não Comparência (No-show)</h2>
    <ul>
      <li>
        Se o cliente não comparecer à hora marcada, sem aviso prévio, não haverá
        direito a reembolso.
      </li>
    </ul>
    <h2>5. Contactos</h2>
    <ul>
      <li>
        Para cancelar ou alterar uma reserva, utilize os contactos disponíveis
        no site.
      </li>
    </ul>
    <p>
      Esta política pode ser atualizada sem aviso prévio. Consulte sempre a
      versão mais recente no nosso site.
    </p>
  </div>
);

export default PoliticaCancelamento;

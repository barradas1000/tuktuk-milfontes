import { useTranslation } from "react-i18next";

export default function Instrucoes() {
  const { t } = useTranslation();
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">
        {t("instructions.title")}
      </h1>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-2">
          {t("instructions.accountLogin.title")}
        </h2>
        <ul className="list-disc ml-6 text-gray-800">
          <li>{t("instructions.accountLogin.client")}</li>
          <li>{t("instructions.accountLogin.admin")}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-2">
          {t("instructions.backoffice.title")}
        </h2>
        <p className="mb-2">{t("instructions.backoffice.description")}</p>
        <ul className="list-disc ml-6 text-gray-800">
          <li>{t("instructions.backoffice.reservas")}</li>
          <li>{t("instructions.backoffice.calendario")}</li>
          <li>{t("instructions.backoffice.relatorios")}</li>
        </ul>
        <p className="mt-2">{t("instructions.backoffice.funcionalidades")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-2">
          {t("instructions.driver.title")}
        </h2>
        <ul className="list-disc ml-6 text-gray-800">
          <li>{t("instructions.driver.reservaCondutor")}</li>
          <li>{t("instructions.driver.whatsappCondutor")}</li>
          <li>{t("instructions.driver.selecionarCondutor")}</li>
          <li>{t("instructions.driver.importanciaCondutor")}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-2">
          {t("instructions.fluxoReserva.title")}
        </h2>
        <ol className="list-decimal ml-6 text-gray-800">
          <li>{t("instructions.fluxoReserva.formulario")}</li>
          <li>{t("instructions.fluxoReserva.verificaDisponibilidade")}</li>
          <li>{t("instructions.fluxoReserva.sugereHorario")}</li>
          <li>{t("instructions.fluxoReserva.redirecionaWhatsapp")}</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-2">
          {t("instructions.gestaoConfirmacao.title")}
        </h2>
        <ol className="list-decimal ml-6 text-gray-800">
          <li>{t("instructions.gestaoConfirmacao.analiseReservas")}</li>
          <li>{t("instructions.gestaoConfirmacao.confirmarReserva")}</li>
          <li>{t("instructions.gestaoConfirmacao.cancelarEliminar")}</li>
          <li>{t("instructions.gestaoConfirmacao.marcarConcluida")}</li>
          <li>{t("instructions.gestaoConfirmacao.abaCalendario")}</li>
        </ol>
        <p className="mt-2">
          {t("instructions.gestaoConfirmacao.mensagensAutomaticas")}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-2">
          {t("instructions.mensagens.title")}
        </h2>
        <div className="mb-2">
          <b>{t("instructions.mensagens.clienteAdmin")}</b>
          <ul className="list-disc ml-6">
            <li>{t("instructions.mensagens.mensagemSimples")}</li>
            <li>{t("instructions.mensagens.mensagemCompleta")}</li>
          </ul>
        </div>
        <div className="mb-2">
          <b>{t("instructions.mensagens.adminCliente")}</b>
          <ul className="list-disc ml-6">
            <li>{t("instructions.mensagens.confirmacao")}</li>
            <li>{t("instructions.mensagens.cancelamento")}</li>
            <li>{t("instructions.mensagens.outrasMensagens")}</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-2">
          {t("instructions.funcionamento.title")}
        </h2>
        <ul className="list-disc ml-6 text-gray-800">
          <li>{t("instructions.funcionamento.impedeSobreposicao")}</li>
          <li>{t("instructions.funcionamento.verificaReservas")}</li>
          <li>{t("instructions.funcionamento.tempoSuficiente")}</li>
          <li>{t("instructions.funcionamento.sugereProximaHora")}</li>
          <li>{t("instructions.funcionamento.consultaCalendario")}</li>
        </ul>
      </section>

      <div className="mt-10 text-center text-gray-500 text-sm">
        {t("instructions.suporte")}
      </div>
    </div>
  );
}

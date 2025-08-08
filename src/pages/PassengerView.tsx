import React from "react";
<<<<<<< HEAD
import { useTranslation } from "react-i18next";
=======
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PassengerMap from "../components/PassengerMap";

const PassengerView: React.FC = () => {
<<<<<<< HEAD
  const { t } = useTranslation();

=======
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center">
<<<<<<< HEAD
              🛺 {t("tracking.title")}
            </h1>
            <p className="text-center text-gray-600 mt-2">
              {t("tracking.subtitle")}
=======
              🛺 TukTuk em Tempo Real
            </h1>
            <p className="text-center text-gray-600 mt-2">
              Acompanhe a localização do nosso TukTuk em Vila Nova de Milfontes
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
<<<<<<< HEAD
              📍 {t("tracking.currentLocation")}
=======
              📍 Localização Atual
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PassengerMap />
          </CardContent>
        </Card>

        {/* Informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
<<<<<<< HEAD
              <CardTitle className="text-lg">
                ℹ️ {t("tracking.howItWorks")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div>• {t("tracking.instructions.locateMe")}</div>
              <div>• {t("tracking.instructions.tuktukIcon")}</div>
              <div>• {t("tracking.instructions.statusIndicator")}</div>
              <div>• {t("tracking.instructions.distanceCalculation")}</div>
              <div>• {t("tracking.instructions.makeReservation")}</div>
              <div>• {t("tracking.instructions.centerMap")}</div>
              <div>• {t("tracking.instructions.offlineNote")}</div>
=======
              <CardTitle className="text-lg">ℹ️ Como funciona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div>• O ponto azul mostra a localização atual do TukTuk</div>
              <div>• A localização é atualizada automaticamente</div>
              <div>• Se não vir o ponto, o TukTuk pode estar offline</div>
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
<<<<<<< HEAD
              <CardTitle className="text-lg">
                📞 {t("tracking.contact")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div>• {t("tracking.contactInfo.phone")}</div>
              <div>• {t("tracking.contactInfo.whatsapp")}</div>
              <div>• {t("tracking.contactInfo.email")}</div>
=======
              <CardTitle className="text-lg">📞 Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div>• Telefone: 963 496 320</div>
              <div>• WhatsApp: Disponível no site principal</div>
              <div>• Email: diogo.carias@outlook.pt</div>
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
            </CardContent>
          </Card>
        </div>

<<<<<<< HEAD
        {/* Link para voltar ao site principal */}
=======
        {/* Link para reserva */}
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
<<<<<<< HEAD
            ← {t("tracking.backToMainSite")}
=======
            ← Voltar ao site principal
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
          </a>
        </div>
      </div>
    </div>
  );
};

export default PassengerView;

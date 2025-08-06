import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PassengerMap from "../components/PassengerMap";

const PassengerView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              🛺 {t("tracking.title")}
            </h1>
            <p className="text-center text-gray-600 mt-2">
              {t("tracking.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📍 {t("tracking.currentLocation")}
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
              <CardTitle className="text-lg">ℹ️ {t("tracking.howItWorks")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div>
                • {t("tracking.instructions.locateMe")}
              </div>
              <div>
                • {t("tracking.instructions.tuktukIcon")}
              </div>
              <div>
                • {t("tracking.instructions.statusIndicator")}
              </div>
              <div>
                • {t("tracking.instructions.distanceCalculation")}
              </div>
              <div>
                • {t("tracking.instructions.makeReservation")}
              </div>
              <div>
                • {t("tracking.instructions.centerMap")}
              </div>
              <div>• {t("tracking.instructions.offlineNote")}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📞 {t("tracking.contact")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div>• {t("tracking.contactInfo.phone")}</div>
              <div>• {t("tracking.contactInfo.whatsapp")}</div>
              <div>• {t("tracking.contactInfo.email")}</div>
            </CardContent>
          </Card>
        </div>

        {/* Link para voltar ao site principal */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← {t("tracking.backToMainSite")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default PassengerView;

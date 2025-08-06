import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PassengerMap from "../components/PassengerMap";

const PassengerView: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              🛺 TukTuk em Tempo Real
            </h1>
            <p className="text-center text-gray-600 mt-2">
              Acompanhe a localização do nosso TukTuk em Vila Nova de Milfontes
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📍 Localização Atual
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
              <CardTitle className="text-lg">ℹ️ Como funciona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div>
                • 📍 Clique em "Localizar-me" para ver a sua posição no mapa
              </div>
              <div>
                • 🚗 O ícone do TukTuk mostra a localização atual em tempo real
              </div>
              <div>
                • 🟢/🔴 O status indica se o TukTuk está disponível ou ocupado
              </div>
              <div>
                • 📏 A distância e tempo estimado são calculados automaticamente
              </div>
              <div>
                • 📝 Use "Faça a Sua Reserva Aqui!" para reservar o serviço
              </div>
              <div>
                • 🎯 "Centralizar mapa" ajusta a vista para melhor visualização
              </div>
              <div>• 🚫 Se não vir o TukTuk, pode estar offline</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📞 Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div>• Telefone: 963 496 320</div>
              <div>• WhatsApp: Disponível no site principal</div>
              <div>• Email: diogo.carias@outlook.pt</div>
            </CardContent>
          </Card>
        </div>

        {/* Link para voltar ao site principal */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Voltar ao site principal
          </a>
        </div>
      </div>
    </div>
  );
};

export default PassengerView;


import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ExternalLink } from 'lucide-react';

const MilfontesMap = () => {
  const { t } = useTranslation();
  const googleMapsUrl = 'https://maps.app.goo.gl/Rye4q9WBC5RufDFt8';

  const handleOpenMap = () => {
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl border-0 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-blue-900 flex items-center justify-center gap-2">
          <MapPin className="w-8 h-8 text-amber-500" />
          {t('map.mapTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🗺️</span>
          </div>
          <p className="text-gray-600 text-lg mb-6">
            {t('map.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-900">{t('map.pointsOfInterest')}</h4>
            <ul className="space-y-1">
              <li>• {t('map.historicCenter')}</li>
              <li>• {t('map.milfontesBeach')}</li>
              <li>• {t('map.fort')}</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-900">{t('map.nearbyBeaches')}</h4>
            <ul className="space-y-1">
              <li>• {t('map.lighthouse')}</li>
              <li>• {t('map.furnasBeach')}</li>
              <li>• {t('map.viewpoints')}</li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-4">
          <Button 
            onClick={handleOpenMap}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
          >
            <ExternalLink className="w-6 h-6 mr-3" />
            {t('map.openInGoogleMaps')}
          </Button>
          <p className="text-xs text-gray-500 mt-3">
            {t('map.clickToSee')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MilfontesMap;

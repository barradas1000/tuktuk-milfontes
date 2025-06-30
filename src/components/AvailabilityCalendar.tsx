
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle } from 'lucide-react';

const AvailabilityCalendar = () => {
  console.log('AvailabilityCalendar rendering');
  const { t } = useTranslation();
  
  const availableSlots = [
    { time: '09:00', available: true },
    { time: '10:30', available: true },
    { time: '12:00', available: false },
    { time: '14:00', available: true },
    { time: '15:30', available: true },
    { time: '17:00', available: true },
    { time: '18:30', available: false }
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl border-0 bg-gradient-to-br from-green-50 to-white">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-3xl font-bold text-blue-900 flex items-center justify-center gap-3">
          <Calendar className="w-8 h-8 text-green-500" />
          {t('availability.availabilityToday')}
        </CardTitle>
        <p className="text-gray-600 text-lg">{t('availability.availableSlots')}</p>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableSlots.map((slot, index) => (
            <div 
              key={index}
              className={`p-4 rounded-xl border-2 text-center transition-all duration-300 ${
                slot.available 
                  ? 'border-green-200 bg-green-50 hover:border-green-300 hover:shadow-md' 
                  : 'border-red-200 bg-red-50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-bold text-lg">{slot.time}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                {slot.available ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 font-semibold">{t('availability.available')}</span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-red-700 font-semibold">{t('availability.occupied')}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            {t('availability.reserveSpecificTime')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityCalendar;

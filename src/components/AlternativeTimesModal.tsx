import React from 'react';
import { formatTime } from '@/services/availabilityService';

interface AlternativeTimesModalProps {
  isOpen: boolean;
  onClose: () => void;
  alternativeTimes: string[];
  onSelectTime: (time: string) => void;
  selectedDate: string;
}

const AlternativeTimesModal: React.FC<AlternativeTimesModalProps> = ({
  isOpen,
  onClose,
  alternativeTimes,
  onSelectTime,
  selectedDate
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Horário Indisponível
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            O horário selecionado para <strong>{formatDate(selectedDate)}</strong> já está reservado por outro cliente.
          </p>
          <p className="text-sm text-gray-500">
            Cada horário pode ter apenas uma reserva por vez. Aqui estão os horários ainda disponíveis:
          </p>
        </div>

        {alternativeTimes.length > 0 ? (
          <div className="space-y-2">
            {alternativeTimes.map((time) => (
              <button
                key={time}
                onClick={() => {
                  onSelectTime(time);
                  onClose();
                }}
                className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-900">
                  {formatTime(time)}
                </div>
                <div className="text-sm text-gray-500">
                  Disponível
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">
              Não há horários alternativos disponíveis para esta data.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Tente selecionar outra data.
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlternativeTimesModal;

import React from "react";
import { formatTime } from "@/services/availabilityService";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

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
  selectedDate,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Sugerir apenas o próximo horário disponível
  const nextAvailableTime = alternativeTimes[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("reservation.blockedTimeTitle") || t("reservation.title")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            {t("reservation.nextAvailableTimeSuggestion", {
              next_available_time: nextAvailableTime
                ? formatTime(nextAvailableTime)
                : "-",
            })}
          </p>
        </div>

        {nextAvailableTime ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                onSelectTime(nextAvailableTime);
                onClose();
              }}
              className="w-full p-3 text-center border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 font-semibold text-blue-900"
            >
              {t("reservation.acceptSuggestion")}
            </button>
            <button
              onClick={onClose}
              className="w-full p-3 text-center border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50"
            >
              {t("reservation.chooseAnotherTime")}
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">
              {t("reservation.noAlternativeTimes") ||
                "Não há horários alternativos disponíveis para esta data."}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {t("reservation.tryAnotherDate") ||
                "Tente selecionar outra data."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlternativeTimesModal;

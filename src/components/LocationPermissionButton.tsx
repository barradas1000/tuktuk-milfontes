import React from 'react';
import { useGeolocation } from '../hooks/useGeolocation';

interface LocationPermissionButtonProps {
  onLocationGranted?: (position: GeolocationPosition) => void;
  onLocationDenied?: () => void;
  className?: string;
  children?: React.ReactNode;
  showStatus?: boolean;
}

export const LocationPermissionButton: React.FC<LocationPermissionButtonProps> = ({
  onLocationGranted,
  onLocationDenied,
  className = '',
  children,
  showStatus = true
}) => {
  const { position, error, permission, isLoading, isSupported, getLocation } = useGeolocation();

  const handleClick = () => {
    if (!isSupported) {
      alert('Geolocalização não é suportada neste navegador');
      return;
    }

    if (permission === 'denied') {
      alert('Permissão de localização negada. Por favor, habilite nas configurações do seu navegador.');
      onLocationDenied?.();
      return;
    }

    getLocation();
  };

  // Callback quando a localização é obtida
  React.useEffect(() => {
    if (position && onLocationGranted) {
      onLocationGranted(position);
    }
  }, [position, onLocationGranted]);

  // Callback quando há erro
  React.useEffect(() => {
    if (error && onLocationDenied) {
      onLocationDenied();
    }
  }, [error, onLocationDenied]);

  const getButtonText = () => {
    if (isLoading) return '📍 Localizando...';
    if (permission === 'denied') return '📍 Permissão Negada';
    if (position) return '📍 Você está aqui!';
    return children || '📍 Localizar-me';
  };

  const getButtonClass = () => {
    let baseClass = 'location-permission-button';
    
    if (isLoading) baseClass += ' loading';
    if (permission === 'denied') baseClass += ' denied';
    if (position) baseClass += ' active';
    if (!isSupported) baseClass += ' disabled';
    
    return `${baseClass} ${className}`.trim();
  };

  const getStatusText = () => {
    if (!isSupported) return 'Geolocalização não suportada';
    if (isLoading) return 'Obtendo localização...';
    if (error) return error;
    if (permission === 'denied') return 'Permissão negada';
    if (position) return 'Localização obtida';
    return 'Clique para localizar';
  };

  return (
    <div className="location-permission-container">
      <button
        onClick={handleClick}
        className={getButtonClass()}
        disabled={!isSupported || isLoading}
        title={getStatusText()}
      >
        {getButtonText()}
      </button>
      
      {showStatus && (
        <div className="location-status">
          <small className={`status-text ${permission}`}>
            {getStatusText()}
          </small>
        </div>
      )}
      
      <style jsx>{`
        .location-permission-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .location-permission-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          min-width: 140px;
          justify-content: center;
        }

        .location-permission-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .location-permission-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .location-permission-button.loading {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          animation: pulse 1.5s infinite;
        }

        .location-permission-button.denied {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          cursor: not-allowed;
        }

        .location-permission-button.active {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .location-permission-button.disabled {
          background: #ccc;
          cursor: not-allowed;
          box-shadow: none;
        }

        .location-permission-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .location-status {
          text-align: center;
        }

        .status-text {
          font-size: 0.75rem;
          color: #666;
          transition: color 0.3s ease;
        }

        .status-text.granted {
          color: #28a745;
        }

        .status-text.denied {
          color: #dc3545;
        }

        .status-text.prompt {
          color: #ffc107;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);
          }
          50% {
            box-shadow: 0 4px 25px rgba(240, 147, 251, 0.6);
          }
          100% {
            box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);
          }
        }

        @media (max-width: 768px) {
          .location-permission-button {
            padding: 0.6rem 1.2rem;
            font-size: 0.85rem;
            min-width: 120px;
          }
        }
      `}</style>
    </div>
  );
}; 
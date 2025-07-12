import React, { useState } from "react";
import { useGeolocation } from "../hooks/useGeolocation";

import { GeolocationPosition as CustomGeolocationPosition } from "../hooks/useGeolocation";

interface LocationPermissionButtonProps {
  onLocationGranted?: (position: CustomGeolocationPosition) => void;
  onLocationDenied?: () => void;
  className?: string;
  children?: React.ReactNode;
  showStatus?: boolean;
}

export const LocationPermissionButton: React.FC<
  LocationPermissionButtonProps
> = ({
  onLocationGranted,
  onLocationDenied,
  className = "",
  children,
  showStatus = true,
}) => {
  const { position, error, permission, isLoading, isSupported, getLocation } =
    useGeolocation();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);

  const handleClick = () => {
    if (!isSupported) {
      alert("Geolocalização não é suportada neste navegador");
      return;
    }

    if (permission === "denied") {
      setShowHelpModal(true);
      setShowPermissionAlert(true);
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
    if (isLoading) return "📍 Localizando...";
    if (permission === "denied") return "📍 Permissão Negada";
    if (position) return "📍 Você está aqui!";
    return children || "📍 Localizar-me";
  };

  const getButtonClass = () => {
    let baseClass = "location-permission-button";

    if (isLoading) baseClass += " loading";
    if (permission === "denied") baseClass += " denied";
    if (position) baseClass += " active";
    if (!isSupported) baseClass += " disabled";

    return `${baseClass} ${className}`.trim();
  };

  const getStatusText = () => {
    if (!isSupported) return "Geolocalização não suportada";
    if (isLoading) return "Obtendo localização...";
    if (error) return error;
    if (permission === "denied") return "Permissão negada";
    if (position) return "Localização obtida";
    return "Clique para localizar";
  };

  const detectMobileOS = () => {
    const userAgent =
      navigator.userAgent ||
      navigator.vendor ||
      (window as unknown as { opera?: string }).opera;

    if (/android/i.test(userAgent)) {
      return "android";
    }
    if (
      /iPad|iPhone|iPod/.test(userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream
    ) {
      return "ios";
    }
    return "desktop";
  };

  const getHelpInstructions = () => {
    const os = detectMobileOS();

    if (os === "android") {
      return {
        title: "Como permitir localização no Android",
        steps: [
          "1. Toque nos três pontos (⋮) no canto superior direito do Chrome",
          '2. Selecione "Configurações"',
          '3. Toque em "Site settings" ou "Configurações do site"',
          '4. Toque em "Localização"',
          '5. Encontre este site na lista e mude para "Permitir"',
          "6. Volte para o site e atualize a página",
          "",
          "Alternativa mais fácil:",
          "• Procure por um ícone de localização 📍 na barra de endereços",
          "• Ou um ícone de cadeado 🔒 ao lado do endereço",
          '• Toque nele e selecione "Permitir"',
          "",
          "Se não vir esses ícones:",
          "• Toque na barra de endereços para ver mais opções",
          "• Ou procure por um ícone de informação (ⓘ)",
        ],
      };
    } else if (os === "ios") {
      return {
        title: "Como permitir localização no iPhone/iPad",
        steps: [
          '1. Toque no ícone "AA" na barra de endereços',
          '2. Selecione "Configurações do site"',
          '3. Toque em "Localização"',
          '4. Mude para "Permitir"',
          "5. Volte para o site e atualize a página",
          "",
          "Alternativa:",
          "• Procure por um ícone de localização 📍 na barra de endereços",
          '• Toque nele e selecione "Permitir"',
        ],
      };
    } else {
      return {
        title: "Como permitir localização no navegador",
        steps: [
          "1. Toque no ícone de localização na barra de endereços",
          '2. Selecione "Permitir" quando aparecer o popup',
          "3. Se não aparecer, verifique as configurações do navegador",
          '4. Procure por "Permissões" ou "Configurações do site"',
          "5. Habilite a permissão de localização para este site",
        ],
      };
    }
  };

  const instructions = getHelpInstructions();

  return (
    <>
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
      </div>

      {/* Banner de alerta de permissão */}
      {showPermissionAlert && (
        <div className="permission-alert-banner">
          <div className="permission-alert-content">
            <div className="permission-alert-icon">⚠️</div>
            <div className="permission-alert-text">
              <strong>Permissão de localização necessária</strong>
              <p>
                Para mostrar sua localização no mapa, precisamos da sua
                permissão.
              </p>
            </div>
            <button
              className="permission-alert-close"
              onClick={() => setShowPermissionAlert(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Modal de ajuda */}
      {showHelpModal && (
        <div
          className="help-modal-overlay"
          onClick={() => setShowHelpModal(false)}
        >
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="help-modal-header">
              <h3>{instructions.title}</h3>
              <button
                className="help-modal-close"
                onClick={() => setShowHelpModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="help-modal-content">
              {instructions.steps.map((step, index) => (
                <p key={index} className="help-step">
                  {step}
                </p>
              ))}

              {/* Seção visual para Android */}
              {detectMobileOS() === "android" && (
                <div className="help-visual-section">
                  <h4>📍 Onde encontrar os ícones:</h4>
                  <div className="browser-mockup">
                    <div className="browser-address-bar">
                      <span className="address-text">
                        tuktuk-milfontes.vercel.app
                      </span>
                      <div className="address-icons">
                        <span
                          className="icon-location"
                          title="Ícone de localização"
                        >
                          📍
                        </span>
                        <span className="icon-lock" title="Ícone de cadeado">
                          🔒
                        </span>
                        <span className="icon-info" title="Ícone de informação">
                          ⓘ
                        </span>
                        <span className="icon-menu" title="Menu de opções">
                          ⋮
                        </span>
                      </div>
                    </div>
                    <p className="visual-note">
                      Procure por estes ícones na barra de endereços do seu
                      navegador
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="help-modal-footer">
              <button
                className="help-modal-button"
                onClick={() => setShowHelpModal(false)}
              >
                Entendi
              </button>
              <a
                href="/docs/PERMISSAO-LOCALIZACAO.md"
                target="_blank"
                rel="noopener noreferrer"
                className="help-modal-link"
              >
                📖 Ver guia completo
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
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

        /* Banner de alerta de permissão */
        .permission-alert-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          color: white;
          z-index: 9999;
          padding: 1rem;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
          animation: slideDown 0.3s ease-out;
        }

        .permission-alert-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .permission-alert-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .permission-alert-text {
          flex: 1;
        }

        .permission-alert-text strong {
          display: block;
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }

        .permission-alert-text p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .permission-alert-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 1.2rem;
          padding: 0.5rem;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s;
          flex-shrink: 0;
        }

        .permission-alert-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }

        /* Modal de ajuda */
        .help-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1rem;
        }

        .help-modal {
          background: white;
          border-radius: 12px;
          max-width: 90vw;
          width: 400px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .help-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 1.5rem 0 1.5rem;
          border-bottom: 1px solid #eee;
        }

        .help-modal-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .help-modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #666;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .help-modal-close:hover {
          background: #f0f0f0;
        }

        .help-modal-content {
          padding: 1.5rem;
        }

        .help-step {
          margin: 0.75rem 0;
          color: #555;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .help-modal-footer {
          padding: 0 1.5rem 1.5rem 1.5rem;
          text-align: center;
        }

        .help-modal-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .help-modal-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .help-modal-link {
          display: block;
          margin-top: 1rem;
          color: #667eea;
          text-decoration: none;
          font-size: 0.9rem;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
          border: 1px solid #e9ecef;
        }

        .help-modal-link:hover {
          background: #f8f9fa;
          color: #764ba2;
          border-color: #667eea;
        }

        /* Seção visual */
        .help-visual-section {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #eee;
        }

        .help-visual-section h4 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1rem;
          font-weight: 600;
        }

        .browser-mockup {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #e9ecef;
        }

        .browser-address-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          border-radius: 6px;
          padding: 0.75rem 1rem;
          border: 1px solid #dee2e6;
          margin-bottom: 0.75rem;
        }

        .address-text {
          font-size: 0.9rem;
          color: #495057;
          font-family: monospace;
        }

        .address-icons {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .icon-location,
        .icon-lock,
        .icon-info,
        .icon-menu {
          font-size: 1.2rem;
          padding: 0.25rem;
          border-radius: 4px;
          background: #e9ecef;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .icon-location:hover,
        .icon-lock:hover,
        .icon-info:hover,
        .icon-menu:hover {
          background: #dee2e6;
        }

        .visual-note {
          margin: 0;
          font-size: 0.85rem;
          color: #6c757d;
          text-align: center;
          font-style: italic;
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

          .help-modal {
            width: 95vw;
            margin: 1rem;
          }

          .help-modal-header,
          .help-modal-content,
          .help-modal-footer {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .permission-alert-content {
            flex-direction: column;
            text-align: center;
            gap: 0.75rem;
          }

          .permission-alert-text p {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </>
  );
};

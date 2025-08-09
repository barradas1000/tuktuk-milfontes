import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGeolocation,
  GeolocationPosition as CustomGeolocationPosition,
  PermissionStatus,
} from "../hooks/useGeolocation";

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
  const { t } = useTranslation();
  const {
    position,
    error,
    permission,
    isLoading,
    isSupported,
    getLocation,
    clearPosition,
    checkPermission,
  } = useGeolocation();

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);

  useEffect(() => {
    if (position && onLocationGranted) onLocationGranted(position);
  }, [position, onLocationGranted]);

  useEffect(() => {
    if (error && onLocationDenied) onLocationDenied();
  }, [error, onLocationDenied]);

  const getButtonText = () => {
    if (!isSupported)
      return t(
        "locationPermission.button.unsupported",
        "Navegador sem suporte"
      );
    if (isLoading)
      return t("locationPermission.button.loading", "A obter localização...");
    if (permission === "denied")
      return t("locationPermission.button.enable", "Permitir localização");
    if (position)
      return t("locationPermission.button.active", "Localização ativa");
    return t("locationPermission.button.use", "Usar minha localização");
  };

  const getStatusText = () => {
    if (!isSupported)
      return (
        "❌ " +
        t(
          "locationPermission.statusMessages.unsupported",
          "Geolocalização não suportada"
        )
      );
    if (isLoading)
      return (
        "🔄 " +
        t(
          "locationPermission.statusMessages.obtaining",
          "A obter localização..."
        )
      );
    if (error)
      return `❌ ${t(
        "locationPermission.statusMessages.error",
        "Erro:"
      )} ${error}`;
    if (permission === "denied")
      return (
        "🔒 " +
        t("locationPermission.statusMessages.denied", "Permissão negada")
      );
    if (position)
      return (
        "✅ " +
        t("locationPermission.statusMessages.success", "Localização obtida")
      );
    return (
      "👆 " +
      t(
        "locationPermission.statusMessages.clickToDiscover",
        "Clique para permitir localização"
      )
    );
  };

  const getButtonClass = () => {
    let baseClass = "location-permission-button";
    if (isLoading) baseClass += " loading";
    if (permission === "denied") baseClass += " denied";
    if (position) baseClass += " active";
    if (!isSupported) baseClass += " disabled";
    return `${baseClass} ${className}`.trim();
  };

  const detectMobileOS = (): "android" | "ios" | "desktop" => {
    const vendor = (navigator as Navigator & { vendor?: string }).vendor || "";
    const opera = (window as unknown as { opera?: string }).opera || "";
    const ua = `${navigator.userAgent} ${vendor} ${opera}`;
    if (/android/i.test(ua)) return "android";
    if (
      /iPad|iPhone|iPod/.test(ua) &&
      !(window as unknown as { MSStream?: unknown }).MSStream
    )
      return "ios";
    return "desktop";
  };

  const instructions = useMemo(() => {
    const safeList = (key: string): string[] => {
      const value = t(key, { returnObjects: true }) as unknown;
      return Array.isArray(value) ? (value as string[]) : [];
    };
    const os = detectMobileOS();
    if (os === "android") {
      return {
        title: t(
          "locationPermission.helpInstructions.android.title",
          "Como ativar localização no Chrome"
        ),
        steps: [
          `**🔧 ${t(
            "locationPermission.helpInstructions.android.method1",
            "Pelo menu do Chrome"
          )}**`,
          ...safeList(
            "locationPermission.helpInstructions.android.steps.complete"
          ),
          "",
          `**⚡ ${t(
            "locationPermission.helpInstructions.android.method2",
            "Pelo atalho na barra de endereço"
          )}**`,
          ...safeList(
            "locationPermission.helpInstructions.android.steps.quick"
          ),
          "",
          `**🔍 ${t(
            "locationPermission.helpInstructions.android.method3",
            "Alternativa"
          )}**`,
          ...safeList(
            "locationPermission.helpInstructions.android.steps.alternative"
          ),
        ],
      };
    }
    if (os === "ios") {
      return {
        title: t(
          "locationPermission.helpInstructions.ios.title",
          "Como ativar localização no Safari"
        ),
        steps: [
          "**📱 Passos no Safari:**",
          ...safeList("locationPermission.helpInstructions.ios.steps"),
          "",
          "**⚡ Método alternativo:**",
          ...safeList("locationPermission.helpInstructions.ios.quick"),
        ],
      };
    }
    return {
      title: t(
        "locationPermission.helpInstructions.desktop.title",
        "Como permitir localização no navegador"
      ),
      steps: [
        "**🖱️ Passos simples:**",
        ...safeList("locationPermission.helpInstructions.desktop.steps"),
      ],
    };
  }, [t]);

  const handleClick = () => {
    if (!isSupported) {
      setShowHelpModal(true);
      return;
    }

    if (permission === "denied") {
      setShowPermissionAlert(true);
      setShowHelpModal(true);
      return;
    }

    getLocation();
  };

  return (
    <>
      <div className="location-permission-container">
        <button
          onClick={handleClick}
          className={getButtonClass()}
          disabled={!isSupported || isLoading}
          title={getStatusText()}
        >
          {children ?? getButtonText()}
        </button>

        {showStatus && (
          <div className="location-status">
            <small className={`status-text ${permission}`}>
              {getStatusText()}
            </small>
          </div>
        )}
      </div>

      {showPermissionAlert && (
        <div className="permission-alert-banner">
          <div className="permission-alert-content">
            <div className="permission-alert-icon">🔐</div>
            <div className="permission-alert-text">
              <strong>
                📍{" "}
                {t(
                  "locationPermission.permissionNeeded",
                  "Permissão de localização necessária"
                )}
              </strong>
              <p>
                {t(
                  "locationPermission.permissionDescription",
                  "Ative a localização para encontrar o tuk-tuk mais próximo."
                )}
              </p>
            </div>
            <button
              className="permission-alert-close"
              onClick={() => setShowPermissionAlert(false)}
              title={t("common.close", "Fechar")}
            >
              ✕
            </button>
          </div>
        </div>
      )}

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

              {detectMobileOS() === "android" && (
                <div className="help-visual-section">
                  <h4>
                    {t(
                      "locationPermission.helpModal.lookForIcons",
                      "Procure por estes ícones"
                    )}
                  </h4>
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
                      {t(
                        "locationPermission.helpModal.visualNote",
                        "Toque no ícone para permitir a localização."
                      )}
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
                ✅ {t("locationPermission.helpModal.understood", "Entendi")}
              </button>
              <a
                href="/docs/PERMISSAO-LOCALIZACAO.md"
                target="_blank"
                rel="noopener noreferrer"
                className="help-modal-link"
              >
                📖{" "}
                {t(
                  "locationPermission.helpModal.completeGuide",
                  "Guia completo"
                )}
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .location-permission-container { display: flex; flex-direction: column; align-items: center; gap: .5rem; }
        .location-permission-button { display:flex; align-items:center; gap:.5rem; padding:.75rem 1.5rem; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:white; border:none; border-radius:25px; font-size:.9rem; font-weight:600; cursor:pointer; transition:all .3s ease; box-shadow:0 4px 15px rgba(102,126,234,.3); min-width:140px; justify-content:center; }
        .location-permission-button:hover:not(:disabled){ transform: translateY(-2px); box-shadow:0 6px 20px rgba(102,126,234,.4); }
        .location-permission-button:active:not(:disabled){ transform: translateY(0); }
        .location-permission-button.loading{ background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%); animation: pulse 1.5s infinite; }
        .location-permission-button.denied{ background:linear-gradient(135deg,#ff6b6b 0%,#ee5a24 100%); cursor:not-allowed; }
        .location-permission-button.active{ background:linear-gradient(135deg,#4facfe 0%,#00f2fe 100%); }
        .location-permission-button.disabled{ background:#ccc; cursor:not-allowed; box-shadow:none; }
        .location-permission-button:disabled{ opacity:.7; cursor:not-allowed; }
        .location-status{text-align:center}
        .status-text{ font-size:.75rem; color:#666; transition: color .3s ease; }
        .status-text.granted{ color:#28a745; } .status-text.denied{ color:#dc3545; } .status-text.prompt{ color:#ffc107; }
        .permission-alert-banner{ position:fixed; top:0; left:0; right:0; background:linear-gradient(135deg,#ff6b6b 0%,#ee5a24 100%); color:white; z-index:9999; padding:1rem; box-shadow:0 4px 15px rgba(255,107,107,.3); animation: slideDown .3s ease-out; }
        .permission-alert-content{ display:flex; align-items:center; gap:1rem; max-width:600px; margin:0 auto; }
        .permission-alert-icon{ font-size:1.5rem; flex-shrink:0; }
        .permission-alert-text{ flex:1; }
        .permission-alert-text strong{ display:block; font-size:1rem; margin-bottom:.25rem; }
        .permission-alert-text p{ margin:0; font-size:.9rem; opacity:.9; }
        .permission-alert-close{ background:transparent; border:0; color:white; font-size:1.25rem; cursor:pointer; }
        .help-modal-overlay{ position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:10000; padding:1rem; }
        .help-modal{ background:white; border-radius:12px; width:min(720px,100%); max-height:80vh; overflow:auto; box-shadow:0 10px 30px rgba(0,0,0,.2); }
        .help-modal-header{ display:flex; justify-content:space-between; align-items:center; padding:1rem 1.25rem; border-bottom:1px solid #eee; }
        .help-modal-close{ background:transparent; border:0; font-size:1.25rem; cursor:pointer; }
        .help-modal-content{ padding:1rem 1.25rem; }
        .help-step{ margin:.25rem 0; font-size:.95rem; color:#333; }
        .help-visual-section{ margin-top:1rem; }
        .browser-mockup{ background:#f7f7f7; border:1px solid #e5e5e5; border-radius:8px; padding:.75rem; }
        .browser-address-bar{ display:flex; align-items:center; justify-content:space-between; background:white; border:1px solid #e5e5e5; border-radius:6px; padding:.5rem .75rem; }
        .address-text{ font-family:monospace; color:#555; }
        .address-icons{ display:flex; align-items:center; gap:.5rem; }
        .help-modal-footer{ display:flex; align-items:center; justify-content:space-between; gap:.5rem; padding:1rem 1.25rem; border-top:1px solid #eee; }
        .help-modal-button{ background:#4facfe; color:white; border:0; border-radius:8px; padding:.5rem .75rem; cursor:pointer; }
        .help-modal-link{ text-decoration:none; color:#764ba2; }
        @keyframes slideDown{ from{ transform: translateY(-10px); opacity:0 } to{ transform: translateY(0); opacity:1 } }
        @keyframes pulse{ 0%{ filter:brightness(1) } 50%{ filter:brightness(1.1) } 100%{ filter:brightness(1) } }
      `}</style>
    </>
  );
};

export default LocationPermissionButton;

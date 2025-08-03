import React from "react";

interface WhatsappMessageModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  onSend: () => void;
}

const WhatsappMessageModal: React.FC<WhatsappMessageModalProps> = ({
  isOpen,
  message,
  onClose,
  onSend,
}) => {
  if (!isOpen) return null;
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Enviar mensagem pelo WhatsApp</h3>
        <textarea value={message} readOnly />
        <button onClick={onSend}>Enviar</button>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

export default WhatsappMessageModal;

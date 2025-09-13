import { useState } from "react";
import { toast } from "sonner";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  action?: React.ReactNode;
}

let toastId = 0;

const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = ({ title, description, variant = "default", ...props }: Omit<Toast, 'id'>) => {
    const id = (++toastId).toString();

    const newToast = {
      id,
      title,
      description,
      variant,
      ...props,
    };

    setToasts((prev) => [...prev, newToast]);

    // Also show via sonner for immediate feedback
    if (variant === "destructive") {
      toast.error(title || "Erro", { description });
    } else if (variant === "success") {
      toast.success(title || "Sucesso", { description });
    } else {
      toast(title || "Notificação", { description });
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    toasts,
    toast: showToast,
    dismiss: dismissToast,
  };
};

export { useToast, toast };

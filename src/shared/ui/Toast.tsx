import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onClose: () => void;
}

export const Toast = ({ message, type = 'success', visible, onClose }: ToastProps) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  const icons = {
    success: <CheckCircle2 className="text-success" size={20} />,
    error: <XCircle className="text-danger" size={20} />,
    info: <Info className="text-info" size={20} />,
    warning: <AlertTriangle className="text-warning" size={20} />
  };

  return createPortal(
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{icons[type]}</div>
      <div className="toast-message">{message}</div>
    </div>,
    document.body
  );
};

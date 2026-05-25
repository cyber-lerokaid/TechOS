import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Loader2 } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';
import { useAuth } from '@/app/providers/AuthContext';
import { notifyStatusUpdate } from '@/lib/services/whatsappService';
import type { ServiceOrder } from '@/data/mock-data';
import { Button } from '@/components/ui/Button';

interface NotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: () => void;
  customerName: string;
  device: string;
  newStatus: string;
  osId: string;
  os: ServiceOrder;
}

export const NotifyModal = ({ isOpen, onClose, onNotify, customerName, device, newStatus, osId, os }: NotifyModalProps) => {
  const { tenant, isDemoMode } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const handleNotify = async () => {
    if (isDemoMode || !tenant?.whatsapp_enabled) {
      // Em modo demo ou sem config: simula envio e abre wa.me
      const message = encodeURIComponent(
        `Olá, ${customerName}! Seu ${device} está agora com status: ${newStatus}. Acompanhe: ${window.location.origin}/os/${os.numeroOs}`
      );
      const phone = os.customerTelefone.replace(/\D/g, '');
      window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
      setToastMessage('Mensagem aberta no WhatsApp (modo manual)');
      setToastType('success');
      setToastVisible(true);
      setTimeout(onClose, 1500);
      onNotify();
      return;
    }

    setIsSending(true);
    const result = await notifyStatusUpdate(
      tenant.id,
      os,
      newStatus,
      window.location.origin
    );
    setIsSending(false);

    if (result.success) {
      setToastMessage(`Mensagem enviada para ${customerName} ✓`);
      setToastType('success');
      onNotify();
    } else {
      setToastMessage(`Falha no envio: ${result.error}`);
      setToastType('error');
    }
    setToastVisible(true);
    setTimeout(onClose, 2000);
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="Notificar Cliente?">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p>Notificar <strong>{customerName}</strong> sobre a atualização?</p>
        
        <div style={{ padding: '16px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontSize: '14px', border: '1px dashed var(--border-strong)' }}>
          "Olá {customerName}! Seu {device} está agora <strong>{newStatus}</strong>. Acompanhe pelo link: https://techos.app/os/{osId}"
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button variant="outline" onClick={() => { onNotify(); onClose(); }}>
            Não, só atualizar
          </Button>
          <Button variant="default" onClick={handleNotify} disabled={isSending}>
            {isSending ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            {isSending ? 'Enviando...' : 'Sim, notificar pelo WhatsApp'}
          </Button>
        </div>
      </div>
    </Modal>
    <Toast 
      visible={toastVisible} 
      message={toastMessage} 
      type={toastType} 
      onClose={() => setToastVisible(false)} 
    />
    </>
  );
};

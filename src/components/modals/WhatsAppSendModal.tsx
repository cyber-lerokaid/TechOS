import { useState, useEffect } from 'react';
import { X, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { STATUS_CONFIG, type ServiceOrder } from '@/data/mock-data';

interface WhatsAppSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  os: ServiceOrder | null;
}

export const WhatsAppSendModal = ({ isOpen, onClose, os }: WhatsAppSendModalProps) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (os) {
      const statusLabel = STATUS_CONFIG[os.status]?.label || os.status;
      const nomeCurto = os.customer_nome.split(' ')[0];
      const defaultMessage = `Olá ${nomeCurto}! 🛠️\n\nA sua Ordem de Serviço *#${os.numero_os}* foi atualizada no nosso sistema.\n\nNovo status: *${statusLabel}*\n\nAgradecemos a preferência!`;
      setMessage(defaultMessage);
    }
  }, [os]);

  if (!isOpen || !os) return null;

  const handleSend = () => {
    if (!os.customer_telefone) {
      alert('Esta Ordem de Serviço não possui um telefone de cliente cadastrado.');
      return;
    }

    let phone = os.customer_telefone.replace(/\D/g, '');
    if (phone.length === 10 || phone.length === 11) {
      phone = `55${phone}`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
    
    // Abre em nova aba
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-[101] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
              <MessageCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Avisar Cliente</h2>
              <p className="text-xs text-zinc-400">Notificação via WhatsApp</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          <p className="text-sm text-zinc-300">
            O status da OS <strong>#{os.numero_os}</strong> mudou. Deseja enviar uma mensagem para <strong>{os.customer_nome}</strong>?
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Mensagem
            </label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-200 text-sm min-h-[120px] resize-y focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
              placeholder="Digite a mensagem..."
            />
          </div>

          {!os.customer_telefone && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
              Atenção: O cliente não possui telefone cadastrado!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-950 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white">
            Não Avisar
          </Button>
          <Button 
            onClick={handleSend}
            disabled={!os.customer_telefone || !message.trim()}
            className="bg-green-600 hover:bg-green-500 text-white gap-2 px-6 shadow-lg shadow-green-900/20"
          >
            Enviar <ExternalLink size={16} />
          </Button>
        </div>
      </div>
    </>
  );
};

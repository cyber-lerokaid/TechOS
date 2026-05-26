import { useState, useEffect } from 'react';
import { X, Sparkles, Send } from 'lucide-react';
import { formatBRL, type ServiceOrder } from '@/data/mock-data';
import { useAuth } from '@/app/providers/AuthContext';
import { notifyOrcamento } from '@/lib/services/whatsappService';
import { Loader2 } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';

interface QuoteModalProps {
  os: ServiceOrder;
  onClose: () => void;
  onSaveQuote: (maoDeObra: number, pecas: number) => void;
}

export const QuoteModal = ({ os, onClose, onSaveQuote }: QuoteModalProps) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [maoDeObra, setMaoDeObra] = useState<number>(0);
  const [pecas, setPecas] = useState<number>(0);
  const [reasons, setReasons] = useState<string[]>([]);
  const { tenant, isDemoMode } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    // Simula a IA gerando o orçamento baseado no problema
    const generateQuote = () => {
      setTimeout(() => {
        const text = os.problemaRelatado.toLowerCase();
        let mObra = 80;
        let cPecas = 0;
        let tempReasons: string[] = [];

        if (text.includes('tela') || text.includes('display')) {
          mObra = 120;
          cPecas = os.deviceTipo === 'notebook' ? 450 : 250;
          tempReasons.push('Substituição de display completo (Risco Alto)');
        }
        if (text.includes('bateria') || text.includes('carrega')) {
          mObra = 60;
          cPecas = 120;
          tempReasons.push('Bateria nova padrão OEM');
        }
        if (text.includes('água') || text.includes('molhou') || text.includes('derramar')) {
          mObra = 150;
          cPecas = 200;
          tempReasons.push('Desoxidação de placa e limpeza química');
        }
        if (text.includes('teclado')) {
          mObra = 100;
          cPecas = 160;
          tempReasons.push('Substituição de painel de teclado');
        }
        if (text.includes('lento') || text.includes('hd') || text.includes('formata')) {
          mObra = 90;
          cPecas = text.includes('hd') || text.includes('ssd') ? 180 : 0;
          tempReasons.push('Backup, formatação e instalação de SO');
          if (cPecas > 0) tempReasons.push('Substituição por SSD NVMe/SATA');
        }
        if (tempReasons.length === 0) {
          mObra = 100;
          cPecas = 50;
          tempReasons.push('Análise eletrônica geral e pequenos componentes');
        }

        setMaoDeObra(mObra);
        setPecas(cPecas);
        setReasons(tempReasons);
        setIsGenerating(false);
      }, 1500);
    };

    generateQuote();
  }, [os.problemaRelatado, os.deviceTipo]);

  const total = maoDeObra + pecas;

  const handleSendWhatsApp = async () => {
    setIsSending(true);

    if (!isDemoMode && tenant?.whatsapp_enabled) {
      const result = await notifyOrcamento(
        tenant.id,
        os,
        maoDeObra,
        pecas,
        reasons.join(', '),
        window.location.origin
      );
      
      setIsSending(false);
      if (result.success) {
        setToastMessage('Orçamento enviado com sucesso via WhatsApp!');
        setToastType('success');
        setToastVisible(true);
        setTimeout(() => {
          onSaveQuote(maoDeObra, pecas);
          onClose();
        }, 1500);
      } else {
        setToastMessage(`Erro: ${result.error}`);
        setToastType('error');
        setToastVisible(true);
      }
    } else {
      // Fallback wa.me para demo ou sem integração configurada
      const msg = encodeURIComponent(
        `Olá ${os.customerNome}! Orçamento OS #${os.numeroOs}:\n` +
        `Mão de obra: R$ ${maoDeObra}\nPeças: R$ ${pecas}\nTotal: R$ ${total}\n` +
        `Aprovar/recusar: ${window.location.origin}/os/${os.numeroOs}`
      );
      const phone = os.customerTelefone.replace(/\D/g, '');
      window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
      setIsSending(false);
      onSaveQuote(maoDeObra, pecas);
      onClose();
    }
  };

  return (
    <>
    <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full shadow-2xl flex flex-col max-h-[90vh]" style={{ maxWidth: '500px' }}>
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white m-0">Gerar Orçamento Inteligente</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"><X size={20} /></button>
        </div>

        {isGenerating ? (
          <div className="p-10 text-center flex flex-col items-center">
            <Sparkles size={32} className="text-blue-500 spin-animation mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Analisando o problema relatado...</h3>
            <p className="text-zinc-400 text-sm">A IA está buscando peças e calculando mão de obra ideal.</p>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-5 overflow-y-auto">
            
            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-2 mb-3 text-blue-400 font-semibold text-sm">
                <Sparkles size={18} /> Orçamento Sugerido
              </div>
              <ul className="list-disc pl-5 text-zinc-300 text-sm mb-5 space-y-1">
                {reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Mão de Obra</label>
                  <input type="number" value={maoDeObra} onChange={e => setMaoDeObra(Number(e.target.value))} className="w-full p-2.5 bg-black/40 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Peças</label>
                  <input type="number" value={pecas} onChange={e => setPecas(Number(e.target.value))} className="w-full p-2.5 bg-black/40 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>

              <div className="mt-5 flex justify-between items-center p-4 bg-black/40 rounded-lg border border-zinc-800">
                <span className="font-semibold text-zinc-300">Valor Total</span>
                <span className="text-xl font-bold text-blue-400">{formatBRL(total)}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => onSaveQuote(maoDeObra, pecas)} 
                className="flex-1 py-3 px-4 rounded-lg border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800 transition-colors" 
              >
                Só Salvar Orçamento
              </button>
              <button 
                onClick={handleSendWhatsApp} 
                className="flex-1 py-3 px-4 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSending}
              >
                {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
                {isSending ? 'Enviando...' : 'Salvar e Enviar'}
              </button>
            </div>

          </div>
        )}
      </div>
      <style>{`
        .spin-animation { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
    <Toast 
      visible={toastVisible} 
      message={toastMessage} 
      type={toastType} 
      onClose={() => setToastVisible(false)} 
    />
    </>
  );
};

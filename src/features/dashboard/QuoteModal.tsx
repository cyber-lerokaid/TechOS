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
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>Gerar Orçamento Inteligente</h2>
          <button onClick={onClose} className="btn-close"><X size={20} /></button>
        </div>

        {isGenerating ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Sparkles size={32} color="var(--color-primary)" className="spin-animation" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ margin: '0 0 8px' }}>Analisando o problema relatado...</h3>
            <p style={{ color: 'var(--text-muted)' }}>A IA está buscando peças e calculando mão de obra ideal.</p>
          </div>
        ) : (
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ backgroundColor: 'var(--bg-elevated)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>
                <Sparkles size={18} /> Orçamento Sugerido
              </div>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
                {reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Mão de Obra</label>
                  <input type="number" value={maoDeObra} onChange={e => setMaoDeObra(Number(e.target.value))} style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Peças</label>
                  <input type="number" value={pecas} onChange={e => setPecas(Number(e.target.value))} style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600 }}>Valor Total</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)' }}>{formatBRL(total)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => onSaveQuote(maoDeObra, pecas)} 
                className="btn btn-outline" 
                style={{ flex: 1 }}
              >
                Só Salvar Orçamento
              </button>
              <button 
                onClick={handleSendWhatsApp} 
                className="btn btn-primary"
                style={{ flex: 1, backgroundColor: '#25D366', borderColor: '#25D366' }}
                disabled={isSending}
              >
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={18} />} 
                {isSending ? 'Enviando...' : 'Salvar e Enviar WhatsApp'}
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

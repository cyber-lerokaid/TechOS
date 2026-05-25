import { useState } from 'react';
import { type ServiceOrder, formatBRL } from '@/data/mock-data';
import { Check, X, Loader2 } from 'lucide-react';
import './QuoteApproval.css';

interface Props {
  os: ServiceOrder;
  onApprove: (approved: boolean) => void;
}

const QuoteApproval = ({ os, onApprove }: Props) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<'approved' | 'rejected' | null>(null);

  const handleAction = (approved: boolean) => {
    setIsProcessing(true);
    // Simula 1.5s de processamento conforme regra "Ao aprovar orçamento..."
    setTimeout(() => {
      setIsProcessing(false);
      setResult(approved ? 'approved' : 'rejected');
      
      // Delay extra para usuário ver a mensagem de sucesso antes de fechar/atualizar
      setTimeout(() => {
        onApprove(approved);
      }, 1500);
    }, 1500);
  };

  const maoDeObra = os.valorMaoObra || 0;
  const pecas = os.valorPecas || 0;
  const total = maoDeObra + pecas;

  if (result) {
    return (
      <div className={`quote-result ${result === 'approved' ? 'success' : 'danger'}`}>
        {result === 'approved' ? (
          <>
            <div className="icon-circle success"><Check size={24} /></div>
            <h3>Orçamento Aprovado!</h3>
            <p>Obrigado. Vamos iniciar o reparo imediatamente.</p>
          </>
        ) : (
          <>
            <div className="icon-circle danger"><X size={24} /></div>
            <h3>Orçamento Recusado</h3>
            <p>Seu aparelho estará disponível para retirada em breve.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="quote-approval-card">
      <h3>Resumo do Orçamento</h3>
      
      <div className="quote-table">
        <div className="quote-row">
          <span>Mão de obra</span>
          <span>{formatBRL(maoDeObra)}</span>
        </div>
        <div className="quote-row">
          <span>Peças (Tela Display Original)</span>
          <span>{formatBRL(pecas)}</span>
        </div>
        <div className="quote-row total">
          <span>Total a pagar</span>
          <span>{formatBRL(total)}</span>
        </div>
      </div>

      <div className="quote-actions">
        <button 
          className="btn btn-outline btn-reject" 
          disabled={isProcessing}
          onClick={() => handleAction(false)}
        >
          <X size={18} />
          Recusar
        </button>
        <button 
          className="btn btn-primary btn-approve" 
          disabled={isProcessing}
          onClick={() => handleAction(true)}
        >
          {isProcessing ? <Loader2 className="spinner" size={18} /> : <Check size={18} />}
          Aprovar Orçamento
        </button>
      </div>
    </div>
  );
};

export default QuoteApproval;

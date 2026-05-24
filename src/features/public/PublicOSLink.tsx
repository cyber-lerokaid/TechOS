import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_SERVICE_ORDERS, MOCK_TENANT, type ServiceOrder } from '@/data/mock-data';
import ProgressBar from '@/features/public/ProgressBar';
import QuoteApproval from '@/features/public/QuoteApproval';
import StatusHistoryTimeline from '@/features/public/StatusHistoryTimeline';
import ReactiveShowcase from '@/features/public/ReactiveShowcase';
import { Phone, AlertCircle } from 'lucide-react';
import './PublicOSLink.css';

const PublicOSLink = () => {
  const { osNumber } = useParams<{ osNumber: string }>();
  const [os, setOs] = useState<ServiceOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Inject tenant primary color as requested
    document.documentElement.style.setProperty('--color-primary', MOCK_TENANT.cor_primaria);

    // Simulate fetch
    const fetchOS = () => {
      setIsLoading(true);
      setError(null);
      setTimeout(() => {
        const found = MOCK_SERVICE_ORDERS.find(o => o.numero_os === osNumber);
        if (found) {
          setOs(found);
        } else {
          setError('Ordem de serviço não encontrada. Verifique o link e tente novamente.');
        }
        setIsLoading(false);
      }, 600); // Perceived performance timing
    };

    fetchOS();
  }, [osNumber]);

  if (isLoading) {
    return (
      <div className="public-layout">
        <div className="skeleton-header skeleton"></div>
        <div className="public-container">
          <div className="skeleton-card skeleton" style={{ height: '200px' }}></div>
          <div className="skeleton-card skeleton" style={{ height: '300px' }}></div>
        </div>
      </div>
    );
  }

  if (error || !os) {
    return (
      <div className="public-layout error-state">
        <AlertCircle size={48} className="text-warning" />
        <h2>Ops! Algo deu errado.</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="public-layout" style={{ fontFamily: 'var(--font-public)' }}>
      <header className="public-header">
        <div className="public-header-content">
          <div className="tenant-brand">
            {MOCK_TENANT.logo_url ? (
              <img src={MOCK_TENANT.logo_url} alt="Logo" className="tenant-logo" />
            ) : (
              <div className="tenant-logo-placeholder">T</div>
            )}
            <div className="tenant-info">
              <h1>{MOCK_TENANT.nome_loja}</h1>
              <span className="tenant-phone">
                <Phone size={12} /> {MOCK_TENANT.telefone}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="public-container">
        <section className="os-status-card">
          <div className="os-header-info">
            <div>
              <h2 className="customer-greeting">Olá, {os.customer_nome.split(' ')[0]}!</h2>
              <p className="device-desc">{os.device_label}</p>
            </div>
            <div className="os-badge">OS #{os.numero_os}</div>
          </div>

          <ProgressBar status={os.status} />
          
          <div className="contextual-message">
            {getContextualMessage(os.status)}
          </div>
        </section>

        {os.status === 'orcamento_enviado' && (
          <QuoteApproval os={os} onApprove={(approved) => {
            // Optimistic update
            setOs(prev => prev ? { ...prev, status: approved ? 'orcamento_aprovado' : 'orcamento_recusado' } : null);
          }} />
        )}

        <StatusHistoryTimeline osId={os.id} currentStatus={os.status} />

        <ReactiveShowcase deviceType={os.device_tipo} />

      </main>

      <footer className="public-footer">
        <p>Precisa falar conosco?</p>
        <a href={`https://wa.me/55${MOCK_TENANT.telefone.replace(/\D/g, '')}`} className="btn-whatsapp">
          Toque aqui e chame no WhatsApp
        </a>
      </footer>
    </div>
  );
};

// Helper for contextual message
function getContextualMessage(status: string) {
  const messages: Record<string, string> = {
    checkin: "Seu aparelho deu entrada e em breve será analisado.",
    em_analise: "Nosso técnico está investigando o problema. Você receberá o diagnóstico em breve.",
    orcamento_enviado: "Temos um diagnóstico! Revise e aprove o orçamento abaixo para iniciarmos o conserto.",
    orcamento_aprovado: "Orçamento aprovado. Já estamos trabalhando no seu aparelho.",
    orcamento_recusado: "Entendido. Seu aparelho estará disponível para retirada em breve.",
    aguardando_peca: "Encomendamos a peça necessária e estamos aguardando a entrega para concluir o serviço.",
    em_bancada: "O conserto está em andamento na nossa bancada técnica.",
    pronto: "Ótimas notícias! O conserto foi concluído e seu aparelho está pronto para retirada.",
    entregue: "Aparelho entregue. Obrigado pela confiança!"
  };
  return messages[status] || "";
}

export default PublicOSLink;

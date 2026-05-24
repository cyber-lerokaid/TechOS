import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { Camera, MessageCircle, Kanban, TrendingUp, ShoppingBag, Shield } from 'lucide-react';
import './LandingPage.css';

const features = [
  {
    icon: Camera,
    color: '#0EA5E9',
    colorMuted: 'rgba(14,165,233,0.10)',
    title: 'Check-in Fotográfico',
    desc: 'Registre fotos, checklist e assinatura digital do cliente em menos de 2 minutos. Proteção legal total contra reclamações.',
  },
  {
    icon: MessageCircle,
    color: '#22C55E',
    colorMuted: 'rgba(34,197,94,0.10)',
    title: 'WhatsApp Automático',
    desc: 'O cliente recebe o link da OS, acompanha o status em tempo real e aprova orçamentos sem precisar ligar uma única vez.',
  },
  {
    icon: Kanban,
    color: '#8B5CF6',
    colorMuted: 'rgba(139,92,246,0.10)',
    title: 'Kanban de Bancada',
    desc: 'Arraste as OS entre status e o sistema notifica o cliente automaticamente. Visualize toda a fila de trabalho num relance.',
  },
  {
    icon: TrendingUp,
    color: '#F59E0B',
    colorMuted: 'rgba(245,158,11,0.10)',
    title: 'Financeiro Real',
    desc: 'Dashboard financeiro calculado automaticamente pelas OS fechadas. Saiba seu lucro real sem preencher nenhum relatório.',
  },
  {
    icon: ShoppingBag,
    color: '#EC4899',
    colorMuted: 'rgba(236,72,153,0.10)',
    title: 'Vitrine Reativa',
    desc: 'Exiba produtos no link da OS do cliente. Se o aparelho é um notebook, mostra mouses e carregadores. Venda enquanto conserta.',
  },
  {
    icon: Shield,
    color: '#06B6D4',
    colorMuted: 'rgba(6,182,212,0.10)',
    title: 'Controle de Garantia',
    desc: 'Cada serviço gera 90 dias de garantia automática. O sistema alerta quando um cliente retorna dentro do prazo.',
  },
];

const faqs = [
  {
    q: 'Preciso de cartão de crédito para testar?',
    a: 'Não. Você pode criar sua conta gratuita e testar todas as funcionalidades do TechOS por 14 dias sem precisar cadastrar nenhum meio de pagamento.'
  },
  {
    q: 'Como funciona o envio automático de WhatsApp?',
    a: 'O TechOS se conecta diretamente ao WhatsApp Web do seu número comercial (via QR Code). Assim que uma OS muda de status no Kanban, a mensagem é enviada automaticamente para o cliente sem você apertar nenhum botão.'
  },
  {
    q: 'O sistema funciona offline?',
    a: 'Sim. A arquitetura moderna do TechOS permite que você continue trabalhando mesmo se a internet cair. Assim que a conexão voltar, todos os dados são sincronizados automaticamente com a nuvem.'
  },
  {
    q: 'Posso migrar meus dados de outro sistema?',
    a: 'Com certeza. Oferecemos importação facilitada de clientes e estoque via planilhas Excel/CSV diretamente no painel de configurações.'
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { enterDemoMode } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const nav = document.getElementById('lp-nav');
    const handleScroll = () => {
      if (window.scrollY > 80) nav?.classList.add('scrolled');
      else nav?.classList.remove('scrolled');
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDemo = async () => {
    await enterDemoMode();
    navigate('/dashboard');
  };

  return (
    <div className="landing-page">
      {/* ── SEÇÃO 1: Navbar ── */}
      <nav className="lp-nav" id="lp-nav">
        <div className="lp-nav-inner">
          <Link to="/" className="lp-nav-logo">
            <img src="/images/logo-techos.png" alt="TechOS" className="lp-nav-logo-img" />
            <span className="lp-nav-logo-text">TechOS</span>
          </Link>
          <div className="lp-nav-links">
            <a href="#features">Recursos</a>
            <a href="#pricing">Planos</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="lp-nav-actions">
            <Link to="/login" className="lp-btn-ghost">Entrar</Link>
            <Link to="/register" className="lp-btn-primary-sm">Criar conta grátis</Link>
          </div>
        </div>
      </nav>

      {/* ── SEÇÃO 2: Hero Imersivo ── */}
      <section className="lp-hero">
        <div className="lp-hero-atmosphere">
          <div className="lp-hero-glow lp-glow-center" />
          <div className="lp-hero-glow lp-glow-left" />
          <div className="lp-hero-grid" />
        </div>

        <div className="lp-hero-inner">
          <div className="lp-hero-content">
            <div className="lp-hero-badge">
              <span className="lp-badge-dot" />
              <span>Novo: Notificações automáticas por WhatsApp</span>
              <span className="lp-badge-arrow">→</span>
            </div>

            <h1 className="lp-hero-title">
              Sua assistência
              <br />
              <span className="lp-hero-title-accent">no próximo</span>
              <br />
              nível.
            </h1>

            <p className="lp-hero-subtitle">
              Do check-in fotográfico ao WhatsApp automático.
              Gerencie OS, estoque e financeiro em um único sistema
              feito para a bancada real.
            </p>

            <div className="lp-hero-ctas">
              <Link to="/register" className="lp-cta-primary">
                <span>Começar grátis</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <button className="lp-cta-demo" onClick={handleDemo}>
                <span className="lp-demo-play">▶</span>
                Ver demonstração
              </button>
            </div>

            <div className="lp-hero-trust">
              {['Multi-tenant isolado', 'WhatsApp automático', 'Offline-first'].map(t => (
                <div key={t} className="lp-trust-item">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="#22C55E" strokeWidth="1.2"/>
                    <path d="M4.5 7l1.8 1.8L9.5 5" stroke="#22C55E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lp-hero-mockup-wrapper">
            <div className="lp-mockup-glow" />
            <div className="lp-mockup-frame">
              <div className="lp-mockup-titlebar">
                <div className="lp-mockup-dots">
                  <span style={{background:'#FF5F57'}}/>
                  <span style={{background:'#FFBD2E'}}/>
                  <span style={{background:'#28C840'}}/>
                </div>
                <span className="lp-mockup-url">techos.app/dashboard</span>
              </div>

              <div className="lp-mockup-body">
                <div className="lp-mini-metrics">
                  {[
                    { label: 'OS Abertas', value: '7', trend: '+2' },
                    { label: 'Faturamento', value: 'R$ 1.247', trend: '+R$150' },
                    { label: 'Prontas', value: '2', alert: true },
                  ].map(m => (
                    <div key={m.label} className="lp-mini-metric">
                      <span className="lp-mini-label">{m.label}</span>
                      <span className="lp-mini-value">{m.value}</span>
                      <span className={`lp-mini-trend ${m.alert ? 'alert' : ''}`}>
                        {m.alert ? '⚠' : '↑'} {m.trend || ''}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="lp-mini-kanban">
                  {[
                    { col: 'Em Análise', color: '#0EA5E9', cards: [
                      { nome: 'Ana Clara', device: 'Samsung A54', os: '049' },
                      { nome: 'Bruno Silva', device: 'PC Gamer', os: '050' },
                    ]},
                    { col: 'Em Bancada', color: '#06B6D4', cards: [
                      { nome: 'Carla Souza', device: 'Dell Inspiron', os: '047' },
                    ]},
                    { col: 'Pronto ✓', color: '#22C55E', cards: [
                      { nome: 'Diego Lima', device: 'iPhone 14 Pro', os: '046' },
                    ]},
                  ].map(col => (
                    <div key={col.col} className="lp-mini-col">
                      <div className="lp-mini-col-header" style={{color: col.color}}>
                        {col.col}
                      </div>
                      {col.cards.map(card => (
                        <div key={card.os} className="lp-mini-card" style={{'--card-color': col.color} as React.CSSProperties}>
                          <span className="lp-mini-os">OS #{card.os}</span>
                          <span className="lp-mini-name">{card.nome}</span>
                          <span className="lp-mini-device">{card.device}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="lp-mockup-notification">
                  <div className="lp-notif-icon">💬</div>
                  <div className="lp-notif-content">
                    <span className="lp-notif-title">WhatsApp enviado</span>
                    <span className="lp-notif-body">OS #047 pronta — Fernanda Lima</span>
                  </div>
                  <span className="lp-notif-time">agora</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lp-scroll-indicator">
          <div className="lp-scroll-line" />
          <span>scroll</span>
        </div>
      </section>

      {/* ── SEÇÃO 3: Social Proof Bar ── */}
      <section className="lp-stats-bar">
        <div className="lp-stats-inner">
          {[
            { value: '2.400+', label: 'OS abertas por mês' },
            { value: '98%',    label: 'Taxa de satisfação' },
            { value: '3h',     label: 'Tempo médio economizado/dia' },
            { value: 'R$0',    label: 'Para começar' },
          ].map((stat, i) => (
            <div key={i} className="lp-stat-item">
              <span className="lp-stat-value">{stat.value}</span>
              <span className="lp-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SEÇÃO 4: Dores e Soluções ── */}
      <section className="lp-pain-section">
        <div className="lp-section-inner">
          <span className="lp-section-tag">Por que TechOS?</span>
          <h2 className="lp-section-title">O fim da desorganização na bancada.</h2>
          
          <div className="lp-pain-grid">
            <div className="lp-pain-card">
              <div className="lp-pain-before">
                <span className="lp-pain-label before">Antes do TechOS</span>
                <p className="lp-pain-text">Papéis sumindo, cliente ligando toda hora para saber se tá pronto, e você sem saber se teve lucro no fim do mês.</p>
              </div>
              <div className="lp-pain-after">
                <span className="lp-pain-label after">Com TechOS</span>
                <p className="lp-pain-text">Tudo digital. O cliente recebe atualizações via WhatsApp automático e o financeiro é calculado em tempo real.</p>
              </div>
            </div>
            
            <div className="lp-pain-card">
              <div className="lp-pain-before">
                <span className="lp-pain-label before">Antes do TechOS</span>
                <p className="lp-pain-text">Aparelhos arranhados gerando dor de cabeça e prejuízos com clientes de má fé alegando danos pré-existentes.</p>
              </div>
              <div className="lp-pain-after">
                <span className="lp-pain-label after">Com TechOS</span>
                <p className="lp-pain-text">Check-in blindado: fotos integradas, checklist de entrada e assinatura digital no momento em que o cliente entrega o aparelho.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 5: Features em Cards Grandes ── */}
      <section id="features" className="lp-features-section">
        <div className="lp-section-inner">
          <span className="lp-section-tag">Tudo incluso</span>
          <h2 className="lp-section-title">Não é apenas uma OS.<br/>É uma operação completa.</h2>
          
          <div className="lp-features-grid">
            {features.map((f, i) => (
              <div key={i} className="lp-feature-card" style={{'--feature-color': f.color, '--feature-color-muted': f.colorMuted} as React.CSSProperties}>
                <div className="lp-feature-icon">
                  <f.icon size={24} />
                </div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 6: Pricing ── */}
      <section id="pricing" className="lp-pricing-section">
        <div className="lp-section-inner">
          <span className="lp-section-tag">Planos</span>
          <h2 className="lp-section-title text-center" style={{ margin: '0 auto 60px' }}>Simples. Transparente.<br/>Feito para você crescer.</h2>
          
          <div className="lp-pricing-grid">
            {/* Plano Free */}
            <div className="lp-pricing-card">
              <div>
                <h3 className="lp-plan-name">Inicial</h3>
                <div className="lp-plan-price mt-2">
                  <span className="lp-price-currency">R$</span>
                  <span className="lp-price-value">0</span>
                  <span className="lp-price-period">/mês</span>
                </div>
              </div>
              <ul className="lp-plan-features">
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Até 50 OS por mês</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 1 Usuário (Técnico)</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Controle de Estoque Básico</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Relatórios Simples</li>
              </ul>
              <Link to="/register" className="lp-plan-cta outline">Começar Grátis</Link>
            </div>

            {/* Plano Pro */}
            <div className="lp-pricing-card popular">
              <span className="lp-popular-badge">Mais Popular</span>
              <div>
                <h3 className="lp-plan-name" style={{ color: 'var(--lp-primary)' }}>Pro</h3>
                <div className="lp-plan-price mt-2">
                  <span className="lp-price-currency">R$</span>
                  <span className="lp-price-value">79</span>
                  <span className="lp-price-period">/mês</span>
                </div>
              </div>
              <ul className="lp-plan-features">
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> OS Ilimitadas</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Usuários Ilimitados</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Notificações via WhatsApp</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Check-in com Fotos/Checklist</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Link de Vitrine Externa</li>
              </ul>
              <Link to="/register" className="lp-plan-cta primary">Assinar Pro</Link>
            </div>

            {/* Plano Enterprise */}
            <div className="lp-pricing-card">
              <div>
                <h3 className="lp-plan-name">Premium</h3>
                <div className="lp-plan-price mt-2">
                  <span className="lp-price-currency">R$</span>
                  <span className="lp-price-value">149</span>
                  <span className="lp-price-period">/mês</span>
                </div>
              </div>
              <ul className="lp-plan-features">
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Tudo do plano Pro</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Múltiplas Lojas/Filiais</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> API e Integrações</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Suporte Prioritário 24/7</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Treinamento Dedicado</li>
              </ul>
              <Link to="/register" className="lp-plan-cta outline">Falar com Consultor</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 7: Depoimentos ── */}
      <section className="lp-testimonials-section">
        <div className="lp-section-inner">
          <span className="lp-section-tag">Depoimentos</span>
          <h2 className="lp-section-title">O que dizem as assistências que já evoluíram.</h2>
          
          <div className="lp-testimonials-grid">
            {[
              { name: 'Ricardo Mendes', store: 'Mendes Celulares', text: 'Eu perdia 2h por dia só respondendo cliente no WhatsApp perguntando se o celular tava pronto. Agora o sistema avisa automático, e eu consigo focar na bancada. Mudou o jogo.', initial: 'R' },
              { name: 'Camila Santos', store: 'iFix Store', text: 'O check-in com fotos já me salvou duas vezes de clientes querendo garantia por arranhões que já estavam na tela. O visual do link do cliente passa muita credibilidade.', initial: 'C' },
              { name: 'João Ferreira', store: 'Tech Masters', text: 'Assinei pelo Kanban, mas o que me segurou foi a gestão financeira. Finalmente eu sei exatamente o ticket médio e se a assistência está dando lucro real no final do mês.', initial: 'J' },
            ].map((t, i) => (
              <div key={i} className="lp-testimonial-card">
                <div className="lp-testimonial-stars">★★★★★</div>
                <p className="lp-testimonial-text">{t.text}</p>
                <div className="lp-testimonial-author">
                  <div className="lp-testimonial-avatar" style={{ background: `hsl(${i * 60 + 200}, 70%, 40%)` }}>{t.initial}</div>
                  <div>
                    <div className="lp-testimonial-name">{t.name}</div>
                    <div className="lp-testimonial-store">{t.store}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 8: FAQ ── */}
      <section id="faq" className="lp-faq-section">
        <div className="lp-section-inner">
          <h2 className="lp-section-title text-center" style={{ margin: '0 auto' }}>Perguntas Frequentes</h2>
          
          <div className="lp-faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className="lp-faq-item">
                <button className="lp-faq-trigger" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className={`lp-faq-icon ${openFaq === i ? 'open' : ''}`}>+</span>
                </button>
                <div className={`lp-faq-answer ${openFaq === i ? 'open' : ''}`}>
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 9: CTA Final ── */}
      <section className="lp-cta-section">
        <div className="lp-cta-inner">
          <div className="lp-cta-glow" />
          <h2 className="lp-cta-title">
            Pronto para transformar<br />
            <span className="lp-hero-title-accent">sua assistência técnica?</span>
          </h2>
          <p className="lp-cta-subtitle">
            Comece grátis hoje. Sem cartão de crédito.
          </p>
          <div className="lp-cta-buttons">
            <Link to="/register" className="lp-cta-primary" style={{ display: 'inline-flex', padding: '16px 36px', fontSize: '18px' }}>
              Criar conta grátis <span style={{ marginLeft: '10px' }}>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 10: Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <Link to="/" className="lp-footer-brand">
            <img src="/images/logo-techos.png" alt="" width={20} /> TechOS
          </Link>
          <div className="lp-footer-copy">
            © {new Date().getFullYear()} TechOS. Todos os direitos reservados.
          </div>
          <div className="lp-footer-links">
            <a href="#">Termos de Uso</a>
            <a href="#">Privacidade</a>
            <a href="#">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

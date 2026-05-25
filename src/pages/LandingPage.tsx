import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { Camera, MessageCircle, Kanban, TrendingUp, ShoppingBag, Shield } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { EnvironmentLayer } from '@/components/environment/EnvironmentLayer';
import './LandingPage.css';

const surfaceBase = "relative rounded-2xl p-7 border border-white/[0.08] backdrop-blur-xl overflow-hidden transition-all duration-300";
const surfaceLevel1 = `${surfaceBase} bg-white/[0.02]`;
const surfaceLevel2 = `${surfaceBase} bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.4)]`;
const surfaceLevel3 = `${surfaceBase} bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_25px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.12]`;

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

const DataFlowLine = ({ triggerKey }: { triggerKey: number }) => {
  return (
    <AnimatePresence>
      <motion.div
        key={triggerKey}
        className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.9)] z-20"
        initial={{ x: '-100%', opacity: 1, scaleX: 0 }}
        animate={{ x: '100%', opacity: 0, scaleX: 1 }}
        transition={{ duration: 8, ease: "easeInOut" }}
      />
    </AnimatePresence>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { enterDemoMode, user, signOut, isDemoMode } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const isRealUser = user && !isDemoMode;

  // --- Sistema Vivo: Dados Dinâmicos ---
  const [metrics, setMetrics] = useState({ osAbertas: 7, faturamento: 1247 });
  const [flowTrigger, setFlowTrigger] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const triggerUpdate = () => {
      setMetrics(prev => ({
        osAbertas: Math.random() > 0.7 ? prev.osAbertas + 1 : prev.osAbertas,
        faturamento: prev.faturamento + Math.floor(Math.random() * 4)
      }));
      setFlowTrigger(prev => prev + 1);

      // Random delay between 6s and 10s
      const nextDelay = 6000 + Math.random() * 4000;
      timeout = setTimeout(triggerUpdate, nextDelay);
    };
    timeout = setTimeout(triggerUpdate, 2500);
    return () => clearTimeout(timeout);
  }, []);

  // --- Navegação Header Scroll ---
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

  // --- Interaction Tracking ---
  const isClient = typeof window !== 'undefined';
  const mouseX = useMotionValue(isClient ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(isClient ? window.innerHeight / 2 : 0);

  // Clamped rotation for subtle 3D effect
  const rotateXRaw = useTransform(mouseY, [0, isClient ? window.innerHeight : 1000], [2, -2]);
  const rotateYRaw = useTransform(mouseX, [0, isClient ? window.innerWidth : 1000], [-3, 3]);

  const springConfig = { stiffness: 40, damping: 40 };
  const rotateX = useSpring(rotateXRaw, springConfig);
  const rotateY = useSpring(rotateYRaw, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="landing-page">
      {/* ── NAVBAR ── */}
      <nav className="lp-nav" id="lp-nav">
        <div className="lp-nav-inner">
          <Link to="/" className="lp-nav-logo">
            <img src="/images/logo-web.png" alt="TechOS" className="lp-nav-logo-img" style={{ width: '40px', height: '40px' }} />
            <span className="lp-nav-logo-text"><span className="text-white">TECH</span><span style={{ color: 'rgba(96, 165, 250, 0.8)' }}>OS</span></span>
          </Link>
          <div className="lp-nav-links">
            <a href="#features">Recursos</a>
            <a href="#pricing">Planos</a>
            <a href="#faq">FAQ</a>
          </div>
            <div className="lp-nav-actions">
              {isRealUser ? (
                <>
                  <span className="text-sm font-medium text-slate-300 hidden md:inline-block mr-4">
                    Logado como <strong className="text-white">{user?.user_metadata?.nome?.split(' ')[0] || user?.nome?.split(' ')[0] || 'Técnico'}</strong>
                  </span>
                  <button onClick={signOut} className="lp-btn-ghost mr-2 text-red-400 hover:text-red-300">Sair</button>
                  <Link to="/dashboard" className="lp-btn-primary-sm">Ir para o Painel</Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="lp-btn-ghost">Entrar</Link>
                  <Link to="/register" className="lp-btn-primary-sm">Criar conta grátis</Link>
                </>
              )}
            </div>
        </div>
      </nav>

      {/* ── 2.1 HERO VIVO ── */}
      <section className="lp-hero relative isolation-isolate">
        <EnvironmentLayer />

        <div className="lp-hero-inner">
          <motion.div 
            className="lp-hero-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="lp-hero-badge">
              <span className="lp-badge-pulse" />
              Novo: Notificações automáticas por WhatsApp
            </div>

            <h1 className="lp-hero-title">
              Sua assistência<br />
              <em>no próximo</em><br />
              nível.
            </h1>

            <p className="lp-hero-sub">
              Do check-in fotográfico ao WhatsApp automático.
              Gerencie OS, estoque e financeiro num único sistema
              feito para a bancada real.
            </p>

            <div className="lp-hero-ctas">
              {!isRealUser && (
                <Link to="/register" className="lp-cta-primary">
                  Começar grátis
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              )}
              <button className="lp-cta-secondary" onClick={handleDemo}>
                <span className="lp-cta-play">▶</span>
                Ver demonstração
              </button>
            </div>

            <div className="lp-trust">
              {[
                'Multi-tenant isolado',
                'WhatsApp automático',
                'Offline-first',
              ].map((t, i) => (
                <React.Fragment key={t}>
                  {i > 0 && <span className="lp-trust-divider" />}
                  <div className="lp-trust-item">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M4.5 7l1.8 1.8L9.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="lp-hero-visual"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Spotlight Anchor Emocional */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-600/5 blur-[120px] pointer-events-none" />

            {/* Dashboard Mockup 3D reativo */}
            <motion.div 
              className="lp-mockup relative overflow-hidden"
              style={{ rotateX, rotateY }}
            >
              <DataFlowLine triggerKey={flowTrigger} />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />

              <div className="lp-mockup-bar">
                <div className="lp-mockup-circles">
                  <span style={{background:'#FF5F57'}} />
                  <span style={{background:'#FFBD2E'}} />
                  <span style={{background:'#28C840'}} />
                </div>
                <span className="lp-mockup-addr">techos.app/dashboard</span>
              </div>

              <div className="lp-mockup-content">
                {/* Métricas Vivas */}
                <div className="lp-mock-metrics">
                  {[
                    { label: 'OS Abertas', val: metrics.osAbertas.toString(), trend: '↑ +2 hoje', color: '#2563EB', warn: false },
                    { label: 'Faturamento', val: `R$${metrics.faturamento.toLocaleString('pt-BR')}`, trend: '↑ crescendo', color: '#06B6D4', warn: false },
                    { label: 'Prontas', val: '2', trend: '⚠ retirar', color: '#F59E0B', warn: true },
                  ].map((m, i) => (
                    <motion.div 
                      key={m.label} 
                      className="lp-mock-metric" 
                      style={{'--metric-color': m.color} as React.CSSProperties}
                      animate={i < 2 ? { backgroundColor: flowTrigger % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)' } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="lp-mock-m-label">{m.label}</span>
                      <span className="lp-mock-m-value">{m.val}</span>
                      <span className={`lp-mock-m-trend ${m.warn ? 'warn' : ''}`}>{m.trend}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="lp-mock-kanban">
                  {[
                    { title: 'Análise', color: '#2563EB', cards: [
                      { os: '049', name: 'Ana Clara', dev: 'Samsung A54' },
                      { os: '050', name: 'Bruno Silva', dev: 'PC Gamer' },
                    ]},
                    { title: 'Bancada', color: '#06B6D4', cards: [
                      { os: '047', name: 'Carla Souza', dev: 'Dell Inspiron' },
                    ]},
                    { title: 'Pronto ✓', color: '#10B981', cards: [
                      { os: '046', name: 'Diego Lima', dev: 'iPhone 14 Pro' },
                    ]},
                  ].map(col => (
                    <div key={col.title} className="lp-mock-col" style={{'--col-color': col.color} as React.CSSProperties}>
                      <span className="lp-mock-col-title" style={{color: col.color}}>{col.title}</span>
                      {col.cards.map(c => (
                        <div key={c.os} className="lp-mock-card">
                          <span className="lp-mock-card-os">OS #{c.os}</span>
                          <span className="lp-mock-card-name">{c.name}</span>
                          <span className="lp-mock-card-dev">{c.dev}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notificação Flutuante Viva */}
              <motion.div 
                className="lp-mock-notif"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="lp-notif-dot animate-pulse" />
                <div className="lp-notif-texts">
                  <span className="lp-notif-top">WhatsApp enviado ✓</span>
                  <span className="lp-notif-bot">OS #047 pronta — Fernanda</span>
                </div>
                <span className="lp-notif-time">agora</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <div className="lp-scroll-hint">
          <div className="lp-scroll-mouse">
            <div className="lp-scroll-wheel" />
          </div>
          <span>scroll</span>
        </div>
      </section>

      {/* ── 2.2 STATS ── */}
      <section className="lp-stats">
        <div className="lp-stats-inner">
          {[
            { value: '2.400+', label: 'OS abertas por mês' },
            { value: '98%',    label: 'Taxa de satisfação' },
            { value: '3h',     label: 'Economizadas por dia' },
            { value: 'R$0',    label: 'Para começar' },
          ].map((s, i) => (
            <div key={i} className="lp-stat">
              <span className="lp-stat-val">{s.value}</span>
              <span className="lp-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2.3 DORES ── */}
      <section className="lp-pain">
        <div className="lp-section-inner">
          <div className="lp-pain-header">
            <span className="lp-section-eyebrow">Por que TechOS?</span>
            <h2 className="lp-section-title">
              O fim da desorganização<br />na bancada.
            </h2>
          </div>
          <div className="lp-pain-grid flex flex-col gap-6">
            {[
              {
                bad: 'Papéis sumindo, cliente ligando toda hora, e você sem saber se teve lucro no fim do mês.',
                good: 'Tudo digital. O cliente recebe atualizações via WhatsApp automático e o financeiro é calculado em tempo real.',
              },
              {
                bad: 'Aparelhos arranhados gerando dor de cabeça com clientes alegando danos pré-existentes.',
                good: 'Check-in blindado: fotos integradas, checklist de entrada e assinatura digital no balcão.',
              },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                className="relative rounded-2xl border border-white/[0.08] overflow-hidden bg-white/[0.02]"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-7 bg-white/[0.02]">
                    <span className="mb-4 inline-block px-3 py-1 bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-widest rounded-md border border-white/10">Antes</span>
                    <p className="text-white/70 leading-relaxed">{item.bad}</p>
                  </div>
                  <div className="p-7 bg-white/[0.04]">
                    <span className="mb-4 inline-block px-3 py-1 bg-white/[0.08] text-white text-[10px] font-bold uppercase tracking-widest rounded-md border border-white/10">Com TechOS</span>
                    <p className="text-white leading-relaxed">{item.good}</p>
                  </div>
                </div>
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/[0.08] hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2.4 FEATURES ── */}
      <section id="features" className="lp-features">
        <div className="lp-section-inner">
          <div className="lp-features-header">
            <span className="lp-section-eyebrow">Tudo incluso</span>
            <h2 className="lp-section-title">
              Não é só uma OS.<br />
              <span className="lp-accent-text">É uma operação completa.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className={`${i === 0 ? surfaceLevel3 : surfaceLevel2} flex flex-col gap-5 ${i === 0 ? 'md:col-span-2' : ''}`}
                style={{'--f-color': f.color, '--f-color-bg': f.colorMuted} as React.CSSProperties}
                whileHover={i === 0 ? { y: -8, scale: 1.02 } : { y: -5 }}
                transition={{ type: "spring", stiffness: 130, damping: 18 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-white/[0.04] opacity-0 hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
                <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center mb-4 relative z-10" style={{color: f.color}}>
                  <f.icon size={20} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold text-white mb-2 tracking-wide">{f.title}</h3>
                  <p className="text-white/70 leading-relaxed text-sm">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2.5 PRICING ── */}
      <section id="pricing" className="lp-pricing">
        <div className="lp-section-inner">
          <div className="lp-pricing-header">
            <span className="lp-section-eyebrow">Planos</span>
            <h2 className="lp-section-title">
              Simples. Transparente.<br />Feito para crescer.
            </h2>
            <p>Sem fidelidade. Cancele quando quiser.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Inicial', amount: '0', period: '/mês', featured: false,
                features: ['Até 50 OS por mês', '1 Usuário', 'Controle de Estoque', 'Relatórios básicos'],
                cta: 'Começar grátis', ctaStyle: 'ghost', href: '/register',
              },
              {
                name: 'Pro', amount: '79', period: '/mês', featured: true,
                features: ['OS Ilimitadas', 'Usuários ilimitados', 'WhatsApp automático', 'Check-in com fotos', 'Vitrine reativa'],
                cta: 'Assinar Pro', ctaStyle: 'primary', href: '/register',
              },
              {
                name: 'Premium', amount: '149', period: '/mês', featured: false,
                features: ['Tudo do Pro', 'Múltiplas filiais', 'API e integrações', 'Suporte 24/7', 'Treinamento dedicado'],
                cta: 'Falar com consultor', ctaStyle: 'ghost', href: '/register',
              },
            ].map((plan, i) => (
              <motion.div 
                key={i} 
                className={`${plan.featured ? surfaceLevel3 : surfaceLevel2} flex flex-col ${plan.featured ? 'bg-gradient-to-b from-white/[0.1] to-white/[0.04] ring-white/[0.15] scale-[1.02]' : ''}`}
                whileHover={plan.featured ? { y: -8, scale: 1.02 } : { y: -5 }}
                transition={{ type: "spring", stiffness: 130, damping: 18 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-white/[0.04] opacity-0 hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
                {plan.featured && <span className="absolute top-0 inset-x-0 mx-auto w-max px-3 py-1 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-b-lg">Mais popular</span>}
                <div className="relative z-10 pt-4">
                  <div className="text-white/70 font-semibold mb-4">{plan.name}</div>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-2xl font-bold text-white/80">R$</span>
                    <span className="text-5xl font-extrabold text-white tracking-wide">{plan.amount}</span>
                    <span className="text-white/40">{plan.period}</span>
                  </div>
                </div>
                <div className="h-px bg-white/10 w-full mb-8" />
                <ul className="flex flex-col gap-4 mb-10 flex-1 relative z-10">
                  {plan.features.map(feat => (
                    <li key={feat} className="flex items-center gap-3 text-white/70 leading-relaxed text-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link to={plan.href} className={`lp-plan-btn relative z-10 ${plan.ctaStyle === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'} w-full text-center py-4 rounded-xl font-bold transition-all`}>{plan.cta}</Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔹 2.6 PROBLEMAS QUE RESOLVEMOS 🔹 */}
      <section className="lp-testimonials">
        <div className="lp-section-inner">
          <div className="lp-testimonials-header text-center mb-16">
            <span className="block text-blue-400 text-sm font-bold uppercase tracking-widest mb-4">Problemas que resolvemos</span>
            <h2 className="text-4xl font-extrabold text-white tracking-wide">
              Se você vive isso, o TechOS é para você.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                title: 'Clientes perguntando o tempo todo', 
                desc: 'Você para o que está fazendo várias vezes por dia só pra responder "já ficou pronto?". Isso quebra seu foco, atrasa o serviço e ainda te deixa estressado.',
                icon: '💬'
              },
              { 
                title: 'Falta de controle financeiro', 
                desc: 'Entra dinheiro na gaveta, sai dinheiro pra peça, e no fim do mês você não sabe se a assistência deu lucro ou apenas pagou as contas.',
                icon: '💸'
              },
              { 
                title: 'Ordens de serviço de papel perdidas', 
                desc: 'Aquele bloco de papel que rasga, some, ou a letra fica ilegível. Quando o cliente volta pra buscar o aparelho, vira um desespero pra encontrar o registro.',
                icon: '📄'
              },
              { 
                title: 'Esquecer de avisar sobre orçamentos', 
                desc: 'O aparelho tá na bancada esperando aprovação, mas você esqueceu de mandar mensagem. Resultado: equipamento parado ocupando espaço e dinheiro que não entra.',
                icon: '⏰'
              },
              { 
                title: 'Desorganização no estoque de peças', 
                desc: 'Você acha que tem a peça, desmonta o aparelho do cliente e descobre que não tem. Precisa pedir às pressas, pagando mais caro no motoboy.',
                icon: '📦'
              },
              { 
                title: 'Dores de cabeça com garantias falsas', 
                desc: 'O cliente volta reclamando de um arranhão que já estava lá, mas você não tem como provar porque não fez um check-in fotográfico antes do conserto.',
                icon: '🤦‍♂️'
              },
            ].map((p, i) => (
              <motion.div 
                key={i} 
                className={`${surfaceLevel1} !p-8`}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 130, damping: 20 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-white/[0.04] opacity-0 hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
                
                <div className="text-4xl mb-6 relative z-10">{p.icon}</div>
                <h3 className="text-xl font-bold text-white mb-4 relative z-10 leading-tight">{p.title}</h3>
                <p className="text-white/60 leading-relaxed relative z-10 text-sm">{p.desc}</p>
                
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2.7 FAQ ── */}
      <section id="faq" className="lp-faq">
        <div className="lp-faq-inner max-w-3xl mx-auto px-6 py-20">
          <div className="lp-faq-header mb-16">
            <span className="block text-center text-blue-400 text-sm font-bold uppercase tracking-widest mb-4">FAQ</span>
            <h2 className="text-center text-4xl font-extrabold text-white tracking-wide">
              Perguntas frequentes
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <motion.div 
                key={i} 
                className={`${surfaceLevel1} !p-6 !bg-white/[0.015]`}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 130, damping: 18 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-white/[0.04] opacity-0 hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
                <button 
                  className="w-full text-left p-6 flex justify-between items-center relative z-10 text-white font-medium"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <span className={`text-blue-400 text-xl transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden relative z-10"
                    >
                      <p className="px-6 pb-6 text-white/60 leading-relaxed text-sm">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2.8 FINAL CTA & FOOTER ── */}
      <section className="lp-final-cta relative overflow-hidden">
        <EnvironmentLayer />
        <div className="lp-final-cta-glow absolute inset-0 bg-blue-600/10 blur-[100px]" />
        <motion.div 
          className="lp-final-cta-inner relative z-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="lp-final-cta-title">
            Pronto para transformar<br />
            <span className="lp-accent-text">sua assistência técnica?</span>
          </h2>
          <p className="lp-final-cta-sub">
            Comece grátis hoje. Sem cartão de crédito.
          </p>
          <div className="lp-final-cta-actions">
            {isRealUser ? (
              <Link to="/dashboard" className="lp-cta-big shadow-[0_10px_40px_rgba(37,99,235,0.4)] hover:-translate-y-1 transition-transform">
                Ir para o Painel
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            ) : (
              <Link to="/register" className="lp-cta-big shadow-[0_10px_40px_rgba(37,99,235,0.4)] hover:-translate-y-1 transition-transform">
                Criar conta grátis
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            )}
            <button className="lp-cta-ghost backdrop-blur-md" onClick={handleDemo}>
              Ver demonstração do painel
            </button>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer border-t border-white/5 relative z-10">
        <div className="lp-footer-inner flex flex-col md:flex-row justify-between items-center py-8 px-8 max-w-7xl mx-auto">
          <Link to="/" className="lp-nav-logo">
            <img src="/images/logo-web.png" alt="TechOS" className="lp-nav-logo-img" />
            <span className="lp-nav-logo-text"><span className="text-white">TECH</span><span style={{ color: 'rgba(96, 165, 250, 0.8)' }}>OS</span></span>
          </Link>
          <div className="text-white/40 text-xs my-4 md:my-0">
            © {new Date().getFullYear()} TECHOS. Todos os direitos reservados.
          </div>
          <div className="flex gap-6 text-sm text-white/50">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

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
    desc: [
      'Evite dor de cabeça com clientes.',
      'Cada entrada gera um check-in com fotos, checklist e assinatura digital. Tudo documentado. Tudo protegido.',
      'Se der problema depois, você tem prova.'
    ],
  },
  {
    icon: MessageCircle,
    color: '#22C55E',
    colorMuted: 'rgba(34,197,94,0.10)',
    title: 'WhatsApp Automático',
    desc: [
      'Pare de perder tempo atualizando cliente.',
      'O sistema envia o status automaticamente em cada etapa.',
      'Orçamento, aprovação, finalização — tudo sem você precisar lembrar.'
    ],
  },
  {
    icon: Kanban,
    color: '#8B5CF6',
    colorMuted: 'rgba(139,92,246,0.10)',
    title: 'Kanban de Bancada',
    desc: [
      'Veja sua operação acontecendo em tempo real.',
      'Arraste as OS entre etapas e saiba exatamente onde cada serviço está.',
      'Sem perguntar. Sem confusão.'
    ],
  },
  {
    icon: TrendingUp,
    color: '#F59E0B',
    colorMuted: 'rgba(245,158,11,0.10)',
    title: 'Financeiro Real',
    desc: [
      'Saiba quanto você realmente ganha.',
      'O sistema calcula automaticamente com base nas OS fechadas.',
      'Sem planilha. Sem achismo.'
    ],
  },
  {
    icon: ShoppingBag,
    color: '#EC4899',
    colorMuted: 'rgba(236,72,153,0.10)',
    title: 'Vitrine Reativa',
    desc: [
      'Venda enquanto o serviço acontece.',
      'O cliente vê sugestões direto na OS.',
      'Você aumenta o ticket sem esforço.'
    ],
  },
  {
    icon: Shield,
    color: '#06B6D4',
    colorMuted: 'rgba(6,182,212,0.10)',
    title: 'Garantia Inteligente',
    desc: [
      'Controle garantia sem depender da memória.',
      'O sistema rastreia prazos automaticamente e te avisa quando algo volta.'
    ],
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
            <a href="#manifesto">Visão</a>
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

      {/* ── 2.2 TRUST / TECH INFO ── */}
      <section className="lp-stats">
        <div className="lp-stats-inner">
          {[
            { title: 'Dados reais desde o início', text: 'Backend integrado com Supabase e PostgreSQL. Nada de dashboard fake.' },
            { title: 'Arquitetura de SaaS', text: 'Multi-tenant preparado para escalar. Cada cliente isolado com segurança.' },
            { title: 'Demo funcional', text: 'Todas as features funcionando. Mesmo sem cadastro.' },
            { title: 'R$0 para começar', text: 'Teste completo antes de criar conta.' },
          ].map((item, i) => (
            <motion.div 
              key={i} 
              className="lp-stat group flex flex-col justify-center items-center text-center !px-6 !py-10"
              whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.02)' }}
              transition={{ duration: 0.2 }}
            >
              <h4 className="text-[17px] font-bold text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors duration-300">
                {item.title}
              </h4>
              <p className="text-[13px] text-white/60 leading-relaxed font-medium">
                {item.text}
              </p>
            </motion.div>
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
      <section id="features" className="lp-features-v2">
        <div className="lp-section-inner">
          {/* Header */}
          <motion.div
            className="lp-fv2-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="lp-section-eyebrow">Operação</span>
            <h2 className="lp-section-title">
              Não é um sistema.<br />
              <span className="lp-accent-text">É sua operação rodando.</span>
            </h2>
            <p className="lp-fv2-sub">
              Do atendimento ao financeiro — cada feature foi desenhada para eliminar
              um ponto de atrito real na bancada.
            </p>
          </motion.div>

          {/* Cards grid - assimétrico */}
          <div className="lp-fv2-grid">
            {/* Card destaque — ocupa linha inteira */}
            {(() => {
              const HeroIcon = features[0].icon;
              return (
                <motion.div
                  className="lp-fv2-card lp-fv2-card--hero group"
                  style={{'--fc': features[0].color, '--fc-bg': features[0].colorMuted} as React.CSSProperties}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="lp-fv2-card-bar" />
                  <div className="lp-fv2-hero-inner">
                    <div className="lp-fv2-hero-left">
                      <span className="lp-fv2-num">01</span>
                      <div className="lp-fv2-icon" style={{color: features[0].color, background: features[0].colorMuted}}>
                        <HeroIcon size={28} strokeWidth={2} />
                      </div>
                      <h3 className="lp-fv2-title">{features[0].title}</h3>
                      <p className="lp-fv2-desc">{features[0].desc[0]}</p>
                      {features[0].desc.slice(1).map((p, i) => (
                        <p key={i} className="lp-fv2-desc lp-fv2-desc--muted">{p}</p>
                      ))}
                    </div>
                    <div className="lp-fv2-hero-right">
                      <div className="lp-fv2-pill" style={{background: features[0].colorMuted, borderColor: features[0].color + '40'}}>
                        <span style={{color: features[0].color}}>✓</span> Sem conflito com cliente
                      </div>
                      <div className="lp-fv2-pill" style={{background: features[0].colorMuted, borderColor: features[0].color + '40'}}>
                        <span style={{color: features[0].color}}>✓</span> Assinatura digital no balcão
                      </div>
                      <div className="lp-fv2-pill" style={{background: features[0].colorMuted, borderColor: features[0].color + '40'}}>
                        <span style={{color: features[0].color}}>✓</span> Fotos + checklist vinculados
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* 5 cards menores */}
            {features.slice(1).map((f, i) => (
              <motion.div
                key={i}
                className="lp-fv2-card group"
                style={{'--fc': f.color, '--fc-bg': f.colorMuted} as React.CSSProperties}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -5 }}
              >
                <div className="lp-fv2-card-bar" />
                <span className="lp-fv2-num">{String(i + 2).padStart(2, '0')}</span>
                <div className="lp-fv2-icon" style={{color: f.color, background: f.colorMuted}}>
                  <f.icon size={22} strokeWidth={2} />
                </div>
                <h3 className="lp-fv2-title">{f.title}</h3>
                <p className="lp-fv2-desc">{f.desc[0]}</p>
                {f.desc.slice(1).map((p, pi) => (
                  <p key={pi} className="lp-fv2-desc lp-fv2-desc--muted">{p}</p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2.5 MANIFESTO ── */}
      <section id="manifesto" className="py-24 relative overflow-hidden">
        <div className="lp-section-inner relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="lp-section-eyebrow">Visão de Produto</span>
            <h2 className="lp-section-title">
              Mais que um projeto.<br />Um <span className="lp-accent-text">ecossistema em construção.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            <motion.div 
              className={`${surfaceLevel2} !p-10 flex flex-col h-full justify-center`}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                Construí o TechOS com a ideia de ser mais do que um dashboard.
              </p>
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                Nada aqui é apenas visual.<br />
                Tudo foi desenhado para simular um <strong className="text-white">produto real em produção.</strong>
              </p>
              <p className="text-white/80 text-lg leading-relaxed">
                A ideia é evoluir isso para um sistema completo de gestão, automação e inteligência de negócio.
              </p>
            </motion.div>

            <motion.div 
              className={`${surfaceLevel3} !p-10 flex flex-col h-full justify-center bg-gradient-to-br from-blue-900/20 to-cyan-900/10`}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-white mb-8">A stack foi pensada para escalar desde o início:</h3>
              <ul className="flex flex-col gap-6">
                {[
                  'Frontend moderno e performático',
                  'Backend estruturado com foco em dados reais',
                  'Integração com banco de dados real (Supabase)',
                  'Arquitetura preparada para SaaS multiusuário'
                ].map((item, i) => (
                  <motion.li 
                    key={i} 
                    className="flex items-center gap-4 text-white/80 font-medium"
                    whileHover={{ x: 5, color: '#fff' }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.15)]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="leading-tight">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <span className="inline-block px-8 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xl font-medium text-white/90 shadow-2xl backdrop-blur-md hover:bg-white/[0.06] transition-colors cursor-default">
              Isso é <span className="lp-accent-text font-bold">só o começo.</span> <span className="inline-block ml-2 animate-bounce">🚀</span>
            </span>
          </motion.div>
        </div>
      </section>

      {/* 🔹 2.6 PROBLEMAS QUE RESOLVEMOS 🔹 */}
      <section className="lp-problems">
        <div className="lp-section-inner">
          <motion.div
            className="lp-problems-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="lp-section-eyebrow">Problemas que resolvemos</span>
            <h2 className="lp-section-title">
              Reconhece algum<br />desses cenários?
            </h2>
            <p className="lp-problems-sub">
              Se você vive qualquer um desses, o TechOS foi feito pra você.
            </p>
          </motion.div>

          <div className="lp-problems-grid">
            {[
              {
                icon: '💬',
                color: '#22C55E',
                tag: 'Comunicação',
                title: 'Cliente ligando o tempo todo',
                desc: 'Você para o que está fazendo várias vezes por dia só pra responder "já ficou pronto?". Isso quebra seu foco, atrasa a fila e te deixa esgotado.',
                fix: 'WhatsApp automático em cada etapa'
              },
              {
                icon: '💸',
                color: '#F59E0B',
                tag: 'Financeiro',
                title: 'Dinheiro entrando sem controle',
                desc: 'Entra pela gaveta, sai pra peça, e no fim do mês você não sabe se teve lucro — ou só pagou as contas mais o seu próprio salário.',
                fix: 'Financeiro calculado automaticamente'
              },
              {
                icon: '📄',
                color: '#0EA5E9',
                tag: 'Registro',
                title: 'OS de papel sumindo',
                desc: 'O bloco rasga, some ou a letra fica ilegível. Quando o cliente volta, vira caça ao tesouro encontrar o registro.',
                fix: 'Tudo digital, buscável e organizado'
              },
              {
                icon: '⏰',
                color: '#EC4899',
                tag: 'Orçamento',
                title: 'Aparelho parado sem aprovação',
                desc: 'O equipamento tá na bancada esperando aprovação, mas você esqueceu de mandar mensagem. Espaço ocupado, dinheiro parado.',
                fix: 'Notificação automática ao cliente'
              },
              {
                icon: '📦',
                color: '#8B5CF6',
                tag: 'Estoque',
                title: 'Peça que sumiu do nada',
                desc: 'Você acha que tem a peça, desmonta o aparelho do cliente e descobre que não tem. Pedido às pressas, motoboy caro, cliente esperando.',
                fix: 'Estoque em tempo real com alertas'
              },
              {
                icon: '🛡️',
                color: '#06B6D4',
                tag: 'Garantia',
                title: 'Arranhão que já estava lá',
                desc: 'O cliente volta reclamando de um dano pré-existente e você não tem como provar. Sem evidência, você perde a discussão.',
                fix: 'Check-in fotográfico + assinatura digital'
              },
            ].map((p, i) => (
              <motion.div
                key={i}
                className="lp-prob-card group"
                style={{'--pc': p.color} as React.CSSProperties}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                whileHover={{ y: -5 }}
              >
                <div className="lp-prob-accent" />
                <div className="lp-prob-top">
                  <span className="lp-prob-tag" style={{color: p.color, background: p.color + '18', borderColor: p.color + '30'}}>
                    {p.tag}
                  </span>
                  <span className="lp-prob-emoji">{p.icon}</span>
                </div>
                <h3 className="lp-prob-title">{p.title}</h3>
                <p className="lp-prob-desc">{p.desc}</p>
                <div className="lp-prob-fix">
                  <span className="lp-prob-fix-dot" style={{background: p.color}} />
                  <span className="lp-prob-fix-text">{p.fix}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2.7 FAQ ── */}
      <section id="faq" className="lp-faq-v2">
        <div className="lp-faq-v2-inner">
          <motion.div
            className="lp-faq-v2-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="lp-section-eyebrow">FAQ</span>
            <h2 className="lp-section-title">Perguntas<br />frequentes</h2>
          </motion.div>

          <div className="lp-faq-v2-list">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                className={`lp-faq-v2-row ${openFaq === i ? 'lp-faq-v2-row--open' : ''}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <button
                  className="lp-faq-v2-btn"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="lp-faq-v2-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="lp-faq-v2-q">{faq.q}</span>
                  <span className={`lp-faq-v2-icon ${openFaq === i ? 'open' : ''}`}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="lp-faq-v2-ans">{faq.a}</p>
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
            <Link to="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link to="/contato" className="hover:text-white transition-colors">Contato</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

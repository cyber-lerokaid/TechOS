import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Zap, LayoutDashboard, Search, Settings, Check, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import './LandingPage.css';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const { enterDemoMode } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleDemo = () => {
    enterDemoMode();
    navigate('/dashboard');
  };

  const painPoints = [
    { problema: "Clientes ligando o dia todo perguntando se ficou pronto", solucao: "Status em tempo real no WhatsApp — zero ligações" },
    { problema: "Medo de cliente alegar que entregou sem arranhão", solucao: "Check-in fotográfico com assinatura digital" },
    { problema: "Acessórios parados no estoque sem vender", solucao: "Vitrine reativa no link do cliente" },
    { problema: "Fim do mês sem saber se teve lucro", solucao: "Dashboard financeiro gerado automaticamente" },
  ];

  const plans = [
    { nome: "Starter", preco: "79", features: ["1 técnico", "50 OS/mês", "Link público da OS", "Vitrine básica"], cta: "Começar grátis" },
    { nome: "Pro", preco: "149", popular: true, features: ["Até 3 técnicos", "OS ilimitadas", "Vitrine reativa", "Reativação automática", "Gráficos financeiros"], cta: "Assinar Pro" },
    { nome: "Enterprise", preco: "299", features: ["Técnicos ilimitados", "Múltiplas unidades", "API WhatsApp oficial", "Relatórios avançados", "Suporte prioritário"], cta: "Falar com vendas" },
  ];

  const faqs = [
    { q: "Preciso instalar algum programa?", r: "Não. O TechOS funciona 100% no navegador, em qualquer celular, tablet ou computador." },
    { q: "Como o cliente recebe o link da OS?", r: "Assim que o técnico abre a OS, o sistema gera um link único e você envia pelo WhatsApp com um clique." },
    { q: "O estoque é complicado de gerenciar?", r: "Não. Você cadastra o produto uma vez e o sistema dá baixa automática quando ele é usado numa OS ou vendido no PDV." },
    { q: "Funciona sem internet?", r: "O TechOS salva os dados localmente e sincroniza quando a conexão voltar. Você não perde nenhum check-in." },
    { q: "Posso cancelar quando quiser?", r: "Sim. Não há fidelidade. Você cancela a qualquer momento direto nas configurações da sua conta." },
  ];

  return (
    <div className="landing-layout">
      {/* Navbar com Tailwind para fundo transparente e links brancos */}
      <nav className="absolute w-full z-50 bg-transparent border-b border-white/10">
        <div className="nav-container text-white">
          <div className="nav-logo">
            <Settings className="text-primary" size={28} />
            <span className="text-white">TechOS</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors font-medium">Recursos</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors font-medium">Planos</a>
            <a href="#faq" className="text-gray-300 hover:text-white transition-colors font-medium">FAQ</a>
            <div className="flex items-center gap-4 ml-4">
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors font-semibold">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section pt-32">
        <div className="hero-background"></div>
        <motion.div 
          className="hero-container"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="hero-content" variants={containerVariants}>
            <motion.h1 variants={itemVariants}>
              O sistema operacional definitivo para a sua <span className="text-primary">assistência técnica</span>.
            </motion.h1>
            <motion.p variants={itemVariants} className="hero-subtitle">
              Gestão de OS, estoque, PDV e envio de links públicos pelo WhatsApp. 
              Impressione seus clientes com uma experiência premium enquanto você foca no conserto.
            </motion.p>
            <motion.div variants={itemVariants} className="hero-cta flex flex-col sm:flex-row gap-4 mb-10">
              <Link to="/register" className="btn btn-primary btn-lg shadow-[0_0_20px_rgba(14,165,233,0.4)]">
                Criar Minha Conta <ChevronRight size={20} />
              </Link>
              <button onClick={handleDemo} className="btn btn-outline btn-lg text-white border-white/20 hover:bg-white/10">
                Ver Demonstração
              </button>
            </motion.div>
            
            <motion.div variants={itemVariants} className="hero-features-list">
              <span><CheckCircle2 size={16} className="text-success" /> Multi-tenant Isolado</span>
              <span><CheckCircle2 size={16} className="text-success" /> Offline-first</span>
              <span><CheckCircle2 size={16} className="text-success" /> Layout Responsivo</span>
            </motion.div>
          </motion.div>

          <motion.div className="hero-image-wrapper" variants={itemVariants}>
            <div className="relative mx-auto w-full max-w-2xl" style={{ perspective: '1000px' }}>
              <div 
                className="border-gray-800 dark:border-gray-800 bg-gray-800 border-[8px] rounded-t-xl h-[400px] w-full overflow-hidden shadow-2xl transition-transform duration-700 ease-out"
                style={{ transform: 'rotateY(-12deg) rotateX(5deg)' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'rotateY(-12deg) rotateX(5deg)'}
              >
                <div className="rounded-lg overflow-hidden h-[384px] bg-zinc-950 flex flex-col">
                {/* Header do Mockup */}
                <div className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-zinc-500 text-xs font-medium">sua-assistencia.techos.com.br</div>
                  <div></div>
                </div>
                {/* Corpo do Mockup (Kanban) */}
                <div className="flex-1 flex gap-3 p-4 overflow-hidden">
                  {/* Coluna 1 */}
                  <div className="flex-1 bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/50 flex flex-col gap-3">
                    <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Aguardando Peça</div>
                    
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 shadow-md">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-blue-400 text-xs font-bold">#4892</span>
                        <span className="text-zinc-500 text-[10px]">Hoje</span>
                      </div>
                      <div className="text-zinc-200 text-sm font-medium mb-1">iPhone 14 Pro</div>
                      <div className="text-zinc-500 text-xs mb-3">Ana Clara</div>
                      <div className="w-full h-1 bg-yellow-500/20 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 w-full"></div>
                      </div>
                    </div>

                  </div>
                  {/* Coluna 2 */}
                  <div className="flex-1 bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/50 flex flex-col gap-3">
                    <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Em Bancada</div>
                    
                    <div className="bg-zinc-900 border border-blue-500/50 rounded-lg p-3 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-blue-400 text-xs font-bold">#4895</span>
                        <span className="text-zinc-500 text-[10px]">1h atrás</span>
                      </div>
                      <div className="text-zinc-200 text-sm font-medium mb-1">MacBook Pro M2</div>
                      <div className="text-zinc-500 text-xs mb-3">Carlos Eduardo</div>
                      <div className="w-full h-1 bg-blue-500/20 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-full"></div>
                      </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 shadow-md">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-blue-400 text-xs font-bold">#4890</span>
                        <span className="text-zinc-500 text-[10px]">Ontem</span>
                      </div>
                      <div className="text-zinc-200 text-sm font-medium mb-1">Dell Inspiron 15</div>
                      <div className="text-zinc-500 text-xs mb-3">Fernando Souza</div>
                      <div className="w-full h-1 bg-blue-500/20 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Dores e Soluções Section */}
      <section className="py-24 px-6 bg-[#0B0F19]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-white mb-4">A realidade da sua bancada hoje</h2>
            <p className="text-gray-400 text-lg">E como o TechOS resolve cada um desses problemas automaticamente.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {painPoints.map((item, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="mt-1 bg-red-500/20 p-1.5 rounded-full text-red-400"><X size={16} /></div>
                    <p className="text-red-200/80 font-medium">{item.problema}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-green-500/20 p-1.5 rounded-full text-green-400"><Check size={16} /></div>
                    <p className="text-green-200 font-medium">{item.solucao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="section-title">
            <h2>Tudo o que você precisa em um só lugar</h2>
            <p>Esqueça o papel e a caneta. O TechOS moderniza a sua bancada.</p>
          </div>

          <div className="features-grid">
            {[
              { icon: <Zap />, title: 'Kanban Dinâmico', desc: 'Arraste e solte as ordens de serviço. Mude o status e notifique o cliente automaticamente.' },
              { icon: <Search />, title: 'Link Público da OS', desc: 'O cliente acompanha o progresso de casa e aprova orçamentos com um clique pelo celular.' },
              { icon: <LayoutDashboard />, title: 'Estoque Inteligente', desc: 'Vitrine reativa que oferece produtos para o cliente enquanto o aparelho dele está na bancada.' }
            ].map((feat, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{feat.icon}</div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proofs Section */}
      <section className="py-24 px-6 bg-[#09090E] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-white mb-4">Quem usa, recomenda.</h2>
            <p className="text-gray-400 text-lg">Veja o que donos de assistência técnica estão falando sobre o TechOS.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { text: "Antes eu perdia horas mandando mensagem pros clientes avisando que tava pronto. Hoje mudo o status pra 'Pronto' e o sistema avisa sozinho.", author: "Ricardo Silva", role: "Dono, RS Info" },
              { text: "A geração do orçamento inteligente com sugestão de peças salvou o meu dia a dia. Tudo muito rápido e o cliente aprova pelo celular.", author: "Aline Santos", role: "Técnica, iFix Center" },
              { text: "Finalmente um sistema de OS que não tem cara de programa dos anos 90. Meus clientes ficam impressionados com o link de acompanhamento.", author: "Marcos Ferreira", role: "CEO, TechBros" }
            ].map((dep, i) => (
              <div key={i} className="bg-[#111118] p-8 rounded-2xl border border-white/5 relative">
                <div className="text-primary text-4xl font-serif absolute top-6 left-6 opacity-20">"</div>
                <p className="text-gray-300 relative z-10 mb-6 italic">"{dep.text}"</p>
                <div>
                  <p className="text-white font-bold">{dep.author}</p>
                  <p className="text-gray-500 text-sm">{dep.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-[#09090E]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-white mb-4">Planos simples e transparentes</h2>
            <p className="text-gray-400 text-lg">Escolha o plano ideal para o tamanho da sua assistência.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {plans.map((plan, i) => (
              <div key={i} className={`p-8 rounded-3xl bg-[#111118] border ${plan.popular ? 'border-primary shadow-[0_0_30px_rgba(14,165,233,0.15)] relative scale-105' : 'border-white/10'}`}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Mais Popular</div>}
                <h3 className="text-xl font-bold text-white mb-2">{plan.nome}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">R$ {plan.preco}</span>
                  <span className="text-gray-500">/mês</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-gray-300">
                      <Check size={18} className="text-primary" /> {feat}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`w-full py-3 rounded-xl font-bold flex justify-center transition-colors ${plan.popular ? 'bg-primary text-white hover:bg-primary-hover' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-[#0B0F19]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-white mb-4">Perguntas Frequentes</h2>
            <p className="text-gray-400 text-lg">Tire suas dúvidas e comece a usar o TechOS hoje mesmo.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <button 
                  className="w-full px-6 py-4 flex items-center justify-between text-left text-white font-semibold focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <ChevronDown className={`transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-primary' : 'text-gray-500'}`} size={20} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-4 text-gray-400">
                        {faq.r}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <Settings size={24} className="text-primary" />
            <span>TechOS SaaS</span>
          </div>
          <p>© 2026 TechOS. O sistema definitivo para assistências técnicas no Brasil.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

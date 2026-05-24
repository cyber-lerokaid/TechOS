import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowRight, Activity, Smartphone, CreditCard, Sparkles, Box, Check } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import './LandingPage.css'; // kept for legacy if any, now empty

const LandingPage = () => {
  const { enterDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleDemo = () => {
    enterDemoMode();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-primary/30 font-sans overflow-x-hidden">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-emerald-900/10 blur-[120px]"></div>
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 font-semibold-plus text-xl tracking-tight">
            <img src="/images/logo-techos.png" alt="TechOS Logo" className="w-8 h-8 object-contain" />
            TechOS
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#customers" className="hover:text-white transition-colors">Clientes</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>TechOS V4 is now available</span>
            <div className="w-px h-3 bg-white/20 mx-1"></div>
            <a href="#" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Read the launch post <ArrowRight className="w-3 h-3" />
            </a>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1] max-w-4xl"
          >
            O sistema operacional da sua <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">assistência técnica.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed"
          >
            Gestão de OS, estoque inteligente, PDV e automação de WhatsApp. 
            Uma experiência luxuosa para você e para o seu cliente.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-black text-sm font-semibold rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              Criar Conta Grátis <ChevronRight className="w-4 h-4" />
            </Link>
            <button 
              onClick={handleDemo}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white text-sm font-semibold rounded-full hover:bg-white/10 transition-colors flex items-center justify-center gap-2 backdrop-blur-md"
            >
              Testar Demonstração
            </button>
          </motion.div>
        </section>

        {/* Dashboard Preview / Bento Grid */}
        <section className="py-20 px-6 max-w-7xl mx-auto" id="features">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Main Feature - Kanban */}
            <div className="md:col-span-2 md:row-span-2 rounded-3xl bg-[#0A0A0A] border border-white/5 p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                    <Activity className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight mb-2">Workflow Cinematográfico</h3>
                  <p className="text-gray-400">Um kanban drag-and-drop tão suave que você vai querer trabalhar mais. Atualizações de status enviam WhatsApp automáticos para o cliente.</p>
                </div>
                
                <div className="mt-auto flex-1 rounded-xl border border-white/10 bg-black/50 p-4 backdrop-blur-xl shadow-2xl translate-y-8 group-hover:translate-y-4 transition-transform duration-500">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="h-6 w-24 bg-white/5 rounded-md"></div>
                      <div className="h-24 bg-white/5 rounded-lg border border-white/5 p-3">
                        <div className="h-3 w-12 bg-blue-500/50 rounded-sm mb-2"></div>
                        <div className="h-4 w-3/4 bg-white/20 rounded-sm mb-4"></div>
                        <div className="h-2 w-full bg-white/10 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3 hidden sm:block">
                      <div className="h-6 w-24 bg-white/5 rounded-md"></div>
                      <div className="h-24 bg-blue-500/10 rounded-lg border border-blue-500/20 p-3">
                         <div className="h-3 w-12 bg-blue-500/80 rounded-sm mb-2"></div>
                         <div className="h-4 w-3/4 bg-white/30 rounded-sm mb-4"></div>
                         <div className="h-2 w-full bg-blue-500/30 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub Feature 1 */}
            <div className="rounded-3xl bg-[#0A0A0A] border border-white/5 p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Tracking Público</h3>
                <p className="text-gray-400 text-sm">Links públicos imaculados para o cliente aprovar o orçamento pelo celular sem te ligar.</p>
              </div>
            </div>

            {/* Sub Feature 2 */}
            <div className="rounded-3xl bg-[#0A0A0A] border border-white/5 p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                  <Box className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Estoque Inteligente</h3>
                <p className="text-gray-400 text-sm">Controle de peças rigoroso e vitrine digital. Dê baixa automaticamente nas OS.</p>
              </div>
            </div>

            {/* Sub Feature 3 */}
            <div className="rounded-3xl bg-[#0A0A0A] border border-white/5 p-8 relative overflow-hidden group md:col-span-3 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 max-w-xl">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">Performance Financeira</h3>
                <p className="text-gray-400">Dashboards gerados em tempo real que não parecem planilhas dos anos 90. Saiba exatamente qual foi o ticket médio e o lucro do dia.</p>
              </div>
              <div className="relative z-10 w-full md:w-auto flex-1 flex justify-end">
                <div className="bg-black/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col gap-4 w-full max-w-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Receita Total</span>
                    <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">+12.5%</span>
                  </div>
                  <span className="text-4xl font-bold tracking-tighter">R$ 14.502<span className="text-xl text-gray-500">,00</span></span>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                    <div className="h-full w-2/3 bg-indigo-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* Pricing Section (Dark Minimalist) */}
        <section className="py-24 px-6 max-w-7xl mx-auto" id="pricing">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">Preços simples.</h2>
            <p className="text-gray-400 text-lg">Sem taxas escondidas. Comece grátis, cresça com o Pro.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Starter */}
            <div className="rounded-3xl bg-[#050505] border border-white/10 p-8 flex flex-col hover:border-white/20 transition-colors">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <p className="text-gray-400 text-sm mb-6">Para assistências individuais que estão começando.</p>
              <div className="mb-8">
                <span className="text-5xl font-bold tracking-tighter">R$ 79</span>
                <span className="text-gray-500">/mês</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['1 Técnico', 'Até 50 OS por mês', 'Links Públicos', 'Suporte por e-mail'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-white" /> {feat}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="w-full py-3 rounded-full border border-white/20 text-center font-semibold hover:bg-white/5 transition-colors">
                Começar Grátis
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-3xl bg-gradient-to-b from-blue-900/20 to-[#050505] border border-blue-500/30 p-8 flex flex-col relative shadow-[0_0_40px_rgba(59,130,246,0.1)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Recomendado
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-gray-400 text-sm mb-6">Para assistências consolidadas com fluxo alto.</p>
              <div className="mb-8">
                <span className="text-5xl font-bold tracking-tighter">R$ 149</span>
                <span className="text-gray-500">/mês</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Técnicos Ilimitados', 'OS Ilimitadas', 'Automação de WhatsApp (Evolution API)', 'Dashboards Financeiros', 'Suporte Prioritário'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-blue-400" /> {feat}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="w-full py-3 rounded-full bg-white text-black text-center font-semibold hover:bg-gray-200 transition-colors">
                Assinar Pro
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 font-bold tracking-tighter text-gray-400">
              <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                <span className="text-white text-[10px]">OS</span>
              </div>
              TechOS © 2026
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Termos</a>
              <a href="#" className="hover:text-white transition-colors">Contato</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;

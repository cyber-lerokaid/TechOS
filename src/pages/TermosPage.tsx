import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import './InstitucionalPage.css';

const TermosPage = () => {
  return (
    <div className="inst-page">
      {/* Background layers */}
      <div className="inst-bg">
        <div className="inst-bg-radial" />
        <div className="inst-bg-dots" />
      </div>

      {/* Nav */}
      <nav className="inst-nav">
        <div className="inst-nav-inner">
          <Link to="/" className="inst-nav-logo">
            <img src="/images/logo-web.png" alt="TechOS" className="inst-nav-logo-img" />
            <span className="inst-nav-logo-text">
              <span style={{ color: '#fff' }}>TECH</span>
              <span style={{ color: 'rgba(96,165,250,0.8)' }}>OS</span>
            </span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="inst-main">
        <motion.div
          className="inst-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back button */}
          <Link to="/" className="inst-back-btn">
            <ArrowLeft size={16} />
            Voltar para o início
          </Link>

          {/* Header */}
          <div className="inst-header">
            <span className="inst-eyebrow">Documentação Legal</span>
            <h1 className="inst-title">Termos de Uso</h1>
            <p className="inst-subtitle">
              Leia com atenção antes de utilizar a plataforma.
            </p>
          </div>

          {/* Notice banner */}
          <motion.div
            className="inst-notice"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <AlertCircle size={18} className="inst-notice-icon" />
            <p>
              Este projeto (<strong>TechOS</strong>) ainda está em fase inicial e tem como objetivo
              demonstrar uma aplicação SaaS funcional.
            </p>
          </motion.div>

          {/* Sections */}
          <div className="inst-sections">
            <motion.section
              className="inst-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
            >
              <h2 className="inst-card-title">Ao utilizar a plataforma, você entende que:</h2>
              <ul className="inst-list">
                <li>Algumas funcionalidades podem mudar sem aviso prévio</li>
                <li>O sistema está em evolução contínua</li>
                <li>Não há garantia de disponibilidade ou estabilidade neste momento</li>
                <li>Nenhum dado crítico deve ser armazenado sem backup próprio</li>
              </ul>
            </motion.section>

            <motion.section
              className="inst-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.45 }}
            >
              <h2 className="inst-card-title">Natureza do projeto</h2>
              <p className="inst-text">
                Este não é um produto comercial final.
              </p>
              <p className="inst-text">
                O uso neste momento é voltado para <strong>testes, validação e demonstração</strong>.
                O TechOS está sendo construído de forma transparente, com o objetivo de evoluir para
                um produto real e completo.
              </p>
            </motion.section>

            <motion.section
              className="inst-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.45 }}
            >
              <h2 className="inst-card-title">Atualizações deste documento</h2>
              <p className="inst-text">
                Estes termos poderão ser atualizados conforme o produto evolui. Recomendamos verificar
                esta página periodicamente. O uso contínuo da plataforma após alterações implica
                aceitação dos novos termos.
              </p>
            </motion.section>
          </div>

          {/* Footer CTA */}
          <motion.div
            className="inst-footer-cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            <Link to="/" className="inst-cta-btn">
              <ArrowLeft size={14} />
              Voltar para o início
            </Link>
            <Link to="/contato" className="inst-cta-ghost">
              Tem dúvidas? Entre em contato →
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default TermosPage;

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import './InstitucionalPage.css';

// Ícone LinkedIn via SVG inline (não disponível nesta versão do lucide-react)
const LinkedinIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const ContatoPage = () => {
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
            <span className="inst-eyebrow">Fale comigo</span>
            <h1 className="inst-title">Contato</h1>
            <p className="inst-subtitle">
              Este projeto foi desenvolvido de forma independente.
            </p>
          </div>

          {/* Contact card */}
          <div className="inst-sections">
            <motion.section
              className="inst-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
            >
              <div className="inst-card-icon-row">
                <MessageSquare size={20} className="inst-card-icon" />
                <h2 className="inst-card-title">Sobre o projeto</h2>
              </div>
              <p className="inst-text">
                Sinta-se à vontade para enviar <strong>feedback, sugestões ou oportunidades</strong>.
                Estou aberto a conversas sobre o produto, colaborações e oportunidades de trabalho.
              </p>
            </motion.section>

            {/* LinkedIn card */}
            <motion.a
              href="https://www.linkedin.com/in/roberth-santos-711068369"
              target="_blank"
              rel="noopener noreferrer"
              className="inst-card inst-card--linkedin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.45 }}
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <div className="inst-linkedin-inner">
                <div className="inst-linkedin-icon-wrap">
                  <LinkedinIcon />
                </div>
                <div className="inst-linkedin-text">
                  <span className="inst-linkedin-label">LinkedIn</span>
                  <span className="inst-linkedin-handle">Roberth Santos</span>
                  <span className="inst-linkedin-url">
                    linkedin.com/in/roberth-santos-711068369
                  </span>
                </div>
                <div className="inst-linkedin-arrow">→</div>
              </div>
            </motion.a>

            <motion.section
              className="inst-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.45 }}
            >
              <h2 className="inst-card-title">Tempo de resposta</h2>
              <p className="inst-text">
                Este é um projeto independente. Faço o possível para responder o mais rápido
                possível, mas não há garantia de SLA. Para questões urgentes, prefira contato direto
                pelo LinkedIn.
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
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default ContatoPage;

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, XCircle } from 'lucide-react';
import './InstitucionalPage.css';

const PrivacidadePage = () => {
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
            <span className="inst-eyebrow">Transparência</span>
            <h1 className="inst-title">Privacidade</h1>
            <p className="inst-subtitle">
              Como tratamos os dados da plataforma — sem letras miúdas.
            </p>
          </div>

          {/* Sections */}
          <div className="inst-sections">
            <motion.section
              className="inst-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
            >
              <h2 className="inst-card-title">O que utilizamos</h2>
              <p className="inst-text inst-text--top">
                Atualmente, o TechOS não coleta dados pessoais sensíveis para fins comerciais.
                Os dados utilizados na plataforma são:
              </p>
              <ul className="inst-list inst-list--check">
                <li>
                  <ShieldCheck size={16} className="inst-list-icon" />
                  Dados inseridos pelo próprio usuário durante uso da aplicação
                </li>
                <li>
                  <ShieldCheck size={16} className="inst-list-icon" />
                  Informações necessárias para funcionamento básico do sistema
                </li>
              </ul>
            </motion.section>

            <motion.section
              className="inst-card inst-card--highlight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.45 }}
            >
              <h2 className="inst-card-title">O que este projeto <em>não</em> faz</h2>
              <ul className="inst-list inst-list--cross">
                <li>
                  <XCircle size={16} className="inst-list-icon inst-list-icon--red" />
                  Venda de dados
                </li>
                <li>
                  <XCircle size={16} className="inst-list-icon inst-list-icon--red" />
                  Compartilhamento com terceiros para fins comerciais
                </li>
                <li>
                  <XCircle size={16} className="inst-list-icon inst-list-icon--red" />
                  Rastreamento ou análise comportamental para anunciantes
                </li>
              </ul>
            </motion.section>

            <motion.section
              className="inst-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.45 }}
            >
              <h2 className="inst-card-title">Recomendação importante</h2>
              <p className="inst-text">
                Por se tratar de um projeto em fase inicial, políticas mais completas poderão ser
                definidas conforme a evolução do produto.
              </p>
              <p className="inst-text">
                <strong>Recomenda-se não inserir dados sensíveis durante o uso</strong> — como
                informações financeiras pessoais, documentos ou senhas de outros serviços.
              </p>
            </motion.section>

            <motion.section
              className="inst-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.45 }}
            >
              <h2 className="inst-card-title">Infraestrutura</h2>
              <p className="inst-text">
                Os dados são armazenados via <strong>Supabase</strong> (PostgreSQL). Para mais
                informações sobre como a Supabase trata dados, consulte{' '}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inst-link"
                >
                  supabase.com/privacy
                </a>
                .
              </p>
            </motion.section>
          </div>

          {/* Footer CTA */}
          <motion.div
            className="inst-footer-cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <Link to="/" className="inst-cta-btn">
              <ArrowLeft size={14} />
              Voltar para o início
            </Link>
            <Link to="/contato" className="inst-cta-ghost">
              Ficou com dúvida? Fale comigo →
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default PrivacidadePage;

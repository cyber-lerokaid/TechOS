import { type OSStatus } from '../../data/mock-data';
import './ProgressBar.css';

interface Props {
  status: OSStatus;
}

// Ocultamos status internos (ex: em_analise, aguardando_peca) no progresso macro
const PROGRESS_STEPS = [
  { id: 'checkin', label: 'Recebido' },
  { id: 'orcamento', label: 'Orçamento' },
  { id: 'reparo', label: 'Em Reparo' },
  { id: 'pronto', label: 'Pronto' },
  { id: 'entregue', label: 'Entregue' }
];

const getMacroStepIndex = (status: OSStatus) => {
  switch (status) {
    case 'checkin': return 0;
    case 'orcamento_enviado':
    case 'orcamento_recusado':
    case 'orcamento_aprovado': return 1;
    case 'em_analise':
    case 'aguardando_peca':
    case 'em_bancada': return 2;
    case 'pronto': return 3;
    case 'entregue': return 4;
    default: return 0;
  }
};

const ProgressBar = ({ status }: Props) => {
  const currentIndex = getMacroStepIndex(status);

  return (
    <div className="progress-container">
      <div className="progress-track">
        <div 
          className="progress-fill-line" 
          style={{ width: `${(currentIndex / (PROGRESS_STEPS.length - 1)) * 100}%` }}
        />
      </div>
      
      <div className="progress-steps-wrapper">
        {PROGRESS_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={step.id} className={`progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
              <div className="step-circle">
                {isCompleted ? '✓' : ''}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;

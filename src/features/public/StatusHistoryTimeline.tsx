import { MOCK_STATUS_HISTORY } from '@/data/mock-data';
import { formatTimeAgo } from '@/lib';
import './StatusHistoryTimeline.css';

interface Props {
  osId: string;
  currentStatus: string;
}

const StatusHistoryTimeline = ({ osId }: Props) => {
  // Filtramos os históricos públicos referentes a esta OS
  const history = MOCK_STATUS_HISTORY.filter(h => h.os_id === osId && h.nota_publica);
  
  if (history.length === 0) return null;

  return (
    <div className="history-card">
      <h3>Histórico</h3>
      
      <div className="timeline">
        {history.map((item, index) => (
          <div key={item.id} className={`timeline-item ${index === history.length - 1 ? 'last' : ''}`}>
            <div className="timeline-marker">
              <div className="timeline-dot"></div>
              <div className="timeline-line"></div>
            </div>
            <div className="timeline-content">
              <p className="timeline-note">{item.nota_publica}</p>
              <span className="timeline-time">{formatTimeAgo(item.criado_em)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusHistoryTimeline;

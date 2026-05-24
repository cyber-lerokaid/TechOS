import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Laptop, Smartphone, Monitor, Tablet, Wrench, Clock } from 'lucide-react';
import { type OSStatus, type ServiceOrder, STATUS_CONFIG } from '../../data/mock-data';
import { formatTimeAgo } from '../../utils';
import { NotifyModal } from './NotifyModal';
import { Avatar } from '../ui/Avatar';
import { OsDrawer } from './OsDrawer';
import { useAuth } from '../../contexts/AuthContext';
import { fetchOrdensServico } from '../../services/osService';
import { formatBRL } from '../../data/mock-data';
import './KanbanBoard.css';

const deviceIcons: Record<string, any> = {
  notebook: Laptop,
  celular: Smartphone,
  desktop: Monitor,
  tablet: Tablet,
  outro: Wrench,
};

const kanbanColumns = [
  { id: 'em_analise', title: 'Em Análise' },
  { id: 'aguardando_peca', title: 'Aguard. Peça' },
  { id: 'em_bancada', title: 'Em Bancada' },
  { id: 'pronto', title: 'Pronto' }
];

const KanbanBoard = () => {
  const { isDemoMode } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [selectedOsId, setSelectedOsId] = useState<string | null>(null);
  const [modalData, setModalData] = useState<{ isOpen: boolean; os: ServiceOrder | null; newStatus: OSStatus | null }>({
    isOpen: false,
    os: null,
    newStatus: null
  });

  useEffect(() => {
    const loadOrders = async () => {
      const data = await fetchOrdensServico(isDemoMode);
      setOrders(data);
      setIsReady(true);
    };

    loadOrders();
    window.addEventListener('osUpdated', loadOrders);
    window.addEventListener('demoDataGenerated', loadOrders);
    return () => {
      window.removeEventListener('osUpdated', loadOrders);
      window.removeEventListener('demoDataGenerated', loadOrders);
    };
  }, [isDemoMode]);

  // ESTA FUNÇÃO É APENAS PARA DEMONSTRAÇÃO E NÃO DEVE SER EXECUTADA EM AMBIENTE DE PRODUÇÃO REAL
  const generateDemoData = () => {
    const newOrders: ServiceOrder[] = [];
    const devices = ['iPhone 15', 'Notebook Gamer Nitro 5', 'Tablet Samsung Tab S8', 'MacBook Pro M2', 'Galaxy S23 Ultra', 'PlayStation 5', 'Apple Watch Series 9', 'Monitor LG UltraGear'];
    const names = ['Ana Clara', 'Bruno Silva', 'Carlos Eduardo', 'Daniela Costa', 'Eduardo Lima', 'Fernanda Souza', 'Gabriel Oliveira', 'Helena Rocha'];
    const colunas = ['em_analise', 'aguardando_peca', 'em_bancada', 'pronto'];

    colunas.forEach(status => {
      for (let i = 0; i < 8; i++) {
        newOrders.push({
          id: `demo-${status}-${i}-${Date.now()}`,
          tenant_id: 'demo-tenant',
          numero_os: Math.floor(Math.random() * 10000).toString(),
          customer_id: `cust-${i}`,
          customer_nome: names[i % names.length] + ' ' + Math.floor(Math.random() * 100),
          device_tipo: 'celular',
          device_label: devices[i % devices.length],
          status: status as OSStatus,
          technician_id: 'tec-1',
          technician_nome: 'Técnico Demo',
          horas_abertas: Math.floor(Math.random() * 72),
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
        } as ServiceOrder);
      }
    });
    return newOrders;
  };

  useEffect(() => {
    const handleGenerate = () => {
      const newDemos = generateDemoData();
      
      if (isDemoMode) {
        // Salva as novas no sessionStorage também para refletir globalmente
        const existingString = sessionStorage.getItem('techos_demo_orders');
        const existing = existingString ? JSON.parse(existingString) : [];
        sessionStorage.setItem('techos_demo_orders', JSON.stringify([...newDemos, ...existing]));
        window.dispatchEvent(new CustomEvent('osUpdated'));
      } else {
        setOrders(prev => [...prev, ...newDemos]);
      }
    };
    window.addEventListener('generateDemoData', handleGenerate);
    return () => window.removeEventListener('generateDemoData', handleGenerate);
  }, [isDemoMode]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const draggedOrderIndex = orders.findIndex(os => os.id === draggableId);
    if (draggedOrderIndex === -1) return;

    const newOrders = [...orders];
    const draggedOrder = newOrders[draggedOrderIndex];
    
    // Removendo do array temporariamente
    newOrders.splice(draggedOrderIndex, 1);
    
    // Calculando novo index
    // Calculando novo index
    let targetIndex = 0;
    let destCount = 0;
    
    for (let i = 0; i < newOrders.length; i++) {
      if (newOrders[i].status === destination.droppableId) {
        if (destCount === destination.index) {
          targetIndex = i;
          break;
        }
        destCount++;
      }
      if (i === newOrders.length - 1) {
        targetIndex = newOrders.length;
      }
    }

    // Se mudou de coluna, atualizar e chamar Modal
    if (destination.droppableId !== source.droppableId) {
      draggedOrder.status = destination.droppableId as OSStatus;
      draggedOrder.atualizado_em = new Date().toISOString();
      draggedOrder.horas_abertas = 0; 
      
      setModalData({
        isOpen: true,
        os: draggedOrder,
        newStatus: destination.droppableId as OSStatus
      });
    }

    newOrders.splice(targetIndex, 0, draggedOrder);
    setOrders(newOrders);
  };

  const closeNotifyModal = () => {
    setModalData({ isOpen: false, os: null, newStatus: null });
  };

  const handleNotifyCustomer = () => {
    // Exibiria um Toast aqui
    closeNotifyModal();
  };

  if (!isReady) return null;

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {kanbanColumns.map(column => {
            const columnOrders = orders.filter(os => os.status === column.id);

            return (
              <div key={column.id} className="kanban-column">
                <div className="kanban-column-header">
                  <h3>{column.title}</h3>
                  <span className="kanban-column-count">{columnOrders.length}</span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`kanban-droppable pt-2 ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
                    >
                      {columnOrders.length === 0 && !snapshot.isDraggingOver && (
                        <div className="empty-state" style={{ padding: '24px 0', opacity: 0.5, border: 'none', backgroundColor: 'transparent' }}>
                          <span style={{ fontSize: '13px' }}>Nenhuma OS neste status</span>
                        </div>
                      )}
                      
                      {columnOrders.map((os, index) => {
                        const DeviceIcon = deviceIcons[os.device_tipo] || Wrench;
                        const isWarning = os.horas_abertas > 48;
                        const statusColor = STATUS_CONFIG[os.status]?.cor || 'var(--color-primary)';

                        return (
                          <Draggable key={os.id} draggableId={os.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`kanban-card ${snapshot.isDragging ? 'is-dragging' : ''} ${isWarning ? 'time-alert' : ''}`}
                                onClick={() => {
                                  if (!snapshot.isDragging) {
                                    setSelectedOsId(os.id);
                                  }
                                }}
                                style={{
                                  ...provided.draggableProps.style,
                                  '--status-color': statusColor
                                } as any}
                              >
                                {isWarning && (
                                  <span title="Sem atualização há mais de 48h">
                                    <Clock className="time-alert-icon" size={16} />
                                  </span>
                                )}
                                
                                <div className="kanban-card-header">
                                  <span className="os-number">OS #{os.numero_os}</span>
                                  <span className="os-time">
                                    <Clock size={12} />
                                    {formatTimeAgo(os.atualizado_em)}
                                  </span>
                                </div>
                                
                                <div className="customer-name">{os.customer_nome}</div>
                                
                                <div className="device-info" style={{ marginBottom: '8px' }}>
                                  <DeviceIcon className="device-icon" size={14} />
                                  <span>{os.device_label}</span>
                                </div>

                                { (os.valor_mao_obra || os.valor_pecas) && (
                                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                                    {formatBRL((os.valor_mao_obra || 0) + (os.valor_pecas || 0))}
                                  </div>
                                )}

                                <div className="kanban-card-footer">
                                  <Avatar name={os.technician_nome} size={24} />
                                  <div className="progress-bar" style={{ flex: 1, marginLeft: 8 }}>
                                    <div 
                                      className="progress-fill" 
                                      style={{ backgroundColor: statusColor, width: '100%' }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {modalData.os && modalData.newStatus && (
        <NotifyModal
          isOpen={modalData.isOpen}
          onClose={closeNotifyModal}
          onNotify={handleNotifyCustomer}
          customerName={modalData.os.customer_nome}
          device={modalData.os.device_label}
          newStatus={STATUS_CONFIG[modalData.newStatus].label}
          osId={modalData.os.id}
          os={modalData.os}
        />
      )}

      <OsDrawer 
        osId={selectedOsId} 
        onClose={() => setSelectedOsId(null)} 
      />
    </>
  );
};

export default KanbanBoard;

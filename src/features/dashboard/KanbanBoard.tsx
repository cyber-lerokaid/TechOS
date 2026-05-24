import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Laptop, Smartphone, Monitor, Tablet, Wrench, Clock } from 'lucide-react';
import { type OSStatus, type ServiceOrder, STATUS_CONFIG } from '@/data/mock-data';
import { formatTimeAgo } from '@/shared/utils';
import { NotifyModal } from './NotifyModal';
import { Avatar } from '@/shared/ui/Avatar';
import { OsDrawer } from './OsDrawer';
import { useAuth } from '@/app/providers/AuthContext';
import { fetchOrdensServico } from '@/shared/services/osService';
import { formatBRL } from '@/data/mock-data';
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

  useEffect(() => {
    const handleGenerate = () => {
      if (isDemoMode) {
        window.dispatchEvent(new CustomEvent('osUpdated'));
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
    
    newOrders.splice(draggedOrderIndex, 1);
    
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
                  <span className="kanban-column-count">
                    {columnOrders.length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`kanban-droppable ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
                    >
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
                                style={{
                                  ...provided.draggableProps.style,
                                  '--status-color': statusColor
                                } as any}
                                onClick={() => {
                                  if (!snapshot.isDragging) setSelectedOsId(os.id);
                                }}
                              >
                                {isWarning && (
                                  <span title="Sem atualização há mais de 48h" className="time-alert-icon">
                                    <Clock size={14} />
                                  </span>
                                )}
                                
                                <div className="kanban-card-header">
                                  <span className="os-number">#{os.numero_os}</span>
                                  <span className="os-time">
                                    <Clock size={11} />
                                    {formatTimeAgo(os.atualizado_em)}
                                  </span>
                                </div>
                                
                                <div className="customer-name">{os.customer_nome}</div>
                                
                                <div className="device-info">
                                  <DeviceIcon size={13} />
                                  <span>{os.device_label}</span>
                                </div>

                                { (os.valor_mao_obra || os.valor_pecas) && (
                                  <div className="os-value">
                                    {formatBRL((os.valor_mao_obra || 0) + (os.valor_pecas || 0))}
                                  </div>
                                )}

                                <div className="kanban-card-footer">
                                  <Avatar name={os.technician_nome} className="w-6 h-6 text-[10px]" />
                                  <div className="progress-bar" style={{ marginLeft: '10px' }}>
                                    <div 
                                      className="progress-fill" 
                                      style={{ backgroundColor: statusColor, width: '100%' }}
                                    />
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

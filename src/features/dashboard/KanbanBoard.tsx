import { useState, useMemo, useEffect } from 'react';
import { Laptop, Smartphone, Monitor, Tablet, Wrench, Clock } from 'lucide-react';
import { type OSStatus, type ServiceOrder, STATUS_CONFIG } from '@/data/mock-data';
import { formatTimeAgo } from '@/lib';
import { NotifyModal } from './NotifyModal';
import { Avatar } from '@/components/ui/Avatar';
import { OsDrawer } from './OsDrawer';

import { useOrderList } from '@/shared/lib/hooks/orders/useOrderList';
import { useUpdateOrderStatus } from '@/shared/lib/hooks/orders/useUpdateOrderStatus';
import { formatBRL } from '@/data/mock-data';
import { Card, CardContent } from '@/components/ui/Card';
import './KanbanBoard.css';

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

const deviceIcons: Record<string, any> = {
  notebook: Laptop,
  celular: Smartphone,
  monitor: Monitor,
  tablet: Tablet,
  outro: Wrench
};

const kanbanColumns = [
  { id: 'em_analise', title: 'Em Análise' },
  { id: 'aguardando_peca', title: 'Aguard. Peça' },
  { id: 'em_bancada', title: 'Em Bancada' },
  { id: 'pronto', title: 'Pronto' }
];

function KanbanCard({ os, isOverlay = false, onClick }: { os: ServiceOrder, isOverlay?: boolean, onClick?: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: os.id, data: { type: 'Card', os } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0.35 : 1,
    ...(isDragging && !isOverlay ? {
      border: '1px dashed rgba(37,99,235,0.4)',
      background: 'rgba(37,99,235,0.04)',
      boxShadow: 'none',
      backdropFilter: 'none',
    } : {}),
  };

  const DeviceIcon = deviceIcons[os.deviceTipo] || Wrench;
  const isWarning = os.horasAbertas > 48;
  const statusColor = STATUS_CONFIG[os.status]?.cor || 'var(--color-primary)';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (!isDragging && onClick) {
          onClick();
        }
      }}
      className={`bg-surface-3/80 backdrop-blur-md border rounded-xl p-4 flex flex-col gap-2 relative hover:bg-surface-3/90 cursor-grab ${isOverlay ? 'z-[9999] shadow-[0_20px_40px_rgba(0,0,0,0.5)] scale-105 border-blue-500/50' : 'border-white/5 hover:border-white/15'}`}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: statusColor,
        opacity: isOverlay ? 1 : 0.6,
        borderRadius: '12px 12px 0 0',
      }} />

      <div className="flex justify-between items-center">
        <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, fontFamily: 'monospace', letterSpacing: '0.03em' }}>
          #{os.numeroOs}
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', gap: 3 }}>
          <Clock size={9} />
          {formatTimeAgo(os.atualizadoEm)}
        </span>
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.88)', lineHeight: 1.3 }}>
        {os.customerNome}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>
        <DeviceIcon size={11} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {os.deviceLabel}
        </span>
      </div>

      {(os.valorMaoObra || os.valorPecas) ? (
        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(34,197,94,0.85)', letterSpacing: '-0.01em' }}>
          {formatBRL((os.valorMaoObra || 0) + (os.valorPecas || 0))}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.20)', fontStyle: 'italic' }}>
          Sem orçamento
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 2 }}>
        <Avatar name={os.customerNome} className="w-5 h-5 text-[9px]" />
        {isWarning && (
          <span style={{ fontSize: 9, color: 'rgba(245,158,11,0.8)', display: 'flex', alignItems: 'center', gap: 2, fontWeight: 600 }}>
            <Clock size={9} />
            {os.horasAbertas}h sem update
          </span>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ column, orders, onCardClick }: { column: any, orders: ServiceOrder[], onCardClick: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'Column', column }
  });

  return (
    <Card className={`border-white/5 bg-surface-2/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col max-h-[60vh] overflow-hidden transition-colors ${isOver ? 'bg-blue-500/10 border-blue-500/50' : ''}`}>
      <CardContent className="p-4 flex flex-col h-full gap-4 overflow-hidden">
        <div className="flex justify-between items-center shrink-0 mb-1">
          <h3 className="text-[13px] font-medium text-[#e6edf3]">{column.title}</h3>
          <span className="bg-white/5 text-[#9da7b3] text-[11px] px-1.5 py-0.5 rounded font-medium">
            {orders.length}
          </span>
        </div>

        <div ref={setNodeRef} className="flex-1 overflow-y-auto pr-1 space-y-3 pb-2 min-h-[100px] scrollbar-hide">
          <SortableContext items={orders.map(o => o.id)} strategy={verticalListSortingStrategy}>
            {orders.map(os => (
              <KanbanCard key={os.id} os={os} onClick={() => onCardClick(os.id)} />
            ))}
          </SortableContext>
        </div>
      </CardContent>
    </Card>
  );
}

const KanbanBoard = ({ filterMode = 'all' }: { filterMode?: 'all' | 'urgent' }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOsId, setSelectedOsId] = useState<string | null>(null);
  const [modalData, setModalData] = useState<{ isOpen: boolean; os: ServiceOrder | null; newStatus: OSStatus | null }>({
    isOpen: false,
    os: null,
    newStatus: null
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [originalStatus, setOriginalStatus] = useState<OSStatus | null>(null);

  const { data: remoteOrders } = useOrderList();
  const updateStatusMutation = useUpdateOrderStatus();

  useEffect(() => {
    if (remoteOrders) {
      if (filterMode === 'urgent') {
        setOrders(remoteOrders.filter(o => o.horasAbertas > 48 || o.status === 'aguardando_peca'));
      } else {
        setOrders(remoteOrders);
      }
    }
  }, [remoteOrders, filterMode]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const os = orders.find(o => o.id === event.active.id);
    if (os) setOriginalStatus(os.status);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Card';
    const isOverTask = over.data.current?.type === 'Card';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      setOrders(orders => {
        const activeIndex = orders.findIndex(t => t.id === activeId);
        const overIndex = orders.findIndex(t => t.id === overId);

        if (orders[activeIndex].status !== orders[overIndex].status) {
          const newOrders = [...orders];
          newOrders[activeIndex] = { ...newOrders[activeIndex], status: newOrders[overIndex].status };
          return arrayMove(newOrders, activeIndex, overIndex);
        }

        return arrayMove(orders, activeIndex, overIndex);
      });
    }

    if (isActiveTask && isOverColumn) {
      setOrders(orders => {
        const activeIndex = orders.findIndex(t => t.id === activeId);
        const newStatus = overId as OSStatus;
        if (orders[activeIndex].status !== newStatus) {
          const newOrders = [...orders];
          newOrders[activeIndex] = { ...newOrders[activeIndex], status: newStatus };
          return newOrders;
        }
        return orders;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) {
      if (originalStatus) {
        setOrders(prev => prev.map(o => o.id === active.id ? { ...o, status: originalStatus } : o));
      }
      setOriginalStatus(null);
      return;
    }

    const activeOs = orders.find(o => o.id === active.id);

    if (activeOs && originalStatus && activeOs.status !== originalStatus) {
      const newStatus = activeOs.status;
      
      setModalData({
        isOpen: true,
        os: activeOs,
        newStatus: newStatus as OSStatus
      });

      updateStatusMutation.mutateAsync({
        id: activeOs.id,
        status: newStatus,
      }).catch(e => { if (import.meta.env.DEV) console.error(e); });
    }
    setOriginalStatus(null);
  };

  const closeNotifyModal = () => {
    setModalData({ isOpen: false, os: null, newStatus: null });
  };

  const activeOsItem = useMemo(() => orders.find(o => o.id === activeId), [activeId, orders]);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex md:grid md:grid-cols-4 gap-4 h-full overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory hide-scrollbar">
          {kanbanColumns.map(column => (
            <div key={column.id} className="min-w-[285px] md:min-w-0 snap-center h-full shrink-0">
              <KanbanColumn 
                column={column} 
                orders={orders.filter(os => os.status === column.id)} 
                onCardClick={(id) => setSelectedOsId(id)}
              />
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeId && activeOsItem ? (
            <KanbanCard os={activeOsItem} isOverlay={true} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {modalData.os && modalData.newStatus && (
        <NotifyModal
          isOpen={modalData.isOpen}
          onClose={closeNotifyModal}
          onNotify={closeNotifyModal}
          customerName={modalData.os.customerNome}
          device={modalData.os.deviceLabel}
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

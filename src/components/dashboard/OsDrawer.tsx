import { useState, useEffect } from 'react';
import { X, Check, FileText, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { type ServiceOrder } from '../../data/mock-data';
import { fetchOrdensServico } from '../../services/osService';
import { Badge } from '../ui/Badge';
import { QuoteModal } from './QuoteModal';
import { formatBRL } from '../../data/mock-data';

interface OsDrawerProps {
  osId: string | null;
  onClose: () => void;
}

export const OsDrawer = ({ osId, onClose }: OsDrawerProps) => {
  const { isDemoMode } = useAuth();
  const [osData, setOsData] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  useEffect(() => {
    if (!osId) {
      setOsData(null);
      return;
    }

    const fetchOsDetails = async () => {
      setLoading(true);
      try {
        if (isDemoMode) {
          const demoOrders = await fetchOrdensServico(isDemoMode);
          const found = demoOrders.find((os: any) => os.id === osId);
          setOsData(found || null);
        } else {
          const { data, error } = await supabase
            .from('ordens_servico')
            .select('*')
            .eq('id', osId)
            .single();
            
          if (!error && data) {
            setOsData(data);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes da OS", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOsDetails();
  }, [osId, isDemoMode]);

  if (!osId) return null;

  return (
    <>
      {/* Overlay Background */}
      <div 
        className="fixed inset-0 bg-black/60 z-40 transition-opacity backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className={`fixed top-0 right-0 h-full w-[90%] md:w-[50%] lg:w-[40%] bg-zinc-950 border-l border-zinc-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col translate-x-0`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white m-0">OS #{osData?.numero_os || '...'}</h2>
            {osData && (
              <>
                <Badge variant={osData.status === 'pronto' ? 'success' : osData.status === 'em_analise' ? 'warning' : 'info'}>
                  {osData.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {(osData.valor_mao_obra || osData.valor_pecas) ? (
                  <span className="text-lg font-bold text-green-400 ml-4">
                    {formatBRL((osData.valor_mao_obra || 0) + (osData.valor_pecas || 0))}
                  </span>
                ) : null}
              </>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          {loading ? (
            <div className="text-zinc-500 text-center py-10 animate-pulse">Carregando detalhes...</div>
          ) : !osData ? (
            <div className="text-red-400 text-center py-10">Ordem de Serviço não encontrada.</div>
          ) : (
            <>
              {/* Relato do Defeito */}
              <section>
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText size={16} /> Relato do Defeito
                </h3>
                <textarea 
                  readOnly 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-zinc-300 text-sm min-h-[100px] resize-none focus:outline-none"
                  value={osData.problema_relatado || "Tela trincada após queda. Bateria também está descarregando muito rápido."}
                />
                
                {osData.garantia_dias && (
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-3">
                    <CheckCircle2 className="text-blue-400" size={20} />
                    <div>
                      <p className="text-blue-100 font-medium text-sm">Garantia Ativa</p>
                      <p className="text-blue-400/80 text-xs">{osData.garantia_dias} dias de garantia para os serviços executados.</p>
                    </div>
                  </div>
                )}
              </section>

              {/* Grid de Fotos */}
              <section>
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ImageIcon size={16} /> Registro Fotográfico
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {osData.fotos_checkin && osData.fotos_checkin.length > 0 ? (
                    osData.fotos_checkin.map((fotoStr, i) => (
                      <div 
                        key={i} 
                        className="aspect-video bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden cursor-pointer group relative"
                        onClick={() => setLightboxImg(fotoStr)}
                      >
                        <img 
                          src={fotoStr} 
                          alt={`Foto ${i}`} 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-105 duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs bg-black/80 px-2 py-1 rounded">Ampliar</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-8 text-center bg-zinc-900/50 border border-dashed border-zinc-700 rounded-lg">
                      <ImageIcon size={32} className="mx-auto text-zinc-600 mb-2" />
                      <p className="text-zinc-500 text-sm">Nenhuma foto registrada no check-in.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Checklist */}
              <section>
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Acessórios Deixados (Checklist)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {osData.checklist_itens?.map((item: any) => (
                    <div key={item.label} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-3 rounded-lg">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.marcado ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-800 text-zinc-600'}`}>
                        {item.marcado && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span className={item.marcado ? 'text-zinc-200 text-sm' : 'text-zinc-500 text-sm'}>{item.label.charAt(0).toUpperCase() + item.label.slice(1)}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Assinatura do Cliente */}
              <section>
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText size={16} /> Assinatura do Cliente
                </h3>
                {osData.assinatura_url ? (
                  <div className="bg-zinc-200 rounded-lg p-2 max-w-sm">
                    <img src={osData.assinatura_url} alt="Assinatura do Cliente" className="w-full h-auto object-contain" style={{ maxHeight: '150px' }} />
                  </div>
                ) : (
                  <div className="bg-zinc-900/50 border border-dashed border-zinc-700 rounded-lg py-6 text-center">
                    <p className="text-zinc-500 text-sm">Nenhuma assinatura registrada.</p>
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex justify-end gap-4">
          <button className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors text-sm font-medium">
            Gerar PDF da OS
          </button>
          
          {osData && osData.status === 'em_analise' && (
            <button 
              onClick={() => setIsQuoteModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white transition-colors text-sm font-medium shadow-lg shadow-green-900/20 flex items-center gap-2"
            >
              💰 Criar Orçamento
            </button>
          )}

          {osData && osData.status !== 'em_analise' && osData.status !== 'pronto' && osData.status !== 'entregue' && (
            <button className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors text-sm font-medium shadow-lg shadow-cyan-900/20">
              Alterar Status para Pronta
            </button>
          )}
        </div>
      </div>

      {isQuoteModalOpen && osData && (
        <QuoteModal 
          os={osData} 
          onClose={() => setIsQuoteModalOpen(false)} 
          onSaveQuote={(maoDeObra, pecas) => {
            // Update OS logic via context or API should be here. For demo, we just alert.
            alert(`Orçamento salvo: ${formatBRL(maoDeObra + pecas)}`);
            setIsQuoteModalOpen(false);
            window.dispatchEvent(new Event('osUpdated'));
          }}
        />
      )}

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div 
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-md"
          onClick={() => setLightboxImg(null)}
        >
          <img src={lightboxImg} alt="Zoom" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}
    </>
  );
};

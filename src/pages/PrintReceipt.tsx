import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { type ServiceOrder, MOCK_TENANT, formatBRL } from '@/data/mock-data';
import { orderApi } from '@/shared/lib/api/order.api';
import { format } from 'date-fns';

export default function PrintReceipt() {
  const { osId } = useParams<{ osId: string }>();
  const navigate = useNavigate();
  const [osData, setOsData] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOs = async () => {
      try {
        const orders = await orderApi.getOrders();
        const found = orders.find(o => o.id === osId || o.numeroOs === osId);
        setOsData(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (osId) fetchOs();
  }, [osId]);

  useEffect(() => {
    if (!loading && osData) {
      // Delay pequeno para garantir que as fontes/imagens carregaram
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, osData]);

  if (loading) return <div className="p-10 text-center">Carregando comprovante...</div>;
  if (!osData) return <div className="p-10 text-center text-red-500">OS não encontrada.</div>;

  return (
    <div className="bg-white text-black min-h-screen p-8 print:p-0 font-sans max-w-3xl mx-auto">
      {/* Botão de voltar (não aparece na impressão) */}
      <div className="mb-4 print:hidden">
        <button 
          onClick={() => navigate(-1)} 
          className="bg-zinc-800 text-white px-4 py-2 rounded"
        >
          Voltar
        </button>
        <button 
          onClick={() => window.print()} 
          className="bg-blue-600 text-white px-4 py-2 rounded ml-2"
        >
          Imprimir Novamente
        </button>
      </div>

      <div className="border-2 border-black p-6 rounded-lg print:border-none print:p-0 print:rounded-none">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold uppercase">{MOCK_TENANT.nome_loja}</h1>
            <p className="text-sm">{MOCK_TENANT.endereco}</p>
            <p className="text-sm">Telefone: {MOCK_TENANT.telefone}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">ORDEM DE SERVIÇO</h2>
            <p className="text-2xl font-black">Nº {osData.numeroOs}</p>
            <p className="text-sm">Data: {(() => {
              try {
                if (!osData.criadoEm) return 'N/A';
                const d = new Date(osData.criadoEm);
                if (isNaN(d.getTime())) return 'N/A';
                return format(d, "dd/MM/yyyy HH:mm");
              } catch {
                return 'N/A';
              }
            })()}</p>
          </div>
        </div>

        {/* Dados do Cliente */}
        <div className="border border-black rounded p-3 mb-4">
          <h3 className="font-bold border-b border-black pb-1 mb-2">DADOS DO CLIENTE</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><strong>Nome:</strong> {osData.customerNome}</p>
            <p><strong>Telefone:</strong> {osData.customerTelefone}</p>
          </div>
        </div>

        {/* Dados do Aparelho */}
        <div className="border border-black rounded p-3 mb-4">
          <h3 className="font-bold border-b border-black pb-1 mb-2">APARELHO</h3>
          <p className="text-sm"><strong>Modelo:</strong> {osData.deviceLabel} ({osData.deviceTipo})</p>
          <div className="mt-2">
            <strong>Problema Relatado:</strong>
            <p className="text-sm p-2 bg-gray-100 rounded mt-1">{osData.problemaRelatado}</p>
          </div>
          
          {osData.checklistItens && osData.checklistItens.length > 0 && (
            <div className="mt-3">
              <strong>Checklist (Itens deixados):</strong>
              <div className="flex gap-4 mt-1 text-sm">
                {osData.checklistItens.filter(i => i.marcado).map(item => (
                  <span key={item.label} className="bg-gray-200 px-2 py-1 rounded">[ X ] {item.label}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Valores */}
        {(osData.valorMaoObra || osData.valorPecas) && (
          <div className="border border-black rounded p-3 mb-4">
            <h3 className="font-bold border-b border-black pb-1 mb-2">ORÇAMENTO</h3>
            <div className="flex justify-between text-sm mb-1">
              <span>Mão de obra:</span>
              <span>{formatBRL(osData.valorMaoObra || 0)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Peças:</span>
              <span>{formatBRL(osData.valorPecas || 0)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-black">
              <span>TOTAL:</span>
              <span>{formatBRL((osData.valorMaoObra || 0) + (osData.valorPecas || 0))}</span>
            </div>
          </div>
        )}

        {/* Termos */}
        <div className="text-xs text-justify mt-8 mb-8 text-gray-700">
          <p>
            1. O cliente autoriza a abertura e análise técnica do aparelho acima descrito.<br/>
            2. Aparelhos não retirados em até 90 dias após a comunicação de conclusão serão considerados abandonados.<br/>
            3. A garantia cobre apenas os serviços descritos neste documento, perdendo a validade em caso de mau uso, quedas ou contato com líquidos.
          </p>
        </div>

        {/* Assinaturas */}
        <div className="grid grid-cols-2 gap-8 mt-16 text-center">
          <div>
            <div className="border-t border-black mx-4"></div>
            <p className="mt-2 font-bold text-sm">{MOCK_TENANT.nome_loja}</p>
            <p className="text-xs">Técnico Responsável</p>
          </div>
          <div className="flex flex-col items-center">
            {osData.assinaturaUrl ? (
              <img src={osData.assinaturaUrl} className="h-16 object-contain invert mb-1" alt="Assinatura" />
            ) : (
              <div className="h-16 mb-1"></div>
            )}
            <div className="border-t border-black w-full mx-4"></div>
            <p className="mt-2 font-bold text-sm">{osData.customerNome}</p>
            <p className="text-xs">Assinatura do Cliente</p>
          </div>
        </div>

        <div className="text-center mt-10 text-xs text-gray-500 print:block">
          <p>Acompanhe o status online: {window.location.origin}/os/{osData.numeroOs}</p>
        </div>

      </div>
    </div>
  );
}

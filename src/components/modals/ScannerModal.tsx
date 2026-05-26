import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, ScanLine, AlertCircle } from 'lucide-react';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

export const ScannerModal = ({ isOpen, onClose, onScan }: ScannerModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      return;
    }

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;
        
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Sucesso na leitura
            scanner.stop().then(() => {
              onScan(decodedText);
              onClose();
            });
          },
          (_errorMessage) => {
            // Erros de leitura ignorados (acontecem a cada frame que não acha código)
          }
        );
      } catch (err) {
        console.error("Erro ao iniciar câmera", err);
        setError("Não foi possível acessar a câmera. Verifique as permissões do seu navegador.");
      }
    };

    // Pequeno delay para garantir que a div #reader foi renderizada
    setTimeout(startScanner, 100);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
        scannerRef.current.clear();
      }
    };
  }, [isOpen, onClose, onScan]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/80 z-[100] backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-[101] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <ScanLine size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Escanear Código</h2>
              <p className="text-xs text-zinc-400">QR Code ou Código de Barras da OS</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 items-center">
          {error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center flex flex-col items-center gap-2">
              <AlertCircle size={24} />
              {error}
            </div>
          ) : (
            <div className="w-full aspect-square bg-black rounded-lg overflow-hidden relative">
              <div id="reader" className="w-full h-full"></div>
            </div>
          )}
          
          <p className="text-sm text-zinc-400 text-center">
            Posicione o código dentro da área para buscar a OS automaticamente.
          </p>
        </div>
      </div>
    </>
  );
};

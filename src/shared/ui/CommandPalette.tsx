import { useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, MonitorSmartphone, Users, Package, Settings, FileText, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/app/store/uiStore';
import { cn } from '@/shared/utils/cn';

export const CommandPalette = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const navigate = useNavigate();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setCommandPaletteOpen]);

  const runCommand = (command: () => void) => {
    setCommandPaletteOpen(false);
    command();
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex justify-center items-start pt-[15vh] p-4 animate-in fade-in duration-300 ease-out">
      <div 
        className="fixed inset-0" 
        onClick={() => setCommandPaletteOpen(false)}
      ></div>
      <div className="w-full max-w-2xl bg-surface-2/90 backdrop-blur-2xl border border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 ease-out">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none"></div>
        <Command 
          className="w-full flex flex-col h-[400px] bg-transparent relative z-10"
          shouldFilter={true}
        >
          <div className="flex items-center border-b border-white/5 px-4 bg-surface-floating/50">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <Command.Input 
              autoFocus
              placeholder="Digite um comando ou busque..." 
              className="flex-1 bg-transparent border-none outline-none py-4 px-3 text-foreground placeholder:text-muted-foreground"
            />
            <button onClick={() => setCommandPaletteOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <Command.List className="flex-1 overflow-y-auto p-2 scrollbar-thin">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado.
            </Command.Empty>

            <Command.Group heading="Navegação Rápida" className="text-[10px] font-semibold-plus tracking-widest uppercase text-muted-foreground/70 px-3 py-2">
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/dashboard'))}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium-plus cursor-pointer transition-all duration-200",
                  "text-foreground hover:bg-white/[0.03] hover:text-white aria-selected:bg-white/[0.05] aria-selected:text-white"
                )}
              >
                <MonitorSmartphone className="w-4 h-4 text-primary" /> Dashboard
                <ArrowRight className="w-3 h-3 ml-auto opacity-50" />
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/dashboard/clientes'))}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium-plus cursor-pointer transition-all duration-200",
                  "text-foreground hover:bg-white/[0.03] hover:text-white aria-selected:bg-white/[0.05] aria-selected:text-white"
                )}
              >
                <Users className="w-4 h-4 text-blue-500" /> Clientes
                <ArrowRight className="w-3 h-3 ml-auto opacity-50" />
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/dashboard/estoque'))}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium-plus cursor-pointer transition-all duration-200",
                  "text-foreground hover:bg-white/[0.03] hover:text-white aria-selected:bg-white/[0.05] aria-selected:text-white"
                )}
              >
                <Package className="w-4 h-4 text-emerald-500" /> Estoque & Vitrine
                <ArrowRight className="w-3 h-3 ml-auto opacity-50" />
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-px bg-white/5 my-2" />

            <Command.Group heading="Ações" className="text-[10px] font-semibold-plus tracking-widest uppercase text-muted-foreground/70 px-3 py-2">
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/checkin'))}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium-plus cursor-pointer transition-all duration-200",
                  "text-foreground hover:bg-white/[0.03] hover:text-white aria-selected:bg-white/[0.05] aria-selected:text-white"
                )}
              >
                <FileText className="w-4 h-4 text-amber-500" /> Nova Ordem de Serviço
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/dashboard/settings'))}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium-plus cursor-pointer transition-all duration-200",
                  "text-foreground hover:bg-white/[0.03] hover:text-white aria-selected:bg-white/[0.05] aria-selected:text-white"
                )}
              >
                <Settings className="w-4 h-4 text-slate-500" /> Configurações Gerais
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};

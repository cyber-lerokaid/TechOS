import { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { MessageSquare, Search, Send, Phone, MoreVertical, CheckCircle2, Bot } from 'lucide-react';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { cn } from '@/shared/utils/cn';
import { formatTimeAgo } from '@/shared/utils';

interface Chat {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isBotActive: boolean;
}

const mockChats: Chat[] = [
  { id: '1', name: 'João Silva', phone: '+55 11 99999-9999', lastMessage: 'Obrigado! Vou buscar amanhã.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), unread: 0, isBotActive: false },
  { id: '2', name: 'Maria Santos', phone: '+55 11 98888-8888', lastMessage: 'Qual o valor do conserto da tela?', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), unread: 2, isBotActive: true },
  { id: '3', name: 'Carlos Ferreira', phone: '+55 11 97777-7777', lastMessage: 'Perfeito, pode aprovar o orçamento.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), unread: 0, isBotActive: false },
  { id: '4', name: 'Ana Oliveira', phone: '+55 11 96666-6666', lastMessage: 'Ainda não recebi o link de pagamento.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), unread: 1, isBotActive: true },
];

export const WhatsAppPage = () => {
  const [activeChat, setActiveChat] = useState<string>('1');
  const [message, setMessage] = useState('');
  const [chats] = useState<Chat[]>(mockChats);

  const selectedChat = chats.find(c => c.id === activeChat);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    // Simulate sending message
    setMessage('');
    window.dispatchEvent(new CustomEvent('showToast', { 
      detail: { message: 'Mensagem enviada com sucesso.', type: 'success' } 
    }));
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <MessageSquare className="w-8 h-8 text-emerald-500" />
              WhatsApp Central
            </h1>
            <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Evolution API: Conectado
            </div>
          </div>
          <p className="text-muted-foreground mt-1">Gerencie as conversas com seus clientes diretamente do TechOS.</p>
        </div>

        <div className="flex flex-1 overflow-hidden bg-surface-1/80 backdrop-blur-xl border border-white/5 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
          {/* Chat List (Sidebar) */}
          <div className="w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col bg-surface-2/30 shrink-0">
            <div className="p-4 border-b border-white/5 bg-surface-floating/20">
              <Input 
                icon={<Search className="w-4 h-4" />}
                type="text" 
                placeholder="Buscar conversas..." 
                className="bg-surface-1 border-white/5 shadow-inner"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {chats.map(chat => (
                <div 
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={cn(
                    "flex items-start gap-3 p-4 cursor-pointer transition-all duration-300 ease-out border-l-2",
                    activeChat === chat.id 
                      ? "bg-white/[0.04] border-emerald-500" 
                      : "border-transparent hover:bg-white/[0.02]"
                  )}
                >
                  <div className="relative">
                    <Avatar name={chat.name} size={48} className="ring-2 ring-background" />
                    {chat.isBotActive && (
                      <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-background" title="Bot Ativo">
                        <Bot className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-semibold text-sm truncate pr-2 text-foreground">{chat.name}</h4>
                      <span className="text-[10px] text-muted-foreground shrink-0">{formatTimeAgo(chat.timestamp)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground truncate pr-2">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shrink-0">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="hidden md:flex flex-1 flex-col bg-surface-base relative">
            <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-surface-1/50 backdrop-blur-md relative z-10">
                  <div className="flex items-center gap-4">
                    <Avatar name={selectedChat.name} size={40} />
                    <div>
                      <h3 className="font-bold text-foreground text-sm leading-none">{selectedChat.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {selectedChat.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedChat.isBotActive && (
                      <Button variant="outline" size="sm" className="h-8 text-xs border-primary/50 text-primary hover:bg-primary/10">
                        <Bot className="w-3 h-3 mr-1.5" /> Assumir Conversa
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
                  {/* Mock Messages */}
                  <div className="flex flex-col gap-1 items-center mb-6">
                    <span className="text-[10px] font-semibold-plus text-muted-foreground/70 uppercase tracking-widest bg-surface-floating border border-white/5 px-3 py-1 rounded-full shadow-sm">Hoje</span>
                  </div>
                  
                  <div className="flex items-end gap-2 max-w-[80%]">
                    <Avatar name={selectedChat.name} size={28} className="shrink-0 mb-1 ring-1 ring-white/10" />
                    <div className="bg-surface-floating border border-white/5 p-3.5 rounded-2xl rounded-bl-sm shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                      <p className="text-sm text-foreground leading-relaxed">Olá, gostaria de saber se meu aparelho já está pronto.</p>
                      <span className="text-[10px] text-muted-foreground mt-1.5 block font-medium-plus">09:42</span>
                    </div>
                  </div>

                  <div className="flex items-end gap-2 max-w-[80%] self-end flex-row-reverse">
                    <div className="bg-emerald-600/90 backdrop-blur-sm text-white p-3.5 rounded-2xl rounded-br-sm shadow-[0_4px_12px_rgba(16,185,129,0.2)] border border-emerald-500/30">
                      <p className="text-sm leading-relaxed">Olá {selectedChat.name.split(' ')[0]}! Sim, o aparelho já passou pelos testes e está pronto para retirada.</p>
                      <div className="flex items-center justify-end gap-1.5 mt-1.5">
                        <span className="text-[10px] text-emerald-100/80 font-medium-plus">09:45</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white/90" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end gap-2 max-w-[80%]">
                    <Avatar name={selectedChat.name} size={28} className="shrink-0 mb-1 ring-1 ring-white/10" />
                    <div className="bg-surface-floating border border-white/5 p-3.5 rounded-2xl rounded-bl-sm shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                      <p className="text-sm text-foreground leading-relaxed">{selectedChat.lastMessage}</p>
                      <span className="text-[10px] text-muted-foreground mt-1.5 block font-medium-plus">09:46</span>
                    </div>
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-5 bg-surface-1/80 border-t border-white/5 backdrop-blur-xl relative z-10">
                  <form onSubmit={handleSendMessage} className="flex gap-3 relative max-w-4xl mx-auto">
                    <Input 
                      placeholder="Digite uma mensagem..." 
                      className="pr-14 bg-surface-base border-white/5 rounded-full shadow-inner py-6 text-sm focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/50"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="absolute right-1.5 top-1.5 bottom-1.5 h-auto rounded-full w-9 bg-emerald-500 hover:bg-emerald-600 text-white border-transparent shadow-[0_2px_10px_rgba(16,185,129,0.3)] transition-transform hover:scale-105 active:scale-95"
                      disabled={!message.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="w-16 h-16 opacity-20 mb-4" />
                <p>Selecione uma conversa para começar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WhatsAppPage;

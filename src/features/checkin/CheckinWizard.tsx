import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { DEVICE_DATA } from '@/data/device-data';
import { Search, User, Smartphone, Camera, CheckCircle, ChevronRight, X, AlertTriangle, Loader2, Laptop, Monitor, Tablet, Gamepad2, Trash2 } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from '@/lib/shared/supabase';
import { useAuth } from '@/app/providers/AuthContext';
import { notifyCheckin } from '@/lib/services/whatsappService';

import { saveOrdemServico, updateOrdemServico } from '@/lib/services/osService';
import { buscarCep, formatCep, formatPhone } from '@/lib/services/viaCepService';
import { MapPin } from 'lucide-react';
import { demoStore } from '@/shared/lib/api/providers/demo/demo-store';
import './CheckinWizard.css';

const STEPS = ['Cliente', 'Aparelho', 'Fotos', 'Assinatura', 'Confirmação'];

const DEVICE_OPTIONS = [
  { id: 'celular', label: 'Celular', icon: Smartphone, phBrand: 'Ex: Samsung, Apple', phModel: 'Ex: Galaxy A54, iPhone 15' },
  { id: 'notebook', label: 'Notebook', icon: Laptop, phBrand: 'Ex: Dell, Lenovo, Acer', phModel: 'Ex: Inspiron 15, Nitro 5' },
  { id: 'desktop', label: 'Desktop', icon: Monitor, phBrand: 'Ex: Custom, HP, Dell', phModel: 'Ex: PC Gamer, OptiPlex' },
  { id: 'tablet', label: 'Tablet', icon: Tablet, phBrand: 'Ex: Samsung, Apple', phModel: 'Ex: Tab S8, iPad Air' },
  { id: 'video_game', label: 'Video Game', icon: Gamepad2, phBrand: 'Ex: Sony, Microsoft, Nintendo', phModel: 'Ex: PlayStation 5, Xbox Series S' },
];

const CheckinWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const { isDemoMode, tenant } = useAuth();
  
  // States - Cliente
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  
  // States - Aparelho
  const [deviceType, setDeviceType] = useState('celular');
  const [deviceBrand, setDeviceBrand] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceProblem, setDeviceProblem] = useState('');
  const [checklist, setChecklist] = useState({ carregador: false, capa: false, caixa: false, memoria: false });
  
  // UI States - Combobox
  const [showBrandSugg, setShowBrandSugg] = useState(false);
  const [showModelSugg, setShowModelSugg] = useState(false);
  
  // States - Fotos
  // Usamos um array de 4 posições. Guardamos a URL para preview e o objeto File original.
  const [photos, setPhotos] = useState<Array<{ preview: string, file: File } | null>>([null, null, null, null]);
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];
  
  // States - Assinatura
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureError, setSignatureError] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [photoWarning, setPhotoWarning] = useState(false);
  
  // States - Submissão
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOs, setCreatedOs] = useState<any>(null);

  // Validation
  const validateStep = (step: number) => {
    switch(step) {
      case 0:
        return selectedCustomer !== null;
      case 1:
        return deviceBrand.trim() !== '' && deviceModel.trim() !== '' && deviceProblem.trim() !== '';
      case 2:
        return true; // Fotos não são obrigatórias, mas mostraremos warning ao tentar avançar sem elas
      case 3:
        if (!hasSignature) {
          setSignatureError(true);
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const submitServiceOrder = async () => {
    setIsSubmitting(true);
    try {
      const checklistArray = Object.entries(checklist).map(([key, value]) => ({ label: key, marcado: value }));
      
      const osNumber = createdOs?.numero_os || Math.floor(1000 + Math.random() * 9000).toString();
      
      // Upload photos to Supabase Storage or mock base64 if Demo Mode
      const validPhotos = photos.filter(p => p !== null) as { preview: string, file: File }[];
      let photoUrls: string[] = [];

      if (isDemoMode) {
        const fileToBase64 = (file: File): Promise<string> => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });
        };
        photoUrls = await Promise.all(validPhotos.map(p => fileToBase64(p.file)));
      } else {
        const uploadPhoto = async (file: File, osNum: string, index: number): Promise<string> => {
          const ext = file.name.split('.').pop() || 'jpg';
          const path = `checkin/${osNum}/foto_${index}.${ext}`;
          const { error } = await supabase.storage
            .from('os-photos')
            .upload(path, file, { upsert: true, contentType: file.type });
          if (error) throw error;
          const { data: { publicUrl } } = supabase.storage.from('os-photos').getPublicUrl(path);
          return publicUrl;
        };
        photoUrls = await Promise.all(validPhotos.map((p, i) => uploadPhoto(p.file, osNumber, i)));
      }

      // Garante a captura da assinatura no momento exato do submit
      let finalSignature = signatureData;
      if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
        finalSignature = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      }

      const newOsData = {
        tenant_id: 'tenant_001',
        customer_id: selectedCustomer.id,
        device_id: 'dev_new',
        device_tipo: deviceType as any,
        device_label: `${deviceBrand} ${deviceModel}`,
        problema_relatado: deviceProblem,
        status: 'em_analise' as any,
        checklist_itens: checklistArray,
        fotos_checkin: photoUrls,
        numero_os: osNumber,
        technician_id: 'user_001',
        technician_nome: 'Técnico Atual',
        assinatura_url: finalSignature,
        horas_abertas: 0
      };

      // Criação ou Atualização da OS
      if (createdOs && createdOs.id) {
        const data = await updateOrdemServico(createdOs.id, newOsData, isDemoMode);
        setCreatedOs(data);
      } else {
        const data = await saveOrdemServico(newOsData, isDemoMode);
        setCreatedOs(data);
      }
      
      setCurrentStep(4);
    } catch (err: any) {
      if (import.meta.env.DEV) console.error("Erro ao processar Ordem de Serviço:", err);
      alert(`Erro ao processar Ordem de Serviço: ${err.message || err.toString()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 2 && photos.every(p => p === null) && !photoWarning) {
      setPhotoWarning(true);
      return; // Segura o usuário na tela de fotos uma vez para ele ler o aviso
    }
    
    if (validateStep(currentStep)) {
      setPhotoWarning(false);
      setSignatureError(false);
      
      if (currentStep === 3) {
        submitServiceOrder(); // Dispara o insert no banco
      } else if (currentStep < STEPS.length - 1) {
        setCurrentStep(s => s + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    } else {
      navigate('/dashboard');
    }
  };

  // Funções Cliente
  const handleSearchClient = (q: string) => {
    setSearchQuery(q);
    setSelectedCustomer(null); // Limpa o selecionado ao digitar novamente
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (q.length < 3) {
      setSearchResults([]);
      return;
    }

    if (isDemoMode) {
      const found = demoStore.customers.filter(c => 
        c.nome.toLowerCase().includes(q.toLowerCase()) || 
        c.telefone.includes(q)
      );
      setSearchResults(found);
    } else {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .ilike('nome', `%${q}%`)
            .limit(5);
            
          if (!error && data) {
            setSearchResults(data);
          }
        } catch (err) {
          if (import.meta.env.DEV) console.error("Erro ao buscar cliente:", err);
        } finally {
          setIsSearching(false);
        }
      }, 300); // Debounce de 300ms
    }
  };

  const selectClient = (client: any) => {
    setSelectedCustomer(client);
    setSearchResults([]);
    setSearchQuery(client.nome);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permite letras e espaços, remove especiais, limita a 60 chars e corta espaço no início
    let val = e.target.value.replace(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]/g, '');
    if (val.startsWith(' ')) val = val.trimStart();
    setNewCustomerName(val.slice(0, 60));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setNewCustomerPhone(formatted);
    const digits = formatted.replace(/\D/g, '');
    setPhoneError(digits.length > 0 && digits.length < 11);
  };

  const handleCepChange = async (value: string) => {
    const formatted = formatCep(value);
    setCep(formatted);
    setCepError('');
    
    if (formatted.replace(/\D/g, '').length === 8) {
      setCepLoading(true);
      const result = await buscarCep(formatted);
      setCepLoading(false);
      if (result) {
        setEndereco(`${result.logradouro}, ${result.bairro} — ${result.localidade}/${result.uf}`);
      } else {
        setCepError('CEP não encontrado');
      }
    }
  };

  const createDraftOs = async (customer: any) => {
    try {
      const draftData = {
        tenant_id: 'tenant_001',
        customer_id: customer.id,
        status: 'em_analise' as any,
        numero_os: Math.floor(1000 + Math.random() * 9000).toString(),
        device_tipo: 'celular' as any,
        device_label: 'Aparelho Pendente',
        problema_relatado: 'Aguardando preenchimento...',
        horas_abertas: 0,
        checklist_itens: [],
        technician_id: 'user_001',
        technician_nome: 'Técnico Atual'
      };
      const data = await saveOrdemServico(draftData, isDemoMode);
      setCreatedOs(data);
    } catch (err) {
      if (import.meta.env.DEV) console.error("Erro ao criar OS inicial:", err);
    }
  };

  const registerNewCustomer = async () => {
    setIsCreatingCustomer(true);
    try {
      const newCustomerData = {
        tenant_id: 'default-tenant',
        nome: newCustomerName,
        telefone: newCustomerPhone,
        email: null,
        cep: cep,
        endereco: endereco,
        total_gasto: 0,
        total_os: 0
      };

      if (isDemoMode) {
        const fakeCustomer = {
          ...newCustomerData,
          id: `demo-${Date.now()}`,
          criado_em: new Date().toISOString()
        };
        demoStore.customers.push(fakeCustomer as any);
        setSelectedCustomer(fakeCustomer);
        setSearchQuery(fakeCustomer.nome);
        await createDraftOs(fakeCustomer);
      } else {
        const { data, error } = await supabase
          .from('clientes')
          .insert([newCustomerData])
          .select()
          .single();

        if (error) {
          if (import.meta.env.DEV) console.error('Erro ao cadastrar cliente:', error);
          alert('Erro ao cadastrar cliente.');
        } else if (data) {
          setSelectedCustomer(data);
          setSearchQuery(data.nome);
          await createDraftOs(data);
        }
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  // Funções Assinatura
  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      setHasSignature(true);
      setSignatureError(false);
      // Captura a assinatura como uma imagem base64
      setSignatureData(sigCanvasRef.current.getCanvas().toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    sigCanvasRef.current?.clear();
    setHasSignature(false);
    setSignatureData(null);
  };

  // Funções Fotos
  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPhotos(prev => {
        const newArr = [...prev];
        // Limpar URL anterior se existir para evitar memory leak
        if (newArr[index]?.preview) {
          URL.revokeObjectURL(newArr[index]!.preview);
        }
        newArr[index] = { preview: previewUrl, file };
        return newArr;
      });
    }
    // Reseta o input para permitir selecionar a mesma imagem se o usuário deletou e quer voltar
    if (e.target) e.target.value = '';
  };

  const removePhoto = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique acione o card (que abre o upload)
    setPhotos(prev => {
      const newArr = [...prev];
      if (newArr[index]?.preview) {
        URL.revokeObjectURL(newArr[index]!.preview);
      }
      newArr[index] = null;
      return newArr;
    });
  };

  const handleSendWhatsApp = async () => {
    if (!createdOs) return;
    setIsSubmitting(true);

    if (!isDemoMode && tenant?.whatsapp_enabled) {
      // Envio automático via API
      await notifyCheckin(
        tenant.id,
        createdOs,
        tenant.nome_loja,
        window.location.origin
      );
    }

    // Fallback sempre disponível: wa.me manual
    const message = encodeURIComponent(
      `Olá ${createdOs.customerNome}! Sua OS #${createdOs.numero_os} foi aberta. Acompanhe: ${window.location.origin}/os/${createdOs.numero_os}`
    );
    const phone = createdOs.customerTelefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
    setIsSubmitting(false);
    navigate('/dashboard/ordens');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans text-zinc-100">
      {/* Header Fixo */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button className="text-white/40 hover:text-white transition-colors" onClick={() => navigate('/dashboard')}><X size={24} /></button>
          <h2 className="text-lg font-semibold tracking-tight text-white/90">Nova Ordem de Serviço</h2>
        </div>
        <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/50">
          Rascunho
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col">
        <div className="max-w-5xl mx-auto w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 sm:p-10 flex flex-col shadow-2xl relative flex-1">
          
          {/* Stepper Moderno */}
          <div className="flex items-center justify-between relative hide-scrollbar overflow-x-auto pb-8 mb-4">
            <div className="absolute left-0 top-4 -translate-y-1/2 w-full h-[2px] bg-white/[0.04] -z-10 rounded-full"></div>
            {STEPS.map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isActive = idx === currentStep;
              return (
                <div key={step} className="flex flex-col items-center gap-3 bg-[#0a0a0a] px-4 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    isCompleted ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 
                    isActive ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 
                    'bg-white/[0.03] border border-white/10 text-white/30'
                  }`}>
                    {isCompleted ? <CheckCircle size={16} /> : idx + 1}
                  </div>
                  <span className={`text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap ${isActive ? 'text-blue-400' : isCompleted ? 'text-white/80' : 'text-white/40'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex-1 flex flex-col">
            {/* PASSO 1: CLIENTE */}
            {currentStep === 0 && (
              <div className="flex flex-col gap-8 slide-in flex-1">
                <div>
                  <h3 className="text-xl font-semibold text-white/90 mb-1">Identificação do Cliente</h3>
                  <p className="text-white/40 text-sm">Busque um cliente existente ou cadastre um novo para iniciar a OS.</p>
                </div>
                
                <div className="relative flex items-center">
                  <Search className="absolute left-4 text-white/40" size={20} />
                  <input 
                    type="text" 
                    placeholder="Busque por nome ou telefone (ex: Carlos Ferreira)" 
                    value={searchQuery}
                    onChange={(e) => handleSearchClient(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/40 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                  />
                  {isSearching && <Loader2 className="animate-spin text-white/40 absolute right-4" size={18} />}
                </div>
                
                {/* Dropdown de Resultados da Busca */}
                {!selectedCustomer && searchResults.length > 0 && (
                  <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden divide-y divide-white/5 -mt-6 z-10">
                    {searchResults.map(client => (
                      <div 
                        key={client.id} 
                        onClick={() => selectClient(client)}
                        className="p-4 hover:bg-white/[0.04] cursor-pointer transition flex justify-between items-center group"
                      >
                        <span className="font-medium text-white/80 group-hover:text-white transition-colors">{client.nome}</span>
                        <span className="text-white/40 text-sm">{client.telefone}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedCustomer ? (
                  <div className="flex items-center gap-4 p-5 rounded-2xl border border-blue-500/30 bg-blue-500/10 slide-in">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <User size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-lg leading-tight mb-1">{selectedCustomer.nome}</h4>
                      <span className="text-blue-400/80 text-sm">{selectedCustomer.telefone}</span>
                    </div>
                    <div className="hidden sm:block">
                      <span className="bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                        {selectedCustomer.total_os || 0} OS Anteriores
                      </span>
                    </div>
                  </div>
                ) : (
                  searchQuery.length > 2 && searchResults.length === 0 && !isSearching && (
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 space-y-5 slide-in">
                      <p className="text-white/60 text-sm">Cliente não encontrado. Preencha para cadastrar:</p>
                      <input 
                        type="text" 
                        placeholder="Nome Completo *" 
                        className="w-full bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/40 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors" 
                        value={newCustomerName}
                        onChange={handleNameChange}
                      />
                      <div className="relative flex flex-col gap-1">
                        <input 
                          type="text" 
                          placeholder="Telefone / WhatsApp *" 
                          className="w-full bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/40 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors" 
                          style={phoneError ? { borderColor: '#ef4444' } : {}}
                          value={newCustomerPhone}
                          onChange={handlePhoneChange}
                        />
                        {phoneError && <span className="text-red-500 text-xs ml-1">O telefone deve conter 11 dígitos.</span>}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                          CEP (opcional)
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            value={cep}
                            onChange={e => handleCepChange(e.target.value)}
                            placeholder="00000-000"
                            style={{
                              width: '100%', padding: '10px 14px',
                              background: 'rgba(255,255,255,0.04)',
                              border: `1px solid ${cepError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                              borderRadius: 10, color: 'rgba(255,255,255,0.85)',
                              fontSize: 14, fontFamily: 'inherit', outline: 'none',
                            }}
                          />
                          {cepLoading && (
                            <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                              <Loader2 size={14} style={{ color: 'rgba(255,255,255,0.3)', animation: 'spin 1s linear infinite' }} />
                            </div>
                          )}
                        </div>
                        {cepError && <span style={{ fontSize: 11, color: 'rgba(239,68,68,0.8)' }}>{cepError}</span>}
                      </div>

                      {endereco && (
                        <div style={{
                          padding: '10px 14px', borderRadius: 10,
                          background: 'rgba(34,197,94,0.06)',
                          border: '1px solid rgba(34,197,94,0.15)',
                          fontSize: 13, color: 'rgba(34,197,94,0.85)',
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                          <MapPin size={13} />
                          {endereco}
                        </div>
                      )}

                      <button 
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3.5 font-medium transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 mt-2" 
                        disabled={!newCustomerName.trim() || phoneError || newCustomerPhone.length < 14 || isCreatingCustomer}
                        onClick={registerNewCustomer}
                      >
                        {isCreatingCustomer ? <Loader2 className="animate-spin" size={18} /> : 'Cadastrar Novo Cliente'}
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {/* PASSO 2: APARELHO */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-8 slide-in flex-1">
                <div>
                  <h3 className="text-xl font-semibold text-white/90 mb-1">Detalhes do Aparelho</h3>
                  <p className="text-white/40 text-sm">Selecione o tipo e descreva o problema com o máximo de detalhes.</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {DEVICE_OPTIONS.map(option => {
                    const Icon = option.icon;
                    const isActive = deviceType === option.id;
                    return (
                      <div 
                        key={option.id} 
                        className={`flex flex-col items-center justify-center p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${isActive ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)] scale-[1.02]' : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] text-white/60 hover:text-white/90'}`}
                        onClick={() => {
                          if (deviceType !== option.id) {
                            setDeviceType(option.id);
                            setDeviceBrand('');
                            setDeviceModel('');
                          }
                        }}
                      >
                        <Icon size={32} className="mb-3" />
                        <span className="font-medium text-sm">{option.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(() => {
                    const currentOpt = DEVICE_OPTIONS.find(d => d.id === deviceType) || DEVICE_OPTIONS[0];
                    const currentCategoryData = DEVICE_DATA[deviceType];
                    const currentBrands = currentCategoryData?.marcas || [];
                    const currentModels = currentCategoryData?.modelos[deviceBrand] || [];
                    const filteredBrands = currentBrands.filter(b => b.toLowerCase().includes(deviceBrand.toLowerCase()));
                    const filteredModels = currentModels.filter(m => m.toLowerCase().includes(deviceModel.toLowerCase()));

                    return (
                      <>
                        {/* Combobox Marca */}
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder={`Marca (${currentOpt.phBrand}) *`} 
                            className="w-full bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/40 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors" 
                            value={deviceBrand} 
                            onChange={e => {
                              setDeviceBrand(e.target.value);
                              setShowBrandSugg(true);
                            }} 
                            onFocus={() => setShowBrandSugg(true)}
                            onBlur={() => setTimeout(() => setShowBrandSugg(false), 200)}
                          />
                          {showBrandSugg && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto divide-y divide-white/5">
                              {filteredBrands.length > 0 ? filteredBrands.map(b => (
                                <div 
                                  key={b} 
                                  className="p-3.5 text-zinc-300 hover:text-white hover:bg-white/[0.04] cursor-pointer text-sm transition-colors"
                                  onClick={() => {
                                    setDeviceBrand(b);
                                    setDeviceModel('');
                                    setShowBrandSugg(false);
                                  }}
                                >
                                  {b}
                                </div>
                              )) : (
                                <div className="p-3.5 text-zinc-500 text-sm italic bg-black/50">
                                  "{deviceBrand}" será registrado como nova marca.
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Combobox Modelo */}
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder={`Modelo (${currentOpt.phModel}) *`} 
                            className="w-full bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/40 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors" 
                            value={deviceModel} 
                            onChange={e => {
                              setDeviceModel(e.target.value);
                              setShowModelSugg(true);
                            }}
                            onFocus={() => setShowModelSugg(true)}
                            onBlur={() => setTimeout(() => setShowModelSugg(false), 200)}
                          />
                          {showModelSugg && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto divide-y divide-white/5">
                              {filteredModels.length > 0 ? filteredModels.map(m => (
                                <div 
                                  key={m} 
                                  className="p-3.5 text-zinc-300 hover:text-white hover:bg-white/[0.04] cursor-pointer text-sm transition-colors"
                                  onClick={() => {
                                    setDeviceModel(m);
                                    setShowModelSugg(false);
                                  }}
                                >
                                  {m}
                                </div>
                              )) : (
                                <div className="p-3.5 text-zinc-500 text-sm italic bg-black/50">
                                  {deviceModel 
                                    ? `"${deviceModel}" será registrado como modelo.` 
                                    : (currentModels.length > 0 ? 'Comece a digitar um modelo...' : 'Digite o modelo manualmente')}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
                
                <textarea 
                  placeholder="Descreva o problema relatado pelo cliente em detalhes... *" 
                  className="w-full bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/40 rounded-xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors resize-y min-h-[120px]"
                  value={deviceProblem}
                  onChange={e => setDeviceProblem(e.target.value)}
                />

                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                  <h4 className="text-white/80 font-medium text-sm mb-4">Acessórios deixados:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.keys(checklist).map(key => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-white/20 bg-black/50 accent-blue-500 cursor-pointer"
                          checked={(checklist as any)[key]} 
                          onChange={() => setChecklist(prev => ({ ...prev, [key]: !(prev as any)[key] }))}
                        />
                        <span className="text-white/60 group-hover:text-white/90 text-sm font-medium capitalize transition-colors">{key}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 3: FOTOS */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-8 slide-in flex-1">
                <div>
                  <h3 className="text-xl font-semibold text-white/90 mb-1">Registro Fotográfico</h3>
                  <p className="text-white/40 text-sm">Tire fotos do estado do aparelho antes de receber para sua segurança.</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map(i => (
                    <div 
                      key={i} 
                      className="aspect-square border-2 border-dashed border-white/10 bg-white/[0.01] hover:bg-white/[0.03] hover:border-blue-500/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden relative group"
                      onClick={() => !photos[i] && fileInputRefs[i].current?.click()}
                    >
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRefs[i]}
                        onChange={(e) => handleFileChange(i, e)}
                      />
                      {photos[i] ? (
                        <div className="w-full h-full relative">
                          <img src={photos[i]!.preview} alt={`Foto ${i+1}`} className="w-full h-full object-cover" />
                          <button 
                            className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white p-2 rounded-full hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            onClick={(e) => removePhoto(i, e)}
                            title="Remover foto"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-white/30 group-hover:text-blue-400 transition-colors">
                          <Camera size={32} />
                          <span className="text-xs font-medium uppercase tracking-wider">Adicionar</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {photoWarning && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500/90 text-sm slide-in">
                    <AlertTriangle size={20} className="shrink-0" />
                    <p>Nenhuma foto tirada. É altamente recomendado registrar o estado do aparelho. Clique em "Próximo" novamente para pular.</p>
                  </div>
                )}
              </div>
            )}

            {/* PASSO 4: ASSINATURA */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-8 slide-in flex-1">
                <div>
                  <h3 className="text-xl font-semibold text-white/90 mb-1">Assinatura do Cliente</h3>
                  <p className="text-white/40 text-sm">Peça para o cliente assinar confirmando o estado do aparelho e acessórios.</p>
                </div>
                
                <div className={`relative h-64 border rounded-2xl overflow-hidden bg-white/[0.02] transition-colors ${signatureError ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] shake' : 'border-white/[0.08]'}`}>
                  <SignatureCanvas 
                    ref={sigCanvasRef} 
                    penColor="#fff"
                    canvasProps={{ 
                      className: "w-full h-full cursor-crosshair",
                    }}
                    onEnd={handleSignatureEnd}
                  />
                  <div className="absolute bottom-6 left-8 right-8 border-b border-dashed border-white/20 pointer-events-none"></div>
                  <div className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-white/20 uppercase tracking-widest pointer-events-none">
                    Assine acima
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={clearSignature}
                  >
                    Limpar e Refazer
                  </button>
                </div>

                {signatureError && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm slide-in">
                    <AlertTriangle size={18} />
                    <span>Peça para o cliente assinar antes de continuar.</span>
                  </div>
                )}
              </div>
            )}

            {/* PASSO 5: CONFIRMAÇÃO */}
            {currentStep === 4 && (
              <div className="flex flex-col items-center justify-center gap-6 slide-in flex-1 py-8">
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <CheckCircle size={40} />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Tudo Pronto!</h3>
                  <p className="text-white/50">A Ordem de Serviço foi criada com sucesso.</p>
                </div>
                
                <div className="w-full max-w-md bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-4 mt-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-white/40 text-sm">OS Número</span>
                    <span className="text-blue-400 font-mono text-lg font-bold">#{createdOs?.numero_os || '...'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-white/40">Cliente:</span>
                    <span className="text-white/90 col-span-2 font-medium">{createdOs?.customerNome}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-white/40">Aparelho:</span>
                    <span className="text-white/90 col-span-2 font-medium">{createdOs?.device_label}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-white/40">Problema:</span>
                    <span className="text-white/90 col-span-2 font-medium">{createdOs?.problema_relatado}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER NAVEGAÇÃO FIXA */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between gap-4">
            {currentStep < 4 ? (
              <>
                <button 
                  className="px-6 py-3 rounded-xl font-medium transition-all bg-transparent border border-white/10 text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed" 
                  onClick={handleBack} 
                  disabled={isSubmitting}
                >
                  {currentStep === 0 ? 'Cancelar' : 'Voltar'}
                </button>
                <button 
                  className="px-8 py-3 rounded-xl font-medium transition-all bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
                  onClick={handleNext}
                  disabled={
                    (currentStep === 0 && !selectedCustomer) || 
                    (currentStep === 1 && (!deviceBrand || !deviceModel || !deviceProblem)) ||
                    isSubmitting
                  }
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (currentStep === 3 ? 'Finalizar OS' : 'Próximo')} 
                  {currentStep !== 3 && !isSubmitting && <ChevronRight size={18} />}
                </button>
              </>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button 
                  className="flex-1 px-6 py-3.5 rounded-xl font-medium transition-all bg-white/[0.03] border border-white/10 text-white hover:bg-white/[0.06]" 
                  onClick={() => navigate('/dashboard/ordens')}
                >
                  Ir para Ordens de Serviço
                </button>
                <button 
                  className="flex-1 px-6 py-3.5 rounded-xl font-medium transition-all bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-[0_0_20px_rgba(37,211,102,0.2)]"
                  onClick={handleSendWhatsApp}
                >
                  Abrir Link no WhatsApp
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CheckinWizard;

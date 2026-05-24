import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_CUSTOMERS } from '@/data/mock-data';
import { DEVICE_DATA } from '@/data/device-data';
import { Search, User, Smartphone, Camera, CheckCircle, ChevronRight, X, AlertTriangle, Loader2, Laptop, Monitor, Tablet, Gamepad2, Trash2 } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/app/providers/AuthContext';
import { notifyCheckin } from '@/shared/services/whatsappService';
import { formatPhoneNumber } from '@/shared/utils';
import { saveOrdemServico } from '@/shared/services/osService';
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
      
      // Convert photos to base64
      const validPhotos = photos.filter(p => p !== null) as { preview: string, file: File }[];
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      };
      const photosBase64 = await Promise.all(validPhotos.map(p => fileToBase64(p.file)));

      // Garante a captura da assinatura no momento exato do submit
      let finalSignature = signatureData;
      if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
        finalSignature = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      }

      const newOsData = {
        tenant_id: 'tenant_001',
        customer_id: selectedCustomer.id,
        customer_nome: selectedCustomer.nome,
        customer_telefone: selectedCustomer.telefone,
        device_id: 'dev_new',
        device_tipo: deviceType as any,
        device_label: `${deviceBrand} ${deviceModel}`,
        problema_relatado: deviceProblem,
        status: 'checkin' as any,
        checklist_itens: checklistArray,
        fotos_checkin: photosBase64,
        numero_os: Math.floor(1000 + Math.random() * 9000).toString(),
        technician_id: 'user_001',
        technician_nome: 'Técnico Atual',
        assinatura_url: finalSignature,
        horas_abertas: 0
      };

      // Aqui você enviaria 'newOsData' para sua API ou SupabaseOrdemServico(newOsData, isDemoMode);
      const data = await saveOrdemServico(newOsData, isDemoMode);
      setCreatedOs(data);
      setCurrentStep(4);
    } catch (err: any) {
      console.error("Erro ao criar Ordem de Serviço:", err);
      alert(`Erro ao criar Ordem de Serviço: ${err.message || err.toString()}`);
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
      const found = MOCK_CUSTOMERS.filter(c => 
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
          console.error("Erro ao buscar cliente:", err);
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
    const formatted = formatPhoneNumber(e.target.value);
    setNewCustomerPhone(formatted);
    const digits = formatted.replace(/\D/g, '');
    setPhoneError(digits.length > 0 && digits.length < 11);
  };

  const registerNewCustomer = async () => {
    setIsCreatingCustomer(true);
    try {
      const newCustomerData = {
        tenant_id: 'default-tenant',
        nome: newCustomerName,
        telefone: newCustomerPhone,
        email: null,
        total_gasto: 0,
        total_os: 0
      };

      if (isDemoMode) {
        const fakeCustomer = {
          ...newCustomerData,
          id: `demo-${Date.now()}`,
          criado_em: new Date().toISOString()
        };
        MOCK_CUSTOMERS.push(fakeCustomer as any);
        setSelectedCustomer(fakeCustomer);
        setSearchQuery(fakeCustomer.nome);
      } else {
        const { data, error } = await supabase
          .from('clientes')
          .insert([newCustomerData])
          .select()
          .single();

        if (error) {
          console.error('Erro ao cadastrar cliente:', error);
          alert('Erro ao cadastrar cliente.');
        } else if (data) {
          setSelectedCustomer(data);
          setSearchQuery(data.nome);
        }
      }
    } catch (err) {
      console.error(err);
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
      `Olá ${createdOs.customer_nome}! Sua OS #${createdOs.numero_os} foi aberta. Acompanhe: ${window.location.origin}/os/${createdOs.numero_os}`
    );
    const phone = createdOs.customer_telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
    setIsSubmitting(false);
    navigate('/dashboard/ordens');
  };

  return (
    <div className="wizard-layout">
      <div className="wizard-header">
        <button className="btn-icon" onClick={() => navigate('/dashboard')}><X size={24} /></button>
        <h2>Nova Ordem de Serviço</h2>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="wizard-progress">
        {STEPS.map((step, index) => (
          <div key={index} className={`wizard-step-indicator ${index <= currentStep ? 'active' : ''}`}>
            <div className="step-bar"></div>
            <span className="step-label">{step}</span>
          </div>
        ))}
      </div>

      <div className="wizard-content">
        {/* PASSO 1: CLIENTE */}
        {currentStep === 0 && (
          <div className="step-container slide-in">
            <h3>Identificação do Cliente</h3>
            <div className="search-box">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                placeholder="Busque por nome ou telefone (ex: Carlos Ferreira)" 
                value={searchQuery}
                onChange={(e) => handleSearchClient(e.target.value)}
                className="text-gray-900 placeholder-gray-400 bg-white opacity-100"
              />
              {isSearching && <Loader2 className="animate-spin text-muted" size={18} style={{ position: 'absolute', right: '16px' }} />}
            </div>
            
            {/* Dropdown de Resultados da Busca */}
            {!selectedCustomer && searchResults.length > 0 && (
              <div className="search-results-dropdown" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', marginTop: '8px', overflow: 'hidden' }}>
                {searchResults.map(client => (
                  <div 
                    key={client.id} 
                    onClick={() => selectClient(client)}
                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <span style={{ fontWeight: 600 }}>{client.nome}</span>
                    <span className="text-muted">{client.telefone}</span>
                  </div>
                ))}
              </div>
            )}
            
            {selectedCustomer ? (
              <div className="customer-card selected">
                <div className="customer-avatar"><User size={24} /></div>
                <div className="customer-info">
                  <h4>{selectedCustomer.nome}</h4>
                  <span>{selectedCustomer.telefone}</span>
                </div>
                <div className="customer-stats">
                  <span className="badge badge-info">{selectedCustomer.total_os || 0} OS Anteriores</span>
                </div>
              </div>
            ) : (
              searchQuery.length > 2 && searchResults.length === 0 && !isSearching && (
                <div className="new-customer-form">
                  <p className="text-muted">Cliente não encontrado. Preencha para cadastrar:</p>
                  <input 
                    type="text" 
                    placeholder="Nome Completo *" 
                    className="input-field text-gray-900 placeholder-gray-400 bg-white opacity-100" 
                    value={newCustomerName}
                    onChange={handleNameChange}
                  />
                  <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <input 
                      type="text" 
                      placeholder="Telefone / WhatsApp *" 
                      className="input-field text-gray-900 placeholder-gray-400 bg-white opacity-100" 
                      style={phoneError ? { borderColor: '#ef4444', outlineColor: '#ef4444' } : {}}
                      value={newCustomerPhone}
                      onChange={handlePhoneChange}
                    />
                    {phoneError && <span style={{ color: '#ef4444', fontSize: '12px' }}>O telefone deve conter 11 dígitos.</span>}
                  </div>
                  <button 
                    className="btn btn-outline" 
                    disabled={!newCustomerName.trim() || phoneError || newCustomerPhone.length < 14 || isCreatingCustomer}
                    onClick={registerNewCustomer}
                  >
                    {isCreatingCustomer ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Cadastrar Cliente'}
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {/* PASSO 2: APARELHO */}
        {currentStep === 1 && (
          <div className="step-container slide-in">
            <h3>Detalhes do Aparelho</h3>
            
            <div className="device-types-grid">
              {DEVICE_OPTIONS.map(option => {
                const Icon = option.icon;
                const isActive = deviceType === option.id;
                return (
                  <div 
                    key={option.id} 
                    className={`device-type-card transition-transform duration-200 hover:scale-105 ${isActive ? 'active' : ''}`}
                    style={isActive ? { borderColor: '#06b6d4', borderWidth: '2px', backgroundColor: 'rgba(6, 182, 212, 0.1)' } : {}}
                    onClick={() => {
                      if (deviceType !== option.id) {
                        setDeviceType(option.id);
                        setDeviceBrand(''); // Reset brand
                        setDeviceModel(''); // Reset model
                      }
                    }}
                  >
                    <Icon size={32} />
                    <span style={{ fontWeight: isActive ? 600 : 400 }}>{option.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="form-grid">
              {(() => {
                const currentOpt = DEVICE_OPTIONS.find(d => d.id === deviceType) || DEVICE_OPTIONS[0];
                
                // Filtros Dinâmicos baseados no tipo do aparelho (DEVICE_DATA)
                const currentCategoryData = DEVICE_DATA[deviceType];
                const currentBrands = currentCategoryData?.marcas || [];
                const currentModels = currentCategoryData?.modelos[deviceBrand] || [];

                // Filtros de Sugestão
                const filteredBrands = currentBrands.filter(b => b.toLowerCase().includes(deviceBrand.toLowerCase()));
                const filteredModels = currentModels.filter(m => m.toLowerCase().includes(deviceModel.toLowerCase()));

                return (
                  <>
                    {/* Combobox Marca */}
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder={`Marca (${currentOpt.phBrand}) *`} 
                        className="input-field text-gray-900 placeholder-gray-400 bg-white opacity-100" 
                        value={deviceBrand} 
                        onChange={e => {
                          setDeviceBrand(e.target.value);
                          setShowBrandSugg(true);
                        }} 
                        onFocus={() => setShowBrandSugg(true)}
                        onBlur={() => setTimeout(() => setShowBrandSugg(false), 200)}
                      />
                      {showBrandSugg && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-xl z-50 max-h-48 overflow-y-auto">
                          {filteredBrands.length > 0 ? filteredBrands.map(b => (
                            <div 
                              key={b} 
                              className="p-3 text-zinc-200 hover:bg-zinc-800 cursor-pointer text-sm"
                              onClick={() => {
                                setDeviceBrand(b);
                                setDeviceModel(''); // Reseta o modelo ao trocar a marca
                                setShowBrandSugg(false);
                              }}
                            >
                              {b}
                            </div>
                          )) : (
                            <div className="p-3 text-zinc-400 text-sm italic">
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
                        className="input-field text-gray-900 placeholder-gray-400 bg-white opacity-100" 
                        value={deviceModel} 
                        onChange={e => {
                          setDeviceModel(e.target.value);
                          setShowModelSugg(true);
                        }}
                        onFocus={() => setShowModelSugg(true)}
                        onBlur={() => setTimeout(() => setShowModelSugg(false), 200)}
                      />
                      {showModelSugg && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-xl z-50 max-h-48 overflow-y-auto">
                          {filteredModels.length > 0 ? filteredModels.map(m => (
                            <div 
                              key={m} 
                              className="p-3 text-zinc-200 hover:bg-zinc-800 cursor-pointer text-sm"
                              onClick={() => {
                                setDeviceModel(m);
                                setShowModelSugg(false);
                              }}
                            >
                              {m}
                            </div>
                          )) : (
                            <div className="p-3 text-zinc-400 text-sm italic">
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
              className="textarea-field text-gray-900 placeholder-gray-400 bg-white opacity-100"
              value={deviceProblem}
              onChange={e => setDeviceProblem(e.target.value)}
              rows={4}
            />

            <div className="checklist-section">
              <h4>Acessórios deixados:</h4>
              <div className="checklist-grid">
                {Object.keys(checklist).map(key => (
                  <label key={key} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={(checklist as any)[key]} 
                      onChange={() => setChecklist(prev => ({ ...prev, [key]: !(prev as any)[key] }))}
                    />
                    <span className="checkbox-text">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PASSO 3: FOTOS */}
        {currentStep === 2 && (
          <div className="step-container slide-in">
            <h3>Registro Fotográfico</h3>
            <p className="text-muted">Proteja-se. Tire fotos do estado do aparelho antes de receber.</p>
            
            <div className="photos-grid">
              {[0, 1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className="photo-slot relative" 
                  onClick={() => !photos[i] && fileInputRefs[i].current?.click()}
                  style={{ position: 'relative' }}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRefs[i]}
                    onChange={(e) => handleFileChange(i, e)}
                    style={{ display: 'none' }}
                  />
                  {photos[i] ? (
                    <div className="photo-preview w-full h-full relative group">
                      <img src={photos[i]!.preview} alt={`Foto ${i+1}`} className="w-full h-full object-cover rounded-md" />
                      <button 
                        className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        onClick={(e) => removePhoto(i, e)}
                        title="Remover foto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="photo-placeholder hover:text-cyan-500 transition-colors">
                      <Camera size={32} />
                      <span>Adicionar</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {photoWarning && (
              <div className="alert-box warning slide-in">
                <AlertTriangle size={20} />
                <span>Nenhuma foto tirada. É altamente recomendado registrar o estado do aparelho. Clique em "Próximo" novamente para pular.</span>
              </div>
            )}
          </div>
        )}

        {/* PASSO 4: ASSINATURA */}
        {currentStep === 3 && (
          <div className="step-container slide-in">
            <h3>Assinatura do Cliente</h3>
            <p className="text-muted">Peça para o cliente assinar confirmando o estado do aparelho e acessórios.</p>
            
            <div className={`signature-pad-container ${signatureError ? 'error-border' : ''}`}>
              <SignatureCanvas 
                ref={sigCanvasRef} 
                penColor="#000"
                canvasProps={{ 
                  className: "signature-canvas",
                  style: { width: '100%', height: '100%' }
                }}
                onEnd={handleSignatureEnd}
              />
              <div className="signature-baseline">Assine acima</div>
            </div>
            
            <div className="signature-actions">
              <button className="btn btn-outline" onClick={clearSignature}>Limpar e Refazer</button>
            </div>

            {signatureError && (
              <div className="alert-box danger slide-in">
                <span>Peça para o cliente assinar antes de continuar.</span>
              </div>
            )}
          </div>
        )}

        {/* PASSO 5: CONFIRMAÇÃO */}
        {currentStep === 4 && (
          <div className="step-container slide-in confirm-step">
            <div className="success-icon-large">
              <CheckCircle size={64} />
            </div>
            <h3>Tudo Pronto!</h3>
            <p>A Ordem de Serviço foi criada com sucesso.</p>
            
            <div className="summary-card">
              <p><strong>OS:</strong> #{createdOs?.numero_os || '...'}</p>
              <p><strong>Cliente:</strong> {createdOs?.customer_nome}</p>
              <p><strong>Aparelho:</strong> {createdOs?.device_label}</p>
              <p><strong>Problema:</strong> {createdOs?.problema_relatado}</p>
            </div>
          </div>
        )}

      </div>

      <div className="wizard-footer">
        {currentStep < 4 ? (
          <>
            <button className="btn btn-outline btn-lg" onClick={handleBack} disabled={isSubmitting}>
              {currentStep === 0 ? 'Cancelar' : 'Voltar'}
            </button>
            <button 
              className="btn btn-primary btn-lg" 
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
          <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
            <button className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => navigate('/dashboard/ordens')}>
              Ir para Ordens de Serviço
            </button>
            <button 
              className="btn btn-primary btn-lg" 
              style={{ flex: 1, backgroundColor: '#25D366', borderColor: '#25D366', color: '#fff' }} 
              onClick={handleSendWhatsApp}
            >
              Abrir Link no WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckinWizard;

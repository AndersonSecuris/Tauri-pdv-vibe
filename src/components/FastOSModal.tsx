import React, { useState } from 'react';
import {
  OrdemDeServico,
  Cliente,
  Aparelho,
  ConfiguracaoImpressora,
  ItemOS,
  AppTheme,
  OSConfigOptions,
} from '../types';
import { PatternLock } from './PatternLock';
import { DynamicIcon } from '../utils/iconResolver';
import {
  Smartphone,
  User,
  Wrench,
  Calendar,
  DollarSign,
  Printer,
  FileText,
  CheckCircle2,
  X,
  Search,
  Plus,
  AlertTriangle,
  Lock,
  Tag,
  Clock,
  Sparkles,
  Phone,
  Shield,
  Zap,
  ZapOff,
  BatteryWarning,
  Droplets,
  PowerOff,
  VolumeX,
  Camera,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  Radio,
  Tv,
  Cpu,
  Check,
  CircleAlert,
  HardDrive,
} from 'lucide-react';

interface FastOSModalProps {
  existingClients: Cliente[];
  existingOrders: OrdemDeServico[];
  printerConfig: ConfiguracaoImpressora;
  onSave: (newOS: OrdemDeServico, printMode?: 'CUSTOMER_RECEIPT' | 'TECH_RECEIPT' | 'WORKBENCH_STICKER') => void;
  onClose: () => void;
  theme?: AppTheme;
  osConfig?: OSConfigOptions;
  onOpenOSConfig?: () => void;
}

// Quick brand presets with icons
const POPULAR_BRANDS = [
  { id: 'b-apple', name: 'Apple', icon: 'Smartphone' },
  { id: 'b-samsung', name: 'Samsung', icon: 'Smartphone' },
  { id: 'b-motorola', name: 'Motorola', icon: 'Radio' },
  { id: 'b-xiaomi', name: 'Xiaomi', icon: 'Flame' },
  { id: 'b-realme', name: 'Realme', icon: 'Sparkles' },
  { id: 'b-lg', name: 'LG', icon: 'Tv' },
  { id: 'b-outro', name: 'Outro', icon: 'Cpu' },
];

// Model presets per brand for instant 1-tap selection
const POPULAR_MODELS: Record<string, string[]> = {
  Apple: ['iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15', 'iPhone XR', 'iPhone 8 Plus'],
  Samsung: ['Galaxy A14', 'Galaxy A34', 'Galaxy A54', 'Galaxy S21', 'Galaxy S22', 'Galaxy S23', 'Galaxy S24'],
  Motorola: ['Moto G53', 'Moto G54', 'Moto G84', 'Moto G22', 'Moto G32', 'Edge 40', 'Moto E22'],
  Xiaomi: ['Redmi Note 11', 'Redmi Note 12', 'Redmi Note 13', 'Poco X5 Pro', 'Poco X6', 'Redmi 12C'],
  Realme: ['Realme C55', 'Realme 11 Pro+', 'Realme C53', 'Realme 9'],
  LG: ['K41S', 'K51S', 'K61', 'Velvet'],
  Outro: ['Asus Zenfone', 'Infinix Hot 30', 'Positivo', 'Nokia'],
};

// Visual defect tiles with dedicated expressive icons
const VISUAL_DEFECTS = [
  {
    id: 'tela',
    title: 'Tela Quebrada',
    desc: 'Touch / Display / Linhas',
    tag: 'Tela quebrada / Touch parou',
    icon: 'Smartphone',
    color: 'text-yellow-400',
    badge: 'Frequente',
  },
  {
    id: 'carga',
    title: 'Não Carrega',
    desc: 'Conector / Mau contato',
    tag: 'Não carrega / Conector folgado',
    icon: 'ZapOff',
    color: 'text-amber-400',
    badge: 'Hardware',
  },
  {
    id: 'bateria',
    title: 'Bateria Viciada',
    desc: 'Descarrega rápido / Estufada',
    tag: 'Bateria descarrega rápido / Estufada',
    icon: 'BatteryWarning',
    color: 'text-yellow-500',
    badge: 'Consumo',
  },
  {
    id: 'agua',
    title: 'Molhou / Água',
    desc: 'Desoxidação na cuba',
    tag: 'Molhou / Caiu na água',
    icon: 'Droplets',
    color: 'text-cyan-400',
    badge: 'Urgente',
  },
  {
    id: 'nao_liga',
    title: 'Não Liga',
    desc: 'Apagado / Curto primário',
    tag: 'Não liga / Totalmente apagado',
    icon: 'PowerOff',
    color: 'text-neutral-400',
    badge: 'Placa',
  },
  {
    id: 'audio',
    title: 'Sem Áudio',
    desc: 'Alto-falante / Microfone',
    tag: 'Sem áudio / Microfone mudo',
    icon: 'VolumeX',
    color: 'text-orange-400',
    badge: 'Áudio',
  },
  {
    id: 'camera',
    title: 'Câmera Falhando',
    desc: 'Preta / Trincada / Foco',
    tag: 'Câmera não abre / Trincada',
    icon: 'Camera',
    color: 'text-purple-400',
    badge: 'Sensor',
  },
  {
    id: 'traseira',
    title: 'Vidro Traseiro',
    desc: 'Tampa traseira trincada',
    tag: 'Vidro traseiro quebrado',
    icon: 'Layers',
    color: 'text-rose-400',
    badge: 'Carcaça',
  },
  {
    id: 'loop',
    title: 'Loop Infinito',
    desc: 'Reiniciando no logo',
    tag: 'Reiniciando em loop',
    icon: 'RotateCcw',
    color: 'text-blue-400',
    badge: 'Sistema',
  },
  {
    id: 'botoes',
    title: 'Botões Travados',
    desc: 'Power / Volume emperrado',
    tag: 'Botão Power / Volume travado',
    icon: 'SlidersHorizontal',
    color: 'text-emerald-400',
    badge: 'Chaves',
  },
];

const COMMON_ACCESSORIES = [
  { id: 'acc-1', name: 'Capa protetora', icon: 'Shield' },
  { id: 'acc-2', name: 'Cabo carregador', icon: 'Zap' },
  { id: 'acc-3', name: 'Fonte de tomada', icon: 'Cpu' },
  { id: 'acc-4', name: 'Gaveta de chip presente', icon: 'HardDrive' },
  { id: 'acc-5', name: 'Película instalada', icon: 'Layers' },
  { id: 'acc-6', name: 'Nenhum acessório', icon: 'X' },
];

const COLORS = ['Preto', 'Branco', 'Azul', 'Verde', 'Dourado', 'Prata', 'Grafite', 'Vermelho', 'Roxo'];

export const FastOSModal: React.FC<FastOSModalProps> = ({
  existingClients,
  existingOrders,
  printerConfig,
  onSave,
  onClose,
  theme = 'black-yellow',
  osConfig,
  onOpenOSConfig,
}) => {
  const isDark = theme === 'black-yellow' || theme === 'dark';

  // Dynamic configuration sources from osConfig
  const brandsList = osConfig?.brands || POPULAR_BRANDS;
  const modelsMap = osConfig?.modelsByBrand || POPULAR_MODELS;
  const defectsList = osConfig?.defects || VISUAL_DEFECTS;
  const accessoriesList = osConfig?.accessories || COMMON_ACCESSORIES;
  const checklistList = osConfig?.checklistItems || [
    { id: 'chk-1', key: 'screenCracked', label: 'Tela já trincada', icon: 'AlertTriangle', dangerIfChecked: true },
    { id: 'chk-2', key: 'housingScratched', label: 'Carcaça c/ riscos', icon: 'AlertTriangle', dangerIfChecked: true },
    { id: 'chk-3', key: 'waterDamage', label: 'Indício de água', icon: 'Droplets', dangerIfChecked: true },
    { id: 'chk-4', key: 'simTrayPresent', label: 'Gaveta SIM presente', icon: 'HardDrive', dangerIfChecked: false },
    { id: 'chk-5', key: 'buttonsWorking', label: 'Botões funcionando', icon: 'SlidersHorizontal', dangerIfChecked: false },
    { id: 'chk-6', key: 'camerasWorking', label: 'Câmeras operacionais', icon: 'Camera', dangerIfChecked: false },
    { id: 'chk-7', key: 'chargesNormal', label: 'Conector de carga OK', icon: 'Zap', dangerIfChecked: false },
    { id: 'chk-8', key: 'speakerWorking', label: 'Alto-falante e microfone', icon: 'Volume2', dangerIfChecked: false },
  ];
  const colorsList = osConfig?.colors || COLORS;
  const techniciansList = osConfig?.technicians || ['Rafael Silveira (Bancada 1)'];

  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

  // New Client quick fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCpf, setClientCpf] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  // Device fields
  const [brand, setBrand] = useState(brandsList[0]?.name || 'Apple');
  const [model, setModel] = useState('');
  const [color, setColor] = useState(colorsList[0] || 'Preto');
  const [imei, setImei] = useState('');
  const [lockType, setLockType] = useState<'PIN' | 'PATTERN' | 'NONE'>('PIN');
  const [passcode, setPasscode] = useState('');
  const [patternLock, setPatternLock] = useState<number[]>([]);
  const [icloudStatus, setIcloudStatus] = useState<Aparelho['icloudStatus']>('COM_CONTA_CLIENTE');

  // Defect & Checklist
  const [reportedDefect, setReportedDefect] = useState('');
  const [initialChecklist, setInitialChecklist] = useState<Record<string, boolean>>({
    screenCracked: false,
    housingScratched: false,
    buttonsWorking: true,
    camerasWorking: true,
    chargesNormal: true,
    speakerWorking: true,
    waterDamage: false,
    simTrayPresent: true,
  });
  const [accessoriesLeft, setAccessoriesLeft] = useState<string[]>(['Gaveta de chip presente']);

  // Budget & Delivery Forecast
  const [estimatedLabor, setEstimatedLabor] = useState<number>(100);
  const [estimatedParts, setEstimatedParts] = useState<number>(0);
  const [partsDescription, setPartsDescription] = useState('');
  const [deliveryPreset, setDeliveryPreset] = useState<'HOJE' | 'AMANHA' | '48H' | 'CUSTOM'>('AMANHA');
  const [customExpectedDate, setCustomExpectedDate] = useState('');
  const [technician, setTechnician] = useState(techniciansList[0] || 'Rafael Silveira (Bancada 1)');
  const [internalNotes, setInternalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter clients
  const filteredClients = clientSearch.trim()
    ? existingClients.filter(
        (c) =>
          c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
          c.phone.includes(clientSearch) ||
          (c.cpf && c.cpf.includes(clientSearch))
      )
    : [];

  const handleSelectClient = (client: Cliente) => {
    setSelectedClient(client);
    setClientName(client.name);
    setClientPhone(client.phone);
    setClientCpf(client.cpf || '');
    setClientEmail(client.email || '');
    setClientSearch('');
  };

  const handleClearClient = () => {
    setSelectedClient(null);
    setClientName('');
    setClientPhone('');
    setClientCpf('');
    setClientEmail('');
  };

  const clientPastRepairsCount = selectedClient
    ? existingOrders.filter((o) => o.client.id === selectedClient.id || o.client.phone === selectedClient.phone).length
    : 0;

  // Toggle Defect from visual icon card
  const handleToggleDefect = (tag: string) => {
    if (reportedDefect.includes(tag)) {
      const parts = reportedDefect.split(',').map((p) => p.trim()).filter((p) => p && p !== tag);
      setReportedDefect(parts.join(', '));
    } else {
      setReportedDefect(reportedDefect ? `${reportedDefect}, ${tag}` : tag);
    }
  };

  // Toggle Accessory
  const handleToggleAccessory = (acc: string) => {
    if (accessoriesLeft.includes(acc)) {
      setAccessoriesLeft(accessoriesLeft.filter((a) => a !== acc));
    } else {
      setAccessoriesLeft([...accessoriesLeft, acc]);
    }
  };

  const calculateExpectedDate = (): string => {
    const now = new Date();
    if (deliveryPreset === 'HOJE') {
      now.setHours(18, 0, 0, 0);
      return now.toISOString();
    }
    if (deliveryPreset === 'AMANHA') {
      now.setDate(now.getDate() + 1);
      now.setHours(17, 0, 0, 0);
      return now.toISOString();
    }
    if (deliveryPreset === '48H') {
      now.setDate(now.getDate() + 2);
      now.setHours(17, 0, 0, 0);
      return now.toISOString();
    }
    return customExpectedDate || new Date(Date.now() + 86400000).toISOString();
  };

  const handleSaveOS = (printMode?: 'CUSTOMER_RECEIPT' | 'TECH_RECEIPT' | 'WORKBENCH_STICKER') => {
    if (isSubmitting) return;

    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Por favor, informe ao menos o Nome e o WhatsApp do cliente.');
      return;
    }
    if (!model.trim()) {
      alert('Por favor, informe ou selecione o modelo do celular.');
      return;
    }
    if (!reportedDefect.trim()) {
      alert('Por favor, selecione ou descreva o defeito reclamado pelo cliente.');
      return;
    }

    setIsSubmitting(true);

    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const osId = `OS-2026-${randomSeq}`;
    const trackingCode = `TRK-${Math.floor(1000 + Math.random() * 9000)}`;

    const client: Cliente = selectedClient || {
      id: `cli-${Date.now()}`,
      name: clientName.trim(),
      phone: clientPhone.trim(),
      cpf: clientCpf.trim() || undefined,
      email: clientEmail.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const device: Aparelho = {
      brand,
      model: model.trim(),
      color,
      imei: imei.trim() || undefined,
      passcode: lockType === 'PIN' ? passcode : undefined,
      patternLock: lockType === 'PATTERN' ? patternLock : [],
      icloudStatus,
    };

    const items: ItemOS[] = [];
    if (estimatedParts > 0) {
      items.push({
        id: `item-peca-${Date.now()}`,
        description: partsDescription || `Peça / Componente de Reposição (${brand} ${model})`,
        type: 'PECA',
        quantity: 1,
        unitPrice: estimatedParts,
        total: estimatedParts,
      });
    }
    if (estimatedLabor > 0) {
      items.push({
        id: `item-srv-${Date.now()}`,
        description: 'Mão de Obra Técnica Especializada e Calibração',
        type: 'SERVICO',
        quantity: 1,
        unitPrice: estimatedLabor,
        total: estimatedLabor,
      });
    }

    const totalAmount = estimatedParts + estimatedLabor;

    const newOS: OrdemDeServico = {
      id: osId,
      trackingCode,
      client,
      device,
      entryDate: new Date().toISOString(),
      expectedDate: calculateExpectedDate(),
      technician,
      reportedDefect: reportedDefect.trim(),
      initialChecklist: {
        screenCracked: !!initialChecklist.screenCracked,
        housingScratched: !!initialChecklist.housingScratched,
        buttonsWorking: initialChecklist.buttonsWorking !== undefined ? !!initialChecklist.buttonsWorking : true,
        camerasWorking: initialChecklist.camerasWorking !== undefined ? !!initialChecklist.camerasWorking : true,
        chargesNormal: initialChecklist.chargesNormal !== undefined ? !!initialChecklist.chargesNormal : true,
        speakerWorking: initialChecklist.speakerWorking !== undefined ? !!initialChecklist.speakerWorking : true,
        waterDamage: !!initialChecklist.waterDamage,
        simTrayPresent: initialChecklist.simTrayPresent !== undefined ? !!initialChecklist.simTrayPresent : true,
        ...initialChecklist,
      },
      accessoriesLeft,
      technicalDiagnosis: '',
      internalNotes,
      status: 'RECEBIDO',
      items,
      partsCost: estimatedParts,
      laborCost: estimatedLabor,
      discount: 0,
      totalAmount,
      paymentStatus: 'PENDENTE',
      amountPaid: 0,
      warrantyDays: 90,
      warrantyTerms:
        'Garantia legal de 90 dias referente ao serviço prestado e peças trocadas (Art. 26 CDC). Não cobre danos por queda ou umidade.',
      timeline: [
        {
          id: `ev-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'RECEBIDO',
          note: 'Ordem de serviço aberta na recepção com checklist e dados do aparelho.',
          author: 'Recepção / Atendente',
        },
      ],
    };

    onSave(newOS, printMode);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        className={`rounded-xl shadow-2xl border max-w-4xl w-full my-auto flex flex-col max-h-[94vh] overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#141519] text-neutral-100 border-[#2A2B33]'
            : 'bg-white text-neutral-900 border-neutral-200'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-[#191A20] border-[#2A2B33]' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-yellow-400 text-neutral-950 flex items-center justify-center font-bold shadow-[0_0_12px_rgba(250,204,21,0.25)]">
              <Smartphone className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Nova Ordem de Serviço Ágil</h2>
                <span className="text-[11px] font-mono text-neutral-950 bg-yellow-400 px-2 py-0.5 rounded font-bold">
                  Triagem Visual
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Identificação do cliente, aparelho, checklist visual e emissão de comprovante térmico.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. SEÇÃO DO CLIENTE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold">1. Identificação do Cliente</h3>
              </div>
              {selectedClient ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-yellow-400 font-semibold bg-yellow-400/10 px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-yellow-400/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Cliente Cadastrado ({clientPastRepairsCount} reparos anteriores)
                  </span>
                  <button
                    type="button"
                    onClick={handleClearClient}
                    className="text-xs text-neutral-400 hover:text-yellow-400 underline"
                  >
                    Trocar
                  </button>
                </div>
              ) : (
                <span className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Digite o WhatsApp/Nome para busca instantânea ou novo cadastro
                </span>
              )}
            </div>

            {/* Quick Search */}
            {!selectedClient && (
              <div className="relative">
                <div
                  className={`flex items-center border rounded-lg px-3 py-2 transition-colors ${
                    isDark
                      ? 'bg-[#1C1D23] border-[#2A2B33] focus-within:border-yellow-400'
                      : 'bg-neutral-50 border-neutral-300 focus-within:border-neutral-900'
                  }`}
                >
                  <Search className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Buscar cliente existente por telefone, nome ou CPF..."
                    className="w-full text-xs bg-transparent outline-none placeholder-neutral-500"
                  />
                </div>

                {filteredClients.length > 0 && (
                  <div
                    className={`absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto ${
                      isDark ? 'bg-[#1A1B20] border-[#2E3038]' : 'bg-white border-neutral-200'
                    }`}
                  >
                    {filteredClients.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectClient(c)}
                        className={`w-full px-3 py-2.5 text-left border-b last:border-b-0 text-xs transition-colors flex items-center justify-between ${
                          isDark ? 'border-[#2E3038] hover:bg-[#252630]' : 'border-neutral-100 hover:bg-neutral-50'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-white">{c.name}</span>
                          <span className="text-yellow-400 ml-2 font-mono">{c.phone}</span>
                        </div>
                        {c.cpf && <span className="text-neutral-500 font-mono">{c.cpf}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Client input fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Nome Completo *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Mendes"
                    className={`w-full text-xs px-3 py-2 border rounded-lg outline-none transition-colors ${
                      isDark
                        ? 'bg-[#1A1B20] border-[#2E3038] focus:border-yellow-400'
                        : 'bg-white border-neutral-300 focus:border-neutral-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">WhatsApp / Celular *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className={`w-full text-xs px-3 py-2 border rounded-lg outline-none font-mono transition-colors ${
                      isDark
                        ? 'bg-[#1A1B20] border-[#2E3038] focus:border-yellow-400 text-yellow-400 font-bold'
                        : 'bg-white border-neutral-300 focus:border-neutral-900'
                    }`}
                  />
                  <Phone className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">CPF (Para Recibo / Nota)</label>
                <input
                  type="text"
                  value={clientCpf}
                  onChange={(e) => setClientCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className={`w-full text-xs px-3 py-2 border rounded-lg outline-none font-mono transition-colors ${
                    isDark
                      ? 'bg-[#1A1B20] border-[#2E3038] focus:border-yellow-400'
                      : 'bg-white border-neutral-300 focus:border-neutral-900'
                  }`}
                />
              </div>
            </div>
          </div>

          <hr className={isDark ? 'border-[#27282F]' : 'border-neutral-200'} />

          {/* 2. SEÇÃO DO APARELHO & SENHA */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold">2. Aparelho, Marca & Senha de Bancada</h3>
            </div>

            {/* Brand Quick Pills with Icons */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-neutral-400">Marca do Aparelho:</div>
                {onOpenOSConfig && (
                  <button
                    type="button"
                    onClick={onOpenOSConfig}
                    className="text-[11px] text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-semibold"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Gerenciar Marcas & Modelos</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {brandsList.map((b) => {
                  const isSelected = brand === b.name;
                  return (
                    <button
                      key={b.id || b.name}
                      type="button"
                      onClick={() => {
                        setBrand(b.name);
                        setModel('');
                      }}
                      className={`p-2 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                          : isDark
                          ? 'bg-[#1B1C22] text-neutral-300 border-[#2A2B33] hover:border-yellow-400/40 hover:text-white'
                          : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                      }`}
                    >
                      <DynamicIcon name={b.icon} className="w-4 h-4" />
                      <span>{b.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Popular models quick buttons */}
            {modelsMap[brand] && modelsMap[brand].length > 0 && (
              <div
                className={`p-3 rounded-lg border space-y-1.5 ${
                  isDark ? 'bg-[#181920] border-[#2A2B33]' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-yellow-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Modelos Frequentes ({brand}):</span>
                  </div>
                  {onOpenOSConfig && (
                    <button
                      type="button"
                      onClick={onOpenOSConfig}
                      className="text-[10px] text-neutral-400 hover:text-yellow-400 flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>Configurar Modelos</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {modelsMap[brand].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModel(m)}
                      className={`px-2.5 py-1 text-xs rounded transition-all font-medium ${
                        model === m
                          ? 'bg-yellow-400 text-neutral-950 font-bold shadow-xs'
                          : isDark
                          ? 'bg-[#22242D] text-neutral-300 hover:text-white hover:bg-[#2C2E3A] border border-[#323440]'
                          : 'bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Device Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Modelo do Aparelho *</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Ex: iPhone 13 / Galaxy A14"
                  className={`w-full text-xs px-3 py-2 border rounded-lg outline-none font-semibold ${
                    isDark
                      ? 'bg-[#1A1B20] border-[#2E3038] focus:border-yellow-400 text-white'
                      : 'bg-white border-neutral-300 focus:border-neutral-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Cor do Aparelho</label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className={`w-full text-xs px-2.5 py-2 border rounded-lg outline-none ${
                    isDark ? 'bg-[#1A1B20] border-[#2E3038] text-white' : 'bg-white border-neutral-300'
                  }`}
                >
                  {colorsList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">IMEI / Número de Série</label>
                <input
                  type="text"
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  placeholder="15 dígitos (*#06#)"
                  className={`w-full text-xs px-3 py-2 border rounded-lg outline-none font-mono ${
                    isDark
                      ? 'bg-[#1A1B20] border-[#2E3038] focus:border-yellow-400 text-yellow-400'
                      : 'bg-white border-neutral-300 focus:border-neutral-900'
                  }`}
                />
              </div>
            </div>

            {/* Security / Password / Unlock Drawer with visual selection */}
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                isDark ? 'bg-[#191A20] border-[#2A2B33]' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-bold">Bloqueio & Senha para Testes</span>
                </div>

                {/* Lock Type Selector with Icons */}
                <div className="flex items-center gap-1 bg-[#0F1013] p-1 rounded-lg border border-[#27282F] text-xs">
                  <button
                    type="button"
                    onClick={() => setLockType('PIN')}
                    className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 font-semibold ${
                      lockType === 'PIN'
                        ? 'bg-yellow-400 text-neutral-950 shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>PIN / Senha</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLockType('PATTERN')}
                    className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 font-semibold ${
                      lockType === 'PATTERN'
                        ? 'bg-yellow-400 text-neutral-950 shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Desenho 3x3</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLockType('NONE')}
                    className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 font-semibold ${
                      lockType === 'NONE'
                        ? 'bg-yellow-400 text-neutral-950 shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <X className="w-3 h-3" />
                    <span>Sem Senha</span>
                  </button>
                </div>
              </div>

              {lockType === 'PIN' && (
                <div className="max-w-xs">
                  <input
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Digite a Senha / PIN do cliente"
                    className={`w-full text-xs px-3 py-2 border rounded-lg outline-none font-mono text-center tracking-widest text-sm font-bold ${
                      isDark
                        ? 'bg-[#101114] border-yellow-400/40 text-yellow-400'
                        : 'bg-white border-neutral-300 text-neutral-900'
                    }`}
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Necessário para testar touch, áudio, câmeras e consumo de bateria.
                  </p>
                </div>
              )}

              {lockType === 'PATTERN' && (
                <div className="flex flex-col sm:flex-row items-center gap-6 py-1">
                  <PatternLock pattern={patternLock} onChange={setPatternLock} size={170} />
                  <div className="text-xs space-y-1.5 max-w-sm">
                    <p className="font-bold text-white flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Desenhe o Padrão Android na Grade:</span>
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Conecte os círculos na ordem de desbloqueio do cliente.
                    </p>
                    {patternLock.length > 0 && (
                      <div className="font-mono text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-3 py-1.5 rounded-lg inline-block font-bold">
                        Sequência: {patternLock.map((p) => p + 1).join(' → ')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {lockType === 'NONE' && (
                <p className="text-xs text-neutral-400 italic">
                  Aparelho sem senha de tela ou restaurado de fábrica.
                </p>
              )}

              <div className="pt-2 border-t border-[#27282F] flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-neutral-400">Conta Google / iCloud:</span>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="icloud"
                      checked={icloudStatus === 'COM_CONTA_CLIENTE'}
                      onChange={() => setIcloudStatus('COM_CONTA_CLIENTE')}
                      className="accent-yellow-400"
                    />
                    <span>Com Conta (Cliente ciente da senha)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="icloud"
                      checked={icloudStatus === 'SEM_CONTA'}
                      onChange={() => setIcloudStatus('SEM_CONTA')}
                      className="accent-yellow-400"
                    />
                    <span>Sem Conta / Removida</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <hr className={isDark ? 'border-[#27282F]' : 'border-neutral-200'} />

          {/* 3. DEFEITO RECLAMADO COM CARDS VISUAIS DE ÍCONES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold">3. Defeito Reclamado (Seleção por Ícones)</h3>
              </div>
              {onOpenOSConfig && (
                <button
                  type="button"
                  onClick={onOpenOSConfig}
                  className="text-[11px] text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-semibold"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Gerenciar Defeitos</span>
                </button>
              )}
            </div>

            {/* VISUAL DEFECT ICON CARDS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {defectsList.map((defect) => {
                const isSelected = reportedDefect.includes(defect.tag);

                return (
                  <button
                    key={defect.id || defect.title}
                    type="button"
                    onClick={() => handleToggleDefect(defect.tag)}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between group active:scale-95 ${
                      isSelected
                        ? 'bg-yellow-400/15 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)] ring-1 ring-yellow-400'
                        : isDark
                        ? 'bg-[#1B1C22] border-[#2A2B33] hover:border-yellow-400/50 hover:bg-[#22242C]'
                        : 'bg-white border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-yellow-400 text-neutral-950 font-bold'
                            : isDark
                            ? 'bg-[#262730] text-yellow-400 group-hover:bg-[#2E303C]'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        <DynamicIcon name={defect.icon} className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-yellow-400 text-neutral-950 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5">
                      <div className="text-xs font-bold leading-tight line-clamp-1">
                        {defect.title}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                        {defect.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Detailed text area */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                Descrição Detalhada do Defeito *
              </label>
              <textarea
                rows={2}
                required
                value={reportedDefect}
                onChange={(e) => setReportedDefect(e.target.value)}
                placeholder="Ex: Caiu no chão, vidro trincado, touch falha na parte superior..."
                className={`w-full text-xs px-3 py-2 border rounded-lg outline-none font-sans ${
                  isDark
                    ? 'bg-[#1A1B20] border-[#2E3038] focus:border-yellow-400 text-white'
                    : 'bg-white border-neutral-300 focus:border-neutral-900'
                }`}
              />
            </div>

            {/* Visual Physical Checklist with Icon Indicators */}
            <div
              className={`p-4 rounded-xl border space-y-2.5 ${
                isDark ? 'bg-[#191A20] border-[#2A2B33]' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-yellow-400" />
                  <span>Checklist Físico Visual de Recepção</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-400">Proteção contra divergências</span>
                  {onOpenOSConfig && (
                    <button
                      type="button"
                      onClick={onOpenOSConfig}
                      className="text-[10px] text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-semibold"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>Gerenciar Itens</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {checklistList.map((chk) => {
                  const isChecked = !!initialChecklist[chk.key];
                  return (
                    <button
                      key={chk.id || chk.key}
                      type="button"
                      onClick={() =>
                        setInitialChecklist({
                          ...initialChecklist,
                          [chk.key]: !isChecked,
                        })
                      }
                      className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                        isChecked
                          ? chk.dangerIfChecked
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : isDark
                          ? 'bg-[#131418] border-[#2A2B33] text-neutral-300'
                          : 'bg-white border-neutral-200'
                      }`}
                    >
                      <span className="truncate pr-1">{chk.label}</span>
                      {isChecked ? (
                        <DynamicIcon
                          name={chk.icon || (chk.dangerIfChecked ? 'AlertTriangle' : 'CheckCircle2')}
                          className={`w-4 h-4 shrink-0 ${chk.dangerIfChecked ? 'text-amber-400' : 'text-emerald-400'}`}
                        />
                      ) : (
                        <Check className="w-4 h-4 text-neutral-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accessories Left with visual icons */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs font-semibold flex items-center gap-1.5 text-neutral-400">
                  <HardDrive className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Acessórios Deixados com o Aparelho:</span>
                </div>
                {onOpenOSConfig && (
                  <button
                    type="button"
                    onClick={onOpenOSConfig}
                    className="text-[10px] text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Gerenciar Acessórios</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {accessoriesList.map((acc) => {
                  const isChecked = accessoriesLeft.includes(acc.name);

                  return (
                    <button
                      key={acc.id || acc.name}
                      type="button"
                      onClick={() => handleToggleAccessory(acc.name)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-medium border ${
                        isChecked
                          ? 'bg-yellow-400 text-neutral-950 border-yellow-400 font-bold shadow-xs'
                          : isDark
                          ? 'bg-[#1D1E24] text-neutral-400 border-[#2A2B33] hover:text-white'
                          : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      <DynamicIcon name={acc.icon} className="w-3.5 h-3.5" />
                      <span>{acc.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <hr className={isDark ? 'border-[#27282F]' : 'border-neutral-200'} />

          {/* 4. PREVISÃO DE ENTREGA & ORÇAMENTO COM ÍCONES */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold">4. Prazo & Orçamento Preliminar</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Delivery Preset with expressive icons */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">Previsão de Conclusão</label>
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryPreset('HOJE')}
                    className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                      deliveryPreset === 'HOJE'
                        ? 'bg-yellow-400 text-neutral-950 border-yellow-400 font-bold shadow-xs'
                        : isDark
                        ? 'bg-[#1A1B20] border-[#2E3038] text-neutral-400 hover:text-white'
                        : 'bg-white border-neutral-300'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Hoje 18h</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryPreset('AMANHA')}
                    className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                      deliveryPreset === 'AMANHA'
                        ? 'bg-yellow-400 text-neutral-950 border-yellow-400 font-bold shadow-xs'
                        : isDark
                        ? 'bg-[#1A1B20] border-[#2E3038] text-neutral-400 hover:text-white'
                        : 'bg-white border-neutral-300'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Amanhã 17h</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryPreset('48H')}
                    className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                      deliveryPreset === '48H'
                        ? 'bg-yellow-400 text-neutral-950 border-yellow-400 font-bold shadow-xs'
                        : isDark
                        ? 'bg-[#1A1B20] border-[#2E3038] text-neutral-400 hover:text-white'
                        : 'bg-white border-neutral-300'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[11px]">48 Horas</span>
                  </button>
                </div>
                <select
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className={`w-full text-xs px-2.5 py-2 border rounded-lg outline-none ${
                    isDark ? 'bg-[#1A1B20] border-[#2E3038] text-white' : 'bg-white border-neutral-300'
                  }`}
                >
                  {techniciansList.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estimated Costs */}
              <div>
                <label className="block text-xs font-semibold mb-1">Estimativa de Peça (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={estimatedParts}
                  onChange={(e) => setEstimatedParts(Number(e.target.value))}
                  placeholder="0,00"
                  className={`w-full text-xs px-3 py-2 border rounded-lg font-mono outline-none ${
                    isDark
                      ? 'bg-[#1A1B20] border-[#2E3038] focus:border-yellow-400 text-white'
                      : 'bg-white border-neutral-300'
                  }`}
                />
                <input
                  type="text"
                  value={partsDescription}
                  onChange={(e) => setPartsDescription(e.target.value)}
                  placeholder="Descrição da peça (opcional)"
                  className={`w-full text-[11px] px-2 py-1.5 mt-1.5 border rounded outline-none ${
                    isDark ? 'bg-[#17181E] border-[#2A2B33] text-neutral-300' : 'bg-neutral-50 border-neutral-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Mão de Obra Técnica (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={estimatedLabor}
                  onChange={(e) => setEstimatedLabor(Number(e.target.value))}
                  placeholder="100,00"
                  className={`w-full text-xs px-3 py-2 border rounded-lg font-mono outline-none ${
                    isDark
                      ? 'bg-[#1A1B20] border-[#2E3038] focus:border-yellow-400 text-white'
                      : 'bg-white border-neutral-300'
                  }`}
                />
                <div className="mt-3 text-right">
                  <span className="text-xs text-neutral-400 mr-2">Total Estimado:</span>
                  <span className="text-lg font-extrabold font-mono text-yellow-400">
                    {(estimatedParts + estimatedLabor).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions with high-contrast Yellow CTA */}
        <div
          className={`px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3 ${
            isDark ? 'bg-[#191A20] border-[#2A2B33]' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold transition-colors ${
              isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Cancelar
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSaveOS()}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                isDark
                  ? 'bg-[#22242D] border-[#323440] text-neutral-300 hover:text-white hover:bg-[#2A2C38]'
                  : 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              Apenas Salvar OS
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSaveOS('WORKBENCH_STICKER')}
              className={`px-3.5 py-2 text-xs font-bold text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 rounded-lg transition-colors flex items-center gap-1.5 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Etiqueta Bancada</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSaveOS('TECH_RECEIPT')}
              className={`px-3.5 py-2 text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 rounded-lg transition-colors flex items-center gap-1.5 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Imprimir O.S. reduzida com dados essenciais para os técnicos na bancada"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Salvar + O.S. Técnico</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSaveOS('CUSTOMER_RECEIPT')}
              className={`px-4 py-2.5 text-xs font-black text-neutral-950 bg-yellow-400 hover:bg-yellow-300 rounded-lg transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(250,204,21,0.3)] active:scale-95 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar + Via Cliente'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

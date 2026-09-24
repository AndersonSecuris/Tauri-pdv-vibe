import React, { useState, useId } from 'react';
import { OrdemDeServico, Cliente, Aparelho, ConfiguracaoImpressora, ItemOS } from '../types';
import { PatternLock } from './PatternLock';
import {
  Smartphone,
  User,
  Wrench,
  Calendar,
  DollarSign,
  Printer,
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
} from 'lucide-react';

interface FastOSModalProps {
  existingClients: Cliente[];
  existingOrders: OrdemDeServico[];
  printerConfig: ConfiguracaoImpressora;
  onSave: (newOS: OrdemDeServico, printMode?: 'CUSTOMER_RECEIPT' | 'WORKBENCH_STICKER') => void;
  onClose: () => void;
}

// Quick brand presets
const POPULAR_BRANDS = ['Apple', 'Samsung', 'Motorola', 'Xiaomi', 'Realme', 'LG', 'Outro'];

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

// Common defect tags for 1-click triage
const COMMON_DEFECTS = [
  'Tela quebrada / Touch parou',
  'Não carrega / Conector folgado',
  'Bateria descarrega rápido / Estufada',
  'Molhou / Caiu na água',
  'Não liga / Totalmente apagado',
  'Sem áudio / Microfone mudo',
  'Câmera não abre / Trincada',
  'Vidro traseiro quebrado',
  'Reiniciando em loop',
  'Botão Power / Volume travado',
];

const COMMON_ACCESSORIES = [
  'Capa protetora',
  'Cabo carregador',
  'Fonte de tomada',
  'Gaveta de chip presente',
  'Película instalada',
  'Nenhum acessório',
];

const COLORS = ['Preto', 'Branco', 'Azul', 'Verde', 'Dourado', 'Prata', 'Grafite', 'Vermelho', 'Roxo'];

export const FastOSModal: React.FC<FastOSModalProps> = ({
  existingClients,
  existingOrders,
  printerConfig,
  onSave,
  onClose,
}) => {
  // Step navigation or unified fast scroll
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

  // New Client quick fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCpf, setClientCpf] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  // Device fields
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('Preto');
  const [imei, setImei] = useState('');
  const [lockType, setLockType] = useState<'PIN' | 'PATTERN' | 'NONE'>('PIN');
  const [passcode, setPasscode] = useState('');
  const [patternLock, setPatternLock] = useState<number[]>([]);
  const [icloudStatus, setIcloudStatus] = useState<Aparelho['icloudStatus']>('COM_CONTA_CLIENTE');

  // Defect & Checklist
  const [reportedDefect, setReportedDefect] = useState('');
  const [initialChecklist, setInitialChecklist] = useState({
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
  const [technician, setTechnician] = useState('Rafael Silveira (Bancada 1)');
  const [internalNotes, setInternalNotes] = useState('');

  // Client search filter
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

  // Check if client has past repairs
  const clientPastRepairsCount = selectedClient
    ? existingOrders.filter((o) => o.client.id === selectedClient.id || o.client.phone === selectedClient.phone).length
    : 0;

  // Quick defect adder
  const handleToggleDefectTag = (tag: string) => {
    if (reportedDefect.includes(tag)) {
      setReportedDefect(reportedDefect.replace(tag, '').replace(/,\s*,/g, ',').trim());
    } else {
      setReportedDefect(reportedDefect ? `${reportedDefect}, ${tag}` : tag);
    }
  };

  // Quick accessory toggle
  const handleToggleAccessory = (acc: string) => {
    if (accessoriesLeft.includes(acc)) {
      setAccessoriesLeft(accessoriesLeft.filter((a) => a !== acc));
    } else {
      setAccessoriesLeft([...accessoriesLeft, acc]);
    }
  };

  // Calculate delivery date based on preset
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

  const handleSaveOS = (printMode?: 'CUSTOMER_RECEIPT' | 'WORKBENCH_STICKER') => {
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Por favor, informe ao menos o Nome e o WhatsApp do cliente.');
      return;
    }
    if (!model.trim()) {
      alert('Por favor, informe ou selecione o modelo do celular.');
      return;
    }
    if (!reportedDefect.trim()) {
      alert('Por favor, informe o defeito reclamado pelo cliente.');
      return;
    }

    // Auto-generate OS sequential number
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
      initialChecklist,
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 max-w-4xl w-full my-auto flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-neutral-900">
                  Nova Ordem de Serviço Ágil
                </h2>
                <span className="text-[11px] font-mono text-neutral-500 bg-neutral-200/70 px-1.5 py-0.5 rounded">
                  Triagem Rápida
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Coleta intuitiva de dados do cliente, aparelho, checklist e emissão de comprovante térmico.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
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
                <User className="w-4 h-4 text-neutral-700" />
                <h3 className="text-sm font-semibold text-neutral-900">
                  1. Identificação do Cliente
                </h3>
              </div>
              {selectedClient ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Cliente Cadastrado ({clientPastRepairsCount} reparos anteriores)
                  </span>
                  <button
                    type="button"
                    onClick={handleClearClient}
                    className="text-xs text-neutral-500 hover:text-neutral-900 underline"
                  >
                    Trocar
                  </button>
                </div>
              ) : (
                <span className="text-xs text-neutral-500">
                  Busque pelo telefone/nome ou digite abaixo para cadastrar na hora
                </span>
              )}
            </div>

            {/* Quick Search existing clients */}
            {!selectedClient && (
              <div className="relative">
                <div className="flex items-center border border-neutral-300 rounded-lg px-3 py-1.5 bg-neutral-50 focus-within:bg-white focus-within:border-neutral-900 transition-colors">
                  <Search className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Buscar cliente existente por telefone, nome ou CPF..."
                    className="w-full text-xs bg-transparent outline-none text-neutral-800 placeholder-neutral-400"
                  />
                </div>

                {filteredClients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                    {filteredClients.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectClient(c)}
                        className="w-full px-3 py-2 text-left hover:bg-neutral-50 flex items-center justify-between border-b border-neutral-100 last:border-b-0 text-xs transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-neutral-900">{c.name}</span>
                          <span className="text-neutral-500 ml-2 font-mono">{c.phone}</span>
                        </div>
                        {c.cpf && <span className="text-neutral-400 font-mono">{c.cpf}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Client input fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Mendes"
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  WhatsApp / Celular *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  CPF (Opcional para recibo)
                </label>
                <input
                  type="text"
                  value={clientCpf}
                  onChange={(e) => setClientCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
                />
              </div>
            </div>
          </div>

          <hr className="border-neutral-200" />

          {/* 2. SEÇÃO DO APARELHO & SENHA */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-neutral-700" />
              <h3 className="text-sm font-semibold text-neutral-900">
                2. Aparelho, Modelo & Senha de Desbloqueio
              </h3>
            </div>

            {/* Brand Quick Pills */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-neutral-600">Marca do Aparelho:</div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_BRANDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      setBrand(b);
                      setModel('');
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      brand === b
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Quick Preset Pills */}
            {POPULAR_MODELS[brand] && (
              <div className="space-y-1.5 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                  Modelos mais frequentes ({brand}):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_MODELS[brand].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModel(m)}
                      className={`px-2.5 py-1 text-xs rounded transition-colors ${
                        model === m
                          ? 'bg-neutral-900 text-white font-medium'
                          : 'bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Device Detail Inputs: Model, Color, IMEI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Modelo do Aparelho *
                </label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Ex: iPhone 13 / Galaxy A14"
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Cor do Aparelho
                </label>
                <div className="flex gap-2">
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                  >
                    {COLORS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  IMEI / Serial (Opcional)
                </label>
                <input
                  type="text"
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  placeholder="15 dígitos (*#06#)"
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
                />
              </div>
            </div>

            {/* Security / Password / Unlock Drawer */}
            <div className="bg-neutral-50/90 border border-neutral-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-neutral-700" />
                  <span className="text-xs font-semibold text-neutral-900">
                    Senha de Bloqueio para Testes na Bancada
                  </span>
                </div>

                {/* Lock Type Selector */}
                <div className="flex items-center bg-neutral-200/80 p-0.5 rounded-lg text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setLockType('PIN')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      lockType === 'PIN' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                    }`}
                  >
                    Senha / PIN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLockType('PATTERN')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      lockType === 'PATTERN' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                    }`}
                  >
                    Desenho 3x3
                  </button>
                  <button
                    type="button"
                    onClick={() => setLockType('NONE')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      lockType === 'NONE' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                    }`}
                  >
                    Sem Senha
                  </button>
                </div>
              </div>

              {/* Conditional PIN input or Pattern Drawer */}
              {lockType === 'PIN' && (
                <div className="max-w-xs">
                  <input
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Digite o PIN / Senha alfanumérica"
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono text-center tracking-widest text-sm bg-white"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Necessário para testar touch, câmeras, sensores e bateria após reparo.
                  </p>
                </div>
              )}

              {lockType === 'PATTERN' && (
                <div className="flex flex-col sm:flex-row items-center gap-6 py-1">
                  <PatternLock
                    pattern={patternLock}
                    onChange={setPatternLock}
                    size={170}
                  />
                  <div className="text-xs text-neutral-600 space-y-1.5 max-w-sm">
                    <p className="font-medium text-neutral-900">Desenho do Padrão Android:</p>
                    <p className="text-[11px] text-neutral-500">
                      Conecte os círculos na ordem que o cliente desbloqueia o celular. A sequência será impressa de forma compacta na etiqueta da bancada (ex: 1→2→5→8).
                    </p>
                    {patternLock.length > 0 && (
                      <div className="font-mono text-xs bg-neutral-200/80 px-2 py-1 rounded text-neutral-800">
                        Sequência: {patternLock.map((p) => p + 1).join(' → ')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {lockType === 'NONE' && (
                <p className="text-xs text-neutral-500 italic">
                  Aparelho sem senha de tela ou restaurado de fábrica.
                </p>
              )}

              {/* Account / iCloud Status */}
              <div className="pt-2 border-t border-neutral-200 flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium text-neutral-700">Conta no Aparelho:</span>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="icloud"
                      checked={icloudStatus === 'COM_CONTA_CLIENTE'}
                      onChange={() => setIcloudStatus('COM_CONTA_CLIENTE')}
                      className="accent-neutral-900"
                    />
                    <span>Com Conta (Cliente ciente da senha)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="icloud"
                      checked={icloudStatus === 'SEM_CONTA'}
                      onChange={() => setIcloudStatus('SEM_CONTA')}
                      className="accent-neutral-900"
                    />
                    <span>Sem Conta / Removida</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-neutral-200" />

          {/* 3. DEFEITO RECLAMADO & CHECKLIST FÍSICO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-neutral-700" />
              <h3 className="text-sm font-semibold text-neutral-900">
                3. Defeito Reclamado & Checklist de Entrada
              </h3>
            </div>

            {/* Quick 1-tap defect tags */}
            <div>
              <div className="text-xs font-medium text-neutral-600 mb-1.5">
                Clique para adicionar defeitos frequentes:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_DEFECTS.map((defect) => {
                  const isActive = reportedDefect.includes(defect);
                  return (
                    <button
                      key={defect}
                      type="button"
                      onClick={() => handleToggleDefectTag(defect)}
                      className={`text-[11px] px-2.5 py-1 rounded-md transition-colors border ${
                        isActive
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                      }`}
                    >
                      {defect}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Descrição do Defeito Reclamado *
              </label>
              <textarea
                rows={2}
                required
                value={reportedDefect}
                onChange={(e) => setReportedDefect(e.target.value)}
                placeholder="Ex: Caiu no chão, tela trincou e parou de responder touch..."
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            {/* Physical condition checklist checkboxes */}
            <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 space-y-2">
              <div className="text-xs font-semibold text-neutral-800">
                Checklist Físico Inicial (Proteção da Loja contra reclamações posteriores):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={initialChecklist.screenCracked}
                    onChange={(e) =>
                      setInitialChecklist({ ...initialChecklist, screenCracked: e.target.checked })
                    }
                    className="accent-neutral-900 rounded"
                  />
                  <span>Tela já trincada</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={initialChecklist.housingScratched}
                    onChange={(e) =>
                      setInitialChecklist({ ...initialChecklist, housingScratched: e.target.checked })
                    }
                    className="accent-neutral-900 rounded"
                  />
                  <span>Carcaça com riscos</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={initialChecklist.waterDamage}
                    onChange={(e) =>
                      setInitialChecklist({ ...initialChecklist, waterDamage: e.target.checked })
                    }
                    className="accent-red-600 rounded"
                  />
                  <span className={initialChecklist.waterDamage ? 'text-red-700 font-semibold' : ''}>
                    Indício de água/líquido
                  </span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={initialChecklist.simTrayPresent}
                    onChange={(e) =>
                      setInitialChecklist({ ...initialChecklist, simTrayPresent: e.target.checked })
                    }
                    className="accent-neutral-900 rounded"
                  />
                  <span>Gaveta SIM presente</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!initialChecklist.chargesNormal}
                    onChange={(e) =>
                      setInitialChecklist({ ...initialChecklist, chargesNormal: !e.target.checked })
                    }
                    className="accent-neutral-900 rounded"
                  />
                  <span>Não carrega</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!initialChecklist.speakerWorking}
                    onChange={(e) =>
                      setInitialChecklist({ ...initialChecklist, speakerWorking: !e.target.checked })
                    }
                    className="accent-neutral-900 rounded"
                  />
                  <span>Áudio com falha</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!initialChecklist.camerasWorking}
                    onChange={(e) =>
                      setInitialChecklist({ ...initialChecklist, camerasWorking: !e.target.checked })
                    }
                    className="accent-neutral-900 rounded"
                  />
                  <span>Câmera com falha</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!initialChecklist.buttonsWorking}
                    onChange={(e) =>
                      setInitialChecklist({ ...initialChecklist, buttonsWorking: !e.target.checked })
                    }
                    className="accent-neutral-900 rounded"
                  />
                  <span>Botões travados</span>
                </label>
              </div>
            </div>

            {/* Accessories Left */}
            <div>
              <div className="text-xs font-medium text-neutral-600 mb-1">
                Acessórios Deixados pelo Cliente:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ACCESSORIES.map((acc) => {
                  const isChecked = accessoriesLeft.includes(acc);
                  return (
                    <button
                      key={acc}
                      type="button"
                      onClick={() => handleToggleAccessory(acc)}
                      className={`text-[11px] px-2.5 py-1 rounded transition-colors ${
                        isChecked
                          ? 'bg-neutral-800 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {isChecked ? `✓ ${acc}` : `+ ${acc}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <hr className="border-neutral-200" />

          {/* 4. ORÇAMENTO PRELIMINAR, PRAZO & TÉCNICO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-neutral-700" />
              <h3 className="text-sm font-semibold text-neutral-900">
                4. Previsão de Entrega & Estimativa de Valores
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Delivery Preset */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Previsão de Conclusão
                </label>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryPreset('HOJE')}
                    className={`py-1 text-xs rounded border transition-colors ${
                      deliveryPreset === 'HOJE'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-700 border-neutral-300'
                    }`}
                  >
                    Hoje 18h
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryPreset('AMANHA')}
                    className={`py-1 text-xs rounded border transition-colors ${
                      deliveryPreset === 'AMANHA'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-700 border-neutral-300'
                    }`}
                  >
                    Amanhã
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryPreset('48H')}
                    className={`py-1 text-xs rounded border transition-colors ${
                      deliveryPreset === '48H'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-700 border-neutral-300'
                    }`}
                  >
                    48 Horas
                  </button>
                </div>
                <select
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="Rafael Silveira (Bancada 1)">Rafael Silveira (Bancada 1)</option>
                  <option value="Marcos Vinicius (Bancada 2)">Marcos Vinicius (Bancada 2)</option>
                  <option value="Bancada Geral">Bancada Geral</option>
                </select>
              </div>

              {/* Estimated Costs */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Estimativa de Peça (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={estimatedParts}
                  onChange={(e) => setEstimatedParts(Number(e.target.value))}
                  placeholder="0,00"
                  className="w-full text-xs px-3 py-1.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
                />
                <input
                  type="text"
                  value={partsDescription}
                  onChange={(e) => setPartsDescription(e.target.value)}
                  placeholder="Descrição da peça (opcional)"
                  className="w-full text-[11px] px-2 py-1 mt-1 border border-neutral-200 rounded text-neutral-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Mão de Obra Técnica (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={estimatedLabor}
                  onChange={(e) => setEstimatedLabor(Number(e.target.value))}
                  placeholder="100,00"
                  className="w-full text-xs px-3 py-1.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
                />
                <div className="mt-2 text-right">
                  <span className="text-xs text-neutral-500 mr-2">Total Estimado:</span>
                  <span className="text-base font-bold font-mono text-neutral-900">
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

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Cancelar
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSaveOS()}
              className="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-lg transition-colors shadow-2xs"
            >
              Apenas Salvar OS
            </button>

            <button
              type="button"
              onClick={() => handleSaveOS('WORKBENCH_STICKER')}
              className="px-4 py-2 text-xs font-medium text-neutral-800 bg-neutral-200 hover:bg-neutral-300 rounded-lg transition-colors flex items-center gap-1.5"
              title="Gera etiqueta compacta com QR code para colar no aparelho na bancada"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-700" />
              <span>Salvar + Etiqueta Bancada</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveOS('CUSTOMER_RECEIPT')}
              className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Salvar + Imprimir Via Cliente</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

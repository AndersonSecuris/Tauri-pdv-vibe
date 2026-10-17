import React, { useState } from 'react';
import {
  ConfiguracaoImpressora,
  AppTheme,
  PrintOSOptions,
  PrintSaleOptions,
  PrintTechOSOptions,
} from '../types';
import {
  isTauriEnvironment,
  generateOSCustomerReceipt,
  generateOSTechReceipt,
  generateSaleReceipt,
  executeEscPosPrint,
  downloadEscPosBinary,
  FormattedReceipt,
} from '../services/escpos';
import {
  DEFAULT_OS_PRINT_OPTIONS,
  DEFAULT_SALE_PRINT_OPTIONS,
  DEFAULT_TECH_OS_PRINT_OPTIONS,
} from '../services/storage';
import {
  Printer,
  Cpu,
  Settings,
  X,
  CheckCircle,
  Radio,
  FileCode,
  Download,
  Store,
  Layers,
  Sparkles,
  Cable,
  Wifi,
  Scissors,
  Coins,
  Tag,
  FileText,
  Eye,
  CheckSquare,
  Square,
  RotateCcw,
  Check,
  ShoppingBag,
  User,
  Smartphone,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface ThermalPrinterSettingsModalProps {
  config: ConfiguracaoImpressora;
  theme?: AppTheme;
  onSaveConfig: (newConfig: ConfiguracaoImpressora) => void;
  onClose: () => void;
}

export const ThermalPrinterSettingsModal: React.FC<ThermalPrinterSettingsModalProps> = ({
  config,
  theme = 'black-yellow',
  onSaveConfig,
  onClose,
}) => {
  const isDark = theme === 'black-yellow' || theme === 'dark';

  const [form, setForm] = useState<ConfiguracaoImpressora>(() => ({
    ...config,
    osPrintOptions: {
      ...DEFAULT_OS_PRINT_OPTIONS,
      ...(config.osPrintOptions || {}),
    },
    salePrintOptions: {
      ...DEFAULT_SALE_PRINT_OPTIONS,
      ...(config.salePrintOptions || {}),
    },
    techOSPrintOptions: {
      ...DEFAULT_TECH_OS_PRINT_OPTIONS,
      ...(config.techOSPrintOptions || {}),
    },
  }));

  const [activeTab, setActiveTab] = useState<
    'OS_ITEMS' | 'TECH_OS_ITEMS' | 'SALE_ITEMS' | 'HARDWARE' | 'STORE_DATA'
  >('OS_ITEMS');

  const [testResult, setTestResult] = useState<string | null>(null);
  const [livePreviewReceipt, setLivePreviewReceipt] = useState<{
    title: string;
    receipt: FormattedReceipt;
  } | null>(null);

  const isTauri = isTauriEnvironment();

  // Mock data for live simulation and tests
  const mockOS = {
    id: 'OS-2026-8842',
    trackingCode: 'TRK-9812',
    client: {
      id: 'c-sim',
      name: 'Carlos Eduardo Oliveira',
      phone: '(11) 98765-4321',
      cpf: '321.654.987-00',
      createdAt: new Date().toISOString(),
    },
    device: {
      brand: 'Apple',
      model: 'iPhone 13 Pro Max',
      color: 'Grafite',
      imei: '358941098234512',
      passcode: '2580',
      icloudStatus: 'COM_CONTA_CLIENTE' as const,
    },
    entryDate: new Date().toISOString(),
    expectedDate: new Date(Date.now() + 86400000).toISOString(),
    technician: 'Rafael Silveira (Bancada 1)',
    reportedDefect: 'Aparelho não liga após queda, tela apagada e conector esquentando.',
    initialChecklist: {
      screenCracked: true,
      housingScratched: true,
      buttonsWorking: true,
      camerasWorking: true,
      chargesNormal: false,
      speakerWorking: true,
      waterDamage: false,
      simTrayPresent: true,
    },
    accessoriesLeft: ['Capa de proteção anti-impacto', 'Gaveta de chip'],
    status: 'RECEBIDO' as const,
    items: [
      {
        id: 'it-1',
        description: 'Tela OLED Premium Original',
        type: 'PECA' as const,
        quantity: 1,
        unitPrice: 480,
        total: 480,
      },
      {
        id: 'it-2',
        description: 'Mão de Obra Técnica Especializada',
        type: 'SERVICO' as const,
        quantity: 1,
        unitPrice: 150,
        total: 150,
      },
    ],
    partsCost: 480,
    laborCost: 150,
    discount: 30,
    totalAmount: 600,
    paymentStatus: 'PENDENTE' as const,
    amountPaid: 0,
    warrantyDays: 90,
    warrantyTerms: 'Garantia legal de 90 dias referente ao serviço prestado e peças trocadas (Art. 26 CDC).',
    timeline: [],
  };

  const mockSale = {
    id: 'sale-sim',
    code: 'VD-2026-4401',
    date: new Date().toISOString(),
    items: [
      {
        product: {
          id: 'p1',
          code: 'PEL-3D',
          name: 'Película 3D Cerâmica',
          barcode: '789100000001',
          category: 'PELICULAS' as const,
          price: 35.0,
          costPrice: 8.0,
          stock: 40,
          minStock: 5,
          unit: 'UN',
        },
        quantity: 2,
        unitPrice: 35.0,
        total: 70.0,
      },
      {
        product: {
          id: 'p2',
          code: 'CAB-LGT',
          name: 'Cabo Tipo Lightning 20W',
          barcode: '789100000002',
          category: 'CABOS' as const,
          price: 49.9,
          costPrice: 15.0,
          stock: 25,
          minStock: 5,
          unit: 'UN',
        },
        quantity: 1,
        unitPrice: 49.9,
        total: 49.9,
      },
    ],
    client: {
      id: 'c-1',
      name: 'Mariana Santos',
      phone: '(11) 97777-8888',
      cpf: '456.789.012-34',
      createdAt: new Date().toISOString(),
    },
    subtotal: 119.9,
    discount: 9.9,
    total: 110.0,
    paymentMethod: 'PIX' as const,
    cashReceived: 110.0,
    changeAmount: 0,
    cashierName: 'Beatriz Almeida (Caixa 01)',
    status: 'CONCLUIDA' as const,
  };

  // Handler: Save Entire Config
  const handleSave = () => {
    onSaveConfig(form);
    onClose();
  };

  // Live Previews
  const previewOSReceipt = () => {
    const receipt = generateOSCustomerReceipt(mockOS, form);
    setLivePreviewReceipt({
      title: 'Pré-Visualização: Comprovante de O.S. (Via Cliente)',
      receipt,
    });
  };

  const previewTechOSReceipt = () => {
    const receipt = generateOSTechReceipt(mockOS, form);
    setLivePreviewReceipt({
      title: 'Pré-Visualização: O.S. Técnico (Via Reduzida para Bancada)',
      receipt,
    });
  };

  const previewSaleReceipt = () => {
    const receipt = generateSaleReceipt(mockSale, form);
    setLivePreviewReceipt({
      title: 'Pré-Visualização: Cupom de Venda PDV',
      receipt,
    });
  };

  // Hardware Tests
  const handleTestPrint = async (type: 'CUSTOMER' | 'TECH' | 'SALE') => {
    setTestResult('Enviando comando para a impressora...');
    let receipt: FormattedReceipt;
    if (type === 'CUSTOMER') {
      receipt = generateOSCustomerReceipt(mockOS, form);
    } else if (type === 'TECH') {
      receipt = generateOSTechReceipt(mockOS, form);
    } else {
      receipt = generateSaleReceipt(mockSale, form);
    }
    const res = await executeEscPosPrint(receipt, form);
    setTestResult(res.message);
  };

  const handleTestDrawer = async () => {
    setTestResult('Pulso elétrico de abertura enviado para o conector RJ12 da gaveta (Comando ESC p 0 25 250).');
  };

  // Helpers to toggle / bulk set OS Print Options
  const updateOSOpt = (key: keyof PrintOSOptions, value: boolean) => {
    setForm((prev) => ({
      ...prev,
      osPrintOptions: {
        ...(prev.osPrintOptions || DEFAULT_OS_PRINT_OPTIONS),
        [key]: value,
      },
    }));
  };

  const toggleAllOSOpts = (value: boolean) => {
    const updated = { ...(form.osPrintOptions || DEFAULT_OS_PRINT_OPTIONS) };
    (Object.keys(updated) as (keyof PrintOSOptions)[]).forEach((k) => {
      updated[k] = value;
    });
    setForm((prev) => ({ ...prev, osPrintOptions: updated }));
  };

  // Helpers to toggle / bulk set Sale Print Options
  const updateSaleOpt = (key: keyof PrintSaleOptions, value: boolean) => {
    setForm((prev) => ({
      ...prev,
      salePrintOptions: {
        ...(prev.salePrintOptions || DEFAULT_SALE_PRINT_OPTIONS),
        [key]: value,
      },
    }));
  };

  const toggleAllSaleOpts = (value: boolean) => {
    const updated = { ...(form.salePrintOptions || DEFAULT_SALE_PRINT_OPTIONS) };
    (Object.keys(updated) as (keyof PrintSaleOptions)[]).forEach((k) => {
      updated[k] = value;
    });
    setForm((prev) => ({ ...prev, salePrintOptions: updated }));
  };

  // Helpers to toggle / bulk set Tech OS Options
  const updateTechOpt = (key: keyof PrintTechOSOptions, value: boolean) => {
    setForm((prev) => ({
      ...prev,
      techOSPrintOptions: {
        ...(prev.techOSPrintOptions || DEFAULT_TECH_OS_PRINT_OPTIONS),
        [key]: value,
      },
    }));
  };

  const toggleAllTechOpts = (value: boolean) => {
    const updated = { ...(form.techOSPrintOptions || DEFAULT_TECH_OS_PRINT_OPTIONS) };
    (Object.keys(updated) as (keyof PrintTechOSOptions)[]).forEach((k) => {
      updated[k] = value;
    });
    setForm((prev) => ({ ...prev, techOSPrintOptions: updated }));
  };

  const osOpts = form.osPrintOptions || DEFAULT_OS_PRINT_OPTIONS;
  const saleOpts = form.salePrintOptions || DEFAULT_SALE_PRINT_OPTIONS;
  const techOpts = form.techOSPrintOptions || DEFAULT_TECH_OS_PRINT_OPTIONS;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        className={`rounded-2xl shadow-2xl border max-w-4xl w-full my-auto flex flex-col max-h-[95vh] overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#121317] border-[#252631] text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-neutral-950 flex items-center justify-center shadow-[0_0_12px_rgba(250,204,21,0.25)]">
              <Printer className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>Central de Impressão Térmica & Cupons</span>
                </h2>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-md font-mono font-bold flex items-center gap-1 ${
                    isTauri
                      ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/40'
                      : 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30'
                  }`}
                >
                  <Cpu className="w-3 h-3" />
                  {isTauri ? 'Tauri ESC/POS' : 'Web Bridge ESC/POS'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Configure todos os campos que saem nas impressões de O.S., O.S. Técnico e Cupom de Venda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg border transition-colors ${
              isDark
                ? 'bg-[#1E2029] border-[#2A2C38] text-neutral-400 hover:text-white hover:bg-[#282A36]'
                : 'text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation with expressive icons */}
        <div
          className={`px-6 py-2.5 border-b flex items-center gap-2 overflow-x-auto text-xs font-bold ${
            isDark ? 'bg-[#111215] border-[#252631]' : 'bg-neutral-100 border-neutral-200'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('OS_ITEMS');
              setLivePreviewReceipt(null);
            }}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'OS_ITEMS'
                ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                : isDark
                ? 'bg-[#181920] border-[#272834] text-neutral-300 hover:text-white hover:bg-[#22242D]'
                : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Itens O.S. (Via Cliente)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('TECH_OS_ITEMS');
              setLivePreviewReceipt(null);
            }}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'TECH_OS_ITEMS'
                ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                : isDark
                ? 'bg-[#181920] border-[#272834] text-neutral-300 hover:text-white hover:bg-[#22242D]'
                : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>O.S. Técnico (Reduzida)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('SALE_ITEMS');
              setLivePreviewReceipt(null);
            }}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'SALE_ITEMS'
                ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                : isDark
                ? 'bg-[#181920] border-[#272834] text-neutral-300 hover:text-white hover:bg-[#22242D]'
                : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Itens Cupom de Venda</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('HARDWARE');
              setLivePreviewReceipt(null);
            }}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'HARDWARE'
                ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                : isDark
                ? 'bg-[#181920] border-[#272834] text-neutral-300 hover:text-white hover:bg-[#22242D]'
                : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Hardware & Conexão</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('STORE_DATA');
              setLivePreviewReceipt(null);
            }}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'STORE_DATA'
                ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                : isDark
                ? 'bg-[#181920] border-[#272834] text-neutral-300 hover:text-white hover:bg-[#22242D]'
                : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Dados da Loja</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* TAB 1: ITENS DA ORDEM DE SERVIÇO (VIA CLIENTE) */}
          {activeTab === 'OS_ITEMS' && (
            <div className="space-y-6">
              {/* Header and Quick Actions */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-yellow-400" />
                    <span>Personalizar Impressão da O.S. (Comprovante do Cliente)</span>
                  </h3>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    Marque os itens que devem ser impressos no cupom de entrada entregue ao cliente.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAllOSOpts(true)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                      isDark
                        ? 'bg-[#1F202B] border-[#2E313E] text-neutral-300 hover:text-white'
                        : 'bg-white border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <CheckSquare className="w-3 h-3 text-yellow-400" />
                    <span>Marcar Todos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAllOSOpts(false)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                      isDark
                        ? 'bg-[#1F202B] border-[#2E313E] text-neutral-300 hover:text-white'
                        : 'bg-white border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <Square className="w-3 h-3 text-neutral-400" />
                    <span>Desmarcar Todos</span>
                  </button>
                  <button
                    type="button"
                    onClick={previewOSReceipt}
                    className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black rounded-lg text-[11px] transition-all flex items-center gap-1 shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Simular Impressão</span>
                  </button>
                </div>
              </div>

              {/* Grouped Checkbox Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Loja & Cabeçalho */}
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="font-bold text-yellow-400 flex items-center gap-1.5 border-b pb-2 border-[#262835]">
                    <Store className="w-4 h-4" />
                    <span>1. Cabeçalho & Dados da Loja</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { key: 'showStoreHeader', label: 'Nome Fantasia da Loja' },
                      { key: 'showStorePhone', label: 'Telefone / WhatsApp da Loja' },
                      { key: 'showStoreAddress', label: 'Endereço Completo' },
                      { key: 'showStoreCnpj', label: 'CNPJ da Empresa' },
                      { key: 'showStoreInstagram', label: 'Instagram da Loja' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!!osOpts[item.key as keyof PrintOSOptions]}
                          onChange={(e) => updateOSOpt(item.key as keyof PrintOSOptions, e.target.checked)}
                          className="accent-yellow-400 rounded w-4 h-4 cursor-pointer"
                        />
                        <span className="text-neutral-200">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 2. Identificação da O.S. */}
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="font-bold text-yellow-400 flex items-center gap-1.5 border-b pb-2 border-[#262835]">
                    <Tag className="w-4 h-4" />
                    <span>2. Identificação & Prazos da O.S.</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { key: 'showOSNumber', label: 'Número da O.S. (#OS-2026-XXXX)' },
                      { key: 'showTrackingCode', label: 'Código de Rastreamento Online' },
                      { key: 'showEntryDate', label: 'Data e Hora de Entrada' },
                      { key: 'showExpectedDate', label: 'Previsão de Entrega Prometida' },
                      { key: 'showTechnician', label: 'Nome do Técnico Responsável' },
                      { key: 'showStatus', label: 'Status Inicial (Em Análise / Recebido)' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!!osOpts[item.key as keyof PrintOSOptions]}
                          onChange={(e) => updateOSOpt(item.key as keyof PrintOSOptions, e.target.checked)}
                          className="accent-yellow-400 rounded w-4 h-4 cursor-pointer"
                        />
                        <span className="text-neutral-200">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 3. Dados do Cliente */}
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="font-bold text-yellow-400 flex items-center gap-1.5 border-b pb-2 border-[#262835]">
                    <User className="w-4 h-4" />
                    <span>3. Dados do Cliente</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { key: 'showClientName', label: 'Nome Completo do Cliente' },
                      { key: 'showClientPhone', label: 'WhatsApp / Telefone de Contato' },
                      { key: 'showClientCpf', label: 'CPF do Cliente' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!!osOpts[item.key as keyof PrintOSOptions]}
                          onChange={(e) => updateOSOpt(item.key as keyof PrintOSOptions, e.target.checked)}
                          className="accent-yellow-400 rounded w-4 h-4 cursor-pointer"
                        />
                        <span className="text-neutral-200">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 4. Aparelho & Segurança */}
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="font-bold text-yellow-400 flex items-center gap-1.5 border-b pb-2 border-[#262835]">
                    <Smartphone className="w-4 h-4" />
                    <span>4. Dados do Aparelho & Segurança</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { key: 'showDeviceModel', label: 'Marca e Modelo do Aparelho' },
                      { key: 'showDeviceColor', label: 'Cor do Aparelho' },
                      { key: 'showDeviceImei', label: 'IMEI / Número de Série' },
                      { key: 'showDevicePassword', label: 'Senha da Tela (PIN ou Desenho 3x3)' },
                      { key: 'showIcloudStatus', label: 'Conta iCloud / Google Vinculada' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!!osOpts[item.key as keyof PrintOSOptions]}
                          onChange={(e) => updateOSOpt(item.key as keyof PrintOSOptions, e.target.checked)}
                          className="accent-yellow-400 rounded w-4 h-4 cursor-pointer"
                        />
                        <span className="text-neutral-200">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 5. Defeito, Checklist & Acessórios */}
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="font-bold text-yellow-400 flex items-center gap-1.5 border-b pb-2 border-[#262835]">
                    <Shield className="w-4 h-4" />
                    <span>5. Defeito, Checklist Físico & Acessórios</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { key: 'showReportedDefect', label: 'Defeito Reclamado pelo Cliente' },
                      { key: 'showChecklist', label: 'Checklist de Estado Físico Inicial' },
                      { key: 'showAccessories', label: 'Acessórios Deixados (Capa, Carregador, Chip)' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!!osOpts[item.key as keyof PrintOSOptions]}
                          onChange={(e) => updateOSOpt(item.key as keyof PrintOSOptions, e.target.checked)}
                          className="accent-yellow-400 rounded w-4 h-4 cursor-pointer"
                        />
                        <span className="text-neutral-200">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 6. Valores, Termos e Assinatura */}
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="font-bold text-yellow-400 flex items-center gap-1.5 border-b pb-2 border-[#262835]">
                    <Coins className="w-4 h-4" />
                    <span>6. Valores, Termos CDC & Assinatura</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { key: 'showBudgetDetails', label: 'Lista de Peças e Serviços Previstos' },
                      { key: 'showTotalAmount', label: 'Valor Total / Orçamento Estimado' },
                      { key: 'showPaymentStatus', label: 'Status do Pagamento (Pendente / Pago)' },
                      { key: 'showTrackingInfo', label: 'Link para Rastreamento Online no Celular' },
                      { key: 'showWarrantyTerms', label: 'Termo de Responsabilidade & Abandono (Art. 1275 CCB)' },
                      { key: 'showSignatureLine', label: 'Linha de Assinatura do Cliente' },
                      { key: 'showCustomFooter', label: 'Mensagem Personalizada de Rodapé' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!!osOpts[item.key as keyof PrintOSOptions]}
                          onChange={(e) => updateOSOpt(item.key as keyof PrintOSOptions, e.target.checked)}
                          className="accent-yellow-400 rounded w-4 h-4 cursor-pointer"
                        />
                        <span className="text-neutral-200">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: O.S. TÉCNICO (VIA REDUZIDA PARA BANCADA) */}
          {activeTab === 'TECH_OS_ITEMS' && (
            <div className="space-y-6">
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-yellow-400" />
                    <span>Configurar O.S. Técnico (Via Reduzida para Bancada)</span>
                  </h3>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    Impressão compacta e objetiva focada no trabalho dos técnicos de bancada com senhas e laudo.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAllTechOpts(true)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                      isDark
                        ? 'bg-[#1F202B] border-[#2E313E] text-neutral-300 hover:text-white'
                        : 'bg-white border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <CheckSquare className="w-3 h-3 text-yellow-400" />
                    <span>Marcar Todos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAllTechOpts(false)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                      isDark
                        ? 'bg-[#1F202B] border-[#2E313E] text-neutral-300 hover:text-white'
                        : 'bg-white border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <Square className="w-3 h-3 text-neutral-400" />
                    <span>Desmarcar Todos</span>
                  </button>
                  <button
                    type="button"
                    onClick={previewTechOSReceipt}
                    className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black rounded-lg text-[11px] transition-all flex items-center gap-1 shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Simular O.S. Técnico</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="font-bold text-yellow-400 flex items-center gap-1.5 border-b pb-2 border-[#262835]">
                    <Tag className="w-4 h-4" />
                    <span>Identificação & Aparelho</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { key: 'showStoreHeader', label: 'Nome da Loja no Topo' },
                      { key: 'showOSNumber', label: 'Número da O.S. em Destaque' },
                      { key: 'showTrackingCode', label: 'Código de Rastreio' },
                      { key: 'showDates', label: 'Datas de Entrada e Previsão' },
                      { key: 'showTechnician', label: 'Nome do Técnico Responsável' },
                      { key: 'showClientName', label: 'Nome do Cliente' },
                      { key: 'showClientPhone', label: 'WhatsApp do Cliente (p/ contato rápido)' },
                      { key: 'showDeviceModel', label: 'Marca e Modelo do Aparelho' },
                      { key: 'showDeviceColor', label: 'Cor do Aparelho' },
                      { key: 'showDeviceImei', label: 'IMEI do Aparelho' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!!techOpts[item.key as keyof PrintTechOSOptions]}
                          onChange={(e) => updateTechOpt(item.key as keyof PrintTechOSOptions, e.target.checked)}
                          className="accent-yellow-400 rounded w-4 h-4 cursor-pointer"
                        />
                        <span className="text-neutral-200">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="font-bold text-yellow-400 flex items-center gap-1.5 border-b pb-2 border-[#262835]">
                    <Shield className="w-4 h-4" />
                    <span>Bancada & Desbloqueio</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { key: 'showDevicePassword', label: 'Senhas de Tela PIN e Desenho 3x3 (Destaque)' },
                      { key: 'showIcloudStatus', label: 'Status da Conta iCloud / Google' },
                      { key: 'showReportedDefect', label: 'Defeito Reclamado pelo Cliente' },
                      { key: 'showChecklist', label: 'Checklist Físico Resumido' },
                      { key: 'showAccessories', label: 'Acessórios Deixados na Loja' },
                      { key: 'showBudget', label: 'Valor do Orçamento Aprovado' },
                      { key: 'showDiagnosisSpace', label: 'Espaço com Testes de Bancada e Assinatura Técnica' },
                      { key: 'showCustomFooter', label: 'Mensagem de Rodapé' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!!techOpts[item.key as keyof PrintTechOSOptions]}
                          onChange={(e) => updateTechOpt(item.key as keyof PrintTechOSOptions, e.target.checked)}
                          className="accent-yellow-400 rounded w-4 h-4 cursor-pointer"
                        />
                        <span className="text-neutral-200">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ITENS DO CUPOM DE VENDA (PDV) */}
          {activeTab === 'SALE_ITEMS' && (
            <div className="space-y-6">
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-yellow-400" />
                    <span>Personalizar Impressão de Venda (Cupom PDV)</span>
                  </h3>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    Escolha os campos que aparecem no cupom térmico impresso no fechamento de vendas.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAllSaleOpts(true)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                      isDark
                        ? 'bg-[#1F202B] border-[#2E313E] text-neutral-300 hover:text-white'
                        : 'bg-white border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <CheckSquare className="w-3 h-3 text-yellow-400" />
                    <span>Marcar Todos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAllSaleOpts(false)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                      isDark
                        ? 'bg-[#1F202B] border-[#2E313E] text-neutral-300 hover:text-white'
                        : 'bg-white border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <Square className="w-3 h-3 text-neutral-400" />
                    <span>Desmarcar Todos</span>
                  </button>
                  <button
                    type="button"
                    onClick={previewSaleReceipt}
                    className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black rounded-lg text-[11px] transition-all flex items-center gap-1 shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Simular Cupom</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="font-bold text-yellow-400 flex items-center gap-1.5 border-b pb-2 border-[#262835]">
                    <Store className="w-4 h-4" />
                    <span>Cabeçalho & Identificação da Venda</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { key: 'showStoreHeader', label: 'Nome da Loja no Cabeçalho' },
                      { key: 'showStoreCnpj', label: 'CNPJ da Empresa' },
                      { key: 'showStorePhone', label: 'Telefone / WhatsApp da Loja' },
                      { key: 'showStoreAddress', label: 'Endereço da Loja' },
                      { key: 'showStoreInstagram', label: 'Instagram da Loja' },
                      { key: 'showSaleCode', label: 'Código da Venda (#VENDA)' },
                      { key: 'showDate', label: 'Data e Hora da Transação' },
                      { key: 'showCashierName', label: 'Nome do Operador de Caixa' },
                      { key: 'showClientName', label: 'Nome e CPF do Cliente (se informado)' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!!saleOpts[item.key as keyof PrintSaleOptions]}
                          onChange={(e) => updateSaleOpt(item.key as keyof PrintSaleOptions, e.target.checked)}
                          className="accent-yellow-400 rounded w-4 h-4 cursor-pointer"
                        />
                        <span className="text-neutral-200">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="font-bold text-yellow-400 flex items-center gap-1.5 border-b pb-2 border-[#262835]">
                    <Coins className="w-4 h-4" />
                    <span>Produtos, Totais & Pagamento</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { key: 'showItemsList', label: 'Lista de Produtos com Qtd e Valor Unitário' },
                      { key: 'showSubtotal', label: 'Subtotal da Compra' },
                      { key: 'showDiscount', label: 'Linha de Desconto Concedido' },
                      { key: 'showTotal', label: 'Valor Total da Venda em Destaque' },
                      { key: 'showPaymentMethod', label: 'Forma de Pagamento (PIX, Dinheiro, Cartão)' },
                      { key: 'showCashReceivedAndChange', label: 'Valor Recebido em Dinheiro e Troco' },
                      { key: 'showWarrantyMessage', label: 'Mensagem de Garantia Legal (90 Dias)' },
                      { key: 'showCustomFooter', label: 'Mensagem Personalizada de Rodapé' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!!saleOpts[item.key as keyof PrintSaleOptions]}
                          onChange={(e) => updateSaleOpt(item.key as keyof PrintSaleOptions, e.target.checked)}
                          className="accent-yellow-400 rounded w-4 h-4 cursor-pointer"
                        />
                        <span className="text-neutral-200">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HARDWARE & CONEXÃO ESC/POS */}
          {activeTab === 'HARDWARE' && (
            <div className="space-y-6">
              {/* Notice */}
              <div
                className={`border rounded-xl p-4 space-y-2 ${
                  isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-yellow-400 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-yellow-400" />
                    <span>Comunicação com Hardware Térmico ESC/POS:</span>
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    ESC/POS 203 DPI Standard
                  </span>
                </div>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  Compatível com impressoras térmicas não fiscais de 58mm e 80mm (Epson TM-T20, Bematech MP-4200, Elgin i9/i7, Daruma, POS-58/POS-80). No desktop Tauri, envia bytes brutos diretamente para a porta; em navegadores, utiliza layout CSS otimizado de página única.
                </p>
              </div>

              {/* Form Settings: Paper Width & Connection with Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Paper Width */}
                <div
                  className={`border rounded-xl p-4 space-y-2.5 ${
                    isDark ? 'bg-[#17181F] border-[#292B37]' : 'border-neutral-200'
                  }`}
                >
                  <label className="font-bold text-yellow-400 block flex items-center gap-1.5">
                    <Scissors className="w-4 h-4" />
                    <span>Largura da Bobina Térmica:</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, paperWidth: '80mm' })}
                      className={`p-3 rounded-xl border text-center font-bold transition-all ${
                        form.paperWidth === '80mm'
                          ? 'border-yellow-400 bg-yellow-400 text-neutral-950 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                          : isDark
                          ? 'border-[#292B37] bg-[#121317] hover:bg-[#1E2029] text-neutral-300'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="font-black text-sm">80 mm</div>
                      <div className="text-[10px] opacity-90 font-mono">48 Colunas (Padrão)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, paperWidth: '58mm' })}
                      className={`p-3 rounded-xl border text-center font-bold transition-all ${
                        form.paperWidth === '58mm'
                          ? 'border-yellow-400 bg-yellow-400 text-neutral-950 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                          : isDark
                          ? 'border-[#292B37] bg-[#121317] hover:bg-[#1E2029] text-neutral-300'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="font-black text-sm">58 mm</div>
                      <div className="text-[10px] opacity-90 font-mono">32 Colunas (Compacta)</div>
                    </button>
                  </div>
                </div>

                {/* Connection Type */}
                <div
                  className={`border rounded-xl p-4 space-y-2.5 ${
                    isDark ? 'bg-[#17181F] border-[#292B37]' : 'border-neutral-200'
                  }`}
                >
                  <label className="font-bold text-yellow-400 block flex items-center gap-1.5">
                    <Cable className="w-4 h-4" />
                    <span>Tipo de Conexão Física:</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'USB', label: 'USB', icon: Cable },
                      { id: 'SERIAL', label: 'Serial COM', icon: Cpu },
                      { id: 'NETWORK', label: 'Rede IP', icon: Wifi },
                    ].map((conn) => {
                      const Icon = conn.icon;
                      const isSel = form.connectionType === conn.id;
                      return (
                        <button
                          key={conn.id}
                          type="button"
                          onClick={() => setForm({ ...form, connectionType: conn.id as 'USB' | 'SERIAL' | 'NETWORK' })}
                          className={`py-2 px-1 text-center rounded-xl border font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                            isSel
                              ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-xs'
                              : isDark
                              ? 'bg-[#121317] border-[#292B37] text-neutral-400 hover:text-white'
                              : 'border-neutral-200 text-neutral-700'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-[11px]">{conn.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <label className="text-[11px] text-neutral-400 block mb-1">
                      Porta / Identificador do Dispositivo:
                    </label>
                    <input
                      type="text"
                      value={form.devicePathOrIp}
                      onChange={(e) => setForm({ ...form, devicePathOrIp: e.target.value })}
                      placeholder={
                        form.connectionType === 'USB'
                          ? 'USB001 / POS-80'
                          : form.connectionType === 'SERIAL'
                          ? 'COM3 ou /dev/ttyUSB0'
                          : '192.168.1.200'
                      }
                      className={`w-full px-3 py-1.5 border rounded-lg font-mono text-xs outline-none ${
                        isDark
                          ? 'bg-[#101115] border-[#2A2C38] text-white focus:border-yellow-400'
                          : 'bg-white border-neutral-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Hardware Features */}
              <div
                className={`border rounded-xl p-4 space-y-2.5 ${
                  isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-neutral-50/50 border-neutral-200'
                }`}
              >
                <span className="font-bold text-yellow-400 block flex items-center gap-1.5">
                  <Settings className="w-4 h-4" />
                  <span>Recursos de Hardware e Automações:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.autoCut}
                      onChange={(e) => setForm({ ...form, autoCut: e.target.checked })}
                      className="accent-yellow-400 rounded w-4 h-4"
                    />
                    <span className="text-neutral-200">Guilhotina Automática (Corte de papel)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.openCashDrawerOnSale}
                      onChange={(e) => setForm({ ...form, openCashDrawerOnSale: e.target.checked })}
                      className="accent-yellow-400 rounded w-4 h-4"
                    />
                    <span className="text-neutral-200">Pulsar Gaveta de Dinheiro no PDV</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.printWorkbenchSticker}
                      onChange={(e) => setForm({ ...form, printWorkbenchSticker: e.target.checked })}
                      className="accent-yellow-400 rounded w-4 h-4"
                    />
                    <span className="text-neutral-200">Habilitar Etiqueta de Bancada</span>
                  </label>
                </div>
              </div>

              {/* Bench Tests */}
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-[#14151B] border-[#262835]' : 'bg-neutral-100 border-neutral-200'
                }`}
              >
                <span className="font-bold text-white block flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-yellow-400" />
                  <span>Bancada de Testes de Impressão Direta:</span>
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestPrint('CUSTOMER')}
                    className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Testar O.S. Cliente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTestPrint('TECH')}
                    className="px-3.5 py-2 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Testar O.S. Técnico</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTestPrint('SALE')}
                    className="px-3.5 py-2 bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-300 border border-emerald-400/40 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Testar Cupom Venda</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestDrawer}
                    className="px-3.5 py-2 bg-blue-400/10 hover:bg-blue-400/20 text-blue-400 border border-blue-400/30 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Testar Abertura de Gaveta</span>
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`mt-2 p-3 rounded-lg font-mono text-[11px] border ${
                      isDark
                        ? 'bg-[#0E0F12] border-yellow-400/30 text-yellow-400'
                        : 'bg-white border-neutral-300 text-neutral-800'
                    }`}
                  >
                    {testResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DADOS CADASTRAIS DA LOJA */}
          {activeTab === 'STORE_DATA' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border space-y-4 ${
                  isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-white border-neutral-200'
                }`}
              >
                <div className="font-bold text-yellow-400 flex items-center gap-1.5 border-b pb-2 border-[#262835]">
                  <Store className="w-4 h-4" />
                  <span>Dados Cadastrais da Empresa para os Comprovantes</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1 font-semibold">
                      Nome Fantasia da Loja:
                    </label>
                    <input
                      type="text"
                      value={form.storeName}
                      onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg text-xs outline-none ${
                        isDark
                          ? 'bg-[#101115] border-[#2A2C38] text-white focus:border-yellow-400'
                          : 'bg-white border-neutral-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1 font-semibold">
                      CNPJ da Empresa:
                    </label>
                    <input
                      type="text"
                      value={form.storeCnpj}
                      onChange={(e) => setForm({ ...form, storeCnpj: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg text-xs font-mono outline-none ${
                        isDark
                          ? 'bg-[#101115] border-[#2A2C38] text-white focus:border-yellow-400'
                          : 'bg-white border-neutral-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1 font-semibold">
                      Telefone / WhatsApp:
                    </label>
                    <input
                      type="text"
                      value={form.storePhone}
                      onChange={(e) => setForm({ ...form, storePhone: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg text-xs font-mono outline-none ${
                        isDark
                          ? 'bg-[#101115] border-[#2A2C38] text-white focus:border-yellow-400'
                          : 'bg-white border-neutral-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1 font-semibold">
                      Instagram da Loja:
                    </label>
                    <input
                      type="text"
                      value={form.storeInstagram}
                      onChange={(e) => setForm({ ...form, storeInstagram: e.target.value })}
                      placeholder="@cellmaster.tecnica"
                      className={`w-full px-3 py-2 border rounded-lg text-xs outline-none ${
                        isDark
                          ? 'bg-[#101115] border-[#2A2C38] text-white focus:border-yellow-400'
                          : 'bg-white border-neutral-300'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-neutral-400 block mb-1 font-semibold">
                      Endereço Completo:
                    </label>
                    <input
                      type="text"
                      value={form.storeAddress}
                      onChange={(e) => setForm({ ...form, storeAddress: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg text-xs outline-none ${
                        isDark
                          ? 'bg-[#101115] border-[#2A2C38] text-white focus:border-yellow-400'
                          : 'bg-white border-neutral-300'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-neutral-400 block mb-1 font-semibold">
                      Mensagem de Rodapé:
                    </label>
                    <input
                      type="text"
                      value={form.customFooterNote}
                      onChange={(e) => setForm({ ...form, customFooterNote: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg text-xs outline-none ${
                        isDark
                          ? 'bg-[#101115] border-[#2A2C38] text-white focus:border-yellow-400'
                          : 'bg-white border-neutral-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LIVE PREVIEW MODAL / DRAWER IF TRIGGERED */}
          {livePreviewReceipt && (
            <div className="p-4 rounded-xl border border-yellow-400/30 bg-[#0c0d10] space-y-3">
              <div className="flex items-center justify-between border-b border-[#22242e] pb-2">
                <span className="font-bold text-yellow-400 flex items-center gap-1.5 text-xs">
                  <Eye className="w-4 h-4" />
                  <span>{livePreviewReceipt.title}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setLivePreviewReceipt(null)}
                  className="text-neutral-400 hover:text-white text-xs"
                >
                  Fechar Pré-Visualização
                </button>
              </div>

              <div className="flex justify-center py-2 bg-neutral-900/60 rounded-lg overflow-x-auto">
                <div
                  className={`thermal-paper p-5 rounded-sm border border-neutral-400 ${
                    form.paperWidth === '58mm' ? 'w-[280px]' : 'w-[360px]'
                  }`}
                >
                  <pre className="font-mono text-[11px] leading-[1.3] text-neutral-900 whitespace-pre-wrap select-text">
                    {livePreviewReceipt.receipt.text}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between ${
            isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setForm({
                  ...config,
                  osPrintOptions: DEFAULT_OS_PRINT_OPTIONS,
                  salePrintOptions: DEFAULT_SALE_PRINT_OPTIONS,
                  techOSPrintOptions: DEFAULT_TECH_OS_PRINT_OPTIONS,
                });
              }}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
                isDark
                  ? 'bg-[#1D1F28] border-[#2E313E] text-neutral-400 hover:text-white'
                  : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrões</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(250,204,21,0.25)] active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Salvar Configurações de Impressão</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { OrdemDeServico, OSStatus, ItemOS, ConfiguracaoImpressora, AppTheme } from '../types';
import { PatternLock } from './PatternLock';
import { formatBRL, formatDateTime } from '../services/escpos';
import {
  Smartphone,
  User,
  Wrench,
  Clock,
  Printer,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Share2,
  Phone,
  Calendar,
  Lock,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Search,
  Package,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Coins,
  Tag,
  Shield,
  Layers,
  Sparkles,
  FileText,
} from 'lucide-react';

interface OSDetailsModalProps {
  os: OrdemDeServico;
  printerConfig: ConfiguracaoImpressora;
  theme?: AppTheme;
  onUpdate: (updatedOS: OrdemDeServico) => void;
  onPrint: (type: 'CUSTOMER_RECEIPT' | 'TECH_RECEIPT' | 'WORKBENCH_STICKER') => void;
  onClose: () => void;
}

const STATUS_ITEMS: {
  status: OSStatus;
  label: string;
  icon: React.FC<{ className?: string }>;
  colorDark: string;
  colorLight: string;
  desc: string;
}[] = [
  {
    status: 'RECEBIDO',
    label: 'Em Triagem',
    icon: Search,
    colorDark: 'text-neutral-300 bg-neutral-800/80 border-neutral-700',
    colorLight: 'text-neutral-700 bg-neutral-100 border-neutral-300',
    desc: 'Aparelho deu entrada na loja e aguarda diagnóstico do técnico.',
  },
  {
    status: 'AGUARDANDO_APROVACAO',
    label: 'Aguardando Aprovação',
    icon: Clock,
    colorDark: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/40',
    colorLight: 'text-amber-800 bg-amber-50 border-amber-300',
    desc: 'Diagnóstico finalizado. Orçamento aguardando sinal verde do cliente.',
  },
  {
    status: 'APROVADO',
    label: 'Em Reparo',
    icon: Wrench,
    colorDark: 'text-amber-400 bg-amber-400/10 border-amber-400/40',
    colorLight: 'text-blue-800 bg-blue-50 border-blue-300',
    desc: 'Orçamento aprovado. Aparelho em execução na bancada técnica.',
  },
  {
    status: 'AGUARDANDO_PECA',
    label: 'Aguardando Peça',
    icon: Package,
    colorDark: 'text-purple-400 bg-purple-400/10 border-purple-400/40',
    colorLight: 'text-purple-800 bg-purple-50 border-purple-300',
    desc: 'Peça solicitada ao fornecedor, aguardando entrega.',
  },
  {
    status: 'PRONTO',
    label: 'Pronto Retirada',
    icon: CheckCircle2,
    colorDark: 'text-emerald-400 bg-emerald-400/15 border-emerald-400/40',
    colorLight: 'text-emerald-800 bg-emerald-50 border-emerald-300',
    desc: 'Reparo e testes concluídos. Cliente já pode vir retirar!',
  },
  {
    status: 'ENTREGUE',
    label: 'Finalizado',
    icon: ShieldCheck,
    colorDark: 'text-white bg-neutral-800 border-neutral-600',
    colorLight: 'text-white bg-neutral-900 border-neutral-900',
    desc: 'Aparelho entregue ao cliente com garantia e recibo emitidos.',
  },
  {
    status: 'CANCELADO',
    label: 'Não Aprovado',
    icon: AlertTriangle,
    colorDark: 'text-red-400 bg-red-400/10 border-red-400/40',
    colorLight: 'text-red-800 bg-red-50 border-red-300',
    desc: 'Orçamento recusado ou sem reparo viável. Devolvido ao cliente.',
  },
];

export const OSDetailsModal: React.FC<OSDetailsModalProps> = ({
  os,
  printerConfig,
  theme = 'black-yellow',
  onUpdate,
  onPrint,
  onClose,
}) => {
  const isDark = theme === 'black-yellow' || theme === 'dark';

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'BUDGET' | 'TIMELINE'>('DETAILS');
  const [currentStatus, setCurrentStatus] = useState<OSStatus>(os.status);
  const [statusNote, setStatusNote] = useState('');
  const [technicalDiagnosis, setTechnicalDiagnosis] = useState(os.technicalDiagnosis || '');
  const [items, setItems] = useState<ItemOS[]>(os.items);
  const [discount, setDiscount] = useState<number>(os.discount);
  const [paymentStatus, setPaymentStatus] = useState(os.paymentStatus);
  const [paymentMethod, setPaymentMethod] = useState(os.paymentMethod || 'PIX');
  const [copiedLink, setCopiedLink] = useState(false);

  // New Item inputs
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemType, setNewItemType] = useState<'PECA' | 'SERVICO'>('PECA');
  const [newItemPrice, setNewItemPrice] = useState<number>(0);

  // Recalculate totals
  const partsCost = items
    .filter((i) => i.type === 'PECA')
    .reduce((sum, i) => sum + i.total, 0);
  const laborCost = items
    .filter((i) => i.type === 'SERVICO')
    .reduce((sum, i) => sum + i.total, 0);
  const subtotal = partsCost + laborCost;
  const totalAmount = Math.max(0, subtotal - discount);

  const currentStatusObj = STATUS_ITEMS.find((s) => s.status === currentStatus) || STATUS_ITEMS[0];
  const CurrentStatusIcon = currentStatusObj.icon;

  const handleAddItem = () => {
    if (!newItemDesc.trim() || newItemPrice <= 0) return;
    const item: ItemOS = {
      id: `it-${Date.now()}`,
      description: newItemDesc.trim(),
      type: newItemType,
      quantity: 1,
      unitPrice: newItemPrice,
      total: newItemPrice,
    };
    setItems([...items, item]);
    setNewItemDesc('');
    setNewItemPrice(0);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleStatusChange = (newStatus: OSStatus) => {
    setCurrentStatus(newStatus);
    const targetLabel = STATUS_ITEMS.find((s) => s.status === newStatus)?.label || newStatus;
    const newEvent = {
      id: `ev-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: newStatus,
      note: statusNote || `Status alterado para ${targetLabel}`,
      author: 'Técnico Responsável',
    };

    const updated: OrdemDeServico = {
      ...os,
      status: newStatus,
      technicalDiagnosis,
      items,
      partsCost,
      laborCost,
      discount,
      totalAmount,
      paymentStatus: newStatus === 'ENTREGUE' ? 'PAGO' : paymentStatus,
      paymentMethod,
      amountPaid: newStatus === 'ENTREGUE' ? totalAmount : os.amountPaid,
      exitDate: newStatus === 'ENTREGUE' ? new Date().toISOString() : os.exitDate,
      timeline: [newEvent, ...os.timeline],
    };

    onUpdate(updated);
    setStatusNote('');
  };

  const handleSaveBudgetAndDiagnosis = () => {
    const updated: OrdemDeServico = {
      ...os,
      status: currentStatus,
      technicalDiagnosis,
      items,
      partsCost,
      laborCost,
      discount,
      totalAmount,
      paymentStatus,
      paymentMethod,
      amountPaid: paymentStatus === 'PAGO' ? totalAmount : os.amountPaid,
      exitDate: currentStatus === 'ENTREGUE' ? os.exitDate || new Date().toISOString() : undefined,
    };

    onUpdate(updated);
    onClose();
  };

  const generateWhatsAppLink = () => {
    const phoneClean = os.client.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá ${os.client.name}! Aqui é da ${printerConfig.storeName}.\n\n` +
      `Sua Ordem de Serviço *${os.id}* (${os.device.brand} ${os.device.model}) está com status: *${currentStatusObj.label}*.\n\n` +
      `Valor total: ${formatBRL(totalAmount)}\n` +
      `Acompanhe em tempo real pelo código de rastreio: *${os.trackingCode}* no link:\n` +
      `https://app.cellmaster.com.br/rastreio?codigo=${os.trackingCode}`
    );
    return `https://wa.me/55${phoneClean}?text=${message}`;
  };

  const handleCopyTrackingLink = () => {
    const url = `https://app.cellmaster.com.br/rastreio?codigo=${os.trackingCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        className={`rounded-2xl shadow-2xl border max-w-4xl w-full my-auto flex flex-col max-h-[94vh] overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#121317] border-[#252631] text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Top Header */}
        <div
          className={`px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-neutral-950 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.25)]">
              <Smartphone className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold font-mono tracking-tight text-white flex items-center gap-1.5">
                  <span>{os.id}</span>
                </h2>
                <button
                  onClick={handleCopyTrackingLink}
                  title="Clique para copiar o link de rastreamento do cliente"
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all ${
                    isDark
                      ? 'bg-[#1E2029] border-[#2E313E] text-yellow-400 hover:border-yellow-400/60'
                      : 'bg-neutral-100 border-neutral-300 text-neutral-800 hover:bg-neutral-200'
                  }`}
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{os.trackingCode}</span>
                </button>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-md border font-bold flex items-center gap-1.5 ${
                    isDark ? currentStatusObj.colorDark : currentStatusObj.colorLight
                  }`}
                >
                  <CurrentStatusIcon className="w-3.5 h-3.5" />
                  <span>{currentStatusObj.label}</span>
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {os.device.brand} {os.device.model} ({os.device.color}) · Cliente: <span className="font-semibold text-neutral-200">{os.client.name}</span>
              </p>
            </div>
          </div>

          {/* Quick Header Actions: WhatsApp, Copy, Close */}
          <div className="flex items-center gap-2">
            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-[#1E2029] border-[#2A2C38] text-neutral-400 hover:text-white hover:bg-[#282A36]'
                  : 'bg-neutral-100 border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Pipeline Workflow Selector with Interactive Icons */}
        <div
          className={`px-6 py-2.5 border-b overflow-x-auto flex items-center gap-1.5 text-xs select-none ${
            isDark ? 'bg-[#111215] border-[#252631]' : 'bg-neutral-100/70 border-neutral-200'
          }`}
        >
          <span className="text-[11px] font-bold text-neutral-400 mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-yellow-400" />
            <span>Fase:</span>
          </span>
          {STATUS_ITEMS.map((item) => {
            const Icon = item.icon;
            const isCurrent = currentStatus === item.status;
            return (
              <button
                key={item.status}
                type="button"
                onClick={() => handleStatusChange(item.status)}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border active:scale-95 ${
                  isCurrent
                    ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.3)]'
                    : isDark
                    ? 'bg-[#181920] border-[#282935] text-neutral-400 hover:text-white hover:bg-[#22232D]'
                    : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'stroke-[2.5]' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Navigation with Icons */}
        <div
          className={`px-6 border-b flex items-center gap-2 sm:gap-4 text-xs font-semibold ${
            isDark ? 'bg-[#15161C] border-[#252631]' : 'bg-white border-neutral-200'
          }`}
        >
          <button
            onClick={() => setActiveTab('DETAILS')}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'DETAILS'
                ? 'border-yellow-400 text-yellow-400 font-extrabold'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Aparelho & Checklist</span>
          </button>
          <button
            onClick={() => setActiveTab('BUDGET')}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'BUDGET'
                ? 'border-yellow-400 text-yellow-400 font-extrabold'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Orçamento & Peças</span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'BUDGET'
                  ? 'bg-yellow-400 text-neutral-950'
                  : isDark
                  ? 'bg-[#22242D] text-neutral-400'
                  : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              {items.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'TIMELINE'
                ? 'border-yellow-400 text-yellow-400 font-extrabold'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Histórico & Timeline</span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'TIMELINE'
                  ? 'bg-yellow-400 text-neutral-950'
                  : isDark
                  ? 'bg-[#22242D] text-neutral-400'
                  : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              {os.timeline.length}
            </span>
          </button>
        </div>

        {/* Modal Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'DETAILS' && (
            <div className="space-y-6 text-xs">
              {/* Client & Device summary grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Card */}
                <div
                  className={`border rounded-xl p-4 space-y-2.5 ${
                    isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2 text-yellow-400 font-bold">
                    <User className="w-4 h-4" />
                    <span>Dados do Cliente</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Nome:</span>
                      <span className="font-semibold text-white">{os.client.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">WhatsApp / Telefone:</span>
                      <span className="font-mono text-yellow-400">{os.client.phone}</span>
                    </div>
                    {os.client.cpf && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">CPF:</span>
                        <span className="font-mono text-neutral-200">{os.client.cpf}</span>
                      </div>
                    )}
                    {os.client.email && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">E-mail:</span>
                        <span className="text-neutral-200">{os.client.email}</span>
                      </div>
                    )}
                    {os.client.address && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Endereço:</span>
                        <span className="text-neutral-200 text-right">{os.client.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Device Card */}
                <div
                  className={`border rounded-xl p-4 space-y-2.5 ${
                    isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2 text-yellow-400 font-bold">
                    <Smartphone className="w-4 h-4" />
                    <span>Dados do Aparelho</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Marca / Modelo:</span>
                      <span className="font-bold text-white">
                        {os.device.brand} {os.device.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Cor:</span>
                      <span className="font-mono text-neutral-200">{os.device.color}</span>
                    </div>
                    {os.device.imei && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">IMEI:</span>
                        <span className="font-mono text-neutral-200">{os.device.imei}</span>
                      </div>
                    )}
                    {os.device.passcode && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Senha / PIN:</span>
                        <span className="font-mono font-bold text-yellow-400">{os.device.passcode}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Conta / iCloud:</span>
                      <span className="font-mono text-[11px] text-neutral-300">{os.device.icloudStatus}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Defect Description and Pattern Lock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`md:col-span-2 border rounded-xl p-4 space-y-2 ${
                    isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2 text-yellow-400 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Defeito Relatado pelo Cliente</span>
                  </div>
                  <p className="text-xs text-neutral-200 leading-relaxed font-medium">
                    {os.reportedDefect}
                  </p>
                </div>

                {/* Pattern lock viewer if available */}
                <div
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center text-center ${
                    isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-yellow-400 font-bold mb-2">
                    <Lock className="w-4 h-4" />
                    <span>Padrão de Desbloqueio</span>
                  </div>
                  {os.device.patternLock && os.device.patternLock.length > 0 ? (
                    <PatternLock pattern={os.device.patternLock} readOnly size={130} />
                  ) : (
                    <div className="text-neutral-500 text-[11px] py-4">
                      {os.device.passcode ? `PIN: ${os.device.passcode}` : 'Sem senha informada'}
                    </div>
                  )}
                </div>
              </div>

              {/* Physical Checklist with Icons */}
              <div
                className={`border rounded-xl p-4 space-y-3 ${
                  isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2 text-yellow-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Checklist Físico de Entrada (Triagem)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div
                    className={`p-2 rounded-lg border flex items-center justify-between ${
                      os.initialChecklist.screenCracked
                        ? 'bg-red-400/10 text-red-400 border-red-400/30 font-bold'
                        : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
                    }`}
                  >
                    <span>Tela Trincada</span>
                    <span>{os.initialChecklist.screenCracked ? '✗ Sim' : '✓ Não'}</span>
                  </div>
                  <div
                    className={`p-2 rounded-lg border flex items-center justify-between ${
                      os.initialChecklist.housingScratched
                        ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                        : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
                    }`}
                  >
                    <span>Carcaça Avariada</span>
                    <span>{os.initialChecklist.housingScratched ? '✗ Sim' : '✓ Intacta'}</span>
                  </div>
                  <div
                    className={`p-2 rounded-lg border flex items-center justify-between ${
                      os.initialChecklist.chargesNormal
                        ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
                        : 'bg-red-400/10 text-red-400 border-red-400/30 font-bold'
                    }`}
                  >
                    <span>Carregando</span>
                    <span>{os.initialChecklist.chargesNormal ? '✓ Sim' : '✗ Não'}</span>
                  </div>
                  <div
                    className={`p-2 rounded-lg border flex items-center justify-between ${
                      os.initialChecklist.buttonsWorking
                        ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
                        : 'bg-red-400/10 text-red-400 border-red-400/30'
                    }`}
                  >
                    <span>Botões Power/Vol</span>
                    <span>{os.initialChecklist.buttonsWorking ? '✓ Ok' : '✗ Falha'}</span>
                  </div>
                  <div
                    className={`p-2 rounded-lg border flex items-center justify-between ${
                      os.initialChecklist.waterDamage
                        ? 'bg-red-400/10 text-red-400 border-red-400/30 font-bold'
                        : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
                    }`}
                  >
                    <span>Contato c/ Água</span>
                    <span>{os.initialChecklist.waterDamage ? '✗ Molhou' : '✓ Não'}</span>
                  </div>
                  <div
                    className={`p-2 rounded-lg border flex items-center justify-between ${
                      os.initialChecklist.camerasWorking
                        ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
                        : 'bg-red-400/10 text-red-400 border-red-400/30'
                    }`}
                  >
                    <span>Câmeras</span>
                    <span>{os.initialChecklist.camerasWorking ? '✓ Ok' : '✗ Falha'}</span>
                  </div>
                  <div
                    className={`p-2 rounded-lg border flex items-center justify-between ${
                      os.initialChecklist.speakerWorking
                        ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
                        : 'bg-red-400/10 text-red-400 border-red-400/30'
                    }`}
                  >
                    <span>Alto-falante/Mic</span>
                    <span>{os.initialChecklist.speakerWorking ? '✓ Ok' : '✗ Mudo'}</span>
                  </div>
                  <div
                    className={`p-2 rounded-lg border flex items-center justify-between ${
                      os.initialChecklist.simTrayPresent
                        ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
                        : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}
                  >
                    <span>Gaveta Chip SIM</span>
                    <span>{os.initialChecklist.simTrayPresent ? '✓ Presente' : '✗ Ausente'}</span>
                  </div>
                </div>
              </div>

              {/* Technical Diagnosis Note */}
              <div className="space-y-1.5">
                <label className="font-bold text-yellow-400 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4" />
                  <span>Laudo e Diagnóstico Técnico da Bancada</span>
                </label>
                <textarea
                  value={technicalDiagnosis}
                  onChange={(e) => setTechnicalDiagnosis(e.target.value)}
                  rows={3}
                  placeholder="Descreva os testes efetuados pelo técnico, medições de corrente/tensão e solução proposta..."
                  className={`w-full p-3 border rounded-xl font-mono text-xs outline-none transition-colors ${
                    isDark
                      ? 'bg-[#17181F] border-[#292B37] text-white focus:border-yellow-400'
                      : 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-900'
                  }`}
                />
              </div>
            </div>
          )}

          {activeTab === 'BUDGET' && (
            <div className="space-y-6 text-xs">
              {/* Items Table */}
              <div
                className={`border rounded-xl overflow-hidden ${
                  isDark ? 'border-[#292B37] bg-[#16171E]' : 'border-neutral-200 bg-white'
                }`}
              >
                <table className="w-full text-left border-collapse">
                  <thead
                    className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                      isDark
                        ? 'bg-[#1C1D26] text-neutral-400 border-[#292B37]'
                        : 'bg-neutral-50 text-neutral-500 border-neutral-200'
                    }`}
                  >
                    <tr>
                      <th className="py-2.5 px-4">Tipo</th>
                      <th className="py-2.5 px-4">Descrição do Serviço / Peça</th>
                      <th className="py-2.5 px-4 text-center">Qtd</th>
                      <th className="py-2.5 px-4 text-right">Valor Unitário</th>
                      <th className="py-2.5 px-4 text-right">Total</th>
                      <th className="py-2.5 px-4 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#242633]' : 'divide-neutral-200'}`}>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-neutral-400">
                          Nenhum item lançado no orçamento ainda. Adicione peças ou mão de obra abaixo.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr
                          key={item.id}
                          className={isDark ? 'hover:bg-[#1D1E28]' : 'hover:bg-neutral-50'}
                        >
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 w-fit ${
                                item.type === 'PECA'
                                  ? 'bg-blue-400/10 text-blue-400 border-blue-400/30'
                                  : 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                              }`}
                            >
                              {item.type === 'PECA' ? <Package className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                              <span>{item.type === 'PECA' ? 'Peça' : 'Serviço'}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">{item.description}</td>
                          <td className="py-3 px-4 text-center font-mono text-neutral-300">{item.quantity}</td>
                          <td className="py-3 px-4 text-right font-mono text-neutral-300">
                            {formatBRL(item.unitPrice)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-yellow-400">
                            {formatBRL(item.total)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 rounded text-neutral-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Quick Add Item Bar with Icons */}
              <div
                className={`p-4 border rounded-xl space-y-3 ${
                  isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2 text-yellow-400 font-bold">
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Adicionar Peça ou Serviço ao Orçamento</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-3 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setNewItemType('PECA')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition-colors ${
                        newItemType === 'PECA'
                          ? 'bg-blue-400/20 text-blue-400 border-blue-400'
                          : isDark
                          ? 'bg-[#1F202B] text-neutral-400 border-[#2D303E]'
                          : 'bg-white text-neutral-600 border-neutral-300'
                      }`}
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Peça</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewItemType('SERVICO')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition-colors ${
                        newItemType === 'SERVICO'
                          ? 'bg-amber-400/20 text-amber-400 border-amber-400'
                          : isDark
                          ? 'bg-[#1F202B] text-neutral-400 border-[#2D303E]'
                          : 'bg-white text-neutral-600 border-neutral-300'
                      }`}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Mão de Obra</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    placeholder="Descrição do item (ex: Tela Original OLED, Troca Conector C)..."
                    className={`sm:col-span-6 px-3 py-2 border rounded-lg text-xs outline-none ${
                      isDark
                        ? 'bg-[#121317] border-[#292B37] text-white focus:border-yellow-400'
                        : 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-900'
                    }`}
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={newItemPrice || ''}
                    onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                    placeholder="Valor (R$)"
                    className={`sm:col-span-2 px-3 py-2 border rounded-lg text-xs font-mono outline-none ${
                      isDark
                        ? 'bg-[#121317] border-[#292B37] text-white focus:border-yellow-400'
                        : 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="sm:col-span-1 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black rounded-lg text-xs flex items-center justify-center transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              {/* Financial Totals & Payment Control */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`border rounded-xl p-4 space-y-3 ${
                    isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2 text-yellow-400 font-bold">
                    <CreditCard className="w-4 h-4" />
                    <span>Pagamento & Cobrança</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Status do Pagamento:</span>
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value as 'PENDENTE' | 'PAGO' | 'PARCIAL')}
                        className={`text-xs px-2.5 py-1.5 border rounded-lg font-bold outline-none ${
                          isDark
                            ? 'bg-[#121317] border-[#292B37] text-yellow-400'
                            : 'bg-white border-neutral-300 text-neutral-900'
                        }`}
                      >
                        <option value="PENDENTE">⏳ Pagamento Pendente</option>
                        <option value="PAGO">✓ Pago Integralmente</option>
                        <option value="PARCIAL">◐ Sinal / Pago Parcial</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Forma de Pagamento:</span>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className={`text-xs px-2.5 py-1.5 border rounded-lg font-mono outline-none ${
                          isDark
                            ? 'bg-[#121317] border-[#292B37] text-white'
                            : 'bg-white border-neutral-300 text-neutral-900'
                        }`}
                      >
                        <option value="PIX">⚡ PIX Instantâneo</option>
                        <option value="CARTAO_CREDITO">💳 Cartão de Crédito</option>
                        <option value="CARTAO_DEBITO">💳 Cartão de Débito</option>
                        <option value="DINHEIRO">💵 Dinheiro em Espécie</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Desconto Especial (R$):</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={discount || ''}
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className={`w-28 text-right text-xs px-2 py-1 border rounded-lg font-mono outline-none ${
                          isDark
                            ? 'bg-[#121317] border-[#292B37] text-white'
                            : 'bg-white border-neutral-300 text-neutral-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Subtotal, Parts, Labor and Final Total Card */}
                <div
                  className={`border rounded-xl p-4 flex flex-col justify-between ${
                    isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Total Peças:</span>
                      <span className="font-mono text-neutral-200">{formatBRL(partsCost)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Total Mão de Obra:</span>
                      <span className="font-mono text-neutral-200">{formatBRL(laborCost)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Desconto Aplicado:</span>
                        <span className="font-mono">-{formatBRL(discount)}</span>
                      </div>
                    )}
                  </div>
                  <div
                    className={`mt-4 pt-3 border-t flex items-center justify-between ${
                      isDark ? 'border-[#292B37]' : 'border-neutral-200'
                    }`}
                  >
                    <span className="text-sm font-extrabold text-neutral-300">Valor Final O.S.:</span>
                    <span className="text-2xl font-black font-mono text-yellow-400">
                      {formatBRL(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'TIMELINE' && (
            <div className="space-y-5 text-xs">
              {/* Event addition bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Adicionar nota técnica interna ou registro de contato com cliente..."
                  className={`flex-1 p-2.5 border rounded-xl text-xs outline-none ${
                    isDark
                      ? 'bg-[#17181F] border-[#292B37] text-white focus:border-yellow-400'
                      : 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleStatusChange(currentStatus)}
                  className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold rounded-xl text-xs whitespace-nowrap flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Registrar Evento</span>
                </button>
              </div>

              {/* Timeline list */}
              <div className={`border-l-2 ml-4 pl-4 space-y-4 ${isDark ? 'border-[#2B2D3B]' : 'border-neutral-200'}`}>
                {os.timeline.map((ev) => (
                  <div key={ev.id} className="relative">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-yellow-400 ring-4 ring-[#121317]" />
                    <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
                      <span>{formatDateTime(ev.timestamp)}</span>
                      <span>·</span>
                      <span className="font-bold text-neutral-200">{ev.author}</span>
                      <span>·</span>
                      <span className="text-yellow-400 font-semibold font-sans">{ev.status}</span>
                    </div>
                    <p className="text-neutral-300 mt-1 font-medium">{ev.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions with High-Impact Interactive Icon Buttons */}
        <div
          className={`px-6 py-3.5 border-t flex flex-wrap items-center justify-between gap-3 ${
            isDark ? 'bg-[#15161C] border-[#252631]' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint('CUSTOMER_RECEIPT')}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 ${
                isDark
                  ? 'bg-[#1F202B] border-[#2F3140] text-neutral-200 hover:text-yellow-400 hover:border-yellow-400/50'
                  : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-yellow-400" />
              <span>Cupom Entrada</span>
            </button>
            <button
              onClick={() => onPrint('TECH_RECEIPT')}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 ${
                isDark
                  ? 'bg-[#1F202B] border-amber-400/40 text-amber-300 hover:text-amber-200 hover:bg-amber-500/10'
                  : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
              }`}
              title="Imprimir O.S. reduzida com dados específicos para o técnico de bancada"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>O.S. Técnico</span>
            </button>
            <button
              onClick={() => onPrint('WORKBENCH_STICKER')}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 ${
                isDark
                  ? 'bg-[#1F202B] border-[#2F3140] text-neutral-200 hover:text-yellow-400 hover:border-yellow-400/50'
                  : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-yellow-400" />
              <span>Etiqueta Bancada</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleSaveBudgetAndDiagnosis}
              className="px-5 py-2 text-xs font-black text-neutral-950 bg-yellow-400 hover:bg-yellow-300 rounded-xl transition-all shadow-[0_0_15px_rgba(250,204,21,0.25)] active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

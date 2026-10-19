import React, { useState } from 'react';
import { OrdemDeServico, OSStatus, ConfiguracaoImpressora, AppTheme } from '../types';
import { formatBRL, formatDateTime } from '../services/escpos';
import {
  Search,
  Plus,
  Printer,
  Smartphone,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  Eye,
  Filter,
  Share2,
  Tag,
  DollarSign,
  Package,
  ShieldCheck,
  Layers,
  ChevronRight,
  Sparkles,
  Copy,
  Check,
  User,
  Phone,
  Calendar,
  CreditCard,
  Coins,
  QrCode,
  ZapOff,
  BatteryWarning,
  Droplets,
  Camera,
  RotateCcw,
  VolumeX,
  SlidersHorizontal,
  FileText,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface OSListViewProps {
  orders: OrdemDeServico[];
  printerConfig: ConfiguracaoImpressora;
  onOpenOS: (os: OrdemDeServico) => void;
  onNewOS: () => void;
  onQuickPrint: (os: OrdemDeServico, type: 'CUSTOMER_RECEIPT' | 'TECH_RECEIPT' | 'WORKBENCH_STICKER') => void;
  onOpenTracker: (initialSearch?: string) => void;
  onOpenOSConfig?: () => void;
  onDeleteOS?: (orderId: string) => void;
  theme?: AppTheme;
}

const STATUS_FILTERS: { id: string; label: string; icon: React.FC<{ className?: string }>; countKey?: OSStatus }[] = [
  { id: 'ALL', label: 'Todas as O.S.', icon: Layers },
  { id: 'RECEBIDO', label: 'Em Triagem', icon: Search, countKey: 'RECEBIDO' },
  { id: 'AGUARDANDO_APROVACAO', label: 'Aguardando Aprovação', icon: Clock, countKey: 'AGUARDANDO_APROVACAO' },
  { id: 'APROVADO', label: 'Em Reparo', icon: Wrench, countKey: 'APROVADO' },
  { id: 'PRONTO', label: 'Prontos p/ Retirada', icon: CheckCircle2, countKey: 'PRONTO' },
  { id: 'ENTREGUE', label: 'Finalizados', icon: ShieldCheck, countKey: 'ENTREGUE' },
];

export const OSListView: React.FC<OSListViewProps> = ({
  orders,
  printerConfig,
  onOpenOS,
  onNewOS,
  onQuickPrint,
  onOpenTracker,
  onOpenOSConfig,
  onDeleteOS = () => {},
  theme = 'black-yellow',
}) => {
  const isDark = theme === 'black-yellow' || theme === 'dark';

  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<OrdemDeServico | null>(null);

  // Count summaries
  const pendingApprovalCount = orders.filter((o) => o.status === 'AGUARDANDO_APROVACAO').length;
  const inRepairCount = orders.filter((o) => o.status === 'APROVADO' || o.status === 'AGUARDANDO_PECA').length;
  const readyCount = orders.filter((o) => o.status === 'PRONTO').length;
  const totalOpenValue = orders
    .filter((o) => o.status !== 'ENTREGUE' && o.status !== 'CANCELADO')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesFilter =
      selectedFilter === 'ALL'
        ? true
        : selectedFilter === 'APROVADO'
        ? o.status === 'APROVADO' || o.status === 'AGUARDANDO_PECA'
        : o.status === selectedFilter;

    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesFilter;

    const matchesSearch =
      o.id.toLowerCase().includes(query) ||
      o.trackingCode.toLowerCase().includes(query) ||
      o.client.name.toLowerCase().includes(query) ||
      o.client.phone.includes(query) ||
      o.device.model.toLowerCase().includes(query) ||
      o.device.brand.toLowerCase().includes(query) ||
      (o.device.imei && o.device.imei.includes(query)) ||
      o.reportedDefect.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const handleCopyTracking = (os: OrdemDeServico, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://app.cellmaster.com.br/rastreio?codigo=${os.trackingCode}`;
    navigator.clipboard.writeText(url);
    setCopiedOrderId(os.id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const getDefectIcon = (defect: string) => {
    const text = defect.toLowerCase();
    if (text.includes('tela') || text.includes('touch') || text.includes('display')) {
      return <Smartphone className="w-3.5 h-3.5 text-yellow-400 shrink-0" />;
    }
    if (text.includes('carreg') || text.includes('conector')) {
      return <ZapOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
    if (text.includes('bateria') || text.includes('descarrega')) {
      return <BatteryWarning className="w-3.5 h-3.5 text-yellow-500 shrink-0" />;
    }
    if (text.includes('molhou') || text.includes('água') || text.includes('agua')) {
      return <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    }
    if (text.includes('camera') || text.includes('câmera')) {
      return <Camera className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    }
    if (text.includes('som') || text.includes('áudio') || text.includes('microfone')) {
      return <VolumeX className="w-3.5 h-3.5 text-orange-400 shrink-0" />;
    }
    return <Wrench className="w-3.5 h-3.5 text-neutral-400 shrink-0" />;
  };

  return (
    <div
      className={`flex-1 flex flex-col overflow-hidden transition-colors ${
        isDark ? 'bg-[#0A0B0E] text-neutral-100' : 'bg-neutral-100/70 text-neutral-900'
      }`}
    >
      {/* Top Metrics Row with High-Impact Yellow Icons & Clickable Filters */}
      <div className="p-6 pb-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <button
          onClick={() => setSelectedFilter('AGUARDANDO_APROVACAO')}
          className={`p-4 rounded-xl border text-left transition-all group ${
            selectedFilter === 'AGUARDANDO_APROVACAO'
              ? 'border-yellow-400 bg-[#1A1B22] shadow-[0_0_15px_rgba(250,204,21,0.2)]'
              : isDark
              ? 'bg-[#141519] border-[#252631] hover:border-yellow-400/40'
              : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-bold group-hover:text-yellow-400 transition-colors">
              Aguardando Aprovação
            </span>
            <div className="w-8 h-8 rounded-lg bg-yellow-400/15 text-yellow-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-yellow-400 mt-2">
            {pendingApprovalCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Orçamentos enviados p/ cliente</div>
        </button>

        {/* Metric 2 */}
        <button
          onClick={() => setSelectedFilter('APROVADO')}
          className={`p-4 rounded-xl border text-left transition-all group ${
            selectedFilter === 'APROVADO'
              ? 'border-amber-400 bg-[#1A1B22] shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : isDark
              ? 'bg-[#141519] border-[#252631] hover:border-amber-400/40'
              : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-bold group-hover:text-amber-400 transition-colors">
              Em Execução Bancada
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-400 mt-2">
            {inRepairCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Aparelhos com técnicos</div>
        </button>

        {/* Metric 3 */}
        <button
          onClick={() => setSelectedFilter('PRONTO')}
          className={`p-4 rounded-xl border text-left transition-all group ${
            selectedFilter === 'PRONTO'
              ? 'border-emerald-400 bg-[#1A1B22] shadow-[0_0_15px_rgba(52,211,153,0.2)]'
              : isDark
              ? 'bg-[#141519] border-[#252631] hover:border-emerald-400/40'
              : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-bold group-hover:text-emerald-400 transition-colors">
              Prontos para Retirada
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-2">
            {readyCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Disponíveis para balcão</div>
        </button>

        {/* Metric 4 */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            isDark
              ? 'bg-[#141519] border-[#252631] shadow-xs'
              : 'bg-white border-neutral-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-bold">Faturamento Previsto</span>
            <div className="w-8 h-8 rounded-lg bg-yellow-400/20 text-yellow-400 flex items-center justify-center shadow-[0_0_12px_rgba(250,204,21,0.25)]">
              <Coins className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white mt-2">
            {formatBRL(totalOpenValue)}
          </div>
          <div className="text-[11px] text-yellow-400 font-mono mt-0.5">Serviços em aberto</div>
        </div>
      </div>

      {/* Control Toolbar: Search + Filter Tabs with Expressive Icons */}
      <div className="p-6 pt-2 pb-3 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por O.S., cliente, telefone, modelo, IMEI..."
              className={`w-full text-xs px-3 py-2.5 pl-9 border rounded-xl font-mono outline-none transition-colors ${
                isDark
                  ? 'bg-[#141519] border-[#252631] text-white focus:border-yellow-400'
                  : 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-900'
              }`}
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          </div>

          {/* Quick Action buttons with visual icons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => onOpenTracker()}
              title="Acessar Portal de Rastreamento de Conserto"
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                isDark
                  ? 'bg-[#181920] border-[#2A2B35] text-neutral-200 hover:text-white hover:bg-[#22242D]'
                  : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-yellow-400" />
              <span>Rastrear O.S.</span>
            </button>

            {onOpenOSConfig && (
              <button
                onClick={onOpenOSConfig}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 active:scale-95 ${
                  isDark
                    ? 'border-[#2D2E39] bg-[#16171E] text-neutral-300 hover:text-white hover:border-yellow-400/40 hover:bg-[#1E1F28]'
                    : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
                title="Configurar Parâmetros de O.S. (Marcas, Modelos, Defeitos, Acessórios e Checklist)"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-yellow-400" />
                <span className="hidden sm:inline">Opções de O.S.</span>
              </button>
            )}

            <button
              onClick={onNewOS}
              className="px-4 py-2 text-xs font-black text-neutral-950 bg-yellow-400 hover:bg-yellow-300 rounded-xl transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(250,204,21,0.25)] active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nova O.S. Ágil</span>
            </button>
          </div>
        </div>

        {/* Status Filter Tabs (Button/Tab interactive control with Icons) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs select-none">
          {STATUS_FILTERS.map((f) => {
            const Icon = f.icon;
            const count =
              f.id === 'ALL'
                ? orders.length
                : f.id === 'APROVADO'
                ? orders.filter((o) => o.status === 'APROVADO' || o.status === 'AGUARDANDO_PECA').length
                : orders.filter((o) => o.status === f.id).length;

            const isSelected = selectedFilter === f.id;

            return (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all flex items-center gap-2 border active:scale-95 ${
                  isSelected
                    ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                    : isDark
                    ? 'bg-[#141519] border-[#252631] text-neutral-400 hover:text-white hover:bg-[#1E1F26]'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'stroke-[2.5]' : ''}`} />
                <span>{f.label}</span>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected
                      ? 'bg-neutral-950 text-yellow-400'
                      : isDark
                      ? 'bg-[#22242D] text-neutral-400'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main High-Density Table with Icon-Centric Interactions */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div
          className={`rounded-2xl border overflow-hidden ${
            isDark ? 'bg-[#121317] border-[#23242E]' : 'bg-white border-neutral-200'
          }`}
        >
          <table className="w-full text-left text-xs border-collapse">
            <thead
              className={`border-b text-[11px] uppercase tracking-wider font-bold ${
                isDark
                  ? 'bg-[#17181F] text-neutral-400 border-[#23242E]'
                  : 'bg-neutral-50 text-neutral-500 border-neutral-200'
              }`}
            >
              <tr>
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-yellow-400" />
                    <span>O.S. / Rastreio</span>
                  </div>
                </th>
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Cliente</span>
                  </div>
                </th>
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Aparelho & Defeito</span>
                  </div>
                </th>
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Status Atual</span>
                  </div>
                </th>
                <th className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Valor Total</span>
                  </div>
                </th>
                <th className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Datas</span>
                  </div>
                </th>
                <th className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Ações Rápidas</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y font-sans ${isDark ? 'divide-[#1D1E26]' : 'divide-neutral-200'}`}>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-neutral-400">
                    <Smartphone className="w-10 h-10 opacity-30 mx-auto mb-2 text-yellow-400" />
                    <div className="text-sm font-bold text-white">Nenhuma ordem de serviço encontrada</div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Ajuste a busca ou registre uma nova O.S. no botão acima.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((os) => {
                  const phoneClean = os.client.phone.replace(/\D/g, '');
                  const whatsAppLink = `https://wa.me/55${phoneClean}?text=${encodeURIComponent(
                    `Olá ${os.client.name}! Sua Ordem de Serviço ${os.id} (${os.device.brand} ${os.device.model}) está com status: ${os.status}. Link de rastreio: https://app.cellmaster.com.br/rastreio?codigo=${os.trackingCode}`
                  )}`;

                  return (
                    <tr
                      key={os.id}
                      onClick={() => onOpenOS(os)}
                      className={`transition-colors cursor-pointer group ${
                        isDark ? 'hover:bg-[#181920]' : 'hover:bg-neutral-50'
                      }`}
                    >
                      {/* OS & Tracking with Copy Icon */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-extrabold text-white group-hover:text-yellow-400 transition-colors flex items-center gap-1.5">
                          <span>{os.id}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleCopyTracking(os, e)}
                          title="Copiar código de rastreamento"
                          className="text-[11px] text-yellow-400/90 hover:text-yellow-400 flex items-center gap-1 mt-0.5"
                        >
                          {copiedOrderId === os.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                          )}
                          <span>{os.trackingCode}</span>
                        </button>
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-100">{os.client.name}</div>
                        <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-yellow-400" />
                          <span>{os.client.phone}</span>
                        </div>
                      </td>

                      {/* Device & Defect with Category Icon */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-yellow-400" />
                          <span>
                            {os.device.brand} {os.device.model}
                          </span>
                          <span className="text-[11px] font-normal text-neutral-400 font-mono">
                            ({os.device.color})
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate mt-0.5 flex items-center gap-1.5">
                          {getDefectIcon(os.reportedDefect)}
                          <span className="truncate">{os.reportedDefect}</span>
                        </div>
                      </td>

                      {/* Status with Expressive Colored Icons */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold">
                          {os.status === 'RECEBIDO' && (
                            <>
                              <Search className="w-3.5 h-3.5 text-neutral-400" />
                              <span className="text-neutral-300">Em Triagem</span>
                            </>
                          )}
                          {os.status === 'AGUARDANDO_APROVACAO' && (
                            <>
                              <Clock className="w-3.5 h-3.5 text-yellow-400" />
                              <span className="text-yellow-400 font-bold">Aguardando Aprovação</span>
                            </>
                          )}
                          {os.status === 'APROVADO' && (
                            <>
                              <Wrench className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-amber-400 font-bold">Em Reparo</span>
                            </>
                          )}
                          {os.status === 'AGUARDANDO_PECA' && (
                            <>
                              <Package className="w-3.5 h-3.5 text-purple-400" />
                              <span className="text-purple-400">Aguardando Peça</span>
                            </>
                          )}
                          {os.status === 'PRONTO' && (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Pronto p/ Retirada</span>
                            </>
                          )}
                          {os.status === 'ENTREGUE' && (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                              <span className="text-neutral-400">Finalizado</span>
                            </>
                          )}
                          {os.status === 'CANCELADO' && (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                              <span className="text-red-400">Não Aprovado</span>
                            </>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          Téc: {os.technician.split(' ')[0]}
                        </div>
                      </td>

                      {/* Total Amount & Payment Badge */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        <div className="font-black text-white text-sm">{formatBRL(os.totalAmount)}</div>
                        <div
                          className={`text-[10px] font-bold flex items-center justify-end gap-1 mt-0.5 ${
                            os.paymentStatus === 'PAGO' ? 'text-emerald-400' : 'text-neutral-400'
                          }`}
                        >
                          {os.paymentStatus === 'PAGO' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Pago</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-neutral-400" />
                              <span>Pendente</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Entry & Expected Dates */}
                      <td className="py-3.5 px-4 text-center font-mono text-[11px] text-neutral-400">
                        <div>{formatDateTime(os.entryDate).split(' ')[0]}</div>
                        {os.expectedDate && (
                          <div className="text-yellow-400/90 text-[10px] font-semibold">
                            Prev: {formatDateTime(os.expectedDate).split(' ')[0]}
                          </div>
                        )}
                      </td>

                      {/* Quick Interactive Icon Bar (Replaces bulky text buttons!) */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. WhatsApp Button */}
                          <a
                            href={whatsAppLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Avisar cliente no WhatsApp"
                            className={`p-2 rounded-lg border transition-all ${
                              isDark
                                ? 'bg-[#1C1D25] border-[#2C2E3C] text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500'
                                : 'bg-neutral-100 border-neutral-200 text-emerald-600 hover:bg-neutral-200'
                            }`}
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </a>

                          {/* 2. Thermal Receipt Button */}
                          <button
                            type="button"
                            onClick={() => onQuickPrint(os, 'CUSTOMER_RECEIPT')}
                            title="Imprimir Cupom de Entrada (Térmica 58/80mm - Via Cliente)"
                            className={`p-2 rounded-lg border transition-all ${
                              isDark
                                ? 'bg-[#1C1D25] border-[#2C2E3C] text-neutral-300 hover:text-yellow-400 hover:border-yellow-400'
                                : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200'
                            }`}
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* 3. O.S. Técnico (Reduzida) Button */}
                          <button
                            type="button"
                            onClick={() => onQuickPrint(os, 'TECH_RECEIPT')}
                            title="Imprimir O.S. Técnico (Via Reduzida para Bancada)"
                            className={`p-2 rounded-lg border transition-all ${
                              isDark
                                ? 'bg-[#1C1D25] border-[#2C2E3C] text-amber-300 hover:text-amber-200 hover:border-amber-400'
                                : 'bg-neutral-100 border-neutral-200 text-amber-700 hover:bg-neutral-200'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* 4. Workbench Sticker Button */}
                          <button
                            type="button"
                            onClick={() => onQuickPrint(os, 'WORKBENCH_STICKER')}
                            title="Imprimir Etiqueta de Bancada (Aparelho)"
                            className={`p-2 rounded-lg border transition-all ${
                              isDark
                                ? 'bg-[#1C1D25] border-[#2C2E3C] text-neutral-300 hover:text-yellow-400 hover:border-yellow-400'
                                : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200'
                            }`}
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </button>

                          {/* 4. Open / Details Icon Button */}
                          <button
                            type="button"
                            onClick={() => onOpenOS(os)}
                            title="Abrir detalhes e fluxo da O.S."
                            className="p-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 rounded-lg transition-all shadow-xs active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>

                          {/* 5. Delete OS Individual Button */}
                          <button
                            type="button"
                            onClick={() => setOrderToDelete(os)}
                            title="Apagar esta Ordem de Serviço individualmente"
                            className={`p-2 rounded-lg border transition-all ${
                              isDark
                                ? 'bg-[#1C1D25] border-[#2C2E3C] text-neutral-400 hover:text-rose-400 hover:border-rose-500/50 hover:bg-rose-950/20'
                                : 'bg-neutral-100 border-neutral-200 text-neutral-500 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION MODAL: DELETE WORK ORDER */}
      {orderToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-50">
          <div
            className={`w-full max-w-md rounded-2xl border p-5 md:p-6 space-y-4 shadow-2xl ${
              isDark ? 'bg-neutral-900 border-rose-500/40 text-neutral-100' : 'bg-white border-rose-300 text-neutral-900'
            }`}
          >
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2.5 rounded-xl bg-rose-500/10">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-rose-400">Apagar Ordem de Serviço?</h3>
                <p className="text-xs text-neutral-400 font-mono">{orderToDelete.id}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-neutral-300 leading-relaxed">
              <p>
                Tem certeza que deseja apagar permanentemente a Ordem de Serviço <strong>{orderToDelete.id}</strong>?
              </p>
              <div className={`p-3 rounded-xl border text-[11px] font-mono space-y-1 ${
                isDark ? 'bg-neutral-950/80 border-neutral-800 text-neutral-300' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
              }`}>
                <div>Cliente: <strong className="text-white">{orderToDelete.client.name}</strong></div>
                <div>Aparelho: {orderToDelete.device.brand} {orderToDelete.device.model} ({orderToDelete.device.color})</div>
                <div>Defeito: {orderToDelete.reportedDefect}</div>
                <div>Valor: <span className="text-yellow-400 font-bold">{formatBRL(orderToDelete.totalAmount)}</span> ({orderToDelete.status})</div>
              </div>
              <p className="text-rose-400 font-semibold text-[11px] pt-1">
                ⚠️ Esta ação excluirá a O.S. e todo o seu histórico de peças, serviços e eventos.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteOS(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 flex items-center gap-1.5 shadow-[0_0_15px_rgba(225,29,72,0.3)]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirmar Exclusão</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { OrdemDeServico, OSStatus, ConfiguracaoImpressora } from '../types';
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
} from 'lucide-react';

interface OSListViewProps {
  orders: OrdemDeServico[];
  printerConfig: ConfiguracaoImpressora;
  onOpenOS: (os: OrdemDeServico) => void;
  onNewOS: () => void;
  onQuickPrint: (os: OrdemDeServico, type: 'CUSTOMER_RECEIPT' | 'WORKBENCH_STICKER') => void;
  onOpenTracker: (initialSearch?: string) => void;
}

const STATUS_FILTERS: { id: string; label: string; countKey?: OSStatus }[] = [
  { id: 'ALL', label: 'Todas as O.S.' },
  { id: 'RECEBIDO', label: 'Em Triagem', countKey: 'RECEBIDO' },
  { id: 'AGUARDANDO_APROVACAO', label: 'Aguardando Aprovação', countKey: 'AGUARDANDO_APROVACAO' },
  { id: 'APROVADO', label: 'Em Reparo / Bancada', countKey: 'APROVADO' },
  { id: 'PRONTO', label: 'Prontos p/ Retirada', countKey: 'PRONTO' },
  { id: 'ENTREGUE', label: 'Finalizados / Entregues', countKey: 'ENTREGUE' },
];

export const OSListView: React.FC<OSListViewProps> = ({
  orders,
  printerConfig,
  onOpenOS,
  onNewOS,
  onQuickPrint,
  onOpenTracker,
}) => {
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-neutral-100/60">
      {/* Top Metrics Row */}
      <div className="p-6 pb-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Aguardando Aprovação</div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
            {pendingApprovalCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Orçamentos enviados p/ cliente</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Em Execução na Bancada</div>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-1">
            {inRepairCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Técnicos trabalhando</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Prontos para Retirada</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {readyCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Avisar clientes para buscar</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Previsão em Aberto</div>
          <div className="text-2xl font-bold font-mono text-neutral-900 mt-1">
            {formatBRL(totalOpenValue)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Faturamento em serviço</div>
        </div>
      </div>

      {/* Control Toolbar: Search + Filter Tabs */}
      <div className="p-6 pt-2 pb-3 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por OS, cliente, telefone, modelo, IMEI..."
              className="w-full text-xs px-3 py-2 pl-9 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => onOpenTracker()}
              className="px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-neutral-500" />
              <span>Rastrear O.S.</span>
            </button>
            <button
              onClick={onNewOS}
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova O.S. Ágil</span>
            </button>
          </div>
        </div>

        {/* Status Filter Tabs (Button/Tab interactive control) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {STATUS_FILTERS.map((f) => {
            const count =
              f.id === 'ALL'
                ? orders.length
                : f.id === 'APROVADO'
                ? orders.filter((o) => o.status === 'APROVADO' || o.status === 'AGUARDANDO_PECA').length
                : orders.filter((o) => o.status === f.id).length;

            return (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors flex items-center gap-1.5 ${
                  selectedFilter === f.id
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <span>{f.label}</span>
                <span className="font-mono text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main High-Density Table */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">O.S. / Rastreio</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Aparelho & Defeito</th>
                <th className="py-3 px-4">Status Atual</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4 text-center">Entrada / Previsão</th>
                <th className="py-3 px-4 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-sans">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <Smartphone className="w-8 h-8 opacity-30 mx-auto mb-2" />
                    <div className="text-sm font-medium text-neutral-600">
                      Nenhuma ordem de serviço encontrada
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Ajuste a busca ou cadastre uma nova OS.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((os) => {
                  return (
                    <tr
                      key={os.id}
                      onClick={() => onOpenOS(os)}
                      className="hover:bg-neutral-50/90 transition-colors cursor-pointer group"
                    >
                      {/* OS & Tracking */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-neutral-900 group-hover:underline">
                          {os.id}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {os.trackingCode}
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-900">{os.client.name}</div>
                        <div className="text-[11px] font-mono text-neutral-500">
                          {os.client.phone}
                        </div>
                      </td>

                      {/* Device & Defect */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
                          <span>
                            {os.device.brand} {os.device.model}
                          </span>
                          <span className="text-[11px] font-normal text-neutral-500">
                            ({os.device.color})
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                          {os.reportedDefect}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-neutral-800">
                          {os.status === 'RECEBIDO' && (
                            <span className="text-neutral-700">· Em Triagem</span>
                          )}
                          {os.status === 'AGUARDANDO_APROVACAO' && (
                            <span className="text-amber-700 font-semibold">· Aguardando Aprovação</span>
                          )}
                          {os.status === 'APROVADO' && (
                            <span className="text-blue-700 font-semibold">· Em Reparo</span>
                          )}
                          {os.status === 'AGUARDANDO_PECA' && (
                            <span className="text-purple-700">· Aguardando Peça</span>
                          )}
                          {os.status === 'PRONTO' && (
                            <span className="text-emerald-700 font-bold">· Pronto p/ Retirada</span>
                          )}
                          {os.status === 'ENTREGUE' && (
                            <span className="text-neutral-500">· Finalizado</span>
                          )}
                          {os.status === 'CANCELADO' && (
                            <span className="text-red-600">· Não Aprovado</span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          Técnico: {os.technician.split(' ')[0]}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        <div className="font-bold text-neutral-900">
                          {formatBRL(os.totalAmount)}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {os.paymentStatus === 'PAGO' ? 'Pago' : 'Pendente'}
                        </div>
                      </td>

                      {/* Entry & Expected Dates */}
                      <td className="py-3.5 px-4 text-center font-mono text-[11px] text-neutral-600">
                        <div>{formatDateTime(os.entryDate).split(' ')[0]}</div>
                        {os.expectedDate && (
                          <div className="text-neutral-400 text-[10px]">
                            Prev: {formatDateTime(os.expectedDate).split(' ')[0]}
                          </div>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onQuickPrint(os, 'CUSTOMER_RECEIPT')}
                            title="Imprimir Cupom Entrada (Térmica 58/80mm)"
                            className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onQuickPrint(os, 'WORKBENCH_STICKER')}
                            title="Imprimir Etiqueta da Bancada (Celular)"
                            className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors text-[10px] font-mono font-bold"
                          >
                            TAG
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenOS(os)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-800 rounded-md transition-colors"
                          >
                            Abrir
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
    </div>
  );
};

import React, { useState } from 'react';
import { Cliente, OrdemDeServico, AppTheme } from '../types';
import { formatBRL, formatDateTime } from '../services/escpos';
import {
  User,
  Smartphone,
  Search,
  History,
  ShieldCheck,
  Calendar,
  DollarSign,
  Plus,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Trophy,
  Layers,
  Wrench,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';

interface ClientHistoryViewProps {
  clients: Cliente[];
  orders: OrdemDeServico[];
  onOpenOS: (os: OrdemDeServico) => void;
  onNewOSForClient: (client: Cliente) => void;
  onDeleteClient?: (clientId: string) => void;
  theme?: AppTheme;
}

export const ClientHistoryView: React.FC<ClientHistoryViewProps> = ({
  clients,
  orders,
  onOpenOS,
  onNewOSForClient,
  onDeleteClient = () => {},
  theme = 'black-yellow',
}) => {
  const isDark = theme === 'black-yellow' || theme === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [clientToDelete, setClientToDelete] = useState<Cliente | null>(null);

  // Filter clients
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.cpf && c.cpf.includes(searchTerm))
  );

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // All orders for this client
  const clientOrders = orders.filter(
    (o) =>
      o.client.id === selectedClient?.id ||
      o.client.phone === selectedClient?.phone ||
      (o.client.cpf && selectedClient?.cpf && o.client.cpf === selectedClient.cpf)
  );

  // Total spent calculation
  const totalSpent = clientOrders
    .filter((o) => o.status === 'ENTREGUE' || o.paymentStatus === 'PAGO')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Unique devices count
  const uniqueDevices = Array.from(
    new Set(clientOrders.map((o) => `${o.device.brand} ${o.device.model} (${o.device.imei || o.device.color})`))
  );

  // Check warranty status (90 days from exitDate or entryDate)
  const isUnderWarranty = (os: OrdemDeServico): boolean => {
    if (os.status !== 'ENTREGUE' && os.status !== 'PRONTO') return false;
    const refDate = os.exitDate ? new Date(os.exitDate) : new Date(os.entryDate);
    const diffDays = (Date.now() - refDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= os.warrantyDays;
  };

  return (
    <div
      className={`flex-1 flex flex-col md:flex-row overflow-hidden transition-colors ${
        isDark ? 'bg-[#0E0F12] text-neutral-100' : 'bg-neutral-100/70 text-neutral-900'
      }`}
    >
      {/* Left Sidebar: Client Directory */}
      <div
        className={`w-full md:w-80 border-r flex flex-col shrink-0 ${
          isDark ? 'bg-[#121317] border-[#252630]' : 'bg-white border-neutral-200'
        }`}
      >
        <div className={`p-4 border-b ${isDark ? 'border-[#252630]' : 'border-neutral-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold">Histórico de Clientes</h2>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, telefone ou CPF..."
              className={`w-full text-xs px-3 py-2.5 pl-8 border rounded-lg outline-none transition-colors ${
                isDark
                  ? 'bg-[#1A1B22] border-[#2D2E3A] text-white focus:border-yellow-400'
                  : 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-900'
              }`}
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-3" />
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto divide-y ${isDark ? 'divide-[#22232B]' : 'divide-neutral-100'}`}>
          {filteredClients.map((client) => {
            const count = orders.filter(
              (o) => o.client.id === client.id || o.client.phone === client.phone
            ).length;
            const isSelected = selectedClient?.id === client.id;

            return (
              <button
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`w-full p-4 text-left transition-colors flex items-center justify-between ${
                  isSelected
                    ? isDark
                      ? 'bg-[#1D1E26] border-l-4 border-yellow-400 text-white'
                      : 'bg-neutral-100/90 border-l-4 border-neutral-900'
                    : isDark
                    ? 'hover:bg-[#181920] text-neutral-300'
                    : 'hover:bg-neutral-50 text-neutral-900'
                }`}
              >
                <div className="space-y-0.5 truncate">
                  <div className="text-xs font-bold truncate flex items-center gap-1.5">
                    <span>{client.name}</span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-yellow-400" />
                    <span>{client.phone}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      count > 1
                        ? 'bg-yellow-400 text-neutral-950 shadow-2xs'
                        : isDark
                        ? 'bg-[#2A2B36] text-neutral-400'
                        : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {count} {count === 1 ? 'OS' : 'OSs'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area: Selected Client Profile & Chronological Repairs */}
      {selectedClient ? (
        <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
          {/* Client Header Card with Yellow Accents */}
          <div
            className={`rounded-xl border p-5 shadow-2xs space-y-4 ${
              isDark ? 'bg-[#15161B] border-[#262730]' : 'bg-white border-neutral-200'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-400 text-neutral-950 flex items-center justify-center font-black text-lg shadow-[0_0_15px_rgba(250,204,21,0.25)]">
                  {selectedClient.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{selectedClient.name}</span>
                    {clientOrders.length >= 2 && (
                      <span className="text-[11px] bg-yellow-400 text-neutral-950 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        <span>Fidelizado</span>
                      </span>
                    )}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mt-1">
                    <span className="flex items-center gap-1 font-mono text-yellow-400">
                      <Phone className="w-3.5 h-3.5" />
                      {selectedClient.phone}
                    </span>
                    {selectedClient.cpf && (
                      <span className="flex items-center gap-1 font-mono">
                        CPF: {selectedClient.cpf}
                      </span>
                    )}
                    {selectedClient.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {selectedClient.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setClientToDelete(selectedClient)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                    isDark
                      ? 'border-neutral-800 hover:border-rose-500/50 text-neutral-400 hover:text-rose-400 bg-neutral-900/40'
                      : 'border-neutral-200 hover:border-rose-300 text-neutral-600 hover:text-rose-600 bg-white'
                  }`}
                  title="Apagar este cliente cadastrado"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Cliente</span>
                </button>

                <button
                  onClick={() => onNewOSForClient(selectedClient)}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 rounded-lg text-xs font-black flex items-center gap-2 shadow-[0_0_15px_rgba(250,204,21,0.25)] transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Nova O.S. Para Este Cliente</span>
                </button>
              </div>
            </div>

            {selectedClient.address && (
              <div
                className={`text-xs text-neutral-400 flex items-center gap-1.5 pt-2 border-t ${
                  isDark ? 'border-[#262730]' : 'border-neutral-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                <span>{selectedClient.address}</span>
              </div>
            )}

            {/* Quick Metrics Bar with Visual Icons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-[#1C1D24] border-[#2E303C]' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400">Total de Reparos</div>
                  <div className="text-xl font-extrabold font-mono text-white mt-0.5">
                    {clientOrders.length} ordens
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                  <History className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>

              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-[#1C1D24] border-[#2E303C]' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400">Aparelhos Distintos</div>
                  <div className="text-xl font-extrabold font-mono text-amber-400 mt-0.5">
                    {uniqueDevices.length} modelos
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>

              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-[#1C1D24] border-[#2E303C]' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400">Faturamento Acumulado</div>
                  <div className="text-xl font-extrabold font-mono text-yellow-400 mt-0.5">
                    {formatBRL(totalSpent)}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-yellow-400/20 text-yellow-400 flex items-center justify-center shadow-[0_0_10px_rgba(250,204,21,0.2)]">
                  <DollarSign className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>
            </div>
          </div>

          {/* Chronological Repair Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-yellow-400" />
                <span>Histórico Completo de Reparos & Garantias</span>
              </h3>
              <span className="text-xs text-neutral-400 font-mono">Mais recentes primeiro</span>
            </div>

            {clientOrders.length === 0 ? (
              <div
                className={`rounded-xl border p-8 text-center text-xs ${
                  isDark ? 'bg-[#15161B] border-[#262730] text-neutral-400' : 'bg-white border-neutral-200 text-neutral-500'
                }`}
              >
                Nenhuma ordem de serviço registrada para este cliente ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {clientOrders.map((os) => {
                  const underWarranty = isUnderWarranty(os);

                  return (
                    <div
                      key={os.id}
                      className={`rounded-xl border p-5 shadow-2xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                        isDark
                          ? 'bg-[#15161B] border-[#262730] hover:border-yellow-400/40'
                          : 'bg-white border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-extrabold font-mono text-yellow-400 text-sm">
                            {os.id}
                          </span>
                          <span className="text-xs text-neutral-400 font-mono">
                            · {formatDateTime(os.entryDate)}
                          </span>

                          <span
                            className={`text-xs px-2.5 py-0.5 rounded font-bold border ${
                              os.status === 'ENTREGUE'
                                ? 'bg-neutral-800 text-neutral-300 border-neutral-700'
                                : os.status === 'PRONTO'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                : 'bg-yellow-400/15 text-yellow-400 border-yellow-400/30'
                            }`}
                          >
                            {os.status}
                          </span>

                          {underWarranty && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Garantia Ativa (90 dias)
                            </span>
                          )}
                        </div>

                        {/* Device & Defect info */}
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2 text-white font-bold">
                            <Smartphone className="w-4 h-4 text-yellow-400" />
                            <span>
                              {os.device.brand} {os.device.model} ({os.device.color})
                            </span>
                            {os.device.imei && (
                              <span className="text-neutral-400 font-mono text-[11px]">
                                IMEI: {os.device.imei}
                              </span>
                            )}
                          </div>
                          <div className="text-neutral-300">
                            <strong className="text-white">Defeito Reclamado: </strong> {os.reportedDefect}
                          </div>
                          {os.technicalDiagnosis && (
                            <div
                              className={`font-mono text-[11px] p-2.5 rounded border ${
                                isDark ? 'bg-[#1D1E25] border-[#2A2B35] text-neutral-300' : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                              }`}
                            >
                              <strong className="text-yellow-400">Laudo Técnico: </strong> {os.technicalDiagnosis}
                            </div>
                          )}
                        </div>

                        {/* Parts replaced badge list */}
                        {os.items.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {os.items.map((it) => (
                              <span
                                key={it.id}
                                className={`text-[11px] px-2 py-0.5 rounded font-mono font-medium ${
                                  isDark ? 'bg-[#22242D] text-neutral-300 border border-[#2F313D]' : 'bg-neutral-100 text-neutral-700'
                                }`}
                              >
                                {it.description} ({formatBRL(it.total)})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right side value and details action */}
                      <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-[#262730] gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-[11px] text-neutral-400">Total do Conserto</div>
                          <div className="text-base font-black font-mono text-yellow-400">
                            {formatBRL(os.totalAmount)}
                          </div>
                        </div>

                        <button
                          onClick={() => onOpenOS(os)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                            isDark
                              ? 'bg-[#1E1F27] border-[#2F313D] text-white hover:border-yellow-400 hover:text-yellow-400'
                              : 'bg-neutral-100 border-neutral-200 text-neutral-800 hover:bg-neutral-200'
                          }`}
                        >
                          <span>Ver Detalhes</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-neutral-400 text-xs">
          Selecione um cliente ao lado para ver o histórico de consertos.
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE CLIENT */}
      {clientToDelete && (
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
                <h3 className="font-bold text-base text-rose-400">Excluir Cadastro do Cliente?</h3>
                <p className="text-xs text-neutral-400">{clientToDelete.name}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-neutral-300 leading-relaxed">
              <p>
                Deseja realmente apagar o cadastro de <strong>{clientToDelete.name}</strong> (Tel: {clientToDelete.phone})?
              </p>
              {orders.filter(
                (o) =>
                  o.client.id === clientToDelete.id ||
                  o.client.phone === clientToDelete.phone ||
                  (o.client.cpf && clientToDelete.cpf && o.client.cpf === clientToDelete.cpf)
              ).length > 0 && (
                <div className={`p-3 rounded-xl border text-[11px] ${
                  isDark ? 'bg-amber-950/20 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  ⚠️ <strong>Aviso:</strong> Este cliente possui ordens de serviço registradas. As ordens de serviço anteriores continuarão preservadas com os dados do cliente para garantir o histórico de manutenções e receitas da loja.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteClient(clientToDelete.id);
                  setClientToDelete(null);
                  // select another client if available
                  const remaining = clients.filter((c) => c.id !== clientToDelete.id);
                  setSelectedClientId(remaining[0]?.id || '');
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

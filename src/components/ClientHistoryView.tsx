import React, { useState } from 'react';
import { Cliente, OrdemDeServico } from '../types';
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
} from 'lucide-react';

interface ClientHistoryViewProps {
  clients: Cliente[];
  orders: OrdemDeServico[];
  onOpenOS: (os: OrdemDeServico) => void;
  onNewOSForClient: (client: Cliente) => void;
}

export const ClientHistoryView: React.FC<ClientHistoryViewProps> = ({
  clients,
  orders,
  onOpenOS,
  onNewOSForClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');

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
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-neutral-100/70">
      {/* Left Sidebar: Client Directory */}
      <div className="w-full md:w-80 border-r border-neutral-200 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-neutral-800" />
            <h2 className="text-sm font-semibold text-neutral-900">Histórico de Clientes</h2>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, telefone ou CPF..."
              className="w-full text-xs px-3 py-2 pl-8 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
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
                  isSelected ? 'bg-neutral-100/90 border-l-3 border-neutral-900' : 'hover:bg-neutral-50'
                }`}
              >
                <div className="space-y-0.5 truncate">
                  <div className="text-xs font-semibold text-neutral-900 truncate">
                    {client.name}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-500">
                    {client.phone}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-[11px] font-mono font-medium text-neutral-600 bg-neutral-200/70 px-1.5 py-0.5 rounded">
                    {count} {count === 1 ? 'conserto' : 'consertos'}
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
          {/* Client Header Card */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-lg">
                  {selectedClient.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-neutral-900">
                    {selectedClient.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-0.5">
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      {selectedClient.phone}
                    </span>
                    {selectedClient.cpf && (
                      <span className="flex items-center gap-1 font-mono">
                        CPF: {selectedClient.cpf}
                      </span>
                    )}
                    {selectedClient.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        {selectedClient.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNewOSForClient(selectedClient)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nova OS Para Este Cliente</span>
              </button>
            </div>

            {selectedClient.address && (
              <div className="text-xs text-neutral-600 flex items-center gap-1.5 pt-1 border-t border-neutral-100">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span>{selectedClient.address}</span>
              </div>
            )}

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                <div className="text-[11px] font-medium text-neutral-500">Total de Reparos</div>
                <div className="text-lg font-bold font-mono text-neutral-900 mt-0.5">
                  {clientOrders.length} ordens de serviço
                </div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                <div className="text-[11px] font-medium text-neutral-500">Aparelhos Distintos</div>
                <div className="text-lg font-bold font-mono text-neutral-900 mt-0.5">
                  {uniqueDevices.length} modelos
                </div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                <div className="text-[11px] font-medium text-neutral-500">Faturamento Acumulado</div>
                <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
                  {formatBRL(totalSpent)}
                </div>
              </div>
            </div>
          </div>

          {/* Chronological Repair Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                <History className="w-4 h-4 text-neutral-700" />
                <span>Histórico Completo de Reparos & Garantias</span>
              </h3>
              <span className="text-xs text-neutral-500">
                Ordenado cronologicamente (mais recentes primeiro)
              </span>
            </div>

            {clientOrders.length === 0 ? (
              <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center text-neutral-500 text-xs">
                Nenhuma ordem de serviço registrada para este cliente ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {clientOrders.map((os) => {
                  const underWarranty = isUnderWarranty(os);

                  return (
                    <div
                      key={os.id}
                      className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs hover:border-neutral-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold font-mono text-neutral-900 text-sm">
                            {os.id}
                          </span>
                          <span className="text-xs text-neutral-500 font-mono">
                            · {formatDateTime(os.entryDate)}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-medium border ${
                              os.status === 'ENTREGUE'
                                ? 'bg-neutral-100 text-neutral-800 border-neutral-300'
                                : os.status === 'PRONTO'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-blue-50 text-blue-800 border-blue-300'
                            }`}
                          >
                            {os.status}
                          </span>

                          {underWarranty && (
                            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Garantia Ativa (90 dias)
                            </span>
                          )}
                        </div>

                        {/* Device & Defect info */}
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2 text-neutral-800 font-medium">
                            <Smartphone className="w-4 h-4 text-neutral-500" />
                            <span>
                              {os.device.brand} {os.device.model} ({os.device.color})
                            </span>
                            {os.device.imei && (
                              <span className="text-neutral-400 font-mono text-[11px]">
                                IMEI: {os.device.imei}
                              </span>
                            )}
                          </div>
                          <div className="text-neutral-600">
                            <strong>Defeito: </strong> {os.reportedDefect}
                          </div>
                          {os.technicalDiagnosis && (
                            <div className="text-neutral-500 font-mono text-[11px] bg-neutral-50 p-2 rounded border border-neutral-100">
                              <strong>Laudo: </strong> {os.technicalDiagnosis}
                            </div>
                          )}
                        </div>

                        {/* Parts replaced badge list */}
                        {os.items.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {os.items.map((it) => (
                              <span
                                key={it.id}
                                className="text-[11px] px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded font-mono"
                              >
                                {it.description} ({formatBRL(it.total)})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right side value and details action */}
                      <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100 gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-[11px] text-neutral-400">Total do Conserto</div>
                          <div className="text-base font-bold font-mono text-neutral-900">
                            {formatBRL(os.totalAmount)}
                          </div>
                        </div>

                        <button
                          onClick={() => onOpenOS(os)}
                          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
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
        <div className="flex-1 flex items-center justify-center p-8 text-neutral-500 text-xs">
          Selecione um cliente ao lado para ver o histórico de consertos.
        </div>
      )}
    </div>
  );
};

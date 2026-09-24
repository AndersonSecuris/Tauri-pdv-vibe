import React, { useState } from 'react';
import { OrdemDeServico, OSStatus } from '../types';
import { formatBRL, formatDateTime } from '../services/escpos';
import {
  Search,
  CheckCircle2,
  Clock,
  Smartphone,
  ShieldCheck,
  Check,
  AlertCircle,
  ExternalLink,
  ThumbsUp,
  X,
  Phone,
  Wrench,
  CheckCircle,
} from 'lucide-react';

interface OSTrackerModalProps {
  orders: OrdemDeServico[];
  initialSearch?: string;
  onApproveBudget?: (osId: string) => void;
  onClose: () => void;
}

const TRACKING_STEPS = [
  { key: 'RECEBIDO', label: '1. Entrada & Triagem', desc: 'Aparelho na loja' },
  { key: 'AGUARDANDO_APROVACAO', label: '2. Orçamento Gerado', desc: 'Aguardando aprovação' },
  { key: 'APROVADO', label: '3. Reparo em Bancada', desc: 'Técnico trabalhando' },
  { key: 'PRONTO', label: '4. Pronto para Retirada', desc: 'Testado e disponível' },
  { key: 'ENTREGUE', label: '5. Entregue com Garantia', desc: 'Finalizado' },
];

export const OSTrackerModal: React.FC<OSTrackerModalProps> = ({
  orders,
  initialSearch = '',
  onApproveBudget,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch || 'OS-2026-0842');
  const [searchedOS, setSearchedOS] = useState<OrdemDeServico | null>(() => {
    if (initialSearch) {
      return (
        orders.find(
          (o) =>
            o.id.toLowerCase() === initialSearch.toLowerCase() ||
            o.trackingCode.toLowerCase() === initialSearch.toLowerCase() ||
            o.client.phone.includes(initialSearch)
        ) || null
      );
    }
    return orders[0] || null;
  });

  const [approvalFeedback, setApprovalFeedback] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchTerm.trim().toLowerCase();
    if (!query) return;

    const found = orders.find(
      (o) =>
        o.id.toLowerCase() === query ||
        o.trackingCode.toLowerCase() === query ||
        o.client.phone.replace(/\D/g, '').includes(query.replace(/\D/g, '')) ||
        (o.device.imei && o.device.imei.toLowerCase() === query)
    );

    setSearchedOS(found || null);
    setApprovalFeedback(false);
  };

  const getStepStatus = (stepKey: string, currentStatus: OSStatus) => {
    const orderIndexMap: Record<string, number> = {
      RECEBIDO: 1,
      AGUARDANDO_APROVACAO: 2,
      APROVADO: 3,
      AGUARDANDO_PECA: 3,
      PRONTO: 4,
      ENTREGUE: 5,
      CANCELADO: 0,
    };

    const currentOrder = orderIndexMap[currentStatus] || 1;
    const stepOrder = orderIndexMap[stepKey] || 1;

    if (currentStatus === 'CANCELADO') return 'CANCELLED';
    if (currentOrder > stepOrder) return 'COMPLETED';
    if (currentOrder === stepOrder) return 'CURRENT';
    return 'UPCOMING';
  };

  const handleApprove = () => {
    if (searchedOS && onApproveBudget) {
      onApproveBudget(searchedOS.id);
      setApprovalFeedback(true);
      // Update local state
      setSearchedOS({
        ...searchedOS,
        status: 'APROVADO',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 max-w-3xl w-full my-auto flex flex-col max-h-[94vh] overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Search className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Portal de Rastreamento de Conserto</h2>
              <p className="text-xs text-neutral-400">
                Acompanhe o status do aparelho, diagnóstico e aprove orçamentos online.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-neutral-50 border-b border-neutral-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o número da OS (ex: OS-2026-0842), Código de rastreio ou Telefone..."
                className="w-full text-xs px-3 py-2 pl-9 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Consultar</span>
            </button>
          </form>

          {/* Quick preset links for demo */}
          <div className="flex items-center gap-2 mt-2 text-[11px] text-neutral-500">
            <span>Exemplos rápidos:</span>
            {orders.slice(0, 3).map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setSearchTerm(o.id);
                  setSearchedOS(o);
                }}
                className="underline hover:text-neutral-900 font-mono"
              >
                {o.id} ({o.device.model})
              </button>
            ))}
          </div>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!searchedOS ? (
            <div className="text-center py-12 space-y-2">
              <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto" />
              <div className="text-sm font-semibold text-neutral-700">
                Nenhuma Ordem de Serviço encontrada
              </div>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Verifique se digitou o número da OS correto (ex: OS-2026-0842) ou o telefone com DDD.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* OS Main Info Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-mono text-neutral-900">
                      {searchedOS.id}
                    </span>
                    <span className="text-xs font-mono text-neutral-500">
                      (Rastreio: {searchedOS.trackingCode})
                    </span>
                  </div>
                  <div className="text-xs text-neutral-600 mt-0.5">
                    Cliente: <strong className="text-neutral-900">{searchedOS.client.name}</strong> · Entrada em {formatDateTime(searchedOS.entryDate)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-neutral-500">Valor Total do Conserto:</div>
                  <div className="text-xl font-bold font-mono text-neutral-900">
                    {formatBRL(searchedOS.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Visual Step Timeline */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Progresso do Reparo:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {TRACKING_STEPS.map((step) => {
                    const status = getStepStatus(step.key, searchedOS.status);

                    let boxBg = 'bg-white border-neutral-200 text-neutral-400';
                    let icon = <Clock className="w-4 h-4 text-neutral-400" />;

                    if (status === 'COMPLETED') {
                      boxBg = 'bg-emerald-50 border-emerald-300 text-emerald-900';
                      icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
                    } else if (status === 'CURRENT') {
                      boxBg = 'bg-neutral-900 border-neutral-900 text-white shadow-xs';
                      icon = <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />;
                    }

                    return (
                      <div
                        key={step.key}
                        className={`p-3 rounded-lg border text-xs flex flex-col justify-between transition-colors ${boxBg}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">{step.label}</span>
                          {icon}
                        </div>
                        <span className="text-[11px] opacity-80">{step.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action: Approve Budget if Waiting for Approval */}
              {searchedOS.status === 'AGUARDANDO_APROVACAO' && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-900">
                        Orçamento Aguardando Sua Aprovação
                      </h4>
                      <p className="text-xs text-amber-800 mt-0.5">
                        O laudo técnico foi concluído com sucesso. Para que nossos técnicos iniciem a montagem das peças na bancada, por favor autorize o orçamento abaixo:
                      </p>
                    </div>
                  </div>

                  {approvalFeedback ? (
                    <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-900 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-700" />
                      <span>Orçamento Aprovado com Sucesso! Seu aparelho já entrou na fila de reparo.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={handleApprove}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Aprovar Orçamento ({formatBRL(searchedOS.totalAmount)})</span>
                      </button>
                      <span className="text-xs text-neutral-500">
                        Garantia legal de 90 dias após a conclusão.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Details & Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Device & Defect */}
                <div className="p-4 border border-neutral-200 rounded-lg space-y-2 bg-neutral-50/50">
                  <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>Aparelho em Conserto</span>
                  </div>
                  <div className="space-y-1 text-neutral-600">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Modelo:</span>
                      <span className="font-semibold text-neutral-900">
                        {searchedOS.device.brand} {searchedOS.device.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Cor:</span>
                      <span>{searchedOS.device.color}</span>
                    </div>
                    {searchedOS.device.imei && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">IMEI:</span>
                        <span className="font-mono">{searchedOS.device.imei}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-neutral-200">
                      <span className="text-neutral-400 block mb-0.5">Defeito Informado:</span>
                      <p className="font-mono text-neutral-800">{searchedOS.reportedDefect}</p>
                    </div>
                  </div>
                </div>

                {/* Technical Diagnosis */}
                <div className="p-4 border border-neutral-200 rounded-lg space-y-2 bg-neutral-50/50">
                  <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4" />
                    <span>Parecer Técnico da Assistência</span>
                  </div>
                  <p className="font-mono text-neutral-700 bg-white p-2.5 rounded border border-neutral-200 leading-relaxed min-h-[70px]">
                    {searchedOS.technicalDiagnosis ||
                      'Aparelho sob análise na bancada. Os testes preliminares estão em andamento.'}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                    <span>Técnico: {searchedOS.technician}</span>
                    <span className="flex items-center gap-1 text-emerald-700">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Garantia 90 Dias
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown of items */}
              {searchedOS.items.length > 0 && (
                <div className="space-y-2 text-xs">
                  <div className="font-semibold text-neutral-700">Peças e Mão de Obra:</div>
                  <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-neutral-100 text-neutral-600 text-[11px]">
                        <tr>
                          <th className="py-2 px-3">Item / Serviço</th>
                          <th className="py-2 px-3 text-center">Qtd</th>
                          <th className="py-2 px-3 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {searchedOS.items.map((it) => (
                          <tr key={it.id}>
                            <td className="py-2 px-3 font-medium text-neutral-900">{it.description}</td>
                            <td className="py-2 px-3 text-center font-mono">{it.quantity}</td>
                            <td className="py-2 px-3 text-right font-mono">{formatBRL(it.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-200 hover:bg-neutral-300 rounded-lg transition-colors"
          >
            Fechar Rastreamento
          </button>
        </div>
      </div>
    </div>
  );
};

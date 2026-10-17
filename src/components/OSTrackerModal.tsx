import React, { useState } from 'react';
import { OrdemDeServico, OSStatus, AppTheme } from '../types';
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
  Copy,
  Layers,
  Sparkles,
} from 'lucide-react';

interface OSTrackerModalProps {
  orders: OrdemDeServico[];
  initialSearch?: string;
  theme?: AppTheme;
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
  theme = 'black-yellow',
  onApproveBudget,
  onClose,
}) => {
  const isDark = theme === 'black-yellow' || theme === 'dark';

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
  const [copiedCode, setCopiedCode] = useState(false);

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
      setSearchedOS({
        ...searchedOS,
        status: 'APROVADO',
      });
    }
  };

  const handleCopyCode = () => {
    if (!searchedOS) return;
    navigator.clipboard.writeText(searchedOS.trackingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        className={`rounded-2xl shadow-2xl border max-w-3xl w-full my-auto flex flex-col max-h-[94vh] overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#121317] border-[#252631] text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Top Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-neutral-900 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-400 text-neutral-950 flex items-center justify-center shadow-[0_0_12px_rgba(250,204,21,0.25)]">
              <Search className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Portal de Rastreamento de Conserto</span>
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              </h2>
              <p className="text-xs text-neutral-400">
                Acompanhe o status do aparelho, diagnóstico e aprove orçamentos online.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg border transition-colors ${
              isDark
                ? 'bg-[#1E2029] border-[#2A2C38] text-neutral-400 hover:text-white hover:bg-[#282A36]'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div
          className={`p-4 border-b ${
            isDark ? 'bg-[#16171D] border-[#252631]' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o número da OS (ex: OS-2026-0842), Código de rastreio ou Telefone..."
                className={`w-full text-xs px-3 py-2 pl-9 border rounded-xl font-mono outline-none transition-colors ${
                  isDark
                    ? 'bg-[#101115] border-[#2A2C38] text-white focus:border-yellow-400'
                    : 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-900'
                }`}
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Consultar</span>
            </button>
          </form>

          {/* Quick preset links for demo */}
          <div className="flex items-center gap-2 mt-2 text-[11px] text-neutral-400 overflow-x-auto pb-0.5">
            <span className="font-semibold text-neutral-400">Exemplos:</span>
            {orders.slice(0, 3).map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setSearchTerm(o.id);
                  setSearchedOS(o);
                }}
                className={`font-mono px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                  isDark
                    ? 'bg-[#1D1F28] border-[#2E313E] text-yellow-400/90 hover:text-yellow-400 hover:border-yellow-400/50'
                    : 'bg-neutral-100 border-neutral-300 text-neutral-800 hover:bg-neutral-200'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>{o.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!searchedOS ? (
            <div className="text-center py-12 space-y-2">
              <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto" />
              <div className="text-sm font-bold text-white">
                Nenhuma Ordem de Serviço encontrada
              </div>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Verifique se digitou o número da OS correto (ex: OS-2026-0842) ou o telefone com DDD.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* OS Main Info Banner */}
              <div
                className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border ${
                  isDark
                    ? 'bg-[#17181F] border-[#292B37]'
                    : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black font-mono text-white">
                      {searchedOS.id}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      title="Copiar código de rastreamento"
                      className={`text-xs font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                        isDark
                          ? 'bg-[#101115] border-[#2A2C38] text-yellow-400 hover:border-yellow-400'
                          : 'bg-neutral-200 border-neutral-300 text-neutral-700'
                      }`}
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{searchedOS.trackingCode}</span>
                    </button>
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    Cliente: <strong className="text-white">{searchedOS.client.name}</strong> · Entrada em {formatDateTime(searchedOS.entryDate)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-neutral-400">Valor Total do Conserto:</div>
                  <div className="text-2xl font-black font-mono text-yellow-400">
                    {formatBRL(searchedOS.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Visual Step Timeline */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Progresso do Reparo:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {TRACKING_STEPS.map((step) => {
                    const status = getStepStatus(step.key, searchedOS.status);

                    let boxBg = isDark
                      ? 'bg-[#15161C] border-[#242633] text-neutral-400'
                      : 'bg-white border-neutral-200 text-neutral-400';
                    let icon = <Clock className="w-4 h-4 text-neutral-400" />;

                    if (status === 'COMPLETED') {
                      boxBg = isDark
                        ? 'bg-emerald-400/10 border-emerald-400/40 text-emerald-400'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-900';
                      icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
                    } else if (status === 'CURRENT') {
                      boxBg = 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)] font-bold';
                      icon = <Clock className="w-4 h-4 text-neutral-950 stroke-[3] animate-pulse" />;
                    }

                    return (
                      <div
                        key={step.key}
                        className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition-all ${boxBg}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold">{step.label}</span>
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
                <div
                  className={`p-4 border rounded-xl space-y-3 ${
                    isDark
                      ? 'bg-yellow-400/10 border-yellow-400/40 text-neutral-200'
                      : 'bg-amber-50 border-amber-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-yellow-400">
                        Orçamento Aguardando Sua Aprovação
                      </h4>
                      <p className="text-xs text-neutral-300 mt-0.5">
                        O laudo técnico foi concluído com sucesso. Para que nossos técnicos iniciem a montagem das peças na bancada, por favor autorize o orçamento abaixo:
                      </p>
                    </div>
                  </div>

                  {approvalFeedback ? (
                    <div className="p-3 bg-emerald-400/20 border border-emerald-400/40 rounded-xl text-xs font-bold text-emerald-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Orçamento Aprovado com Sucesso! Seu aparelho já entrou na fila de reparo.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={handleApprove}
                        className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(250,204,21,0.25)] active:scale-95"
                      >
                        <ThumbsUp className="w-4 h-4 stroke-[2.5]" />
                        <span>Aprovar Orçamento ({formatBRL(searchedOS.totalAmount)})</span>
                      </button>
                      <span className="text-xs text-neutral-400">
                        Garantia legal de 90 dias após a conclusão.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Details & Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Device & Defect */}
                <div
                  className={`p-4 border rounded-xl space-y-2.5 ${
                    isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="font-bold text-yellow-400 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>Aparelho em Conserto</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Modelo:</span>
                      <span className="font-bold text-white">
                        {searchedOS.device.brand} {searchedOS.device.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Cor:</span>
                      <span className="text-neutral-200">{searchedOS.device.color}</span>
                    </div>
                    {searchedOS.device.imei && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">IMEI:</span>
                        <span className="font-mono text-neutral-200">{searchedOS.device.imei}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-[#292B37]">
                      <span className="text-neutral-400 block mb-0.5">Defeito Informado:</span>
                      <p className="font-mono text-neutral-200">{searchedOS.reportedDefect}</p>
                    </div>
                  </div>
                </div>

                {/* Technical Diagnosis */}
                <div
                  className={`p-4 border rounded-xl space-y-2.5 ${
                    isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="font-bold text-yellow-400 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4" />
                    <span>Parecer Técnico da Assistência</span>
                  </div>
                  <p
                    className={`font-mono p-3 rounded-lg border leading-relaxed min-h-[70px] ${
                      isDark
                        ? 'bg-[#121317] border-[#262834] text-neutral-200'
                        : 'bg-white border-neutral-200 text-neutral-800'
                    }`}
                  >
                    {searchedOS.technicalDiagnosis ||
                      'Aparelho sob análise na bancada. Os testes preliminares estão em andamento.'}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                    <span>Técnico: {searchedOS.technician}</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Garantia 90 Dias
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown of items */}
              {searchedOS.items.length > 0 && (
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-yellow-400">Peças e Mão de Obra Lançadas:</div>
                  <div
                    className={`border rounded-xl overflow-hidden ${
                      isDark ? 'border-[#292B37] bg-[#16171E]' : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <table className="w-full text-left">
                      <thead
                        className={`text-[11px] font-bold uppercase ${
                          isDark
                            ? 'bg-[#1D1E28] text-neutral-400 border-b border-[#292B37]'
                            : 'bg-neutral-100 text-neutral-600 border-b border-neutral-200'
                        }`}
                      >
                        <tr>
                          <th className="py-2.5 px-3">Item / Serviço</th>
                          <th className="py-2.5 px-3 text-center">Qtd</th>
                          <th className="py-2.5 px-3 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-[#242633]' : 'divide-neutral-200'}`}>
                        {searchedOS.items.map((it) => (
                          <tr key={it.id}>
                            <td className="py-2.5 px-3 font-semibold text-white">{it.description}</td>
                            <td className="py-2.5 px-3 text-center font-mono text-neutral-300">{it.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-yellow-400">
                              {formatBRL(it.total)}
                            </td>
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
        <div
          className={`px-6 py-4 border-t flex items-center justify-end ${
            isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors ${
              isDark
                ? 'bg-[#1F202B] border-[#2E313E] text-neutral-300 hover:text-white hover:bg-[#282A36]'
                : 'bg-neutral-200 border-neutral-300 text-neutral-700 hover:bg-neutral-300'
            }`}
          >
            Fechar Rastreamento
          </button>
        </div>
      </div>
    </div>
  );
};

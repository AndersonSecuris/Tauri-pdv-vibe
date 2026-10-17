import React, { useState } from 'react';
import { CaixaSessao, MovimentacaoCaixa, ConfiguracaoImpressora, AppTheme } from '../types';
import { formatBRL, formatDateTime } from '../services/escpos';
import {
  Coins,
  ArrowDownRight,
  ArrowUpRight,
  Printer,
  X,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingDown,
  TrendingUp,
  CreditCard,
  QrCode,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

interface CaixaModalProps {
  caixa: CaixaSessao;
  printerConfig: ConfiguracaoImpressora;
  theme?: AppTheme;
  onUpdateCaixa: (caixa: CaixaSessao) => void;
  onPrintReport: () => void;
  onClose: () => void;
}

export const CaixaModal: React.FC<CaixaModalProps> = ({
  caixa,
  printerConfig,
  theme = 'black-yellow',
  onUpdateCaixa,
  onPrintReport,
  onClose,
}) => {
  const isDark = theme === 'black-yellow' || theme === 'dark';

  const [movementType, setMovementType] = useState<'SANGRIA' | 'SUPRIMENTO'>('SANGRIA');
  const [movementAmount, setMovementAmount] = useState<number>(0);
  const [movementReason, setMovementReason] = useState('');
  const [finalCashInput, setFinalCashInput] = useState<number>(caixa.expectedCash);

  const handleAddMovement = () => {
    if (movementAmount <= 0 || !movementReason.trim()) {
      alert('Informe o valor e o motivo da movimentação.');
      return;
    }

    const newMov: MovimentacaoCaixa = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: movementType,
      amount: movementAmount,
      reason: movementReason.trim(),
      author: 'Beatriz Almeida',
    };

    const newCashWithdrawals =
      movementType === 'SANGRIA' ? caixa.cashWithdrawals + movementAmount : caixa.cashWithdrawals;
    const newCashAdditions =
      movementType === 'SUPRIMENTO' ? caixa.cashAdditions + movementAmount : caixa.cashAdditions;

    const newExpectedCash =
      caixa.initialCash +
      newCashAdditions -
      newCashWithdrawals +
      caixa.totalSalesCash +
      caixa.totalOSCash;

    const updated: CaixaSessao = {
      ...caixa,
      cashWithdrawals: newCashWithdrawals,
      cashAdditions: newCashAdditions,
      expectedCash: newExpectedCash,
      movements: [newMov, ...caixa.movements],
    };

    onUpdateCaixa(updated);
    setMovementAmount(0);
    setMovementReason('');
  };

  const handleToggleCaixaStatus = () => {
    if (caixa.status === 'ABERTO') {
      const updated: CaixaSessao = {
        ...caixa,
        status: 'FECHADO',
        closedAt: new Date().toISOString(),
        finalCash: finalCashInput,
      };
      onUpdateCaixa(updated);
    } else {
      const updated: CaixaSessao = {
        ...caixa,
        status: 'ABERTO',
        closedAt: undefined,
        finalCash: undefined,
      };
      onUpdateCaixa(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className={`rounded-2xl shadow-2xl border max-w-2xl w-full flex flex-col max-h-[92vh] overflow-hidden transition-colors ${
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
              <Coins className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Gestão e Fechamento de Caixa</h2>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                    caixa.status === 'ABERTO'
                      ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/40'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  {caixa.status === 'ABERTO' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span>{caixa.status}</span>
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Operador: {caixa.cashierName} · Aberto em {formatDateTime(caixa.openedAt)}
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Balance Cards with Bold Icons and Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className={`p-3.5 rounded-xl border ${
                isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="text-neutral-400 text-[11px] font-semibold flex items-center gap-1">
                <Coins className="w-3 h-3 text-neutral-400" />
                <span>Fundo Inicial</span>
              </div>
              <div className="text-base font-extrabold font-mono text-white mt-1">
                {formatBRL(caixa.initialCash)}
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="text-blue-400 text-[11px] font-semibold flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3 text-blue-400" />
                <span>Suprimentos</span>
              </div>
              <div className="text-base font-extrabold font-mono text-blue-400 mt-1">
                + {formatBRL(caixa.cashAdditions)}
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-amber-400" />
                <span>Sangrias</span>
              </div>
              <div className="text-base font-extrabold font-mono text-amber-400 mt-1">
                - {formatBRL(caixa.cashWithdrawals)}
              </div>
            </div>

            <div className="bg-yellow-400 text-neutral-950 p-3.5 rounded-xl border border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.25)]">
              <div className="text-neutral-950 text-[11px] font-black flex items-center gap-1">
                <Coins className="w-3 h-3 text-neutral-950" />
                <span>Em Caixa (Gaveta)</span>
              </div>
              <div className="text-lg font-black font-mono mt-1">
                {formatBRL(caixa.expectedCash)}
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div
            className={`border rounded-xl p-4 space-y-3 ${
              isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-white border-neutral-200'
            }`}
          >
            <div className="font-bold text-yellow-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>Totalizadores de Vendas e O.S.:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
              <div className="flex justify-between border-b border-[#242633] pb-1.5">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-neutral-400" />
                  <span>Dinheiro Balcão:</span>
                </span>
                <span className="text-neutral-200 font-bold">{formatBRL(caixa.totalSalesCash)}</span>
              </div>
              <div className="flex justify-between border-b border-[#242633] pb-1.5">
                <span className="text-neutral-400 flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-yellow-400" />
                  <span>Vendas PIX:</span>
                </span>
                <span className="text-yellow-400 font-bold">{formatBRL(caixa.totalSalesPix)}</span>
              </div>
              <div className="flex justify-between border-b border-[#242633] pb-1.5">
                <span className="text-neutral-400 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-blue-400" />
                  <span>Vendas Cartão:</span>
                </span>
                <span className="text-neutral-200 font-bold">{formatBRL(caixa.totalSalesCard)}</span>
              </div>
              <div className="flex justify-between border-b border-[#242633] pb-1.5">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-emerald-400" />
                  <span>O.S. em Dinheiro:</span>
                </span>
                <span className="text-emerald-400 font-bold">{formatBRL(caixa.totalOSCash)}</span>
              </div>
              <div className="flex justify-between border-b border-[#242633] pb-1.5 sm:col-span-2">
                <span className="text-white font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  <span>Total Faturado no Dia:</span>
                </span>
                <span className="font-black text-yellow-400 text-sm">
                  {formatBRL(
                    caixa.totalSalesCash +
                      caixa.totalSalesPix +
                      caixa.totalSalesCard +
                      caixa.totalOSCash
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Add Sangria / Suprimento Form with Icons */}
          {caixa.status === 'ABERTO' && (
            <div
              className={`border rounded-xl p-4 space-y-3 ${
                isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="font-bold text-yellow-400 flex items-center gap-1.5">
                <Coins className="w-4 h-4" />
                <span>Lançar Sangria ou Suprimento de Gaveta:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setMovementType('SANGRIA')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition-colors ${
                      movementType === 'SANGRIA'
                        ? 'bg-amber-400/20 text-amber-400 border-amber-400'
                        : isDark
                        ? 'bg-[#1F202B] text-neutral-400 border-[#2D303E]'
                        : 'bg-white text-neutral-600 border-neutral-300'
                    }`}
                  >
                    <ArrowUpRight className="w-3 h-3" />
                    <span>Sangria</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('SUPRIMENTO')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition-colors ${
                      movementType === 'SUPRIMENTO'
                        ? 'bg-blue-400/20 text-blue-400 border-blue-400'
                        : isDark
                        ? 'bg-[#1F202B] text-neutral-400 border-[#2D303E]'
                        : 'bg-white text-neutral-600 border-neutral-300'
                    }`}
                  >
                    <ArrowDownRight className="w-3 h-3" />
                    <span>Entrada</span>
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={movementAmount || ''}
                  onChange={(e) => setMovementAmount(Number(e.target.value))}
                  placeholder="Valor (R$)"
                  className={`px-3 py-1.5 border rounded-lg font-mono text-xs outline-none ${
                    isDark
                      ? 'bg-[#101115] border-[#2A2C38] text-white focus:border-yellow-400'
                      : 'bg-white border-neutral-300'
                  }`}
                />
                <input
                  type="text"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="Motivo (ex: Pagamento motoboy, troco extra...)"
                  className={`px-3 py-1.5 border rounded-lg text-xs outline-none sm:col-span-2 ${
                    isDark
                      ? 'bg-[#101115] border-[#2A2C38] text-white focus:border-yellow-400'
                      : 'bg-white border-neutral-300'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={handleAddMovement}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Confirmar Lançamento</span>
              </button>
            </div>
          )}

          {/* Close Cashier Action */}
          {caixa.status === 'ABERTO' ? (
            <div
              className={`p-4 border rounded-xl space-y-3 ${
                isDark
                  ? 'bg-amber-400/10 border-amber-400/30 text-neutral-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                <span>Conferência para Fechamento de Caixa:</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-neutral-300">Valor em dinheiro contado na gaveta:</span>
                <input
                  type="number"
                  value={finalCashInput}
                  onChange={(e) => setFinalCashInput(Number(e.target.value))}
                  className={`w-32 px-3 py-1.5 border rounded-lg font-mono text-sm font-bold outline-none ${
                    isDark
                      ? 'bg-[#101115] border-[#2A2C38] text-yellow-400'
                      : 'bg-white border-neutral-300'
                  }`}
                />
                <button
                  onClick={handleToggleCaixaStatus}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Fechar Caixa Agora</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-[#17181F] border-[#292B37]' : 'bg-neutral-100'
              }`}
            >
              <span className="text-neutral-400">Este caixa está fechado no momento.</span>
              <button
                onClick={handleToggleCaixaStatus}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-black rounded-xl text-xs flex items-center gap-1.5"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Reabrir Caixa</span>
              </button>
            </div>
          )}

          {/* Movements History */}
          <div className="space-y-2">
            <div className="font-bold text-neutral-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-yellow-400" />
              <span>Histórico de Movimentações:</span>
            </div>
            <div
              className={`border rounded-xl divide-y max-h-40 overflow-y-auto ${
                isDark
                  ? 'border-[#292B37] divide-[#22242D] bg-[#15161C]'
                  : 'border-neutral-200 divide-neutral-100 bg-white'
              }`}
            >
              {caixa.movements.length === 0 ? (
                <div className="p-4 text-center text-neutral-500">Nenhuma movimentação registrada.</div>
              ) : (
                caixa.movements.map((mov) => (
                  <div key={mov.id} className="p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {mov.type === 'SANGRIA' ? (
                        <ArrowUpRight className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-blue-400" />
                      )}
                      <div>
                        <span className="font-bold text-white">{mov.type}</span>
                        <span className="text-neutral-500 ml-2 font-mono">
                          {formatDateTime(mov.timestamp)}
                        </span>
                        <div className="text-neutral-400 text-[11px]">{mov.reason}</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-yellow-400">
                      {formatBRL(mov.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between ${
            isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <button
            onClick={onPrintReport}
            className={`px-4 py-2 border rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isDark
                ? 'bg-[#1F202B] border-[#2F3140] text-yellow-400 hover:bg-[#282A38]'
                : 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            <Printer className="w-4 h-4 text-yellow-400" />
            <span>Imprimir Fechamento (ESC/POS Térmico)</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black rounded-xl text-xs transition-all shadow-xs"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { CaixaSessao, MovimentacaoCaixa, ConfiguracaoImpressora } from '../types';
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
} from 'lucide-react';

interface CaixaModalProps {
  caixa: CaixaSessao;
  printerConfig: ConfiguracaoImpressora;
  onUpdateCaixa: (caixa: CaixaSessao) => void;
  onPrintReport: () => void;
  onClose: () => void;
}

export const CaixaModal: React.FC<CaixaModalProps> = ({
  caixa,
  printerConfig,
  onUpdateCaixa,
  onPrintReport,
  onClose,
}) => {
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 max-w-2xl w-full flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-neutral-900">Gestão e Fechamento de Caixa</h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    caixa.status === 'ABERTO'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {caixa.status}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Operador: {caixa.cashierName} · Aberto em {formatDateTime(caixa.openedAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Balance Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              <div className="text-neutral-500 text-[11px]">Fundo Inicial</div>
              <div className="text-sm font-bold font-mono text-neutral-900 mt-0.5">
                {formatBRL(caixa.initialCash)}
              </div>
            </div>
            <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              <div className="text-neutral-500 text-[11px]">Suprimentos</div>
              <div className="text-sm font-bold font-mono text-blue-700 mt-0.5">
                + {formatBRL(caixa.cashAdditions)}
              </div>
            </div>
            <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              <div className="text-neutral-500 text-[11px]">Sangrias (Retiradas)</div>
              <div className="text-sm font-bold font-mono text-amber-700 mt-0.5">
                - {formatBRL(caixa.cashWithdrawals)}
              </div>
            </div>
            <div className="bg-neutral-900 text-white p-3 rounded-lg border border-neutral-900 shadow-xs">
              <div className="text-neutral-300 text-[11px]">Dinheiro em Caixa</div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                {formatBRL(caixa.expectedCash)}
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="border border-neutral-200 rounded-lg p-4 bg-white space-y-2">
            <div className="font-semibold text-neutral-900">Totalizadores de Vendas e O.S.:</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
              <div className="flex justify-between border-b border-neutral-100 pb-1">
                <span className="text-neutral-500">Vendas Dinheiro:</span>
                <span>{formatBRL(caixa.totalSalesCash)}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-1">
                <span className="text-neutral-500">Vendas PIX:</span>
                <span>{formatBRL(caixa.totalSalesPix)}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-1">
                <span className="text-neutral-500">Vendas Cartão:</span>
                <span>{formatBRL(caixa.totalSalesCard)}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-1">
                <span className="text-neutral-500">OS em Dinheiro:</span>
                <span>{formatBRL(caixa.totalOSCash)}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-1">
                <span className="text-neutral-500">Total Entradas:</span>
                <span className="font-bold text-neutral-900">
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

          {/* Add Sangria / Suprimento Form */}
          {caixa.status === 'ABERTO' && (
            <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50 space-y-3">
              <div className="font-semibold text-neutral-900">Lançar Sangria ou Suprimento:</div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as 'SANGRIA' | 'SUPRIMENTO')}
                  className="px-2.5 py-1.5 border border-neutral-300 rounded bg-white text-xs"
                >
                  <option value="SANGRIA">Sangria (Retirada)</option>
                  <option value="SUPRIMENTO">Suprimento (Entrada)</option>
                </select>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={movementAmount || ''}
                  onChange={(e) => setMovementAmount(Number(e.target.value))}
                  placeholder="Valor (R$)"
                  className="px-2.5 py-1.5 border border-neutral-300 rounded bg-white font-mono text-xs"
                />
                <input
                  type="text"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="Motivo (ex: Pagamento motoboy)"
                  className="px-2.5 py-1.5 border border-neutral-300 rounded bg-white text-xs sm:col-span-2"
                />
              </div>
              <button
                type="button"
                onClick={handleAddMovement}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-xs font-semibold"
              >
                Confirmar Lançamento
              </button>
            </div>
          )}

          {/* Close Cashier Action */}
          {caixa.status === 'ABERTO' ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
              <div className="font-semibold text-amber-900">Conferência para Fechamento:</div>
              <div className="flex items-center gap-3">
                <span className="text-neutral-700">Valor em dinheiro contado na gaveta:</span>
                <input
                  type="number"
                  value={finalCashInput}
                  onChange={(e) => setFinalCashInput(Number(e.target.value))}
                  className="w-32 px-3 py-1 border border-neutral-300 rounded bg-white font-mono text-sm font-bold"
                />
                <button
                  onClick={handleToggleCaixaStatus}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-xs"
                >
                  Fechar Caixa Agora
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-neutral-100 rounded-lg flex items-center justify-between">
              <span className="text-neutral-600">Este caixa está fechado.</span>
              <button
                onClick={handleToggleCaixaStatus}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium"
              >
                Reabrir Caixa
              </button>
            </div>
          )}

          {/* Movements History */}
          <div className="space-y-2">
            <div className="font-semibold text-neutral-800">Histórico de Movimentações:</div>
            <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-100 max-h-40 overflow-y-auto">
              {caixa.movements.map((mov) => (
                <div key={mov.id} className="p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {mov.type === 'SANGRIA' ? (
                      <ArrowDownRight className="w-4 h-4 text-amber-600" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-blue-600" />
                    )}
                    <div>
                      <span className="font-semibold text-neutral-900">{mov.type}</span>
                      <span className="text-neutral-500 ml-2 font-mono">
                        {formatDateTime(mov.timestamp)}
                      </span>
                      <div className="text-neutral-600 text-[11px]">{mov.reason}</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-neutral-900">
                    {formatBRL(mov.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <button
            onClick={onPrintReport}
            className="px-4 py-2 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Fechamento (ESC/POS Térmico)</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

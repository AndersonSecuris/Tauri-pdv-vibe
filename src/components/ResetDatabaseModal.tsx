import React, { useState } from 'react';
import {
  OrdemDeServico,
  Cliente,
  ItemPDV,
  VendaPDV,
  CaixaSessao,
  ConfiguracaoImpressora,
  OSConfigOptions,
  AppTheme,
} from '../types';
import {
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Check,
  X,
  Wrench,
  ShoppingCart,
  Users,
  Package,
  Coins,
  SlidersHorizontal,
  Printer,
  HardDrive,
  Save,
  Trash2,
  Sparkles,
} from 'lucide-react';

export interface SelectiveResetOptions {
  deleteOrders: boolean;
  deleteSales: boolean;
  deleteClients: boolean;
  deleteProducts: boolean;
  resetCaixa: boolean;
  resetOSConfig: boolean;
  resetPrinterConfig: boolean;
  clearSnapshots: boolean;
  createBackupFirst: boolean;
}

interface ResetDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  ordersCount: number;
  salesCount: number;
  clientsCount: number;
  productsCount: number;
  snapshotsCount: number;
  theme?: AppTheme;
  onConfirmReset: (options: SelectiveResetOptions) => void;
}

export const ResetDatabaseModal: React.FC<ResetDatabaseModalProps> = ({
  isOpen,
  onClose,
  ordersCount,
  salesCount,
  clientsCount,
  productsCount,
  snapshotsCount,
  theme = 'black-yellow',
  onConfirmReset,
}) => {
  const isDark = theme === 'black-yellow' || theme === 'dark';

  // State: what to DELETE (checked means delete/reset, unchecked means KEEP)
  const [deleteOrders, setDeleteOrders] = useState(true);
  const [deleteSales, setDeleteSales] = useState(true);
  const [deleteClients, setDeleteClients] = useState(false);
  const [deleteProducts, setDeleteProducts] = useState(false);
  const [resetCaixa, setResetCaixa] = useState(true);
  const [resetOSConfig, setResetOSConfig] = useState(false); // KEEP models, defects by default
  const [resetPrinterConfig, setResetPrinterConfig] = useState(false); // KEEP printer config by default
  const [clearSnapshots, setClearSnapshots] = useState(false);
  const [createBackupFirst, setCreateBackupFirst] = useState(true);

  const [confirmStep, setConfirmStep] = useState(false);

  if (!isOpen) return null;

  // Presets
  const applyPresetTransactionsOnly = () => {
    setDeleteOrders(true);
    setDeleteSales(true);
    setResetCaixa(true);
    setDeleteClients(false); // keep
    setDeleteProducts(false); // keep
    setResetOSConfig(false); // keep models, defects!
    setResetPrinterConfig(false); // keep printer!
    setClearSnapshots(false); // keep snapshots!
  };

  const applyPresetFactoryReset = () => {
    setDeleteOrders(true);
    setDeleteSales(true);
    setDeleteClients(true);
    setDeleteProducts(true);
    setResetCaixa(true);
    setResetOSConfig(true);
    setResetPrinterConfig(true);
    setClearSnapshots(true);
  };

  const applyPresetKeepCustomConfigs = () => {
    setDeleteOrders(true);
    setDeleteSales(true);
    setDeleteClients(true);
    setDeleteProducts(true);
    setResetCaixa(true);
    setResetOSConfig(false); // KEEP models, defects!
    setResetPrinterConfig(false); // KEEP printer!
    setClearSnapshots(false);
  };

  const handleExecute = () => {
    onConfirmReset({
      deleteOrders,
      deleteSales,
      deleteClients,
      deleteProducts,
      resetCaixa,
      resetOSConfig,
      resetPrinterConfig,
      clearSnapshots,
      createBackupFirst,
    });
    setConfirmStep(false);
    onClose();
  };

  // Count items marked for deletion
  const totalItemsToDelete = [
    deleteOrders ? `${ordersCount} O.S.` : null,
    deleteSales ? `${salesCount} Vendas` : null,
    deleteClients ? `${clientsCount} Clientes` : null,
    deleteProducts ? `${productsCount} Produtos` : null,
    resetCaixa ? 'Sessão Caixa' : null,
    resetOSConfig ? 'Modelos & Defeitos' : null,
    resetPrinterConfig ? 'Config Impressora' : null,
    clearSnapshots ? `${snapshotsCount} Snapshots` : null,
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in-50">
      <div
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-300 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className={`p-4 md:p-5 border-b flex items-center justify-between ${
          isDark ? 'bg-neutral-950/80 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
                Reset & Limpeza Seletiva do Banco de Dados
              </h2>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Escolha exatamente o que deseja <strong>excluir</strong> e o que deseja <strong>manter</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg border transition-colors ${
              isDark ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-400' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {/* Quick Presets Bar */}
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Atalhos Rápidos de Seleção:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={applyPresetTransactionsOnly}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  deleteOrders && deleteSales && !deleteClients && !resetOSConfig
                    ? isDark
                      ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300 font-bold'
                      : 'border-yellow-500 bg-yellow-50 text-neutral-900 font-bold'
                    : isDark
                    ? 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800/60 text-neutral-300'
                    : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Limpar Transações</span>
                </div>
                <div className="text-[10px] text-neutral-400 font-normal">
                  Apaga O.S. e Vendas. Mantém Modelos, Defeitos, Clientes e Estoque.
                </div>
              </button>

              <button
                type="button"
                onClick={applyPresetKeepCustomConfigs}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  deleteOrders && deleteSales && deleteClients && deleteProducts && !resetOSConfig
                    ? isDark
                      ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300 font-bold'
                      : 'border-yellow-500 bg-yellow-50 text-neutral-900 font-bold'
                    : isDark
                    ? 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800/60 text-neutral-300'
                    : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Manter Configurações</span>
                </div>
                <div className="text-[10px] text-neutral-400 font-normal">
                  Apaga registros, mas preserva Modelos de Aparelho, Defeitos e Impressora.
                </div>
              </button>

              <button
                type="button"
                onClick={applyPresetFactoryReset}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  deleteOrders && deleteSales && deleteClients && deleteProducts && resetOSConfig
                    ? 'border-rose-500 bg-rose-500/10 text-rose-300 font-bold'
                    : isDark
                    ? 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800/60 text-neutral-300'
                    : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5 text-rose-400">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset Total de Fábrica</span>
                </div>
                <div className="text-[10px] text-neutral-400 font-normal">
                  Apaga tudo e restaura os padrões iniciais de fábrica.
                </div>
              </button>
            </div>
          </div>

          {/* Section 1: Operational Records (What you usually delete) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                1. Registros Operacionais & Faturamento:
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                Marque para EXCLUIR, desmarque para MANTER
              </span>
            </div>

            <div className="space-y-2">
              {/* Delete Orders */}
              <label
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  deleteOrders
                    ? isDark
                      ? 'bg-rose-950/20 border-rose-500/40 text-neutral-100'
                      : 'bg-rose-50 border-rose-300 text-neutral-900'
                    : isDark
                    ? 'bg-neutral-950/40 border-neutral-800 text-neutral-400'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={deleteOrders}
                    onChange={(e) => setDeleteOrders(e.target.checked)}
                    className="accent-rose-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-yellow-400" />
                      <span className="font-bold text-xs">Ordens de Serviço (O.S.)</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800/60 font-semibold text-neutral-300">
                        {ordersCount} registros
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Exclui histórico de consertos, diagnósticos, orçamentos e garantias.
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
                  deleteOrders ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'
                }`}>
                  {deleteOrders ? 'EXCLUIR' : 'MANTER'}
                </span>
              </label>

              {/* Delete Sales */}
              <label
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  deleteSales
                    ? isDark
                      ? 'bg-rose-950/20 border-rose-500/40 text-neutral-100'
                      : 'bg-rose-50 border-rose-300 text-neutral-900'
                    : isDark
                    ? 'bg-neutral-950/40 border-neutral-800 text-neutral-400'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={deleteSales}
                    onChange={(e) => setDeleteSales(e.target.checked)}
                    className="accent-rose-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-yellow-400" />
                      <span className="font-bold text-xs">Histórico de Vendas Balcão (PDV)</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800/60 font-semibold text-neutral-300">
                        {salesCount} vendas
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Exclui os cupons e histórico de vendas de balcão e peças.
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
                  deleteSales ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'
                }`}>
                  {deleteSales ? 'EXCLUIR' : 'MANTER'}
                </span>
              </label>

              {/* Delete Clients */}
              <label
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  deleteClients
                    ? isDark
                      ? 'bg-rose-950/20 border-rose-500/40 text-neutral-100'
                      : 'bg-rose-50 border-rose-300 text-neutral-900'
                    : isDark
                    ? 'bg-neutral-950/40 border-neutral-800 text-neutral-400'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={deleteClients}
                    onChange={(e) => setDeleteClients(e.target.checked)}
                    className="accent-rose-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-xs">Cadastro de Clientes</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800/60 font-semibold text-neutral-300">
                        {clientsCount} clientes
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Exclui a lista de contatos, nomes, telefones e endereços cadastrados.
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
                  deleteClients ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'
                }`}>
                  {deleteClients ? 'EXCLUIR' : 'MANTER'}
                </span>
              </label>

              {/* Delete Products */}
              <label
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  deleteProducts
                    ? isDark
                      ? 'bg-rose-950/20 border-rose-500/40 text-neutral-100'
                      : 'bg-rose-50 border-rose-300 text-neutral-900'
                    : isDark
                    ? 'bg-neutral-950/40 border-neutral-800 text-neutral-400'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={deleteProducts}
                    onChange={(e) => setDeleteProducts(e.target.checked)}
                    className="accent-rose-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-xs">Produtos & Estoque do Balcão</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800/60 font-semibold text-neutral-300">
                        {productsCount} itens
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Exclui o catálogo de acessórios, cabos, películas e peças cadastradas.
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
                  deleteProducts ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'
                }`}>
                  {deleteProducts ? 'EXCLUIR' : 'MANTER'}
                </span>
              </label>

              {/* Reset Caixa */}
              <label
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  resetCaixa
                    ? isDark
                      ? 'bg-rose-950/20 border-rose-500/40 text-neutral-100'
                      : 'bg-rose-50 border-rose-300 text-neutral-900'
                    : isDark
                    ? 'bg-neutral-950/40 border-neutral-800 text-neutral-400'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={resetCaixa}
                    onChange={(e) => setResetCaixa(e.target.checked)}
                    className="accent-rose-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-xs">Sessão e Movimentações do Caixa</span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Reseta saldo inicial, entradas, sangrias e suprimentos da sessão.
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
                  resetCaixa ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'
                }`}>
                  {resetCaixa ? 'RESETAR' : 'MANTER'}
                </span>
              </label>
            </div>
          </div>

          {/* Section 2: Configurations & Base catalogs (What user usually keeps!) */}
          <div className="space-y-3 pt-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              2. Configurações de Aparelhos, Defeitos & Impressora (Recomendado Manter):
            </span>

            <div className="space-y-2">
              {/* Reset OS Config (Models, defects, checklist) */}
              <label
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  resetOSConfig
                    ? isDark
                      ? 'bg-rose-950/20 border-rose-500/40 text-neutral-100'
                      : 'bg-rose-50 border-rose-300 text-neutral-900'
                    : isDark
                    ? 'bg-neutral-950/40 border-neutral-800 text-neutral-400'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={resetOSConfig}
                    onChange={(e) => setResetOSConfig(e.target.checked)}
                    className="accent-rose-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-yellow-400" />
                      <span className="font-bold text-xs">
                        Modelos de Aparelhos Cadastrados, Defeitos, Acessórios e Checklist
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {resetOSConfig
                        ? '⚠️ Irá apagar todos os modelos, marcas e defeitos personalizados criados por você e voltar para o padrão.'
                        : '✅ Mantendo seus modelos cadastrados (Apple, Samsung, etc.), defeitos e checklist intactos!'}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
                  resetOSConfig ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'
                }`}>
                  {resetOSConfig ? 'RESETAR' : 'MANTER'}
                </span>
              </label>

              {/* Reset Printer Config */}
              <label
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  resetPrinterConfig
                    ? isDark
                      ? 'bg-rose-950/20 border-rose-500/40 text-neutral-100'
                      : 'bg-rose-50 border-rose-300 text-neutral-900'
                    : isDark
                    ? 'bg-neutral-950/40 border-neutral-800 text-neutral-400'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={resetPrinterConfig}
                    onChange={(e) => setResetPrinterConfig(e.target.checked)}
                    className="accent-rose-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Printer className="w-4 h-4 text-yellow-400" />
                      <span className="font-bold text-xs">Configurações da Impressora ESC/POS e Cupons</span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {resetPrinterConfig
                        ? '⚠️ Irá apagar configurações de bobina térmica, cabeçalhos, rodapé e IP.'
                        : '✅ Mantendo o layout e as opções de impressão que você já configurou.'}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
                  resetPrinterConfig ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'
                }`}>
                  {resetPrinterConfig ? 'RESETAR' : 'MANTER'}
                </span>
              </label>

              {/* Clear Snapshots */}
              <label
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  clearSnapshots
                    ? isDark
                      ? 'bg-rose-950/20 border-rose-500/40 text-neutral-100'
                      : 'bg-rose-50 border-rose-300 text-neutral-900'
                    : isDark
                    ? 'bg-neutral-950/40 border-neutral-800 text-neutral-400'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={clearSnapshots}
                    onChange={(e) => setClearSnapshots(e.target.checked)}
                    className="accent-rose-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-neutral-400" />
                      <span className="font-bold text-xs">Snapshots e Pontos de Restauração Salvos</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800/60 font-semibold text-neutral-300">
                        {snapshotsCount} salvos
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Exclui os backups internos salvos na memória do navegador.
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
                  clearSnapshots ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'
                }`}>
                  {clearSnapshots ? 'EXCLUIR' : 'MANTER'}
                </span>
              </label>
            </div>
          </div>

          {/* Safety Backup Checkbox */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-yellow-400/5 border-yellow-400/20' : 'bg-yellow-50/70 border-yellow-200'
          }`}>
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={createBackupFirst}
                onChange={(e) => setCreateBackupFirst(e.target.checked)}
                className="mt-0.5 accent-yellow-400 rounded w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold flex items-center gap-1.5 text-yellow-400">
                  <ShieldCheck className="w-4 h-4" />
                  Criar cópia de segurança (Snapshot) automática antes de efetuar o reset
                </span>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Gera um ponto de restauração com todos os seus dados atuais antes de apagá-los, permitindo desfazer se necessário na aba Backup.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-4 md:p-5 border-t flex flex-wrap items-center justify-between gap-3 ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <div className="text-xs text-neutral-400">
            Marcados para excluir:{' '}
            <strong className="text-rose-400">
              {totalItemsToDelete.length > 0 ? totalItemsToDelete.join(', ') : 'Nenhum item'}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white"
            >
              Cancelar
            </button>

            {!confirmStep ? (
              <button
                type="button"
                onClick={() => setConfirmStep(true)}
                disabled={totalItemsToDelete.length === 0}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(225,29,72,0.3)] active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Prosseguir para Confirmação</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleExecute}
                className="px-5 py-2.5 rounded-xl font-black text-xs text-white bg-rose-700 hover:bg-rose-600 transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(225,29,72,0.5)] active:scale-95 animate-pulse"
              >
                <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                <span>Sim, Confirmar Limpeza dos Dados Marcados</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

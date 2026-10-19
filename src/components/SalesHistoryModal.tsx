import React, { useState } from 'react';
import { VendaPDV, ConfiguracaoImpressora, AppTheme } from '../types';
import { formatBRL, formatDateTime } from '../services/escpos';
import {
  X,
  Search,
  Trash2,
  Edit2,
  Save,
  Printer,
  Receipt,
  Calendar,
  DollarSign,
  AlertTriangle,
  CreditCard,
  Coins,
  QrCode,
  User,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SalesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales: VendaPDV[];
  printerConfig: ConfiguracaoImpressora;
  onDeleteSale: (saleId: string) => void;
  onUpdateSale: (updatedSale: VendaPDV) => void;
  onPrintReceipt: (sale: VendaPDV) => void;
  theme?: AppTheme;
}

export const SalesHistoryModal: React.FC<SalesHistoryModalProps> = ({
  isOpen,
  onClose,
  sales,
  onDeleteSale,
  onUpdateSale,
  onPrintReceipt,
  theme = 'black-yellow',
}) => {
  const isDark = theme === 'black-yellow' || theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [saleToDelete, setSaleToDelete] = useState<VendaPDV | null>(null);
  const [editingSale, setEditingSale] = useState<VendaPDV | null>(null);
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter sales
  const filteredSales = sales.filter((s) => {
    const matchesMethod = selectedMethod === 'ALL' || s.paymentMethod === selectedMethod;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesMethod;

    const matchesSearch =
      s.code.toLowerCase().includes(query) ||
      (s.client?.name && s.client.name.toLowerCase().includes(query)) ||
      (s.client?.phone && s.client.phone.includes(query)) ||
      s.items.some((i) => i.product.name.toLowerCase().includes(query) || i.product.code.toLowerCase().includes(query));

    return matchesMethod && matchesSearch;
  });

  const totalFilteredRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);

  // Handle Edit changes
  const handleSaveEdit = () => {
    if (!editingSale) return;
    onUpdateSale(editingSale);
    setEditingSale(null);
  };

  const handleUpdateItemPrice = (itemIndex: number, newUnitPrice: number) => {
    if (!editingSale) return;
    const updatedItems = [...editingSale.items];
    const item = updatedItems[itemIndex];
    const qty = item.quantity;
    const price = Math.max(0, newUnitPrice);
    updatedItems[itemIndex] = {
      ...item,
      product: {
        ...item.product,
        price,
      },
      total: qty * price,
    };

    const newSubtotal = updatedItems.reduce((acc, it) => acc + it.total, 0);
    const newTotal = Math.max(0, newSubtotal - editingSale.discount);

    setEditingSale({
      ...editingSale,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newTotal,
    });
  };

  const handleUpdateItemQty = (itemIndex: number, delta: number) => {
    if (!editingSale) return;
    const updatedItems = [...editingSale.items];
    const item = updatedItems[itemIndex];
    const newQty = Math.max(1, item.quantity + delta);
    updatedItems[itemIndex] = {
      ...item,
      quantity: newQty,
      total: newQty * item.product.price,
    };

    const newSubtotal = updatedItems.reduce((acc, it) => acc + it.total, 0);
    const newTotal = Math.max(0, newSubtotal - editingSale.discount);

    setEditingSale({
      ...editingSale,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newTotal,
    });
  };

  const handleUpdateDiscount = (newDiscount: number) => {
    if (!editingSale) return;
    const disc = Math.max(0, newDiscount);
    const newTotal = Math.max(0, editingSale.subtotal - disc);
    setEditingSale({
      ...editingSale,
      discount: disc,
      total: newTotal,
    });
  };

  const handleUpdateDirectTotal = (newTotalVal: number) => {
    if (!editingSale) return;
    const val = Math.max(0, newTotalVal);
    setEditingSale({
      ...editingSale,
      total: val,
    });
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'PIX':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <QrCode className="w-3 h-3" /> PIX
          </span>
        );
      case 'CARTAO_CREDITO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <CreditCard className="w-3 h-3" /> Crédito
          </span>
        );
      case 'CARTAO_DEBITO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CreditCard className="w-3 h-3" /> Débito
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Coins className="w-3 h-3" /> Dinheiro
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in-50">
      <div
        className={`w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-300 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className={`p-4 md:p-5 border-b flex items-center justify-between ${
          isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isDark ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-600'
            }`}>
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
                Histórico & Gestão de Vendas Realizadas
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                  isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-700'
                }`}>
                  {sales.length} vendas
                </span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Altere valores, edite formas de pagamento ou apague vendas do histórico.
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

        {/* Filters Bar */}
        <div className={`p-3 md:p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-neutral-50/50 border-neutral-200'
        }`}>
          {/* Search input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por código (ex: VENDA-001), cliente ou produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border outline-none focus:ring-2 focus:ring-yellow-400/40 ${
                isDark ? 'bg-neutral-950 border-neutral-700 text-neutral-100 placeholder:text-neutral-500' : 'bg-white border-neutral-300 text-neutral-900'
              }`}
            />
          </div>

          {/* Payment Method filter tabs */}
          <div className="flex items-center gap-1 text-xs">
            {['ALL', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO'].map((method) => (
              <button
                key={method}
                onClick={() => setSelectedMethod(method)}
                className={`px-2.5 py-1.5 rounded-lg font-medium text-[11px] transition-all border ${
                  selectedMethod === method
                    ? isDark
                      ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400 font-bold'
                      : 'bg-neutral-900 text-white border-neutral-900 font-bold'
                    : isDark
                    ? 'border-transparent text-neutral-400 hover:bg-neutral-800'
                    : 'border-transparent text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {method === 'ALL'
                  ? 'Todas'
                  : method === 'CARTAO_CREDITO'
                  ? 'Crédito'
                  : method === 'CARTAO_DEBITO'
                  ? 'Débito'
                  : method}
              </button>
            ))}
          </div>

          {/* Quick Summary Pill */}
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold ${
            isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700'
          }`}>
            Subtotal: <span className="text-yellow-400">{formatBRL(totalFilteredRevenue)}</span> ({filteredSales.length})
          </div>
        </div>

        {/* Sales List Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredSales.length === 0 ? (
            <div className={`py-16 text-center text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              <ShoppingBag className="w-10 h-10 opacity-30 mx-auto mb-2 text-yellow-400" />
              <p className="font-bold text-sm">Nenhuma venda encontrada</p>
              <p className="mt-1">Tente ajustar a busca ou filtre por outra forma de pagamento.</p>
            </div>
          ) : (
            filteredSales.map((sale) => {
              const isExpanded = expandedSaleId === sale.id;

              return (
                <div
                  key={sale.id}
                  className={`rounded-xl border transition-all ${
                    isDark
                      ? 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                      : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-xs'
                  }`}
                >
                  {/* Card Header Row */}
                  <div className="p-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setExpandedSaleId(isExpanded ? null : sale.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isDark ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-400' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-600'
                        }`}
                        title="Ver itens da venda"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-white">{sale.code}</span>
                          {getMethodBadge(sale.paymentMethod)}
                        </div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono">{formatDateTime(sale.date)}</span>
                          {sale.client && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-neutral-300">
                                <User className="w-3 h-3 text-yellow-400" />
                                {sale.client.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Items summary */}
                    <div className="text-xs text-neutral-400">
                      <span className="font-semibold text-neutral-200">
                        {sale.items.reduce((acc, i) => acc + i.quantity, 0)} itens
                      </span>{' '}
                      ({sale.items.length} produtos diferentes)
                    </div>

                    {/* Right: Total & Action Buttons */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono font-black text-sm text-yellow-400">
                          {formatBRL(sale.total)}
                        </div>
                        {sale.discount > 0 && (
                          <div className="text-[10px] text-emerald-400 font-mono">
                            Desc: -{formatBRL(sale.discount)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onPrintReceipt(sale)}
                          className={`p-2 rounded-lg border transition-colors ${
                            isDark
                              ? 'bg-neutral-900 border-neutral-800 hover:border-yellow-400/40 text-neutral-300 hover:text-yellow-400'
                              : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                          }`}
                          title="Reimprimir Cupom Térmico ESC/POS"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setEditingSale(sale)}
                          className={`p-2 rounded-lg border transition-colors ${
                            isDark
                              ? 'bg-neutral-900 border-neutral-800 hover:border-yellow-400 text-yellow-400'
                              : 'bg-yellow-50 border-yellow-200 hover:border-yellow-300 text-yellow-800'
                          }`}
                          title="Alterar valores desta venda"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setSaleToDelete(sale)}
                          className={`p-2 rounded-lg border transition-colors ${
                            isDark
                              ? 'bg-neutral-900 border-neutral-800 hover:border-rose-500/50 text-neutral-400 hover:text-rose-400'
                              : 'bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-700'
                          }`}
                          title="Apagar venda do histórico"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Items Drawer */}
                  {isExpanded && (
                    <div className={`p-3.5 border-t text-xs ${
                      isDark ? 'bg-neutral-900/40 border-neutral-800/80' : 'bg-neutral-50/70 border-neutral-200'
                    }`}>
                      <p className={`font-bold text-[11px] uppercase tracking-wider mb-2 ${
                        isDark ? 'text-neutral-400' : 'text-neutral-500'
                      }`}>
                        Itens Vendidos no Cupom:
                      </p>
                      <div className="space-y-1.5">
                        {sale.items.map((item, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg border flex items-center justify-between text-xs ${
                              isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-white border-neutral-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-neutral-400 text-[11px]">{item.quantity}x</span>
                              <span className="font-medium text-neutral-200">{item.product.name}</span>
                              <span className="text-[10px] text-neutral-500 font-mono">({item.product.code})</span>
                            </div>
                            <div className="font-mono text-neutral-300">
                              {formatBRL(item.product.price)} un = <strong className="text-yellow-400">{formatBRL(item.total)}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-xs ${
          isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-600'
        }`}>
          <span>
            Exibindo <strong>{filteredSales.length}</strong> de <strong>{sales.length}</strong> vendas realizadas.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-neutral-950 bg-yellow-400 hover:bg-yellow-300 rounded-xl transition-all"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* MODAL: EDIT SALE VALUES */}
      {editingSale && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-50">
          <div
            className={`w-full max-w-xl rounded-2xl border shadow-2xl p-5 md:p-6 space-y-5 ${
              isDark ? 'bg-neutral-900 border-yellow-400/30 text-neutral-100' : 'bg-white border-yellow-400 text-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isDark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Alterar Valores da Venda</h3>
                  <p className="text-xs text-neutral-400 font-mono">Código: {editingSale.code}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingSale(null)}
                className="p-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items Editor */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Itens & Preços Unitários da Venda:
              </label>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {editingSale.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                      isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate text-neutral-200">{item.product.name}</p>
                      <p className="text-[10px] text-neutral-500 font-mono">{item.product.code}</p>
                    </div>

                    {/* Qty Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateItemQty(idx, -1)}
                        className={`w-6 h-6 rounded flex items-center justify-center border ${
                          isDark ? 'border-neutral-700 bg-neutral-900 text-neutral-300' : 'border-neutral-300 bg-white text-neutral-700'
                        }`}
                      >
                        -
                      </button>
                      <span className="font-mono font-bold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateItemQty(idx, 1)}
                        className={`w-6 h-6 rounded flex items-center justify-center border ${
                          isDark ? 'border-neutral-700 bg-neutral-900 text-neutral-300' : 'border-neutral-300 bg-white text-neutral-700'
                        }`}
                      >
                        +
                      </button>
                    </div>

                    {/* Unit Price input */}
                    <div className="w-24">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={item.product.price}
                        onChange={(e) => handleUpdateItemPrice(idx, parseFloat(e.target.value) || 0)}
                        className={`w-full px-2 py-1 text-right text-xs font-mono font-bold rounded border outline-none ${
                          isDark ? 'bg-neutral-900 border-neutral-700 text-yellow-400' : 'bg-white border-neutral-300'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Adjustments Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Desconto Aplicado (R$):</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={editingSale.discount}
                  onChange={(e) => handleUpdateDiscount(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border outline-none ${
                    isDark ? 'bg-neutral-950 border-neutral-700 text-emerald-400' : 'bg-neutral-50 border-neutral-300'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Valor Total Final (R$):</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={editingSale.total}
                  onChange={(e) => handleUpdateDirectTotal(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border outline-none ${
                    isDark ? 'bg-neutral-950 border-yellow-400 text-yellow-400 text-base' : 'bg-white border-yellow-400 text-base'
                  }`}
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Forma de Pagamento:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'PIX', label: 'PIX' },
                  { id: 'CARTAO_CREDITO', label: 'Crédito' },
                  { id: 'CARTAO_DEBITO', label: 'Débito' },
                  { id: 'DINHEIRO', label: 'Dinheiro' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setEditingSale({ ...editingSale, paymentMethod: pm.id as any })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      editingSale.paymentMethod === pm.id
                        ? isDark
                          ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                          : 'border-neutral-900 bg-neutral-900 text-white'
                        : isDark
                        ? 'border-neutral-800 bg-neutral-950 text-neutral-400'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setEditingSale(null)}
                className="px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-neutral-950 bg-yellow-400 hover:bg-yellow-300 flex items-center gap-1.5 shadow-[0_0_15px_rgba(250,204,21,0.25)]"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE SALE */}
      {saleToDelete && (
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
                <h3 className="font-bold text-base text-rose-400">Apagar Venda Realizada?</h3>
                <p className="text-xs text-neutral-400 font-mono">Código: {saleToDelete.code}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Você está prestes a apagar a venda <strong>{saleToDelete.code}</strong> no valor de{' '}
              <strong className="text-yellow-400">{formatBRL(saleToDelete.total)}</strong> realizada em{' '}
              {formatDateTime(saleToDelete.date)}. Esta operação removerá a venda do histórico e atualizará os relatórios de faturamento.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSaleToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteSale(saleToDelete.id);
                  setSaleToDelete(null);
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

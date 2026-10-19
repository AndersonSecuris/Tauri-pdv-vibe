import React, { useState } from 'react';
import { ItemPDV, AppTheme } from '../types';
import { formatBRL } from '../services/escpos';
import {
  X,
  Search,
  Plus,
  Trash2,
  Edit2,
  Package,
  Layers,
  Infinity,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ShieldAlert,
  ArrowUpDown,
  Barcode,
  Hash,
} from 'lucide-react';

interface ProductManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ItemPDV[];
  onOpenNewProduct: () => void;
  onEditProduct: (product: ItemPDV) => void;
  onDeleteProduct: (product: ItemPDV) => void;
  onToggleControlStock: (product: ItemPDV) => void;
  onUpdateStockQuantity?: (product: ItemPDV, delta: number) => void;
  theme?: AppTheme;
}

export const ProductManagerModal: React.FC<ProductManagerModalProps> = ({
  isOpen,
  onClose,
  products,
  onOpenNewProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleControlStock,
  onUpdateStockQuantity,
  theme = 'black-yellow',
}) => {
  const isDark = theme === 'black-yellow' || theme === 'dark';

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'CONTROLLED' | 'UNLIMITED' | 'LOW_STOCK'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  // Statistics
  const totalProducts = products.length;
  const controlledCount = products.filter((p) => p.controlStock !== false && p.unit !== 'SV').length;
  const unlimitedCount = totalProducts - controlledCount;
  const lowStockCount = products.filter(
    (p) => p.controlStock !== false && p.unit !== 'SV' && p.stock <= p.minStock
  ).length;

  // Filtered list
  const filteredProducts = products.filter((p) => {
    const isControlled = p.controlStock !== false && p.unit !== 'SV';
    
    // Category match
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;

    // Filter type match
    if (filterType === 'CONTROLLED' && !isControlled) return false;
    if (filterType === 'UNLIMITED' && isControlled) return false;
    if (filterType === 'LOW_STOCK' && (!isControlled || p.stock > p.minStock)) return false;

    // Search query match
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchBarcode = p.barcode.includes(q);
      if (!matchName && !matchCode && !matchBarcode) return false;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in-50">
      <div
        className={`w-full max-w-5xl h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-300 text-neutral-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'bg-neutral-950/90 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isDark ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
              }`}
            >
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Catálogo de Produtos & Estoque</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md font-bold bg-yellow-400 text-neutral-950">
                  {totalProducts} {totalProducts === 1 ? 'item' : 'itens'}
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Adicione, altere, exclua e configure quais produtos controlam saldo físico ou possuem estoque livre.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewProduct}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-950 bg-yellow-400 hover:bg-yellow-300 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(250,204,21,0.25)] shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Cadastrar Novo Produto</span>
              <span className="sm:hidden">Novo</span>
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors ${
                isDark ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-400' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 border-b shrink-0 text-xs font-mono ${
            isDark ? 'bg-neutral-950/40 border-neutral-800/80' : 'bg-neutral-100/60 border-neutral-200'
          }`}
        >
          <div
            onClick={() => setFilterType('ALL')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              filterType === 'ALL'
                ? isDark
                  ? 'bg-neutral-800/80 border-neutral-600 shadow-xs'
                  : 'bg-white border-neutral-400 shadow-xs'
                : isDark
                ? 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-850'
                : 'bg-white/70 border-neutral-200 hover:bg-white'
            }`}
          >
            <div className="text-[10px] text-neutral-400 font-sans uppercase">Total Geral</div>
            <div className="text-sm sm:text-base font-bold text-white flex items-center justify-between mt-0.5">
              <span>{totalProducts}</span>
              <Package className="w-4 h-4 text-neutral-400" />
            </div>
          </div>

          <div
            onClick={() => setFilterType('CONTROLLED')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              filterType === 'CONTROLLED'
                ? isDark
                  ? 'bg-yellow-400/10 border-yellow-400/50 shadow-xs'
                  : 'bg-yellow-50 border-yellow-400 shadow-xs'
                : isDark
                ? 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-850'
                : 'bg-white/70 border-neutral-200 hover:bg-white'
            }`}
          >
            <div className="text-[10px] text-yellow-400 font-sans uppercase font-bold">Com Estoque Controlado</div>
            <div className="text-sm sm:text-base font-bold text-yellow-400 flex items-center justify-between mt-0.5">
              <span>{controlledCount}</span>
              <Boxes className="w-4 h-4 text-yellow-400" />
            </div>
          </div>

          <div
            onClick={() => setFilterType('UNLIMITED')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              filterType === 'UNLIMITED'
                ? isDark
                  ? 'bg-cyan-500/10 border-cyan-500/50 shadow-xs'
                  : 'bg-cyan-50 border-cyan-400 shadow-xs'
                : isDark
                ? 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-850'
                : 'bg-white/70 border-neutral-200 hover:bg-white'
            }`}
          >
            <div className="text-[10px] text-cyan-400 font-sans uppercase font-bold">Estoque Livre / Serviços</div>
            <div className="text-sm sm:text-base font-bold text-cyan-400 flex items-center justify-between mt-0.5">
              <span>{unlimitedCount}</span>
              <Infinity className="w-4 h-4 text-cyan-400" />
            </div>
          </div>

          <div
            onClick={() => setFilterType('LOW_STOCK')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              filterType === 'LOW_STOCK'
                ? isDark
                  ? 'bg-rose-500/15 border-rose-500/60 shadow-xs'
                  : 'bg-rose-50 border-rose-400 shadow-xs'
                : isDark
                ? 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-850'
                : 'bg-white/70 border-neutral-200 hover:bg-white'
            }`}
          >
            <div className="text-[10px] text-rose-400 font-sans uppercase font-bold">Estoque Crítico / Zerado</div>
            <div className="text-sm sm:text-base font-bold text-rose-400 flex items-center justify-between mt-0.5">
              <span>{lowStockCount}</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div
          className={`p-3.5 border-b flex flex-col sm:flex-row items-center gap-3 shrink-0 ${
            isDark ? 'bg-neutral-950/30 border-neutral-800' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por nome, código interno (ex: PEL-01) ou código de barras EAN..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none transition-colors ${
                isDark
                  ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-yellow-400'
                  : 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-neutral-900'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold outline-none ${
                isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-200' : 'bg-neutral-50 border-neutral-300 text-neutral-900'
              }`}
            >
              <option value="ALL">Todas as Categorias</option>
              <option value="PELICULAS">Películas</option>
              <option value="CABOS">Cabos</option>
              <option value="ACESSORIOS">Acessórios / Fontes</option>
              <option value="BATERIAS">Baterias</option>
              <option value="PECAS">Peças / Telas</option>
              <option value="SERVICOS">Serviços Bancada</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="flex-1 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-neutral-500 space-y-3">
              <Package className="w-10 h-10 stroke-1" />
              <div>
                <p className="text-sm font-bold text-neutral-300">Nenhum produto encontrado</p>
                <p className="text-xs text-neutral-500">Tente ajustar seus termos de busca ou filtros.</p>
              </div>
              <button
                onClick={onOpenNewProduct}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-950 bg-yellow-400 hover:bg-yellow-300 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Cadastrar Primeiro Produto</span>
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead
                className={`sticky top-0 z-10 border-b text-[11px] font-bold uppercase tracking-wider select-none ${
                  isDark ? 'bg-neutral-950 text-neutral-400 border-neutral-800' : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                }`}
              >
                <tr>
                  <th className="p-3.5 pl-4">Código / EAN</th>
                  <th className="p-3.5">Nome do Produto</th>
                  <th className="p-3.5">Categoria</th>
                  <th className="p-3.5 text-right">Preço Venda</th>
                  <th className="p-3.5 text-right">Preço Custo</th>
                  <th className="p-3.5 text-center">Controle Estoque</th>
                  <th className="p-3.5 text-center">Saldo Atual</th>
                  <th className="p-3.5 pr-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {filteredProducts.map((prod) => {
                  const isControlled = prod.controlStock !== false && prod.unit !== 'SV';
                  const isLow = isControlled && prod.stock <= prod.minStock;
                  const isZero = isControlled && prod.stock === 0;

                  return (
                    <tr
                      key={prod.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-neutral-50'
                      }`}
                    >
                      {/* Code & Barcode */}
                      <td className="p-3.5 pl-4 font-mono">
                        <div className="font-bold text-yellow-400">{prod.code}</div>
                        <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                          <Barcode className="w-3 h-3" />
                          <span>{prod.barcode}</span>
                        </div>
                      </td>

                      {/* Name & Unit */}
                      <td className="p-3.5 max-w-xs">
                        <div className="font-bold text-white line-clamp-1">{prod.name}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">Unidade: {prod.unit || 'UN'}</div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                            isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {prod.category}
                        </span>
                      </td>

                      {/* Sale Price */}
                      <td className="p-3.5 text-right font-mono font-bold text-yellow-400">
                        {formatBRL(prod.price)}
                      </td>

                      {/* Cost Price */}
                      <td className="p-3.5 text-right font-mono text-neutral-400">
                        {prod.costPrice > 0 ? formatBRL(prod.costPrice) : '-'}
                      </td>

                      {/* Control Stock Toggle Button */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleControlStock(prod)}
                          title="Clique para alternar o controle de estoque deste produto"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono transition-all border ${
                            isControlled
                              ? isDark
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                                : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                              : isDark
                              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/25'
                              : 'bg-cyan-50 border-cyan-300 text-cyan-700 hover:bg-cyan-100'
                          }`}
                        >
                          {isControlled ? (
                            <>
                              <Package className="w-3 h-3 text-emerald-400" />
                              <span>ATIVADO</span>
                            </>
                          ) : (
                            <>
                              <Infinity className="w-3 h-3 text-cyan-400" />
                              <span>ILIMITADO</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Stock Quantity */}
                      <td className="p-3.5 text-center font-mono">
                        {isControlled ? (
                          <div className="inline-flex items-center gap-2">
                            {onUpdateStockQuantity && (
                              <button
                                onClick={() => onUpdateStockQuantity(prod, -1)}
                                className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${
                                  isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700'
                                }`}
                                title="Subtrair 1 do estoque"
                              >
                                -
                              </button>
                            )}

                            <span
                              className={`px-2 py-0.5 rounded font-bold text-xs ${
                                isZero
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : isLow
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : isDark
                                  ? 'bg-neutral-800 text-white'
                                  : 'bg-neutral-100 text-neutral-800'
                              }`}
                              title={`Mínimo configurado: ${prod.minStock}`}
                            >
                              {prod.stock} un
                            </span>

                            {onUpdateStockQuantity && (
                              <button
                                onClick={() => onUpdateStockQuantity(prod, 1)}
                                className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${
                                  isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700'
                                }`}
                                title="Adicionar 1 ao estoque"
                              >
                                +
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-cyan-400 flex items-center justify-center gap-1 font-semibold">
                            <Infinity className="w-3.5 h-3.5" />
                            <span>Sem limite</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditProduct(prod)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isDark
                                ? 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-yellow-400'
                                : 'border-neutral-300 bg-white hover:bg-neutral-100 text-yellow-700'
                            }`}
                            title="Editar produto e dados de estoque"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteProduct(prod)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isDark
                                ? 'border-rose-900/60 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                                : 'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600'
                            }`}
                            title="Excluir produto do catálogo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer info bar */}
        <div
          className={`p-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 text-xs ${
            isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Estoque Ativado: saldo físico controlado e deduzido a cada venda.</span>
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 ml-2"></span>
            <span>Estoque Ilimitado: itens e serviços sem restrição de saldo físico.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg border font-semibold ${
              isDark ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-200' : 'border-neutral-300 hover:bg-neutral-100 text-neutral-700'
            }`}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

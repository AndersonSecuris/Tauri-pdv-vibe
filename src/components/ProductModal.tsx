import React, { useState, useEffect } from 'react';
import { ItemPDV, AppTheme } from '../types';
import { formatBRL } from '../services/escpos';
import {
  X,
  Package,
  Layers,
  Shield,
  Cable,
  PlugZap,
  BatteryCharging,
  Cpu,
  Wrench,
  DollarSign,
  Barcode,
  Hash,
  Check,
  AlertTriangle,
  TrendingUp,
  Infinity,
  Sparkles,
  Info,
} from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: ItemPDV | null;
  onSaveProduct: (product: ItemPDV) => void;
  theme?: AppTheme;
}

const CATEGORY_OPTIONS: {
  id: ItemPDV['category'];
  label: string;
  icon: React.FC<{ className?: string }>;
  defaultUnit: string;
}[] = [
  { id: 'PELICULAS', label: 'Películas', icon: Shield, defaultUnit: 'UN' },
  { id: 'CABOS', label: 'Cabos Turbo', icon: Cable, defaultUnit: 'UN' },
  { id: 'ACESSORIOS', label: 'Fontes & Capas', icon: PlugZap, defaultUnit: 'UN' },
  { id: 'BATERIAS', label: 'Baterias', icon: BatteryCharging, defaultUnit: 'UN' },
  { id: 'PECAS', label: 'Peças & Telas', icon: Cpu, defaultUnit: 'UN' },
  { id: 'SERVICOS', label: 'Serviços Bancada', icon: Wrench, defaultUnit: 'SV' },
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSaveProduct,
  theme = 'black-yellow',
}) => {
  const isDark = theme === 'black-yellow' || theme === 'dark';

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemPDV['category']>('ACESSORIOS');
  const [code, setCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [unit, setUnit] = useState('UN');
  const [controlStock, setControlStock] = useState<boolean>(true);
  const [stock, setStock] = useState<number>(10);
  const [minStock, setMinStock] = useState<number>(3);
  const [error, setError] = useState<string | null>(null);

  // Fill on open / edit change
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setCategory(productToEdit.category || 'ACESSORIOS');
      setCode(productToEdit.code || '');
      setBarcode(productToEdit.barcode || '');
      setPrice(productToEdit.price || 0);
      setCostPrice(productToEdit.costPrice || 0);
      setUnit(productToEdit.unit || 'UN');
      // If undefined, default to true unless category is SERVICOS or unit is SV
      const shouldControl =
        productToEdit.controlStock !== undefined
          ? productToEdit.controlStock
          : productToEdit.category !== 'SERVICOS' && productToEdit.unit !== 'SV';
      setControlStock(shouldControl);
      setStock(productToEdit.stock || 0);
      setMinStock(productToEdit.minStock || 0);
    } else {
      // New product defaults
      setName('');
      setCategory('ACESSORIOS');
      setCode(`PRD-${Math.floor(100 + Math.random() * 900)}`);
      setBarcode(`789${Date.now().toString().slice(-8)}`);
      setPrice(0);
      setCostPrice(0);
      setUnit('UN');
      setControlStock(true);
      setStock(10);
      setMinStock(3);
    }
    setError(null);
  }, [productToEdit, isOpen]);

  // When category changes to SERVICOS, suggest controlStock = false
  const handleCategoryChange = (newCat: ItemPDV['category']) => {
    setCategory(newCat);
    if (!productToEdit) {
      if (newCat === 'SERVICOS') {
        setControlStock(false);
        setUnit('SV');
      } else {
        setControlStock(true);
        setUnit('UN');
      }
    }
  };

  if (!isOpen) return null;

  // Margin calculation
  const grossProfit = price - costPrice;
  const marginPercent = price > 0 ? (grossProfit / price) * 100 : 0;

  // Auto-generate code
  const handleGenerateCode = () => {
    const prefix = category.slice(0, 3).toUpperCase();
    const rand = Math.floor(100 + Math.random() * 900);
    setCode(`${prefix}-${rand}`);
  };

  // Auto-generate barcode EAN
  const handleGenerateBarcode = () => {
    const ean = `789${Date.now().toString().slice(-8)}`;
    setBarcode(ean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Informe o nome ou descrição do produto.');
      return;
    }
    if (!code.trim()) {
      setError('Informe o código interno do produto.');
      return;
    }
    if (price < 0) {
      setError('O preço de venda não pode ser negativo.');
      return;
    }

    const newOrUpdatedProduct: ItemPDV = {
      id: productToEdit?.id || `prod-${Date.now()}`,
      name: name.trim(),
      category,
      code: code.trim().toUpperCase(),
      barcode: barcode.trim() || `789${Date.now().toString().slice(-8)}`,
      price: Math.max(0, price),
      costPrice: Math.max(0, costPrice),
      unit: unit.trim().toUpperCase() || 'UN',
      controlStock,
      stock: controlStock ? Math.max(0, stock) : 0,
      minStock: controlStock ? Math.max(0, minStock) : 0,
    };

    onSaveProduct(newOrUpdatedProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in-50">
      <div
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-300 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 md:p-5 border-b flex items-center justify-between ${
            isDark ? 'bg-neutral-950/80 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isDark ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-600'
              }`}
            >
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
                {productToEdit ? 'Editar Produto / Serviço' : 'Cadastrar Novo Produto / Peça'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Configure preços, categoria e defina se este produto possui ou não controle de estoque.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Name */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Nome do Produto / Serviço / Peça <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Película Cerâmica 9D Privacidade iPhone 15 ou Troca de Tela"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-colors focus:ring-2 focus:ring-yellow-400/40 ${
                isDark
                  ? 'bg-neutral-950 border-neutral-700 text-neutral-100 placeholder:text-neutral-600'
                  : 'bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400'
              }`}
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Categoria do Item:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? isDark
                          ? 'border-yellow-400 bg-yellow-400/15 text-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.2)] font-bold'
                          : 'border-yellow-500 bg-yellow-50 text-yellow-900 font-bold'
                        : isDark
                        ? 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800/60 text-neutral-400'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-yellow-400' : 'text-neutral-400'}`} />
                    <span className="text-xs truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Codes Row: Internal Code & Barcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Código Interno <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="text-[11px] text-yellow-400 hover:underline"
                >
                  Gerar Código
                </button>
              </div>
              <div className="relative">
                <Hash className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  required
                  placeholder="Ex: PEL-01, CAB-02"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-yellow-400/40 ${
                    isDark ? 'bg-neutral-950 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Código de Barras (EAN-13)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateBarcode}
                  className="text-[11px] text-yellow-400 hover:underline"
                >
                  Gerar EAN
                </button>
              </div>
              <div className="relative">
                <Barcode className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Ex: 78910001001"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-mono outline-none focus:ring-2 focus:ring-yellow-400/40 ${
                    isDark ? 'bg-neutral-950 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Pricing Grid & Margin Indicator */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Preço de Venda (R$) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-yellow-400">R$</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={price || ''}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-mono font-bold text-right outline-none focus:ring-2 focus:ring-yellow-400/40 ${
                      isDark ? 'bg-neutral-950 border-neutral-700 text-yellow-400' : 'bg-white border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Preço de Custo (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500">R$</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={costPrice || ''}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-mono font-bold text-right outline-none focus:ring-2 focus:ring-yellow-400/40 ${
                      isDark ? 'bg-neutral-950 border-neutral-700 text-neutral-200' : 'bg-white border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Unidade
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none ${
                    isDark ? 'bg-neutral-950 border-neutral-700 text-neutral-200' : 'bg-white border-neutral-300 text-neutral-900'
                  }`}
                >
                  <option value="UN">UN - Unidade</option>
                  <option value="PC">PC - Peça</option>
                  <option value="SV">SV - Serviço / Mão de Obra</option>
                  <option value="KIT">KIT - Kit / Conjunto</option>
                  <option value="M">M - Metro</option>
                </select>
              </div>
            </div>

            {/* Profit margin summary card */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-neutral-400">
                <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
                <span>Lucro Bruto Calculado:</span>
                <strong className="text-emerald-400">{formatBRL(Math.max(0, grossProfit))}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400">Margem:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    marginPercent > 50
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : marginPercent > 20
                      ? 'bg-yellow-400/20 text-yellow-400'
                      : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {marginPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* STOCK CONTROL CONFIGURATION (USER'S EXPLICIT REQUIREMENT) */}
          <div
            className={`p-4 rounded-xl border-2 transition-all space-y-4 ${
              controlStock
                ? isDark
                  ? 'bg-neutral-950/70 border-yellow-400/40'
                  : 'bg-yellow-50/40 border-yellow-400'
                : isDark
                ? 'bg-neutral-950/40 border-neutral-800'
                : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            {/* Toggle header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-lg ${
                    controlStock
                      ? isDark
                        ? 'bg-yellow-400/20 text-yellow-400'
                        : 'bg-yellow-100 text-yellow-800'
                      : isDark
                      ? 'bg-neutral-800 text-neutral-400'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {controlStock ? <Package className="w-4 h-4" /> : <Infinity className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    Controlar Estoque deste Produto
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        controlStock
                          ? 'bg-yellow-400 text-neutral-950'
                          : isDark
                          ? 'bg-neutral-800 text-neutral-400'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {controlStock ? 'ATIVADO' : 'DESATIVADO'}
                    </span>
                  </h4>
                  <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    Defina se as vendas devem decrementar quantidades físicas no estoque da assistência.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setControlStock(!controlStock)}
                className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  controlStock ? 'bg-yellow-400' : isDark ? 'bg-neutral-700' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-neutral-950 shadow ring-0 transition duration-200 ease-in-out ${
                    controlStock ? 'translate-x-6 bg-neutral-950' : 'translate-x-0 bg-white'
                  }`}
                />
              </button>
            </div>

            {/* When Control Stock is Enabled */}
            {controlStock ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-800/80 animate-in fade-in-50">
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Quantidade Atual em Estoque:
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold text-right outline-none focus:ring-2 focus:ring-yellow-400/40 ${
                      isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-300 text-neutral-900'
                    }`}
                  />
                  <p className="text-[10px] text-neutral-400">
                    Diminuirá automaticamente a cada venda finalizada no PDV.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Estoque Mínimo para Alerta:
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={minStock}
                    onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold text-right outline-none focus:ring-2 focus:ring-yellow-400/40 ${
                      isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-300 text-neutral-900'
                    }`}
                  />
                  <p className="text-[10px] text-neutral-400">
                    Alerta de reposição quando a quantidade for igual ou inferior a este valor.
                  </p>
                </div>
              </div>
            ) : (
              /* When Control Stock is Disabled */
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in-50 ${
                  isDark ? 'bg-neutral-900/80 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'
                }`}
              >
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <p className="font-semibold text-cyan-400">
                    Estoque ilimitado (Sem controle de saldo)
                  </p>
                  <p className="text-neutral-400">
                    Este item poderá ser vendido repetidamente no PDV balcão sem travas ou contadores de quantidade física. Recomendado para <strong>mão de obra de bancada, serviços, formatação, películas com aplicação livre ou itens sob demanda</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-neutral-950 bg-yellow-400 hover:bg-yellow-300 flex items-center gap-1.5 shadow-[0_0_15px_rgba(250,204,21,0.25)] transition-all active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{productToEdit ? 'Salvar Alterações' : 'Cadastrar Produto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

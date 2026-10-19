import React, { useState } from 'react';
import { ItemPDV, ItemVenda, Cliente, VendaPDV, ConfiguracaoImpressora, AppTheme } from '../types';
import { formatBRL } from '../services/escpos';
import confetti from 'canvas-confetti';
import {
  ShoppingCart,
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  User,
  CreditCard,
  QrCode,
  Coins,
  CheckCircle,
  Receipt,
  AlertTriangle,
  ArrowRight,
  Package,
  Shield,
  Cable,
  PlugZap,
  BatteryCharging,
  Cpu,
  Wrench,
  Layers,
  Sparkles,
  History,
  Edit2,
  Infinity,
  Boxes,
} from 'lucide-react';
import { SalesHistoryModal } from './SalesHistoryModal';
import { ProductModal } from './ProductModal';
import { ProductManagerModal } from './ProductManagerModal';

interface PDVViewProps {
  products: ItemPDV[];
  clients: Cliente[];
  sales?: VendaPDV[];
  printerConfig: ConfiguracaoImpressora;
  onCompleteSale: (sale: VendaPDV) => void;
  onDeleteSale?: (saleId: string) => void;
  onUpdateSale?: (updatedSale: VendaPDV) => void;
  onPrintReceipt?: (sale: VendaPDV) => void;
  onSaveProduct?: (product: ItemPDV) => void;
  onDeleteProduct?: (productId: string) => void;
  onOpenCaixa: () => void;
  theme?: AppTheme;
}

const CATEGORIES = [
  { id: 'ALL', label: 'Todos os Itens', icon: Layers },
  { id: 'PELICULAS', label: 'Películas', icon: Shield },
  { id: 'CABOS', label: 'Cabos Turbo', icon: Cable },
  { id: 'ACESSORIOS', label: 'Fontes & Capas', icon: PlugZap },
  { id: 'BATERIAS', label: 'Baterias', icon: BatteryCharging },
  { id: 'PECAS', label: 'Peças & Telas', icon: Cpu },
  { id: 'SERVICOS', label: 'Serviços Bancada', icon: Wrench },
];

export const PDVView: React.FC<PDVViewProps> = ({
  products,
  clients,
  sales = [],
  printerConfig,
  onCompleteSale,
  onDeleteSale = () => {},
  onUpdateSale = () => {},
  onPrintReceipt = () => {},
  onSaveProduct = () => {},
  onDeleteProduct = () => {},
  onOpenCaixa,
  theme = 'black-yellow',
}) => {
  const isDark = theme === 'black-yellow' || theme === 'dark';

  const [isSalesHistoryOpen, setIsSalesHistoryOpen] = useState(false);
  const [isProductManagerOpen, setIsProductManagerOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ItemPDV | null>(null);
  const [productToDelete, setProductToDelete] = useState<ItemPDV | null>(null);

  const [cart, setCart] = useState<ItemVenda[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [discount, setDiscount] = useState<number>(0);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'DINHEIRO' | 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO'>('PIX');
  const [cashReceived, setCashReceived] = useState<number>(0);

  // Cart Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const total = Math.max(0, subtotal - discount);
  const changeAmount = paymentMethod === 'DINHEIRO' && cashReceived > total ? cashReceived - total : 0;

  // Filter Products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    return matchesCat && matchesQuery;
  });

  // Add Product to Cart with stock control awareness
  const handleAddToCart = (product: ItemPDV) => {
    const isControlled = product.controlStock !== false && product.unit !== 'SV';
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);

    if (existingIndex >= 0) {
      const currentQty = cart[existingIndex].quantity;
      if (isControlled && currentQty + 1 > product.stock) {
        alert(
          `Atenção: Saldo de estoque insuficiente para "${product.name}".\nDisponível: ${product.stock} un.`
        );
        return;
      }
      const updated = [...cart];
      const newQty = currentQty + 1;
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        total: newQty * product.price,
      };
      setCart(updated);
    } else {
      if (isControlled && product.stock <= 0) {
        alert(
          `Atenção: O produto "${product.name}" está com estoque esgotado (0 un).\nCadastre nova entrada de estoque ou desative o controle de estoque nas configurações do item.`
        );
        return;
      }
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          unitPrice: product.price,
          total: product.price,
        },
      ]);
    }
  };

  // Adjust Quantity
  const handleUpdateQty = (productId: string, delta: number) => {
    const targetItem = cart.find((i) => i.product.id === productId);
    if (targetItem && delta > 0) {
      const isControlled = targetItem.product.controlStock !== false && targetItem.product.unit !== 'SV';
      if (isControlled && targetItem.quantity + delta > targetItem.product.stock) {
        alert(
          `Quantidade máxima em estoque atingida para "${targetItem.product.name}" (${targetItem.product.stock} un disponíveis).`
        );
        return;
      }
    }

    const updated = cart
      .map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            total: newQty * item.unitPrice,
          };
        }
        return item;
      })
      .filter(Boolean) as ItemVenda[];

    setCart(updated);
  };

  // Remove from Cart
  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  // Barcode Fast Scan submission
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    const found = products.find((p) => p.barcode === code || p.code.toLowerCase() === code.toLowerCase());
    if (found) {
      handleAddToCart(found);
      setBarcodeInput('');
    } else {
      alert(`Produto com código ${code} não encontrado no catálogo.`);
    }
  };

  // Finalize Sale
  const handleFinalizeSale = () => {
    if (cart.length === 0) return;

    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const saleCode = `V-2026-${randomSeq}`;

    const newSale: VendaPDV = {
      id: `venda-${Date.now()}`,
      code: saleCode,
      date: new Date().toISOString(),
      client: selectedClient || undefined,
      items: cart,
      subtotal,
      discount,
      total,
      paymentMethod,
      changeAmount: paymentMethod === 'DINHEIRO' ? changeAmount : undefined,
      cashReceived: paymentMethod === 'DINHEIRO' ? cashReceived : undefined,
      cashierName: 'Beatriz Almeida (Caixa 01)',
      status: 'CONCLUIDA',
    };

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
    });

    onCompleteSale(newSale);
    setCart([]);
    setDiscount(0);
    setSelectedClient(null);
    setIsCheckoutOpen(false);
  };

  return (
    <div
      className={`flex-1 flex flex-col lg:flex-row overflow-hidden transition-colors ${
        isDark ? 'bg-[#0E0F12] text-neutral-100' : 'bg-neutral-100/70 text-neutral-900'
      }`}
    >
      {/* Left Column: Product Catalog & Quick Search */}
      <div
        className={`flex-1 flex flex-col overflow-hidden border-r ${
          isDark ? 'bg-[#121317] border-[#252630]' : 'bg-white border-neutral-200'
        }`}
      >
        {/* Top Controls: Barcode scan input + Category Tabs with Icons */}
        <div
          className={`p-4 border-b space-y-3 ${
            isDark ? 'bg-[#16171D] border-[#252630]' : 'bg-neutral-50/70 border-neutral-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Barcode scanner quick form */}
            <form onSubmit={handleBarcodeSubmit} className="relative flex-1 w-full">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Leitor de Código de Barras / Digite o código e aperte Enter..."
                className={`w-full text-xs px-3 py-2.5 pl-9 border rounded-lg font-mono outline-none shadow-2xs transition-colors ${
                  isDark
                    ? 'bg-[#1E1F27] border-[#2F313D] text-yellow-400 placeholder-neutral-500 focus:border-yellow-400'
                    : 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-900'
                }`}
              />
              <Barcode className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </form>

            {/* Keyword Search */}
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar por nome ou código..."
                className={`w-full text-xs px-3 py-2.5 pl-8 border rounded-lg outline-none transition-colors ${
                  isDark
                    ? 'bg-[#1E1F27] border-[#2F313D] text-white placeholder-neutral-500 focus:border-yellow-400'
                    : 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-900'
                }`}
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-3" />
            </div>

            {/* Add New Product & Manage Stock Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setProductToEdit(null);
                  setIsProductModalOpen(true);
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-lg text-xs font-bold text-neutral-950 bg-yellow-400 hover:bg-yellow-300 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(250,204,21,0.25)] shrink-0 active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Novo Produto</span>
              </button>

              <button
                type="button"
                onClick={() => setIsProductManagerOpen(true)}
                className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shrink-0 active:scale-95 whitespace-nowrap ${
                  isDark
                    ? 'border-neutral-700 bg-neutral-800 hover:bg-neutral-750 text-neutral-200'
                    : 'border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800'
                }`}
                title="Abrir painel completo de controle de estoque e catálogo de produtos"
              >
                <Boxes className="w-3.5 h-3.5 text-yellow-400" />
                <span>Estoque ({products.length})</span>
              </button>
            </div>
          </div>

          {/* Category Tabs with Icons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                      : isDark
                      ? 'bg-[#1B1C23] border-[#2B2C37] text-neutral-400 hover:text-white hover:bg-[#23242E]'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => handleAddToCart(prod)}
                className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between group h-40 cursor-pointer select-none active:scale-[0.98] ${
                  isDark
                    ? 'bg-[#17181E] border-[#262732] hover:border-yellow-400/60 hover:bg-[#1E2028]'
                    : 'bg-white border-neutral-200 hover:border-neutral-400 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono mb-1">
                    <span className="truncate max-w-[80px]" title={prod.code}>{prod.code}</span>
                    
                    <div className="flex items-center gap-1.5">
                      {/* Stock badge: handles controlStock true vs false */}
                      {prod.controlStock === false ? (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1"
                          title="Produto com estoque ilimitado (sem controle de estoque)"
                        >
                          <Infinity className="w-3 h-3" />
                          <span>Livre</span>
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${
                            prod.stock === 0
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : prod.stock <= prod.minStock
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : isDark
                              ? 'bg-[#252630] text-neutral-400'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                          title={`Estoque mínimo para alerta: ${prod.minStock}`}
                        >
                          {prod.stock === 0 ? 'Esgotado' : `Est: ${prod.stock}`}
                        </span>
                      )}

                      {/* Quick Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductToEdit(prod);
                            setIsProductModalOpen(true);
                          }}
                          className={`p-1 rounded hover:bg-yellow-400/20 text-neutral-400 hover:text-yellow-400 transition-colors`}
                          title="Editar dados e controle de estoque deste produto"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductToDelete(prod);
                          }}
                          className={`p-1 rounded hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors`}
                          title="Excluir este produto do catálogo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`text-xs font-bold line-clamp-2 transition-colors ${
                      isDark ? 'text-white group-hover:text-yellow-400' : 'text-neutral-900'
                    }`}
                  >
                    {prod.name}
                  </div>
                </div>

                <div
                  className={`flex items-baseline justify-between pt-2 border-t mt-2 ${
                    isDark ? 'border-[#262732]' : 'border-neutral-100'
                  }`}
                >
                  <span className="text-sm font-extrabold font-mono text-yellow-400">
                    {formatBRL(prod.price)}
                  </span>
                  <span
                    className={`text-[11px] font-bold flex items-center gap-0.5 ${
                      isDark ? 'text-neutral-400 group-hover:text-yellow-400' : 'text-neutral-500'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Inserir</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Active Cart & Cashier Summary */}
      <div
        className={`w-full lg:w-96 flex flex-col shrink-0 border-t lg:border-t-0 lg:border-l ${
          isDark ? 'bg-[#121317] border-[#252630]' : 'bg-neutral-50 border-neutral-200'
        }`}
      >
        {/* Cart Top Bar */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDark ? 'bg-[#16171D] border-[#252630]' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h2 className="text-sm font-bold">
              Carrinho ({cart.reduce((sum, i) => sum + i.quantity, 0)})
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSalesHistoryOpen(true)}
              className="text-xs text-yellow-400 hover:text-yellow-300 hover:underline font-bold flex items-center gap-1 transition-colors"
              title="Ver histórico de vendas realizadas, alterar valores ou apagar vendas"
            >
              <History className="w-3.5 h-3.5" />
              <span>Vendas ({sales.length})</span>
            </button>
            <button
              type="button"
              onClick={onOpenCaixa}
              className={`text-xs hover:underline font-bold flex items-center gap-1 transition-colors ${
                isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Caixa</span>
            </button>
          </div>
        </div>

        {/* Customer Select / Anonymous */}
        <div
          className={`p-3 border-b text-xs ${
            isDark ? 'bg-[#181920] border-[#252630]' : 'bg-neutral-100/50 border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-semibold flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-yellow-400" />
              <span>Cliente:</span>
            </span>
            {selectedClient ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{selectedClient.name}</span>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            ) : (
              <span className="text-neutral-400 italic">Consumidor Final (Balcão)</span>
            )}
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400 text-xs space-y-2">
              <ShoppingCart className="w-8 h-8 opacity-30 text-yellow-400" />
              <p className="font-bold text-white">Carrinho Vazio</p>
              <p className="text-[11px] text-neutral-500 max-w-xs">
                Utilize o leitor de código de barras ou selecione os itens no catálogo ao lado.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className={`rounded-lg border p-2.5 shadow-2xs flex items-center justify-between gap-3 text-xs transition-colors ${
                  isDark ? 'bg-[#181920] border-[#2A2B35]' : 'bg-white border-neutral-200'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate text-white">{item.product.name}</div>
                  <div className="text-[11px] text-yellow-400 font-mono flex items-center gap-1.5">
                    <span>{formatBRL(item.unitPrice)} un.</span>
                    {item.product.controlStock === false ? (
                      <span className="text-[10px] text-cyan-400 flex items-center gap-0.5">
                        <Infinity className="w-2.5 h-2.5" /> Livre
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-sans">
                        (Est: {item.product.stock})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleUpdateQty(item.product.id, -1)}
                    className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                      isDark
                        ? 'bg-[#272833] hover:bg-[#343544] text-neutral-300'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-mono font-bold text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQty(item.product.id, 1)}
                    className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                      isDark
                        ? 'bg-[#272833] hover:bg-[#343544] text-neutral-300'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right shrink-0 w-16 font-mono font-extrabold text-white">
                  {formatBRL(item.total)}
                </div>

                <button
                  onClick={() => handleRemoveFromCart(item.product.id)}
                  className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Financial Summary & Checkout Action with High-Contrast Yellow Button */}
        <div
          className={`p-4 border-t space-y-3 ${
            isDark ? 'bg-[#16171D] border-[#252630]' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal:</span>
              <span>{formatBRL(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-neutral-300">
              <span>Desconto (R$):</span>
              <input
                type="number"
                min="0"
                value={discount || ''}
                onChange={(e) => setDiscount(Number(e.target.value))}
                placeholder="0,00"
                className={`w-20 text-right px-2 py-0.5 border rounded text-xs font-mono outline-none ${
                  isDark
                    ? 'bg-[#1E1F27] border-[#2F313D] text-yellow-400'
                    : 'bg-white border-neutral-300 text-neutral-900'
                }`}
              />
            </div>
            <div
              className={`flex justify-between text-base font-extrabold border-t pt-2 ${
                isDark ? 'border-[#252630] text-white' : 'border-neutral-200 text-neutral-900'
              }`}
            >
              <span>Total:</span>
              <span className="text-yellow-400">{formatBRL(total)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => {
              setCashReceived(total);
              setIsCheckoutOpen(true);
            }}
            className={`w-full py-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95 ${
              cart.length === 0
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-yellow-400 hover:bg-yellow-300 text-neutral-950 shadow-[0_0_15px_rgba(250,204,21,0.25)]'
            }`}
          >
            <DollarSign className="w-4 h-4 stroke-[3]" />
            <span>Fechar Venda ({formatBRL(total)})</span>
          </button>
        </div>
      </div>

      {/* Checkout Modal with Visual Payment Tiles */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`rounded-xl shadow-2xl border max-w-lg w-full overflow-hidden flex flex-col ${
              isDark ? 'bg-[#141519] text-white border-[#2A2B35]' : 'bg-white text-neutral-900 border-neutral-200'
            }`}
          >
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                isDark ? 'bg-[#181920] border-[#2A2B35]' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-bold">Fechar Venda & Pagamento</h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div
                className={`text-center p-4 rounded-xl border ${
                  isDark ? 'bg-[#1A1B22] border-[#2E303C]' : 'bg-neutral-100 border-neutral-200'
                }`}
              >
                <span className="text-neutral-400 block mb-0.5 text-xs font-semibold">Total a Receber:</span>
                <span className="text-3xl font-black font-mono text-yellow-400">
                  {formatBRL(total)}
                </span>
              </div>

              {/* Payment Methods with Large Visual Tiles */}
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-300">Escolha a Forma de Pagamento:</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      paymentMethod === 'PIX'
                        ? 'border-yellow-400 bg-yellow-400/15 text-white shadow-[0_0_12px_rgba(250,204,21,0.2)] ring-1 ring-yellow-400'
                        : isDark
                        ? 'border-[#2A2B35] bg-[#1A1B22] text-neutral-300 hover:bg-[#23242E]'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold">PIX Instantâneo</div>
                      <div className="text-[10px] text-neutral-400">Aprovação imediata</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('DINHEIRO')}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      paymentMethod === 'DINHEIRO'
                        ? 'border-yellow-400 bg-yellow-400/15 text-white shadow-[0_0_12px_rgba(250,204,21,0.2)] ring-1 ring-yellow-400'
                        : isDark
                        ? 'border-[#2A2B35] bg-[#1A1B22] text-neutral-300 hover:bg-[#23242E]'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold">Dinheiro / Cédulas</div>
                      <div className="text-[10px] text-neutral-400">Com cálculo de troco</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARTAO_DEBITO')}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      paymentMethod === 'CARTAO_DEBITO'
                        ? 'border-yellow-400 bg-yellow-400/15 text-white shadow-[0_0_12px_rgba(250,204,21,0.2)] ring-1 ring-yellow-400'
                        : isDark
                        ? 'border-[#2A2B35] bg-[#1A1B22] text-neutral-300 hover:bg-[#23242E]'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold">Cartão de Débito</div>
                      <div className="text-[10px] text-neutral-400">Maquininha</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARTAO_CREDITO')}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      paymentMethod === 'CARTAO_CREDITO'
                        ? 'border-yellow-400 bg-yellow-400/15 text-white shadow-[0_0_12px_rgba(250,204,21,0.2)] ring-1 ring-yellow-400'
                        : isDark
                        ? 'border-[#2A2B35] bg-[#1A1B22] text-neutral-300 hover:bg-[#23242E]'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold">Cartão de Crédito</div>
                      <div className="text-[10px] text-neutral-400">Parcelamento</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dinheiro Change Calculator */}
              {paymentMethod === 'DINHEIRO' && (
                <div
                  className={`p-3 rounded-lg border space-y-2 ${
                    isDark ? 'bg-[#181920] border-[#2A2B35]' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-300">Valor Recebido do Cliente:</span>
                    <input
                      type="number"
                      step="5"
                      value={cashReceived || ''}
                      onChange={(e) => setCashReceived(Number(e.target.value))}
                      className={`w-28 text-right font-mono text-sm px-2 py-1 border rounded font-bold outline-none ${
                        isDark ? 'bg-[#101114] border-yellow-400 text-yellow-400' : 'bg-white border-neutral-300'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#2A2B35]">
                    <span className="font-bold text-neutral-200">Troco a Devolver:</span>
                    <span className="text-lg font-black font-mono text-emerald-400">
                      {formatBRL(changeAmount)}
                    </span>
                  </div>
                </div>
              )}

              {/* PIX Key / QR simulation */}
              {paymentMethod === 'PIX' && (
                <div
                  className={`p-3 rounded-lg border flex items-center gap-3 ${
                    isDark ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <QrCode className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div className="text-[11px] text-emerald-300">
                    <strong>Chave PIX da Loja (CNPJ):</strong> 48.912.345/0001-90
                    <div className="text-neutral-400 mt-0.5">
                      Confirme o comprovante no aplicativo antes de entregar a mercadoria.
                    </div>
                  </div>
                </div>
              )}

              {/* Thermal print notice */}
              <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 pt-1">
                <span>🖨️ Cupom ESC/POS será gerado e a gaveta será acionada automaticamente.</span>
              </div>
            </div>

            <div
              className={`px-6 py-4 border-t flex items-center justify-end gap-2 ${
                isDark ? 'bg-[#181920] border-[#2A2B35]' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleFinalizeSale}
                className="px-5 py-2.5 text-xs font-black text-neutral-950 bg-yellow-400 hover:bg-yellow-300 rounded-lg transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(250,204,21,0.25)]"
              >
                <CheckCircle className="w-4 h-4 stroke-[3]" />
                <span>Confirmar & Emitir Cupom</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales History, Edit Values and Delete Modal */}
      <SalesHistoryModal
        isOpen={isSalesHistoryOpen}
        onClose={() => setIsSalesHistoryOpen(false)}
        sales={sales}
        printerConfig={printerConfig}
        onDeleteSale={onDeleteSale}
        onUpdateSale={onUpdateSale}
        onPrintReceipt={onPrintReceipt}
        theme={theme}
      />

      {/* Product Add / Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
        onSaveProduct={(p) => {
          onSaveProduct(p);
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        theme={theme}
      />

      {/* Product Manager & Stock Control Center */}
      <ProductManagerModal
        isOpen={isProductManagerOpen}
        onClose={() => setIsProductManagerOpen(false)}
        products={products}
        onOpenNewProduct={() => {
          setProductToEdit(null);
          setIsProductModalOpen(true);
        }}
        onEditProduct={(p) => {
          setProductToEdit(p);
          setIsProductModalOpen(true);
        }}
        onDeleteProduct={(p) => {
          setProductToDelete(p);
        }}
        onToggleControlStock={(p) => {
          const newControlStock = p.controlStock === false ? true : false;
          onSaveProduct({
            ...p,
            controlStock: newControlStock,
            stock: newControlStock && p.stock === 0 ? 10 : p.stock,
          });
        }}
        onUpdateStockQuantity={(p, delta) => {
          onSaveProduct({
            ...p,
            stock: Math.max(0, p.stock + delta),
          });
        }}
        theme={theme}
      />

      {/* Product Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in-50">
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
                <h3 className="font-bold text-base text-rose-400">Excluir Produto do Catálogo?</h3>
                <p className="text-xs text-neutral-400 font-mono">{productToDelete.code}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-neutral-300 leading-relaxed">
              <p>
                Tem certeza que deseja apagar o produto <strong>{productToDelete.name}</strong>?
              </p>
              <div
                className={`p-3 rounded-xl border text-[11px] font-mono space-y-1 ${
                  isDark ? 'bg-neutral-950/80 border-neutral-800 text-neutral-300' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                }`}
              >
                <div>Código: {productToDelete.code} (EAN: {productToDelete.barcode})</div>
                <div>Preço: <span className="text-yellow-400 font-bold">{formatBRL(productToDelete.price)}</span></div>
                <div>
                  Controle de Estoque:{' '}
                  <span className={productToDelete.controlStock === false ? 'text-cyan-400' : 'text-neutral-200'}>
                    {productToDelete.controlStock === false ? 'Desativado (Ilimitado)' : `Ativado (${productToDelete.stock} un)`}
                  </span>
                </div>
              </div>
              <p className="text-rose-400 font-semibold text-[11px]">
                ⚠️ Esta ação removerá o produto da vitrine e do leitor de código de barras.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProduct(productToDelete.id);
                  setProductToDelete(null);
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

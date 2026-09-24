import React, { useState } from 'react';
import { ItemPDV, ItemVenda, Cliente, VendaPDV, ConfiguracaoImpressora } from '../types';
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
} from 'lucide-react';

interface PDVViewProps {
  products: ItemPDV[];
  clients: Cliente[];
  printerConfig: ConfiguracaoImpressora;
  onCompleteSale: (sale: VendaPDV) => void;
  onOpenCaixa: () => void;
}

const CATEGORIES = [
  { id: 'ALL', label: 'Todos os Itens' },
  { id: 'PELICULAS', label: 'Películas' },
  { id: 'CABOS', label: 'Cabos' },
  { id: 'ACESSORIOS', label: 'Acessórios & Fontes' },
  { id: 'BATERIAS', label: 'Baterias' },
  { id: 'PECAS', label: 'Peças & Telas' },
  { id: 'SERVICOS', label: 'Serviços de Bancada' },
];

export const PDVView: React.FC<PDVViewProps> = ({
  products,
  clients,
  printerConfig,
  onCompleteSale,
  onOpenCaixa,
}) => {
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

  // Add Product to Cart
  const handleAddToCart = (product: ItemPDV) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    if (existingIndex >= 0) {
      const updated = [...cart];
      const newQty = updated[existingIndex].quantity + 1;
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        total: newQty * product.price,
      };
      setCart(updated);
    } else {
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
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-neutral-100/70">
      {/* Left Column: Product Catalog & Quick Search */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-neutral-200 bg-white">
        {/* Top Controls: Barcode scan input + Category Tabs */}
        <div className="p-4 border-b border-neutral-200 space-y-3 bg-neutral-50/70">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Barcode scanner quick form */}
            <form onSubmit={handleBarcodeSubmit} className="relative flex-1 w-full">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Leitor de Código de Barras / Digite código e Enter..."
                className="w-full text-xs px-3 py-2 pl-9 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono shadow-2xs"
              />
              <Barcode className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            </form>

            {/* Keyword Search */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar por nome..."
                className="w-full text-xs px-3 py-2 pl-8 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((prod) => (
              <button
                key={prod.id}
                onClick={() => handleAddToCart(prod)}
                className="text-left p-3.5 rounded-xl border border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-xs transition-all flex flex-col justify-between group h-36"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono mb-1">
                    <span>{prod.code}</span>
                    <span
                      className={`text-[10px] px-1 rounded ${
                        prod.stock <= prod.minStock
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      Est: {prod.stock}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-neutral-900 line-clamp-2 group-hover:text-neutral-950">
                    {prod.name}
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-neutral-100 mt-2">
                  <span className="text-sm font-bold font-mono text-neutral-900">
                    {formatBRL(prod.price)}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-medium group-hover:text-neutral-900 flex items-center gap-0.5">
                    + Inserir
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Active Cart & Cashier Summary */}
      <div className="w-full lg:w-96 bg-neutral-50 flex flex-col shrink-0 border-t lg:border-t-0 lg:border-l border-neutral-200">
        {/* Cart Top Bar */}
        <div className="p-4 border-b border-neutral-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-neutral-800" />
            <h2 className="text-sm font-semibold text-neutral-900">
              Carrinho ({cart.reduce((sum, i) => sum + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onOpenCaixa}
            className="text-xs text-neutral-600 hover:text-neutral-900 underline font-medium"
          >
            Gestão do Caixa
          </button>
        </div>

        {/* Customer Select / Anonymous */}
        <div className="p-3 border-b border-neutral-200 bg-neutral-100/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500 font-medium">Cliente:</span>
            {selectedClient ? (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900">{selectedClient.name}</span>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-neutral-400 hover:text-neutral-700"
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
              <ShoppingCart className="w-8 h-8 opacity-40" />
              <p>O carrinho de compras está vazio.</p>
              <p className="text-[11px] text-neutral-400">
                Passe o leitor de código de barras ou selecione os itens no catálogo à esquerda.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-lg border border-neutral-200 p-2.5 shadow-2xs flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-neutral-900 truncate">
                    {item.product.name}
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    {formatBRL(item.unitPrice)} un.
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleUpdateQty(item.product.id, -1)}
                    className="w-6 h-6 rounded bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-mono font-semibold text-neutral-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQty(item.product.id, 1)}
                    className="w-6 h-6 rounded bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right shrink-0 w-16 font-mono font-bold text-neutral-900">
                  {formatBRL(item.total)}
                </div>

                <button
                  onClick={() => handleRemoveFromCart(item.product.id)}
                  className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Financial Summary & Checkout Action */}
        <div className="p-4 bg-white border-t border-neutral-200 space-y-3">
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal:</span>
              <span>{formatBRL(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-neutral-600">
              <span>Desconto (R$):</span>
              <input
                type="number"
                min="0"
                value={discount || ''}
                onChange={(e) => setDiscount(Number(e.target.value))}
                placeholder="0,00"
                className="w-20 text-right px-1.5 py-0.5 border border-neutral-300 rounded text-xs"
              />
            </div>
            <div className="flex justify-between text-base font-bold text-neutral-900 border-t border-neutral-200 pt-2">
              <span>Total a Pagar:</span>
              <span>{formatBRL(total)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => {
              setCashReceived(total);
              setIsCheckoutOpen(true);
            }}
            className={`w-full py-3 rounded-lg text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-xs ${
              cart.length === 0
                ? 'bg-neutral-300 cursor-not-allowed'
                : 'bg-neutral-900 hover:bg-neutral-800'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Finalizar Venda ({formatBRL(total)})</span>
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 max-w-lg w-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-neutral-900" />
                <h3 className="text-sm font-bold text-neutral-900">Fechar Venda & Pagamento</h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="text-center p-3 bg-neutral-100 rounded-lg">
                <span className="text-neutral-500 block mb-0.5">Total a Receber:</span>
                <span className="text-2xl font-bold font-mono text-neutral-900">
                  {formatBRL(total)}
                </span>
              </div>

              {/* Payment Methods */}
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-800">Forma de Pagamento:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                      paymentMethod === 'PIX'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="font-semibold">PIX Instantâneo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('DINHEIRO')}
                    className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                      paymentMethod === 'DINHEIRO'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    <span className="font-semibold">Dinheiro (Cédulas)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARTAO_DEBITO')}
                    className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                      paymentMethod === 'CARTAO_DEBITO'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="font-semibold">Cartão Débito</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARTAO_CREDITO')}
                    className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                      paymentMethod === 'CARTAO_CREDITO'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="font-semibold">Cartão Crédito</span>
                  </button>
                </div>
              </div>

              {/* Dinheiro Change Calculator */}
              {paymentMethod === 'DINHEIRO' && (
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-700">Valor Recebido do Cliente:</span>
                    <input
                      type="number"
                      step="5"
                      value={cashReceived || ''}
                      onChange={(e) => setCashReceived(Number(e.target.value))}
                      className="w-28 text-right font-mono text-sm px-2 py-1 border border-neutral-300 rounded font-bold"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-200">
                    <span className="font-bold text-neutral-800">Troco a Devolver:</span>
                    <span className="text-base font-bold font-mono text-emerald-700">
                      {formatBRL(changeAmount)}
                    </span>
                  </div>
                </div>
              )}

              {/* PIX Key / QR simulation */}
              {paymentMethod === 'PIX' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                  <QrCode className="w-8 h-8 text-emerald-700 shrink-0" />
                  <div className="text-[11px] text-emerald-900">
                    <strong>Chave PIX da Loja (CNPJ):</strong> 48.912.345/0001-90
                    <div className="text-neutral-500 mt-0.5">
                      Aguardando confirmação bancária do comprovante no balcão.
                    </div>
                  </div>
                </div>
              )}

              {/* Thermal print notice */}
              <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 pt-1">
                <span>🖨️ Cupom térmico ESC/POS será gerado e a gaveta será acionada automaticamente.</span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleFinalizeSale}
                className="px-5 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Confirmar & Emitir Cupom</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

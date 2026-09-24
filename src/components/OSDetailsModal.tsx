import React, { useState } from 'react';
import { OrdemDeServico, OSStatus, ItemOS, ConfiguracaoImpressora } from '../types';
import { PatternLock } from './PatternLock';
import { formatBRL, formatDateTime } from '../services/escpos';
import {
  Smartphone,
  User,
  Wrench,
  Clock,
  Printer,
  X,
  Plus,
  Trash2,
  CheckCircle,
  Share2,
  Phone,
  Calendar,
  Lock,
  MessageSquare,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

interface OSDetailsModalProps {
  os: OrdemDeServico;
  printerConfig: ConfiguracaoImpressora;
  onUpdate: (updatedOS: OrdemDeServico) => void;
  onPrint: (type: 'CUSTOMER_RECEIPT' | 'WORKBENCH_STICKER') => void;
  onClose: () => void;
}

const STATUS_LABELS: Record<OSStatus, { label: string; color: string; desc: string }> = {
  RECEBIDO: {
    label: 'Recebido / Em Triagem',
    color: 'bg-neutral-100 text-neutral-800 border-neutral-300',
    desc: 'Aparelho deu entrada na loja e aguarda diagnóstico do técnico.',
  },
  AGUARDANDO_APROVACAO: {
    label: 'Aguardando Aprovação',
    color: 'bg-amber-50 text-amber-800 border-amber-300',
    desc: 'Diagnóstico finalizado. Orçamento aguardando sinal verde do cliente.',
  },
  APROVADO: {
    label: 'Aprovado / Em Reparo',
    color: 'bg-blue-50 text-blue-800 border-blue-300',
    desc: 'Orçamento aprovado. Aparelho em execução na bancada técnica.',
  },
  AGUARDANDO_PECA: {
    label: 'Aguardando Peça',
    color: 'bg-purple-50 text-purple-800 border-purple-300',
    desc: 'Peça solicitada ao fornecedor, aguardando entrega.',
  },
  PRONTO: {
    label: 'Pronto para Retirada',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    desc: 'Reparo e testes concluídos. Cliente já pode vir retirar!',
  },
  ENTREGUE: {
    label: 'Finalizado / Entregue',
    color: 'bg-neutral-900 text-white border-neutral-900',
    desc: 'Aparelho entregue ao cliente com garantia e recibo emitidos.',
  },
  CANCELADO: {
    label: 'Não Aprovado / Devolvido',
    color: 'bg-red-50 text-red-800 border-red-300',
    desc: 'Orçamento recusado ou sem reparo viável. Devolvido ao cliente.',
  },
};

export const OSDetailsModal: React.FC<OSDetailsModalProps> = ({
  os,
  printerConfig,
  onUpdate,
  onPrint,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'BUDGET' | 'TIMELINE'>('DETAILS');
  const [currentStatus, setCurrentStatus] = useState<OSStatus>(os.status);
  const [statusNote, setStatusNote] = useState('');
  const [technicalDiagnosis, setTechnicalDiagnosis] = useState(os.technicalDiagnosis || '');
  const [items, setItems] = useState<ItemOS[]>(os.items);
  const [discount, setDiscount] = useState<number>(os.discount);
  const [paymentStatus, setPaymentStatus] = useState(os.paymentStatus);
  const [paymentMethod, setPaymentMethod] = useState(os.paymentMethod || 'PIX');

  // New Item inputs
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemType, setNewItemType] = useState<'PECA' | 'SERVICO'>('PECA');
  const [newItemPrice, setNewItemPrice] = useState<number>(0);

  // Recalculate totals
  const partsCost = items
    .filter((i) => i.type === 'PECA')
    .reduce((sum, i) => sum + i.total, 0);
  const laborCost = items
    .filter((i) => i.type === 'SERVICO')
    .reduce((sum, i) => sum + i.total, 0);
  const subtotal = partsCost + laborCost;
  const totalAmount = Math.max(0, subtotal - discount);

  const handleAddItem = () => {
    if (!newItemDesc.trim() || newItemPrice <= 0) return;
    const item: ItemOS = {
      id: `it-${Date.now()}`,
      description: newItemDesc.trim(),
      type: newItemType,
      quantity: 1,
      unitPrice: newItemPrice,
      total: newItemPrice,
    };
    setItems([...items, item]);
    setNewItemDesc('');
    setNewItemPrice(0);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleStatusChange = (newStatus: OSStatus) => {
    setCurrentStatus(newStatus);
    const newEvent = {
      id: `ev-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: newStatus,
      note: statusNote || `Status alterado para ${STATUS_LABELS[newStatus].label}`,
      author: 'Técnico Responsável',
    };

    const updated: OrdemDeServico = {
      ...os,
      status: newStatus,
      technicalDiagnosis,
      items,
      partsCost,
      laborCost,
      discount,
      totalAmount,
      paymentStatus: newStatus === 'ENTREGUE' ? 'PAGO' : paymentStatus,
      paymentMethod,
      amountPaid: newStatus === 'ENTREGUE' ? totalAmount : os.amountPaid,
      exitDate: newStatus === 'ENTREGUE' ? new Date().toISOString() : os.exitDate,
      timeline: [newEvent, ...os.timeline],
    };

    onUpdate(updated);
    setStatusNote('');
  };

  const handleSaveBudgetAndDiagnosis = () => {
    const updated: OrdemDeServico = {
      ...os,
      status: currentStatus,
      technicalDiagnosis,
      items,
      partsCost,
      laborCost,
      discount,
      totalAmount,
      paymentStatus,
      paymentMethod,
      amountPaid: paymentStatus === 'PAGO' ? totalAmount : os.amountPaid,
    };
    onUpdate(updated);
    alert('Dados da Ordem de Serviço atualizados com sucesso!');
  };

  const generateWhatsAppLink = () => {
    const phoneClean = os.client.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá ${os.client.name}! Aqui é da ${printerConfig.storeName}.\n\n` +
      `Sua Ordem de Serviço *${os.id}* (${os.device.brand} ${os.device.model}) está com status: *${STATUS_LABELS[currentStatus].label}*.\n\n` +
      `Valor total: ${formatBRL(totalAmount)}\n` +
      `Acompanhe em tempo real pelo código de rastreio: *${os.trackingCode}* no link:\n` +
      `https://app.cellmaster.com.br/rastreio?codigo=${os.trackingCode}`
    );
    return `https://wa.me/55${phoneClean}?text=${message}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 max-w-4xl w-full my-auto flex flex-col max-h-[94vh] overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900">{os.id}</h2>
                <span className="text-xs font-mono text-neutral-600 bg-neutral-200/80 px-2 py-0.5 rounded">
                  Rastreio: {os.trackingCode}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded border font-medium ${
                    STATUS_LABELS[currentStatus].color
                  }`}
                >
                  {STATUS_LABELS[currentStatus].label}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                {os.device.brand} {os.device.model} ({os.device.color}) · Cliente: {os.client.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Pipeline Workflow Selector */}
        <div className="px-6 py-3 bg-neutral-100/60 border-b border-neutral-200 overflow-x-auto flex items-center gap-1.5 text-xs">
          {(Object.keys(STATUS_LABELS) as OSStatus[]).map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors border ${
                currentStatus === st
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {STATUS_LABELS[st].label}
            </button>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-neutral-200 flex items-center gap-4 bg-white text-xs font-medium">
          <button
            onClick={() => setActiveTab('DETAILS')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'DETAILS'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Dados do Aparelho & Checklist
          </button>
          <button
            onClick={() => setActiveTab('BUDGET')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'BUDGET'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Orçamento & Peças ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'TIMELINE'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Histórico & Timeline ({os.timeline.length})
          </button>
        </div>

        {/* Modal Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'DETAILS' && (
            <div className="space-y-6 text-xs">
              {/* Client & Device summary grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Card */}
                <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-neutral-700 font-semibold">
                    <User className="w-4 h-4" />
                    <span>Dados do Cliente</span>
                  </div>
                  <div className="space-y-1 text-neutral-600">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Nome:</span>
                      <span className="font-medium text-neutral-900">{os.client.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Telefone / WhatsApp:</span>
                      <span className="font-mono text-neutral-900">{os.client.phone}</span>
                    </div>
                    {os.client.cpf && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">CPF:</span>
                        <span className="font-mono text-neutral-900">{os.client.cpf}</span>
                      </div>
                    )}
                    {os.client.email && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">E-mail:</span>
                        <span className="text-neutral-900">{os.client.email}</span>
                      </div>
                    )}
                    {os.client.address && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Endereço:</span>
                        <span className="text-neutral-900 text-right">{os.client.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Device Card */}
                <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-neutral-700 font-semibold">
                    <Smartphone className="w-4 h-4" />
                    <span>Dados do Aparelho & Segurança</span>
                  </div>
                  <div className="space-y-1 text-neutral-600">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Modelo:</span>
                      <span className="font-medium text-neutral-900">
                        {os.device.brand} {os.device.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Cor:</span>
                      <span className="text-neutral-900">{os.device.color}</span>
                    </div>
                    {os.device.imei && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">IMEI:</span>
                        <span className="font-mono text-neutral-900">{os.device.imei}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Senha / Bloqueio:</span>
                      {os.device.passcode ? (
                        <span className="font-mono bg-neutral-200 px-2 py-0.5 rounded font-bold text-neutral-900">
                          {os.device.passcode}
                        </span>
                      ) : os.device.patternLock && os.device.patternLock.length > 0 ? (
                        <span className="font-mono bg-neutral-200 px-2 py-0.5 rounded text-neutral-800">
                          Padrão: {os.device.patternLock.map((p) => p + 1).join('→')}
                        </span>
                      ) : (
                        <span className="text-neutral-400 italic">Sem senha</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Conta Google/iCloud:</span>
                      <span className="font-medium text-neutral-900">
                        {os.device.icloudStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Pattern Lock if available */}
              {os.device.patternLock && os.device.patternLock.length > 0 && (
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 flex items-center gap-6">
                  <PatternLock pattern={os.device.patternLock} readOnly size={130} />
                  <div className="space-y-1">
                    <div className="font-semibold text-neutral-900">
                      Padrão de Desenho da Bancada
                    </div>
                    <p className="text-neutral-500">
                      Utilize o padrão acima para desbloquear o aparelho do cliente para os testes de calibração.
                    </p>
                    <div className="font-mono text-xs text-neutral-800 bg-white px-2 py-1 rounded border border-neutral-200 inline-block">
                      Sequência: {os.device.patternLock.map((p) => p + 1).join(' → ')}
                    </div>
                  </div>
                </div>
              )}

              {/* Reported Defect & Initial Checklist */}
              <div className="border border-neutral-200 rounded-lg p-4 bg-white space-y-3">
                <div className="font-semibold text-neutral-900">Defeito Reclamado pelo Cliente:</div>
                <div className="p-3 bg-neutral-100 rounded-lg font-mono text-neutral-800">
                  {os.reportedDefect}
                </div>

                <div className="font-semibold text-neutral-900 pt-2">Checklist de Entrada:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        os.initialChecklist.screenCracked ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                    <span>
                      Tela: {os.initialChecklist.screenCracked ? 'Trincada' : 'Íntegra'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        os.initialChecklist.housingScratched ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                    <span>
                      Carcaça: {os.initialChecklist.housingScratched ? 'Riscos' : 'Perfeita'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        os.initialChecklist.waterDamage ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                    />
                    <span>
                      Água/Umidade: {os.initialChecklist.waterDamage ? 'Com indício' : 'Não'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        os.initialChecklist.chargesNormal ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    />
                    <span>
                      Carga: {os.initialChecklist.chargesNormal ? 'Normal' : 'Com falha'}
                    </span>
                  </div>
                </div>

                {os.accessoriesLeft && os.accessoriesLeft.length > 0 && (
                  <div className="pt-2 text-neutral-600">
                    <span className="font-medium text-neutral-900">Acessórios deixados: </span>
                    {os.accessoriesLeft.join(', ')}
                  </div>
                )}
              </div>

              {/* Technical Diagnosis Textarea */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-neutral-900">
                  Laudo Técnico / Diagnóstico da Bancada:
                </label>
                <textarea
                  rows={3}
                  value={technicalDiagnosis}
                  onChange={(e) => setTechnicalDiagnosis(e.target.value)}
                  placeholder="Descreva aqui o parecer técnico, testes realizados, medições de corrente..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {activeTab === 'BUDGET' && (
            <div className="space-y-6 text-xs">
              {/* Items Table */}
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-neutral-100 text-neutral-600 border-b border-neutral-200">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Tipo</th>
                      <th className="py-2 px-3 font-semibold">Descrição da Peça / Serviço</th>
                      <th className="py-2 px-3 font-semibold text-center">Qtd</th>
                      <th className="py-2 px-3 font-semibold text-right">Unitário</th>
                      <th className="py-2 px-3 font-semibold text-right">Total</th>
                      <th className="py-2 px-3 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-neutral-400 italic">
                          Nenhum item adicionado ao orçamento ainda.
                        </td>
                      </tr>
                    ) : (
                      items.map((it) => (
                        <tr key={it.id} className="hover:bg-neutral-50">
                          <td className="py-2 px-3">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                it.type === 'PECA'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {it.type}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-medium text-neutral-900">
                            {it.description}
                          </td>
                          <td className="py-2 px-3 text-center font-mono">{it.quantity}</td>
                          <td className="py-2 px-3 text-right font-mono text-neutral-600">
                            {formatBRL(it.unitPrice)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-neutral-900">
                            {formatBRL(it.total)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(it.id)}
                              className="text-neutral-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add item inline form */}
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
                <div className="font-semibold text-neutral-800">
                  Adicionar Peça ou Mão de Obra:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <select
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value as 'PECA' | 'SERVICO')}
                    className="text-xs px-2.5 py-1.5 border border-neutral-300 rounded bg-white"
                  >
                    <option value="PECA">Peça / Componente</option>
                    <option value="SERVICO">Mão de Obra / Serviço</option>
                  </select>
                  <input
                    type="text"
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    placeholder="Descrição da peça ou serviço"
                    className="sm:col-span-2 text-xs px-3 py-1.5 border border-neutral-300 rounded"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={newItemPrice || ''}
                      onChange={(e) => setNewItemPrice(Number(e.target.value))}
                      placeholder="Valor (R$)"
                      className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-xs font-medium flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Inserir</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Financial summary & Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="border border-neutral-200 rounded-lg p-3 space-y-2 bg-neutral-50/50">
                  <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    <span>Pagamento & Garantia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">Status Pgto:</span>
                    <select
                      value={paymentStatus}
                      onChange={(e) =>
                        setPaymentStatus(e.target.value as 'PENDENTE' | 'PAGO' | 'PARCIAL')
                      }
                      className="text-xs px-2 py-1 border border-neutral-300 rounded bg-white font-medium"
                    >
                      <option value="PENDENTE">Pendente</option>
                      <option value="PAGO">Pago / Liquidado</option>
                      <option value="PARCIAL">Parcial / Entrada</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">Forma Pgto:</span>
                    <select
                      value={paymentMethod}
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value as 'DINHEIRO' | 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO'
                        )
                      }
                      className="text-xs px-2 py-1 border border-neutral-300 rounded bg-white"
                    >
                      <option value="PIX">PIX</option>
                      <option value="DINHEIRO">Dinheiro</option>
                      <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                      <option value="CARTAO_DEBITO">Cartão de Débito</option>
                    </select>
                  </div>
                  <div className="text-[11px] text-neutral-500 pt-1">
                    Garantia: <span className="font-bold text-neutral-800">90 dias</span> legal do CDC.
                  </div>
                </div>

                <div className="space-y-1.5 text-right font-mono">
                  <div className="flex justify-between text-neutral-500">
                    <span>Peças:</span>
                    <span>{formatBRL(partsCost)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Mão de Obra:</span>
                    <span>{formatBRL(laborCost)}</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-600">
                    <span>Desconto:</span>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-24 text-right px-1.5 py-0.5 border border-neutral-300 rounded text-xs"
                    />
                  </div>
                  <div className="flex justify-between text-base font-bold text-neutral-900 border-t border-neutral-300 pt-2">
                    <span>Total da OS:</span>
                    <span>{formatBRL(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'TIMELINE' && (
            <div className="space-y-4 text-xs">
              {/* Add event note */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Adicionar nota de bancada ou histórico de contato..."
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
                <button
                  type="button"
                  onClick={() => handleStatusChange(currentStatus)}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium whitespace-nowrap"
                >
                  Registrar Evento
                </button>
              </div>

              {/* Timeline list */}
              <div className="border-l-2 border-neutral-200 ml-4 pl-4 space-y-4">
                {os.timeline.map((ev) => (
                  <div key={ev.id} className="relative">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-neutral-900 ring-4 ring-white" />
                    <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
                      <span>{formatDateTime(ev.timestamp)}</span>
                      <span>·</span>
                      <span className="font-semibold text-neutral-800">{ev.author}</span>
                      <span>·</span>
                      <span className="text-neutral-600 font-sans">{STATUS_LABELS[ev.status]?.label || ev.status}</span>
                    </div>
                    <p className="text-neutral-700 mt-1 font-medium">{ev.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint('CUSTOMER_RECEIPT')}
              className="px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Via do Cliente (Térmica)</span>
            </button>
            <button
              onClick={() => onPrint('WORKBENCH_STICKER')}
              className="px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Etiqueta Bancada</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleSaveBudgetAndDiagnosis}
              className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

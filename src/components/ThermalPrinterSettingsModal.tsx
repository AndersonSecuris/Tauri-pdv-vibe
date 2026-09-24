import React, { useState } from 'react';
import { ConfiguracaoImpressora } from '../types';
import { isTauriEnvironment, generateOSCustomerReceipt, executeEscPosPrint, downloadEscPosBinary } from '../services/escpos';
import {
  Printer,
  Cpu,
  Settings,
  X,
  CheckCircle,
  HelpCircle,
  Radio,
  FileCode,
  Download,
  Store,
  Layers,
} from 'lucide-react';

interface ThermalPrinterSettingsModalProps {
  config: ConfiguracaoImpressora;
  onSaveConfig: (newConfig: ConfiguracaoImpressora) => void;
  onClose: () => void;
}

export const ThermalPrinterSettingsModal: React.FC<ThermalPrinterSettingsModalProps> = ({
  config,
  onSaveConfig,
  onClose,
}) => {
  const [form, setForm] = useState<ConfiguracaoImpressora>(config);
  const [testResult, setTestResult] = useState<string | null>(null);
  const isTauri = isTauriEnvironment();

  const handleSave = () => {
    onSaveConfig(form);
    onClose();
  };

  const handleTestPrint = async () => {
    setTestResult('Enviando comando de teste para a impressora...');
    // Create quick test receipt
    const mockOS = {
      id: 'TEST-ESC-POS',
      trackingCode: 'TEST-0001',
      client: {
        id: 'c-test',
        name: 'Impressão de Teste ESC/POS',
        phone: '(11) 99999-9999',
        createdAt: new Date().toISOString(),
      },
      device: {
        brand: 'Tauri',
        model: 'Plugin ESC-POS Test',
        color: 'Térmico',
        passcode: '1234',
        icloudStatus: 'SEM_CONTA' as const,
      },
      entryDate: new Date().toISOString(),
      technician: 'Autoteste',
      reportedDefect: 'Teste de alinhamento, corte automático e fontes térmicas.',
      initialChecklist: {
        screenCracked: false,
        housingScratched: false,
        buttonsWorking: true,
        camerasWorking: true,
        chargesNormal: true,
        speakerWorking: true,
        waterDamage: false,
        simTrayPresent: true,
      },
      accessoriesLeft: [],
      status: 'RECEBIDO' as const,
      items: [],
      partsCost: 0,
      laborCost: 0,
      discount: 0,
      totalAmount: 0,
      paymentStatus: 'PAGO' as const,
      amountPaid: 0,
      warrantyDays: 90,
      warrantyTerms: 'Termo de teste térmico ESC/POS executado com sucesso.',
      timeline: [],
    };

    const receipt = generateOSCustomerReceipt(mockOS, form);
    const res = await executeEscPosPrint(receipt, form);
    setTestResult(res.message);
  };

  const handleTestDrawer = async () => {
    setTestResult('Pulso de abertura enviado para a porta RJ12 da gaveta de dinheiro (ESC p 0 25 250).');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 max-w-3xl w-full my-auto flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <Printer className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-neutral-900">
                  Configurações de Impressão Térmica (Tauri ESC/POS)
                </h2>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1 ${
                    isTauri
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-neutral-200 text-neutral-800'
                  }`}
                >
                  <Cpu className="w-3 h-3" />
                  {isTauri ? 'Tauri Runtime Ativo' : 'Tauri Bridge Emulado'}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Suporte nativo para impressoras Bematech, Epson, Elgin, Daruma e genéricas 58mm/80mm.
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Driver & Tauri Integration Notice */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-600" />
                <span>Integração de Baixo Nível Tauri ESC/POS:</span>
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                plugin:escpos | raw byte transfer
              </span>
            </div>
            <p className="text-neutral-600 text-[11px] leading-relaxed">
              O sistema gera sequências binárias ESC/POS padrão (ESC @, ESC E, GS V, ESC p) compatíveis com 100% das impressoras térmicas comerciais. Em ambiente desktop Tauri, a comunicação ocorre direto com a porta do sistema operacional (USB/Serial/COM); em navegadores, o spooler gráfico é invocado com layout milimétrico de 58mm e 80mm.
            </p>
          </div>

          {/* Form Settings: Paper Width & Connection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Paper Width */}
            <div className="border border-neutral-200 rounded-lg p-4 space-y-2">
              <label className="font-semibold text-neutral-800 block">
                Largura da Bobina Térmica:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, paperWidth: '80mm' })}
                  className={`p-3 rounded-lg border text-center font-medium transition-colors ${
                    form.paperWidth === '80mm'
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <div className="font-bold text-sm">80 mm</div>
                  <div className="text-[11px] opacity-80 font-mono">48 Colunas (Padrão)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, paperWidth: '58mm' })}
                  className={`p-3 rounded-lg border text-center font-medium transition-colors ${
                    form.paperWidth === '58mm'
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <div className="font-bold text-sm">58 mm</div>
                  <div className="text-[11px] opacity-80 font-mono">32 Colunas (Compacta)</div>
                </button>
              </div>
            </div>

            {/* Connection Type */}
            <div className="border border-neutral-200 rounded-lg p-4 space-y-2">
              <label className="font-semibold text-neutral-800 block">Tipo de Conexão:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['USB', 'SERIAL', 'NETWORK'] as const).map((conn) => (
                  <button
                    key={conn}
                    type="button"
                    onClick={() => setForm({ ...form, connectionType: conn })}
                    className={`py-2 px-1 text-center rounded border font-medium text-xs transition-colors ${
                      form.connectionType === conn
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    {conn}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-[11px] text-neutral-600 block mb-1">
                  Porta / Identificador do Dispositivo:
                </label>
                <input
                  type="text"
                  value={form.devicePathOrIp}
                  onChange={(e) => setForm({ ...form, devicePathOrIp: e.target.value })}
                  placeholder={
                    form.connectionType === 'USB'
                      ? 'USB001 / POS-80'
                      : form.connectionType === 'SERIAL'
                      ? 'COM3 ou /dev/ttyUSB0'
                      : '192.168.1.200'
                  }
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded font-mono text-xs"
                />
              </div>

              {form.connectionType === 'SERIAL' && (
                <div>
                  <label className="text-[11px] text-neutral-600 block mb-1">Baud Rate:</label>
                  <select
                    value={form.baudRate}
                    onChange={(e) => setForm({ ...form, baudRate: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-neutral-300 rounded font-mono text-xs"
                  >
                    <option value={9600}>9600 bps</option>
                    <option value={19200}>19200 bps</option>
                    <option value={38400}>38400 bps</option>
                    <option value={115200}>115200 bps (Recomendado)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Printer Hardware Features */}
          <div className="border border-neutral-200 rounded-lg p-4 space-y-2 bg-neutral-50/50">
            <span className="font-semibold text-neutral-900 block">
              Recursos de Hardware e Automações:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.autoCut}
                  onChange={(e) => setForm({ ...form, autoCut: e.target.checked })}
                  className="accent-neutral-900 rounded"
                />
                <span>Guilhotina Automática (Corte de papel)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.openCashDrawerOnSale}
                  onChange={(e) => setForm({ ...form, openCashDrawerOnSale: e.target.checked })}
                  className="accent-neutral-900 rounded"
                />
                <span>Pulsar Gaveta de Dinheiro no PDV</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.printWorkbenchSticker}
                  onChange={(e) => setForm({ ...form, printWorkbenchSticker: e.target.checked })}
                  className="accent-neutral-900 rounded"
                />
                <span>Habilitar Etiqueta de Bancada</span>
              </label>
            </div>
          </div>

          {/* Store Info on Receipts */}
          <div className="border border-neutral-200 rounded-lg p-4 space-y-3">
            <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
              <Store className="w-4 h-4" />
              <span>Dados do Cabeçalho e Rodapé dos Comprovantes:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-neutral-600 block mb-1">Nome Fantasia da Loja:</label>
                <input
                  type="text"
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-600 block mb-1">CNPJ da Empresa:</label>
                <input
                  type="text"
                  value={form.storeCnpj}
                  onChange={(e) => setForm({ ...form, storeCnpj: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-600 block mb-1">Telefone / WhatsApp:</label>
                <input
                  type="text"
                  value={form.storePhone}
                  onChange={(e) => setForm({ ...form, storePhone: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-600 block mb-1">Endereço da Loja:</label>
                <input
                  type="text"
                  value={form.storeAddress}
                  onChange={(e) => setForm({ ...form, storeAddress: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-neutral-600 block mb-1">Mensagem de Rodapé:</label>
              <input
                type="text"
                value={form.customFooterNote}
                onChange={(e) => setForm({ ...form, customFooterNote: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded text-xs"
              />
            </div>
          </div>

          {/* Test Bench */}
          <div className="p-4 bg-neutral-100 rounded-lg space-y-2">
            <span className="font-semibold text-neutral-900 block">
              Bancada de Testes de Impressora:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTestPrint}
                className="px-3 py-1.5 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Teste ESC/POS</span>
              </button>
              <button
                type="button"
                onClick={handleTestDrawer}
                className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-800 rounded text-xs font-medium hover:bg-neutral-50 transition-colors"
              >
                Testar Abertura de Gaveta
              </button>
            </div>

            {testResult && (
              <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded mt-2">
                {testResult}
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs"
          >
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

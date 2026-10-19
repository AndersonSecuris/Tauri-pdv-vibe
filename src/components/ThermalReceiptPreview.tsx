import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FormattedReceipt, executeEscPosPrint, downloadEscPosBinary } from '../services/escpos';
import { ConfiguracaoImpressora, AppTheme } from '../types';
import { Printer, Download, Copy, Check, Eye, X, Terminal, Cpu, Sparkles } from 'lucide-react';

interface ThermalReceiptPreviewProps {
  receipt: FormattedReceipt;
  config: ConfiguracaoImpressora;
  title: string;
  theme?: AppTheme;
  onClose?: () => void;
}

export const ThermalReceiptPreview: React.FC<ThermalReceiptPreviewProps> = ({
  receipt,
  config,
  title,
  theme = 'black-yellow',
  onClose,
}) => {
  const isDark = theme === 'black-yellow' || theme === 'dark';

  const [copied, setCopied] = useState(false);
  const [showHex, setShowHex] = useState(false);
  const [printingStatus, setPrintingStatus] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    setPrintingStatus('Enviando...');
    try {
      const res = await executeEscPosPrint(receipt, config);
      setPrintingStatus(res.message);
    } catch {
      setPrintingStatus('Erro ao imprimir');
    } finally {
      setTimeout(() => {
        setIsPrinting(false);
        setPrintingStatus(null);
      }, 2500);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(receipt.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBin = () => {
    downloadEscPosBinary(receipt, `cupom_${Date.now()}.bin`);
  };

  const is58mm = config.paperWidth === '58mm';

  return (
    <>
      {/* Isolated Print Portal on document.body for clean zero-duplication printing */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className={`printable-receipt-area ${is58mm ? 'width-58mm' : ''}`}>
            <pre className="whitespace-pre-wrap font-mono text-black leading-tight text-xs m-0 p-0">
              {receipt.text}
            </pre>
          </div>,
          document.body
        )}

      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div
          className={`rounded-2xl shadow-2xl border max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden transition-colors ${
            isDark
              ? 'bg-[#121317] border-[#252631] text-neutral-100'
              : 'bg-white border-neutral-200 text-neutral-900'
          }`}
        >
        {/* Modal Top Bar */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-400 text-neutral-950 flex items-center justify-center shadow-[0_0_12px_rgba(250,204,21,0.25)]">
              <Printer className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{title}</span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono mt-0.5">
                <span className="text-yellow-400 font-bold">ESC/POS</span>
                <span aria-hidden="true">·</span>
                <span>{config.paperWidth}</span>
                <span aria-hidden="true">·</span>
                <span>{receipt.rawBytes.length} bytes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHex(!showHex)}
              className={`p-2 rounded-xl border text-xs font-mono transition-colors flex items-center gap-1.5 ${
                showHex
                  ? 'bg-yellow-400 text-neutral-950 border-yellow-400 font-black'
                  : isDark
                  ? 'bg-[#1D1F28] text-neutral-300 border-[#2E313E] hover:text-white'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
              }`}
              title="Alternar entre Cupom Térmico e Hexadecimal ESC/POS"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{showHex ? 'Cupom' : 'Hex'}</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className={`p-2 rounded-xl border transition-colors ${
                  isDark
                    ? 'bg-[#1D1F28] border-[#2E313E] text-neutral-400 hover:text-white'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div
          className={`flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center ${
            isDark ? 'bg-[#0E0F12]' : 'bg-neutral-200/80'
          }`}
        >
          {showHex ? (
            <div className="w-full bg-[#08090B] text-yellow-400 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-[#23242E]">
              <div className="text-neutral-400 pb-2 mb-2 border-b border-[#23242E] flex items-center justify-between">
                <span>// Sequência binária ESC/POS (Ready for Tauri / Serial / Raw Socket)</span>
                <span className="text-white font-bold">{receipt.rawBytes.length} BYTES</span>
              </div>
              <p className="leading-relaxed tracking-wider break-all">{receipt.hexDump}</p>
            </div>
          ) : (
            <div
              className={`thermal-paper p-5 sm:p-6 pb-8 my-auto sm:my-2 rounded-t-sm transition-all duration-200 border border-neutral-300 shrink-0 ${
                is58mm ? 'w-[280px]' : 'w-[360px]'
              }`}
            >
              {/* Receipt Visual Header */}
              <div className="text-center border-b border-dashed border-neutral-400 pb-3 mb-3">
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">
                  *** Simulação de Impressão Térmica ***
                </div>
                <div className="text-xs font-mono font-bold text-neutral-900">
                  {config.storeName}
                </div>
              </div>

              {/* Monospace thermal text */}
              <pre className="font-mono text-[11px] leading-[1.3] text-neutral-900 whitespace-pre-wrap break-words select-text m-0 p-0">
                {receipt.text}
              </pre>

              {/* Barcode & QR Code simulation visual footer */}
              <div className="mt-5 pt-3 border-t border-dashed border-neutral-400 flex flex-col items-center">
                <div className="w-full flex justify-center py-2">
                  <div className="h-10 flex items-center gap-[2px] opacity-85">
                    {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2].map(
                      (w, i) => (
                        <div
                          key={i}
                          className="bg-black h-8"
                          style={{ width: `${w}px` }}
                        />
                      )
                    )}
                  </div>
                </div>
                <div className="text-[9px] font-mono tracking-widest text-neutral-600">
                  ESC/POS 203 DPI STANDARD
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status notification if any */}
        {printingStatus && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center gap-2 border-t font-bold ${
              isDark
                ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{printingStatus}</span>
          </div>
        )}

        {/* Modal Bottom Actions with Icons */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between ${
            isDark ? 'bg-[#16171E] border-[#252631]' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 ${
                isDark
                  ? 'bg-[#1D1F28] border-[#2E313E] text-neutral-300 hover:text-white'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>
            <button
              onClick={handleDownloadBin}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 ${
                isDark
                  ? 'bg-[#1D1F28] border-[#2E313E] text-neutral-300 hover:text-white'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
              title="Baixar arquivo binário ESC/POS para testes físicos em hardware"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar .BIN</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
              >
                Fechar
              </button>
            )}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 active:scale-95 ${
                isPrinting
                  ? 'bg-yellow-400/50 text-neutral-800 cursor-not-allowed'
                  : 'text-neutral-950 bg-yellow-400 hover:bg-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.25)]'
              }`}
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>{isPrinting ? 'Processando...' : 'Imprimir Térmica'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

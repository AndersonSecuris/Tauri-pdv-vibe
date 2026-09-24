import React, { useState } from 'react';
import { FormattedReceipt, executeEscPosPrint, downloadEscPosBinary } from '../services/escpos';
import { ConfiguracaoImpressora } from '../types';
import { Printer, Download, Copy, Check, Eye, X, Terminal, Cpu } from 'lucide-react';

interface ThermalReceiptPreviewProps {
  receipt: FormattedReceipt;
  config: ConfiguracaoImpressora;
  title: string;
  onClose?: () => void;
}

export const ThermalReceiptPreview: React.FC<ThermalReceiptPreviewProps> = ({
  receipt,
  config,
  title,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [showHex, setShowHex] = useState(false);
  const [printingStatus, setPrintingStatus] = useState<string | null>(null);

  const handlePrint = async () => {
    setPrintingStatus('Enviando...');
    const res = await executeEscPosPrint(receipt, config);
    setPrintingStatus(res.message);
    setTimeout(() => {
      setPrintingStatus(null);
    }, 4000);
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Hidden print container for browser window.print() */}
      <div className={`hidden printable-receipt-area ${is58mm ? 'width-58mm' : ''}`}>
        <pre className="whitespace-pre-wrap font-mono text-black leading-tight text-xs">
          {receipt.text}
        </pre>
      </div>

      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden no-print">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
              <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                <span>ESC/POS</span>
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
              className={`p-1.5 rounded-md border text-xs font-mono transition-colors flex items-center gap-1.5 ${
                showHex
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
              }`}
              title="Alternar entre Cupom e Hexadecimal ESC/POS"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{showHex ? 'Cupom' : 'Hex'}</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-100/70 flex justify-center">
          {showHex ? (
            <div className="w-full bg-neutral-950 text-emerald-400 p-4 rounded-lg font-mono text-xs overflow-x-auto border border-neutral-800">
              <div className="text-neutral-400 pb-2 mb-2 border-b border-neutral-800 flex items-center justify-between">
                <span>// Sequência de bytes ESC/POS (Ready for Tauri / Serial / Raw Socket)</span>
                <span>{receipt.rawBytes.length} BYTES</span>
              </div>
              <p className="leading-relaxed tracking-wider break-all">{receipt.hexDump}</p>
            </div>
          ) : (
            <div
              className={`thermal-paper p-6 rounded-t-sm transition-all duration-200 border border-neutral-300 ${
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
              <pre className="font-mono text-[11px] leading-[1.3] text-neutral-900 whitespace-pre-wrap select-text">
                {receipt.text}
              </pre>

              {/* Barcode & QR Code simulation visual footer */}
              <div className="mt-5 pt-3 border-t border-dashed border-neutral-400 flex flex-col items-center">
                <div className="w-full flex justify-center py-2">
                  <div className="h-10 flex items-center gap-[2px] opacity-85">
                    {/* Simulated thermal barcode bars */}
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
          <div className="bg-emerald-50 border-t border-emerald-200 px-6 py-2.5 text-xs text-emerald-800 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>{printingStatus}</span>
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>
            <button
              onClick={handleDownloadBin}
              className="px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5"
              title="Baixar arquivo binário ESC/POS para testes físicos"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar .BIN</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Fechar
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Térmica</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

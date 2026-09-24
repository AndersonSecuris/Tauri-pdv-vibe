import React from 'react';
import { Plus, ShoppingCart, Search, Printer, Wrench } from 'lucide-react';

interface TopNavProps {
  currentTab: 'OS_LIST' | 'PDV' | 'CLIENTS' | 'TRACKER' | 'PRINTER_SETTINGS';
  onChangeTab: (tab: 'OS_LIST' | 'PDV' | 'CLIENTS' | 'TRACKER' | 'PRINTER_SETTINGS') => void;
  onOpenFastOS: () => void;
  ordersCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onChangeTab,
  onOpenFastOS,
  ordersCount,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-neutral-200 sticky top-0 z-40 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onChangeTab('OS_LIST');
          }}
          className="text-base font-bold tracking-tight text-neutral-900 flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-black">
            CM
          </div>
          <span>CellMaster PDV & OS</span>
        </a>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-600">
        <button
          onClick={() => onChangeTab('OS_LIST')}
          className={`transition-colors flex items-center gap-1.5 py-1 ${
            currentTab === 'OS_LIST'
              ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
              : 'hover:text-neutral-900 border-b-2 border-transparent'
          }`}
        >
          <span>Ordens de Serviço</span>
          <span className="font-mono text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded-full">
            {ordersCount}
          </span>
        </button>

        <button
          onClick={() => onChangeTab('PDV')}
          className={`transition-colors py-1 ${
            currentTab === 'PDV'
              ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
              : 'hover:text-neutral-900 border-b-2 border-transparent'
          }`}
        >
          PDV Balcão
        </button>

        <button
          onClick={() => onChangeTab('CLIENTS')}
          className={`transition-colors py-1 ${
            currentTab === 'CLIENTS'
              ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
              : 'hover:text-neutral-900 border-b-2 border-transparent'
          }`}
        >
          Histórico de Clientes
        </button>

        <button
          onClick={() => onChangeTab('TRACKER')}
          className={`transition-colors py-1 ${
            currentTab === 'TRACKER'
              ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
              : 'hover:text-neutral-900 border-b-2 border-transparent'
          }`}
        >
          Rastrear Conserto
        </button>

        <button
          onClick={() => onChangeTab('PRINTER_SETTINGS')}
          className={`transition-colors py-1 flex items-center gap-1 ${
            currentTab === 'PRINTER_SETTINGS'
              ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
              : 'hover:text-neutral-900 border-b-2 border-transparent'
          }`}
        >
          <Printer className="w-3.5 h-3.5 text-neutral-500" />
          <span>Tauri ESC/POS</span>
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenFastOS}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova O.S. Ágil</span>
        </button>
      </div>
    </header>
  );
};

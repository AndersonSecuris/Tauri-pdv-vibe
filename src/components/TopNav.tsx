import {
  Plus,
  ShoppingCart,
  Search,
  Printer,
  Wrench,
  Users,
  Sun,
  Moon,
  Sparkles,
  Smartphone,
  SlidersHorizontal,
  BarChart3,
  Database,
} from 'lucide-react';
import { AppTheme } from '../types';

interface TopNavProps {
  currentTab: 'OS_LIST' | 'PDV' | 'ANALYTICS' | 'CLIENTS' | 'TRACKER' | 'PRINTER_SETTINGS' | 'OS_CONFIG' | 'BACKUP';
  onChangeTab: (tab: 'OS_LIST' | 'PDV' | 'ANALYTICS' | 'CLIENTS' | 'TRACKER' | 'PRINTER_SETTINGS' | 'OS_CONFIG' | 'BACKUP') => void;
  onOpenFastOS: () => void;
  ordersCount: number;
  theme: AppTheme;
  onToggleTheme: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onChangeTab,
  onOpenFastOS,
  ordersCount,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'black-yellow' || theme === 'dark';

  return (
    <header
      className={`flex items-center justify-between px-6 py-3.5 border-b sticky top-0 z-40 select-none transition-colors duration-200 ${
        isDark
          ? 'bg-[#121316] border-[#27282F] text-neutral-100'
          : 'bg-white border-neutral-200 text-neutral-900'
      }`}
    >
      {/* Zone 1: Single text element wordmark with icon */}
      <div className="flex items-center gap-3">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onChangeTab('OS_LIST');
          }}
          className="text-base font-bold tracking-tight flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-yellow-400 text-neutral-950 flex items-center justify-center text-sm font-black shadow-[0_0_12px_rgba(250,204,21,0.25)] group-hover:scale-105 transition-transform">
            <Smartphone className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="flex items-center gap-1.5">
            <span className={isDark ? 'text-white' : 'text-neutral-900'}>CellMaster</span>
            <span className="text-yellow-400 font-extrabold">PDV</span>
          </span>
        </a>
      </div>

      {/* Zone 2: 4-6 clean text + icon navigation links */}
      <nav className="hidden md:flex items-center gap-2 lg:gap-4 text-xs font-medium">
        <button
          onClick={() => onChangeTab('OS_LIST')}
          className={`transition-all flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            currentTab === 'OS_LIST'
              ? isDark
                ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30 font-semibold'
                : 'bg-neutral-900 text-white border-neutral-900 font-semibold'
              : isDark
              ? 'text-neutral-400 hover:text-white border-transparent hover:bg-neutral-800/60'
              : 'text-neutral-600 hover:text-neutral-900 border-transparent hover:bg-neutral-100'
          }`}
        >
          <Wrench className={`w-3.5 h-3.5 ${currentTab === 'OS_LIST' ? 'text-yellow-400' : ''}`} />
          <span>Ordens de Serviço</span>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              currentTab === 'OS_LIST'
                ? isDark
                  ? 'bg-yellow-400 text-neutral-950'
                  : 'bg-white text-neutral-900'
                : isDark
                ? 'bg-neutral-800 text-neutral-400'
                : 'bg-neutral-200 text-neutral-700'
            }`}
          >
            {ordersCount}
          </span>
        </button>

        <button
          onClick={() => onChangeTab('PDV')}
          className={`transition-all flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            currentTab === 'PDV'
              ? isDark
                ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30 font-semibold'
                : 'bg-neutral-900 text-white border-neutral-900 font-semibold'
              : isDark
              ? 'text-neutral-400 hover:text-white border-transparent hover:bg-neutral-800/60'
              : 'text-neutral-600 hover:text-neutral-900 border-transparent hover:bg-neutral-100'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>PDV Balcão</span>
        </button>

        <button
          onClick={() => onChangeTab('ANALYTICS')}
          className={`transition-all flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            currentTab === 'ANALYTICS'
              ? isDark
                ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30 font-semibold shadow-xs'
                : 'bg-neutral-900 text-white border-neutral-900 font-semibold'
              : isDark
              ? 'text-neutral-400 hover:text-white border-transparent hover:bg-neutral-800/60'
              : 'text-neutral-600 hover:text-neutral-900 border-transparent hover:bg-neutral-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Gráficos & Métricas</span>
        </button>

        <button
          onClick={() => onChangeTab('CLIENTS')}
          className={`transition-all flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            currentTab === 'CLIENTS'
              ? isDark
                ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30 font-semibold'
                : 'bg-neutral-900 text-white border-neutral-900 font-semibold'
              : isDark
              ? 'text-neutral-400 hover:text-white border-transparent hover:bg-neutral-800/60'
              : 'text-neutral-600 hover:text-neutral-900 border-transparent hover:bg-neutral-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Clientes & Histórico</span>
        </button>

        <button
          onClick={() => onChangeTab('TRACKER')}
          className={`transition-all flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            currentTab === 'TRACKER'
              ? isDark
                ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30 font-semibold'
                : 'bg-neutral-900 text-white border-neutral-900 font-semibold'
              : isDark
              ? 'text-neutral-400 hover:text-white border-transparent hover:bg-neutral-800/60'
              : 'text-neutral-600 hover:text-neutral-900 border-transparent hover:bg-neutral-100'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Rastrear Conserto</span>
        </button>

        <button
          onClick={() => onChangeTab('PRINTER_SETTINGS')}
          title="Configurar itens das impressões de O.S., O.S. Técnico, Cupom de Venda e Hardware ESC/POS"
          className={`transition-all flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            currentTab === 'PRINTER_SETTINGS'
              ? isDark
                ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30 font-semibold'
                : 'bg-neutral-900 text-white border-neutral-900 font-semibold'
              : isDark
              ? 'text-neutral-400 hover:text-white border-transparent hover:bg-neutral-800/60'
              : 'text-neutral-600 hover:text-neutral-900 border-transparent hover:bg-neutral-100'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Impressão & Cupons</span>
        </button>

        <button
          onClick={() => onChangeTab('OS_CONFIG')}
          className={`transition-all flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            currentTab === 'OS_CONFIG'
              ? isDark
                ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30 font-semibold shadow-xs'
                : 'bg-neutral-900 text-white border-neutral-900 font-semibold'
              : isDark
              ? 'text-neutral-400 hover:text-white border-transparent hover:bg-neutral-800/60'
              : 'text-neutral-600 hover:text-neutral-900 border-transparent hover:bg-neutral-100'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Opções de O.S.</span>
        </button>

        <button
          onClick={() => onChangeTab('BACKUP')}
          title="Fazer backup completo ou recuperar dados do sistema"
          className={`transition-all flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            currentTab === 'BACKUP'
              ? isDark
                ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30 font-semibold shadow-xs'
                : 'bg-neutral-900 text-white border-neutral-900 font-semibold'
              : isDark
              ? 'text-neutral-400 hover:text-white border-transparent hover:bg-neutral-800/60'
              : 'text-neutral-600 hover:text-neutral-900 border-transparent hover:bg-neutral-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Backup & Dados</span>
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions + theme switch */}
      <div className="flex items-center gap-2.5">
        {/* Theme Switcher Button */}
        <button
          onClick={onToggleTheme}
          title={`Tema Atual: ${theme === 'black-yellow' ? 'Preto & Amarelo (Cyber/Industrial)' : 'Modo Claro'}. Clique para alternar.`}
          className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
            theme === 'black-yellow'
              ? 'bg-[#1C1D22] text-yellow-400 border-yellow-400/30 hover:bg-[#25262C]'
              : 'bg-neutral-100 text-neutral-800 border-neutral-300 hover:bg-neutral-200'
          }`}
        >
          {theme === 'black-yellow' ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline text-[11px] font-mono text-yellow-400">Preto & Amarelo</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline text-[11px] font-mono">Claro</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenFastOS}
          className="px-3.5 py-2 text-xs font-bold text-neutral-950 bg-yellow-400 hover:bg-yellow-300 rounded-lg transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(250,204,21,0.25)] hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] whitespace-nowrap active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova O.S. Ágil</span>
        </button>
      </div>
    </header>
  );
};

import React, { useState, useMemo } from 'react';
import { OrdemDeServico, VendaPDV, AppTheme } from '../types';
import { formatBRL } from '../services/escpos';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Wrench,
  ShoppingCart,
  DollarSign,
  PieChart,
  ArrowUpRight,
  Layers,
  Smartphone,
  CreditCard,
  QrCode,
  Coins,
  Package,
  CheckCircle2,
  Clock,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface AnalyticsViewProps {
  orders: OrdemDeServico[];
  sales: VendaPDV[];
  theme: AppTheme;
}

type Granularity = 'day' | 'week' | 'month' | 'year';
type FocusArea = 'ALL' | 'MAINTENANCE' | 'SALES';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  orders,
  sales,
  theme,
}) => {
  const isDark = theme === 'black-yellow' || theme === 'dark';

  // State Controls
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [focusArea, setFocusArea] = useState<FocusArea>('ALL');
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0); // 0 = current reference, -1 = previous, etc.
  const [hoveredPoint, setHoveredPoint] = useState<{
    label: string;
    maintenance: number;
    sales: number;
    osCount: number;
    salesCount: number;
    x: number;
    y: number;
  } | null>(null);

  // Reference Date for calculation (simulated to 2026-09-24 if current local time is in that scope)
  const referenceDate = useMemo(() => {
    // Check if there are orders or sales in 2026
    const allDates = [
      ...orders.map((o) => new Date(o.entryDate).getTime()),
      ...sales.map((s) => new Date(s.date).getTime()),
    ];
    if (allDates.length > 0) {
      const maxTimestamp = Math.max(...allDates);
      return new Date(maxTimestamp);
    }
    return new Date();
  }, [orders, sales]);

  // Generate Periods based on selected Granularity
  const chartData = useMemo(() => {
    const base = new Date(referenceDate);

    if (granularity === 'day') {
      // Last 7 days ending at referenceDate + selectedDayOffset * 7
      const daysCount = 7;
      const end = new Date(base);
      end.setDate(end.getDate() + selectedDayOffset * 7);

      const points = [];
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(end);
        d.setDate(d.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;
        const dayLabel = `${day}/${m}`;
        const weekdayLabel = d.toLocaleDateString('pt-BR', { weekday: 'short' });

        // Filter orders on this day
        const dayOrders = orders.filter((o) => o.entryDate.startsWith(dateStr));
        const maintenanceRevenue = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const partsCost = dayOrders.reduce((sum, o) => sum + (o.partsCost || 0), 0);
        const laborCost = dayOrders.reduce((sum, o) => sum + (o.laborCost || 0), 0);

        // Filter sales on this day
        const daySales = sales.filter((s) => s.date.startsWith(dateStr) && s.status !== 'CANCELADA');
        const salesRevenue = daySales.reduce((sum, s) => sum + (s.total || 0), 0);
        const salesProfit = daySales.reduce((sum, s) => {
          const cost = s.items.reduce((itemSum, item) => itemSum + ((item.product.costPrice || 0) * item.quantity), 0);
          return sum + (s.total - cost);
        }, 0);

        points.push({
          key: dateStr,
          label: dayLabel,
          sublabel: weekdayLabel,
          maintenance: maintenanceRevenue,
          maintenanceParts: partsCost,
          maintenanceLabor: laborCost,
          sales: salesRevenue,
          salesProfit: Math.max(0, salesProfit),
          totalRevenue: maintenanceRevenue + salesRevenue,
          osCount: dayOrders.length,
          salesCount: daySales.length,
        });
      }
      return points;
    }

    if (granularity === 'week') {
      // Last 8 weeks
      const weeksCount = 8;
      const points = [];
      for (let i = weeksCount - 1; i >= 0; i--) {
        const weekEnd = new Date(base);
        weekEnd.setDate(weekEnd.getDate() - i * 7 + selectedDayOffset * 7);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);

        const startStr = weekStart.toISOString().split('T')[0];
        const endStr = weekEnd.toISOString().split('T')[0];
        const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`;

        const weekOrders = orders.filter((o) => {
          const d = o.entryDate.split('T')[0];
          return d >= startStr && d <= endStr;
        });
        const maintenanceRevenue = weekOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const partsCost = weekOrders.reduce((sum, o) => sum + (o.partsCost || 0), 0);
        const laborCost = weekOrders.reduce((sum, o) => sum + (o.laborCost || 0), 0);

        const weekSales = sales.filter((s) => {
          const d = s.date.split('T')[0];
          return d >= startStr && d <= endStr && s.status !== 'CANCELADA';
        });
        const salesRevenue = weekSales.reduce((sum, s) => sum + (s.total || 0), 0);
        const salesProfit = weekSales.reduce((sum, s) => {
          const cost = s.items.reduce((itemSum, item) => itemSum + ((item.product.costPrice || 0) * item.quantity), 0);
          return sum + (s.total - cost);
        }, 0);

        points.push({
          key: `sem-${i}`,
          label: `Sem ${weeksCount - i}`,
          sublabel: label,
          maintenance: maintenanceRevenue,
          maintenanceParts: partsCost,
          maintenanceLabor: laborCost,
          sales: salesRevenue,
          salesProfit: Math.max(0, salesProfit),
          totalRevenue: maintenanceRevenue + salesRevenue,
          osCount: weekOrders.length,
          salesCount: weekSales.length,
        });
      }
      return points;
    }

    if (granularity === 'month') {
      // Months of current reference year (Jan to Dec)
      const currentYear = base.getFullYear();
      const monthNames = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];

      return monthNames.map((name, idx) => {
        const monthNum = String(idx + 1).padStart(2, '0');
        const prefix = `${currentYear}-${monthNum}`;

        const monthOrders = orders.filter((o) => o.entryDate.startsWith(prefix));
        const maintenanceRevenue = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const partsCost = monthOrders.reduce((sum, o) => sum + (o.partsCost || 0), 0);
        const laborCost = monthOrders.reduce((sum, o) => sum + (o.laborCost || 0), 0);

        const monthSales = sales.filter((s) => s.date.startsWith(prefix) && s.status !== 'CANCELADA');
        const salesRevenue = monthSales.reduce((sum, s) => sum + (s.total || 0), 0);
        const salesProfit = monthSales.reduce((sum, s) => {
          const cost = s.items.reduce((itemSum, item) => itemSum + ((item.product.costPrice || 0) * item.quantity), 0);
          return sum + (s.total - cost);
        }, 0);

        return {
          key: prefix,
          label: name,
          sublabel: `${currentYear}`,
          maintenance: maintenanceRevenue,
          maintenanceParts: partsCost,
          maintenanceLabor: laborCost,
          sales: salesRevenue,
          salesProfit: Math.max(0, salesProfit),
          totalRevenue: maintenanceRevenue + salesRevenue,
          osCount: monthOrders.length,
          salesCount: monthSales.length,
        };
      });
    }

    // granularity === 'year'
    const years = [2024, 2025, 2026];
    return years.map((year) => {
      const yearStr = String(year);
      const yearOrders = orders.filter((o) => o.entryDate.startsWith(yearStr));
      const maintenanceRevenue = yearOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const partsCost = yearOrders.reduce((sum, o) => sum + (o.partsCost || 0), 0);
      const laborCost = yearOrders.reduce((sum, o) => sum + (o.laborCost || 0), 0);

      const yearSales = sales.filter((s) => s.date.startsWith(yearStr) && s.status !== 'CANCELADA');
      const salesRevenue = yearSales.reduce((sum, s) => sum + (s.total || 0), 0);
      const salesProfit = yearSales.reduce((sum, s) => {
        const cost = s.items.reduce((itemSum, item) => itemSum + ((item.product.costPrice || 0) * item.quantity), 0);
        return sum + (s.total - cost);
      }, 0);

      return {
        key: yearStr,
        label: yearStr,
        sublabel: 'Consolidado',
        maintenance: maintenanceRevenue,
        maintenanceParts: partsCost,
        maintenanceLabor: laborCost,
        sales: salesRevenue,
        salesProfit: Math.max(0, salesProfit),
        totalRevenue: maintenanceRevenue + salesRevenue,
        osCount: yearOrders.length,
        salesCount: yearSales.length,
      };
    });
  }, [granularity, selectedDayOffset, referenceDate, orders, sales]);

  // Aggregate totals for the active chart range
  const summaryTotals = useMemo(() => {
    const totalMaintenance = chartData.reduce((acc, p) => acc + p.maintenance, 0);
    const totalPartsCost = chartData.reduce((acc, p) => acc + p.maintenanceParts, 0);
    const totalLaborCost = chartData.reduce((acc, p) => acc + p.maintenanceLabor, 0);
    const totalSales = chartData.reduce((acc, p) => acc + p.sales, 0);
    const totalSalesProfit = chartData.reduce((acc, p) => acc + p.salesProfit, 0);
    const totalRevenue = totalMaintenance + totalSales;
    const totalOSCount = chartData.reduce((acc, p) => acc + p.osCount, 0);
    const totalSalesCount = chartData.reduce((acc, p) => acc + p.salesCount, 0);

    const maintenancePercentage = totalRevenue > 0 ? (totalMaintenance / totalRevenue) * 100 : 0;
    const salesPercentage = totalRevenue > 0 ? (totalSales / totalRevenue) * 100 : 0;
    const avgTicketOS = totalOSCount > 0 ? totalMaintenance / totalOSCount : 0;
    const avgTicketSale = totalSalesCount > 0 ? totalSales / totalSalesCount : 0;
    const salesProfitMargin = totalSales > 0 ? (totalSalesProfit / totalSales) * 100 : 0;

    return {
      totalMaintenance,
      totalPartsCost,
      totalLaborCost,
      totalSales,
      totalSalesProfit,
      totalRevenue,
      totalOSCount,
      totalSalesCount,
      maintenancePercentage,
      salesPercentage,
      avgTicketOS,
      avgTicketSale,
      salesProfitMargin,
    };
  }, [chartData]);

  // Granular Filter Range for Detailed Breakdowns
  const activeKeys = useMemo(() => new Set(chartData.map((d) => d.key)), [chartData]);

  // Filtered orders in active chart window
  const activeOrders = useMemo(() => {
    return orders.filter((o) => {
      const entryKey = o.entryDate.split('T')[0];
      if (granularity === 'day') return activeKeys.has(entryKey);
      if (granularity === 'month') return activeKeys.has(entryKey.slice(0, 7));
      if (granularity === 'year') return activeKeys.has(entryKey.slice(0, 4));
      // week
      return chartData.some((c) => {
        if (!c.sublabel.includes('-')) return false;
        // In week mode, chartData key sem-0 .. sem-7 was mapped
        return true;
      });
    });
  }, [orders, granularity, activeKeys, chartData]);

  // Filtered sales in active chart window
  const activeSales = useMemo(() => {
    return sales.filter((s) => {
      if (s.status === 'CANCELADA') return false;
      const dateKey = s.date.split('T')[0];
      if (granularity === 'day') return activeKeys.has(dateKey);
      if (granularity === 'month') return activeKeys.has(dateKey.slice(0, 7));
      if (granularity === 'year') return activeKeys.has(dateKey.slice(0, 4));
      return true;
    });
  }, [sales, granularity, activeKeys]);

  // Breakdown: Orders Status
  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      RECEBIDO: 0,
      AGUARDANDO_APROVACAO: 0,
      APROVADO: 0,
      AGUARDANDO_PECA: 0,
      PRONTO: 0,
      ENTREGUE: 0,
    };
    activeOrders.forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status]++;
    });
    return counts;
  }, [activeOrders]);

  // Breakdown: OS Brands Ranking
  const brandsRanking = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    activeOrders.forEach((o) => {
      const brand = o.device.brand || 'Outro';
      const prev = map.get(brand) || { count: 0, total: 0 };
      map.set(brand, {
        count: prev.count + 1,
        total: prev.total + (o.totalAmount || 0),
      });
    });
    return Array.from(map.entries())
      .map(([brand, data]) => ({ brand, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [activeOrders]);

  // Breakdown: OS Payment Status
  const osPaymentStatus = useMemo(() => {
    const paid = activeOrders
      .filter((o) => o.paymentStatus === 'PAGO')
      .reduce((s, o) => s + (o.amountPaid || o.totalAmount || 0), 0);
    const pending = activeOrders
      .filter((o) => o.paymentStatus === 'PENDENTE' || o.paymentStatus === 'PARCIAL')
      .reduce((s, o) => s + (o.totalAmount - (o.amountPaid || 0)), 0);
    return { paid, pending };
  }, [activeOrders]);

  // Breakdown: Sales Categories
  const salesCategoryBreakdown = useMemo(() => {
    const map = new Map<string, { count: number; total: number; profit: number }>();
    activeSales.forEach((s) => {
      s.items.forEach((item) => {
        const cat = item.product.category || 'ACESSORIOS';
        const cost = (item.product.costPrice || 0) * item.quantity;
        const profit = item.total - cost;
        const prev = map.get(cat) || { count: 0, total: 0, profit: 0 };
        map.set(cat, {
          count: prev.count + item.quantity,
          total: prev.total + item.total,
          profit: prev.profit + profit,
        });
      });
    });
    return Array.from(map.entries())
      .map(([cat, data]) => ({ category: cat, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [activeSales]);

  // Breakdown: Top Selling Products
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; revenue: number; profit: number }>();
    activeSales.forEach((s) => {
      s.items.forEach((item) => {
        const id = item.product.id;
        const cost = (item.product.costPrice || 0) * item.quantity;
        const profit = item.total - cost;
        const prev = map.get(id) || { name: item.product.name, quantity: 0, revenue: 0, profit: 0 };
        map.set(id, {
          name: item.product.name,
          quantity: prev.quantity + item.quantity,
          revenue: prev.revenue + item.total,
          profit: prev.profit + profit,
        });
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [activeSales]);

  // Breakdown: Sales Payment Methods
  const salesPaymentMethods = useMemo(() => {
    const map: Record<string, number> = {
      PIX: 0,
      CARTAO_CREDITO: 0,
      CARTAO_DEBITO: 0,
      DINHEIRO: 0,
    };
    activeSales.forEach((s) => {
      if (map[s.paymentMethod] !== undefined) {
        map[s.paymentMethod] += s.total;
      }
    });
    return map;
  }, [activeSales]);

  // SVG Chart Maximum calculation
  const maxRevenue = useMemo(() => {
    const maxVal = Math.max(
      ...chartData.map((d) => Math.max(d.maintenance, d.sales, d.totalRevenue)),
      100
    );
    // Round to a nice ceiling
    return Math.ceil(maxVal * 1.15);
  }, [chartData]);

  // Window period title
  const periodTitle = useMemo(() => {
    if (granularity === 'day') return 'Análise Diária (Últimos 7 dias)';
    if (granularity === 'week') return 'Análise Semanal (Últimas 8 semanas)';
    if (granularity === 'month') return `Análise Mensal (${referenceDate.getFullYear()})`;
    return 'Análise Anual Consolidada';
  }, [granularity, referenceDate]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 select-none">
      {/* Top Header & Interactive Segmented Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-[#27282F]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-yellow-400 text-neutral-950 flex items-center justify-center font-bold shadow-[0_0_14px_rgba(250,204,21,0.3)]">
              <BarChart3 className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Métricas & Gráficos Financeiros
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Relatórios quantitativos com segregação de receitas de Manutenções (O.S.) e Vendas Balcão (PDV)
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar: Granularity & Focus Area Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Granularity Selector */}
          <div className="flex items-center bg-neutral-200/70 dark:bg-[#16171B] p-1 rounded-lg border border-neutral-300 dark:border-[#27282F]">
            {(
              [
                { id: 'day', label: 'Dia' },
                { id: 'week', label: 'Semana' },
                { id: 'month', label: 'Mês' },
                { id: 'year', label: 'Ano' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setGranularity(item.id);
                  setSelectedDayOffset(0);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  granularity === item.id
                    ? isDark
                      ? 'bg-yellow-400 text-neutral-950 shadow-sm'
                      : 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Area Filter Selector */}
          <div className="flex items-center bg-neutral-200/70 dark:bg-[#16171B] p-1 rounded-lg border border-neutral-300 dark:border-[#27282F]">
            <button
              onClick={() => setFocusArea('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                focusArea === 'ALL'
                  ? isDark
                    ? 'bg-[#25262C] text-yellow-400 border border-yellow-400/30'
                    : 'bg-white text-neutral-900 border border-neutral-300 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Visão Completa</span>
            </button>
            <button
              onClick={() => setFocusArea('MAINTENANCE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                focusArea === 'MAINTENANCE'
                  ? 'bg-amber-400/20 text-yellow-400 border border-yellow-400/40 font-bold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-yellow-400" />
              <span>Apenas Manutenções</span>
            </button>
            <button
              onClick={() => setFocusArea('SALES')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                focusArea === 'SALES'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-400/40 font-bold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 text-sky-400" />
              <span>Apenas Vendas</span>
            </button>
          </div>

          {/* Day/Week Navigation Offset */}
          {granularity === 'day' && (
            <div className="flex items-center gap-1 bg-neutral-200/70 dark:bg-[#16171B] p-1 rounded-lg border border-neutral-300 dark:border-[#27282F]">
              <button
                onClick={() => setSelectedDayOffset((prev) => prev - 1)}
                title="Semana Anterior"
                className="p-1 rounded text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono px-1.5 text-neutral-700 dark:text-neutral-300">
                {selectedDayOffset === 0 ? 'Atual' : `${selectedDayOffset} sem.`}
              </span>
              <button
                disabled={selectedDayOffset >= 0}
                onClick={() => setSelectedDayOffset((prev) => Math.min(0, prev + 1))}
                title="Semana Seguinte"
                className="p-1 rounded text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Print/Export Summary Button */}
          <button
            onClick={() => window.print()}
            title="Imprimir relatório analítico"
            className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-medium ${
              isDark
                ? 'bg-[#1C1D22] text-neutral-200 border-[#27282F] hover:bg-[#25262C]'
                : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100 shadow-sm'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: CONSOLIDATED EXECUTIVE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturamento Global */}
        <div
          className={`p-5 rounded-xl border transition-all ${
            isDark
              ? 'bg-[#121316] border-[#27282F] hover:border-yellow-400/40 shadow-xs'
              : 'bg-white border-neutral-200 hover:border-neutral-400 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium">Receita Global Consolidada</span>
            <div className="p-1.5 rounded-md bg-yellow-400/10 text-yellow-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-2">
            {formatBRL(summaryTotals.totalRevenue)}
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="text-yellow-500 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              100%
            </span>
            <span>{summaryTotals.totalOSCount + summaryTotals.totalSalesCount} transações totais</span>
          </div>

          {/* Revenue Proportion Bar */}
          <div className="mt-3.5 pt-3 border-t border-neutral-200 dark:border-[#22242B]">
            <div className="flex justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mb-1">
              <span className="text-yellow-400 font-semibold">O.S. {summaryTotals.maintenancePercentage.toFixed(0)}%</span>
              <span className="text-sky-400 font-semibold">Vendas {summaryTotals.salesPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex">
              <div
                className="bg-yellow-400 h-full transition-all duration-500"
                style={{ width: `${summaryTotals.maintenancePercentage}%` }}
              />
              <div
                className="bg-sky-400 h-full transition-all duration-500"
                style={{ width: `${summaryTotals.salesPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Receita Manutenções (O.S.) */}
        <div
          className={`p-5 rounded-xl border transition-all ${
            isDark
              ? 'bg-[#121316] border-[#27282F] hover:border-yellow-400/40 shadow-xs'
              : 'bg-white border-neutral-200 hover:border-neutral-400 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium">Receita Manutenções (O.S.)</span>
            <div className="p-1.5 rounded-md bg-yellow-400/10 text-yellow-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-yellow-400 mb-2">
            {formatBRL(summaryTotals.totalMaintenance)}
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>{summaryTotals.totalOSCount} ordens no período</span>
            <span className="font-mono text-neutral-700 dark:text-neutral-300 font-semibold">
              Méd: {formatBRL(summaryTotals.avgTicketOS)}
            </span>
          </div>

          <div className="mt-3.5 pt-3 border-t border-neutral-200 dark:border-[#22242B] flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>Peças: <strong className="text-neutral-800 dark:text-neutral-200">{formatBRL(summaryTotals.totalPartsCost)}</strong></span>
            <span>Serviço: <strong className="text-yellow-400">{formatBRL(summaryTotals.totalLaborCost)}</strong></span>
          </div>
        </div>

        {/* Card 3: Receita Vendas Balcão (PDV) */}
        <div
          className={`p-5 rounded-xl border transition-all ${
            isDark
              ? 'bg-[#121316] border-[#27282F] hover:border-sky-400/40 shadow-xs'
              : 'bg-white border-neutral-200 hover:border-neutral-400 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium">Receita de Vendas (PDV)</span>
            <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-sky-400 mb-2">
            {formatBRL(summaryTotals.totalSales)}
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>{summaryTotals.totalSalesCount} cupons emitidos</span>
            <span className="font-mono text-neutral-700 dark:text-neutral-300 font-semibold">
              Méd: {formatBRL(summaryTotals.avgTicketSale)}
            </span>
          </div>

          <div className="mt-3.5 pt-3 border-t border-neutral-200 dark:border-[#22242B] flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>Lucro Bruto: <strong className="text-emerald-400 font-bold">{formatBRL(summaryTotals.totalSalesProfit)}</strong></span>
            <span>Margem: <strong className="text-emerald-400">{summaryTotals.salesProfitMargin.toFixed(1)}%</strong></span>
          </div>
        </div>

        {/* Card 4: Faturamento Recebido vs Pendente */}
        <div
          className={`p-5 rounded-xl border transition-all ${
            isDark
              ? 'bg-[#121316] border-[#27282F] hover:border-emerald-400/40 shadow-xs'
              : 'bg-white border-neutral-200 hover:border-neutral-400 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium">Status de Pagamento (O.S.)</span>
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-emerald-400 mb-2">
            {formatBRL(osPaymentStatus.paid)}
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span className="text-emerald-500 font-medium">Recebido em Caixa</span>
            <span className="text-amber-400 font-medium font-mono">
              A Receber: {formatBRL(osPaymentStatus.pending)}
            </span>
          </div>

          <div className="mt-3.5 pt-3 border-t border-neutral-200 dark:border-[#22242B]">
            <div className="flex justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mb-1">
              <span>{((osPaymentStatus.paid / (summaryTotals.totalMaintenance || 1)) * 100).toFixed(0)}% Liquidado</span>
              <span className="text-amber-400">{((osPaymentStatus.pending / (summaryTotals.totalMaintenance || 1)) * 100).toFixed(0)}% Pendente</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex">
              <div
                className="bg-emerald-400 h-full transition-all"
                style={{ width: `${(osPaymentStatus.paid / (summaryTotals.totalMaintenance || 1)) * 100}%` }}
              />
              <div
                className="bg-amber-400 h-full transition-all"
                style={{ width: `${(osPaymentStatus.pending / (summaryTotals.totalMaintenance || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: INTERACTIVE COMPARISON CHART */}
      <div
        className={`p-6 rounded-xl border transition-all ${
          isDark ? 'bg-[#121316] border-[#27282F]' : 'bg-white border-neutral-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              <span>{periodTitle} - Comparativo de Receita</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Passe o cursor sobre as barras para inspecionar quantitativos detalhados de cada período
            </p>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-4 text-xs font-medium">
            {(focusArea === 'ALL' || focusArea === 'MAINTENANCE') && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-yellow-400" />
                <span className="text-neutral-700 dark:text-neutral-300">Receita Manutenções (O.S.)</span>
              </div>
            )}
            {(focusArea === 'ALL' || focusArea === 'SALES') && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-sky-400" />
                <span className="text-neutral-700 dark:text-neutral-300">Receita Vendas (PDV)</span>
              </div>
            )}
          </div>
        </div>

        {/* SVG Interactive Bar Chart */}
        <div className="relative w-full h-72">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 240">
            <defs>
              <linearGradient id="yellowBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FACC15" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#CA8A04" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="skyBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = 200 - pct * 180;
              const val = Math.round(maxRevenue * pct);
              return (
                <g key={idx}>
                  <line
                    x1="45"
                    y1={y}
                    x2="790"
                    y2={y}
                    stroke={isDark ? '#22242B' : '#E5E7EB'}
                    strokeDasharray={pct === 0 ? 'none' : '3 3'}
                    strokeWidth="1"
                  />
                  <text
                    x="40"
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] font-mono fill-neutral-400 select-none"
                  >
                    R${val}
                  </text>
                </g>
              );
            })}

            {/* Render Bars per Point */}
            {chartData.map((d, idx) => {
              const totalBars = chartData.length;
              const slotWidth = 735 / totalBars;
              const groupCenterX = 45 + idx * slotWidth + slotWidth / 2;

              const isMaintenanceOnly = focusArea === 'MAINTENANCE';
              const isSalesOnly = focusArea === 'SALES';

              // Bar width & position
              const barWidth = isMaintenanceOnly || isSalesOnly ? Math.min(slotWidth * 0.55, 38) : Math.min(slotWidth * 0.36, 26);
              const mHeight = (d.maintenance / (maxRevenue || 1)) * 180;
              const sHeight = (d.sales / (maxRevenue || 1)) * 180;

              const mX = isMaintenanceOnly
                ? groupCenterX - barWidth / 2
                : isSalesOnly
                ? groupCenterX
                : groupCenterX - barWidth - 2;

              const sX = isSalesOnly
                ? groupCenterX - barWidth / 2
                : isMaintenanceOnly
                ? groupCenterX
                : groupCenterX + 2;

              return (
                <g
                  key={d.key}
                  className="cursor-pointer group"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredPoint({
                      label: `${d.label} (${d.sublabel})`,
                      maintenance: d.maintenance,
                      sales: d.sales,
                      osCount: d.osCount,
                      salesCount: d.salesCount,
                      x: rect.x + rect.width / 2,
                      y: rect.y,
                    });
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Hover background column */}
                  <rect
                    x={groupCenterX - slotWidth / 2 + 2}
                    y="20"
                    width={slotWidth - 4}
                    height="180"
                    fill="currentColor"
                    className="text-neutral-500/5 group-hover:text-yellow-400/10 transition-colors"
                  />

                  {/* Maintenance Bar */}
                  {(focusArea === 'ALL' || focusArea === 'MAINTENANCE') && (
                    <rect
                      x={mX}
                      y={200 - mHeight}
                      width={barWidth}
                      height={Math.max(2, mHeight)}
                      rx="3"
                      fill="url(#yellowBarGrad)"
                      className="transition-all duration-300 group-hover:brightness-110"
                    />
                  )}

                  {/* Sales Bar */}
                  {(focusArea === 'ALL' || focusArea === 'SALES') && (
                    <rect
                      x={sX}
                      y={200 - sHeight}
                      width={barWidth}
                      height={Math.max(2, sHeight)}
                      rx="3"
                      fill="url(#skyBarGrad)"
                      className="transition-all duration-300 group-hover:brightness-110"
                    />
                  )}

                  {/* X Axis Label */}
                  <text
                    x={groupCenterX}
                    y="218"
                    textAnchor="middle"
                    className="text-[10px] font-medium fill-neutral-700 dark:fill-neutral-300 select-none group-hover:fill-yellow-400 font-mono transition-colors"
                  >
                    {d.label}
                  </text>
                  <text
                    x={groupCenterX}
                    y="232"
                    textAnchor="middle"
                    className="text-[8px] fill-neutral-400 select-none"
                  >
                    {d.sublabel}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Floating Tooltip */}
          {hoveredPoint && (
            <div
              className={`absolute z-30 pointer-events-none p-3 rounded-lg shadow-xl border text-xs min-w-[210px] transform -translate-x-1/2 -translate-y-full mb-3 backdrop-blur-md transition-transform duration-75 ${
                isDark
                  ? 'bg-[#18191E]/95 border-yellow-400/40 text-neutral-100 shadow-[0_10px_25px_rgba(0,0,0,0.6)]'
                  : 'bg-white/95 border-neutral-300 text-neutral-900 shadow-lg'
              }`}
              style={{
                left: `${hoveredPoint.x}px`,
                top: `${hoveredPoint.y}px`,
              }}
            >
              <div className="font-bold text-sm mb-1.5 border-b border-neutral-200 dark:border-[#27282F] pb-1 flex items-center justify-between">
                <span>{hoveredPoint.label}</span>
                <span className="text-[10px] font-mono text-yellow-400">
                  Total: {formatBRL(hoveredPoint.maintenance + hoveredPoint.sales)}
                </span>
              </div>
              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between text-yellow-400">
                  <span className="flex items-center gap-1">
                    <Wrench className="w-3 h-3" /> Manutenções ({hoveredPoint.osCount} O.S.):
                  </span>
                  <strong>{formatBRL(hoveredPoint.maintenance)}</strong>
                </div>
                <div className="flex items-center justify-between text-sky-400">
                  <span className="flex items-center gap-1">
                    <ShoppingCart className="w-3 h-3" /> Vendas ({hoveredPoint.salesCount} un.):
                  </span>
                  <strong>{formatBRL(hoveredPoint.sales)}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: ÁREA EXCLUSIVA DE RECEITA DAS MANUTENÇÕES (O.S.) */}
      {(focusArea === 'ALL' || focusArea === 'MAINTENANCE') && (
        <section className="space-y-5 pt-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-[#27282F] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                <Wrench className="w-5 h-5 stroke-[2.3]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span>Área de Manutenções & Ordens de Serviço</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 font-mono font-semibold">
                    {activeOrders.length} O.S. no período
                  </span>
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Análise técnica de rentabilidade, faturamento por marcas, defeitos mais frequentes e gargalos operacionais
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Faturamento Técnico Total</div>
              <div className="text-xl font-extrabold text-yellow-400 font-mono">
                {formatBRL(summaryTotals.totalMaintenance)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Box 1: Composição Peças vs Mão de Obra */}
            <div
              className={`p-5 rounded-xl border ${
                isDark ? 'bg-[#121316] border-[#27282F]' : 'bg-white border-neutral-200 shadow-sm'
              }`}
            >
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-yellow-400" />
                <span>Composição: Peças vs Mão de Obra</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                Separação entre custo de reposição e serviço técnico prestado
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-neutral-700 dark:text-neutral-300">Mão de Obra / Serviços de Bancada</span>
                    <span className="font-mono font-bold text-yellow-400">
                      {formatBRL(summaryTotals.totalLaborCost)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full transition-all"
                      style={{
                        width: `${(summaryTotals.totalLaborCost / (summaryTotals.totalMaintenance || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5 text-right font-mono">
                    {((summaryTotals.totalLaborCost / (summaryTotals.totalMaintenance || 1)) * 100).toFixed(1)}% do faturamento
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-neutral-700 dark:text-neutral-300">Peças e Módulos Instalados</span>
                    <span className="font-mono font-bold text-amber-500">
                      {formatBRL(summaryTotals.totalPartsCost)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all"
                      style={{
                        width: `${(summaryTotals.totalPartsCost / (summaryTotals.totalMaintenance || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5 text-right font-mono">
                    {((summaryTotals.totalPartsCost / (summaryTotals.totalMaintenance || 1)) * 100).toFixed(1)}% do faturamento
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-200 dark:border-[#22242B] flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Ticket Médio por Conserto:</span>
                  <span className="font-bold text-neutral-900 dark:text-white font-mono">
                    {formatBRL(summaryTotals.avgTicketOS)}
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: Ranking de Marcas Mais Consertadas */}
            <div
              className={`p-5 rounded-xl border ${
                isDark ? 'bg-[#121316] border-[#27282F]' : 'bg-white border-neutral-200 shadow-sm'
              }`}
            >
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-yellow-400" />
                <span>Marcas Mais Reparadas & Faturamento</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                Volume de aparelhos e faturamento gerado por fabricante
              </p>

              <div className="space-y-3">
                {brandsRanking.slice(0, 5).map((b, idx) => {
                  const share = (b.total / (summaryTotals.totalMaintenance || 1)) * 100;
                  return (
                    <div key={b.brand} className="text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[10px] flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          {b.brand}
                        </span>
                        <div className="text-right font-mono">
                          <strong className="text-yellow-400">{formatBRL(b.total)}</strong>
                          <span className="text-neutral-500 text-[10px] ml-1.5">({b.count} un.)</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                        <div
                          className="bg-yellow-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(10, share))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Box 3: Funil e Status das Ordens de Serviço */}
            <div
              className={`p-5 rounded-xl border ${
                isDark ? 'bg-[#121316] border-[#27282F]' : 'bg-white border-neutral-200 shadow-sm'
              }`}
            >
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span>Fluxo Operacional de Bancada</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                Quantitativo de aparelhos em cada estágio do conserto
              </p>

              <div className="space-y-2.5 text-xs">
                {[
                  { key: 'RECEBIDO', label: 'Recebido / Na Triagem', color: 'bg-neutral-500', text: 'text-neutral-400' },
                  { key: 'AGUARDANDO_APROVACAO', label: 'Aguardando Aprovação', color: 'bg-amber-400', text: 'text-amber-400' },
                  { key: 'APROVADO', label: 'Aprovado / Na Bancada', color: 'bg-blue-400', text: 'text-blue-400' },
                  { key: 'AGUARDANDO_PECA', label: 'Aguardando Peça', color: 'bg-orange-500', text: 'text-orange-400' },
                  { key: 'PRONTO', label: 'Pronto / Testado', color: 'bg-emerald-400', text: 'text-emerald-400' },
                  { key: 'ENTREGUE', label: 'Entregue ao Cliente', color: 'bg-yellow-400', text: 'text-yellow-400' },
                ].map((st) => {
                  const count = statusBreakdown[st.key] || 0;
                  const total = activeOrders.length || 1;
                  const pct = (count / total) * 100;
                  return (
                    <div key={st.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${st.color}`} />
                        <span className="text-neutral-700 dark:text-neutral-300">{st.label}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <div className="w-16 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                          <div className={`h-full ${st.color}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`w-6 text-right font-bold ${st.text}`}>{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: ÁREA EXCLUSIVA DE RECEITA DE VENDAS (PDV) */}
      {(focusArea === 'ALL' || focusArea === 'SALES') && (
        <section className="space-y-5 pt-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-[#27282F] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-400/20">
                <ShoppingCart className="w-5 h-5 stroke-[2.3]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span>Área de Vendas Balcão (PDV) & Produtos</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-sky-400/10 text-sky-400 font-mono font-semibold">
                    {activeSales.length} cupons no período
                  </span>
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Desempenho de vendas de películas, cabos, fontes turbo, acessórios e margem de lucro estimada
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Faturamento Vendas PDV</div>
              <div className="text-xl font-extrabold text-sky-400 font-mono">
                {formatBRL(summaryTotals.totalSales)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Box 1: Faturamento por Categoria de Produto */}
            <div
              className={`p-5 rounded-xl border ${
                isDark ? 'bg-[#121316] border-[#27282F]' : 'bg-white border-neutral-200 shadow-sm'
              }`}
            >
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-sky-400" />
                <span>Receita por Categoria de Produto</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                Distribuição de vendas e lucro gerado por grupo de itens
              </p>

              <div className="space-y-3">
                {salesCategoryBreakdown.map((cat) => {
                  const share = (cat.total / (summaryTotals.totalSales || 1)) * 100;
                  return (
                    <div key={cat.category} className="text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {cat.category}
                        </span>
                        <div className="text-right font-mono">
                          <strong className="text-sky-400">{formatBRL(cat.total)}</strong>
                          <span className="text-emerald-400 text-[10px] ml-1.5">(+{formatBRL(cat.profit)})</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                        <div
                          className="bg-sky-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(8, share))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Box 2: Produtos Campeões de Venda */}
            <div
              className={`p-5 rounded-xl border ${
                isDark ? 'bg-[#121316] border-[#27282F]' : 'bg-white border-neutral-200 shadow-sm'
              }`}
            >
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Top Produtos Mais Vendidos</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                Itens com maior saída e contribuição para a margem da loja
              </p>

              <div className="space-y-3">
                {topProducts.map((p, idx) => (
                  <div
                    key={p.name}
                    className="p-2.5 rounded-lg border border-neutral-200 dark:border-[#22242B] bg-neutral-50/50 dark:bg-[#16171B] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="truncate">
                        <div className="font-semibold text-neutral-900 dark:text-white truncate">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono">
                          {p.quantity} unidades vendidas
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <div className="font-bold text-sky-400">{formatBRL(p.revenue)}</div>
                      <div className="text-[10px] text-emerald-400 font-medium">Lucro: +{formatBRL(p.profit)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 3: Formas de Pagamento no PDV */}
            <div
              className={`p-5 rounded-xl border ${
                isDark ? 'bg-[#121316] border-[#27282F]' : 'bg-white border-neutral-200 shadow-sm'
              }`}
            >
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-sky-400" />
                <span>Formas de Pagamento no Balcão</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                Meios de recebimento utilizados pelos clientes
              </p>

              <div className="space-y-3.5 text-xs">
                {[
                  { id: 'PIX', label: 'PIX Instantâneo', icon: QrCode, color: 'text-emerald-400', bg: 'bg-emerald-400' },
                  { id: 'CARTAO_CREDITO', label: 'Cartão de Crédito', icon: CreditCard, color: 'text-sky-400', bg: 'bg-sky-400' },
                  { id: 'CARTAO_DEBITO', label: 'Cartão de Débito', icon: CreditCard, color: 'text-indigo-400', bg: 'bg-indigo-400' },
                  { id: 'DINHEIRO', label: 'Dinheiro em Espécie', icon: Coins, color: 'text-yellow-400', bg: 'bg-yellow-400' },
                ].map((m) => {
                  const amount = salesPaymentMethods[m.id] || 0;
                  const share = (amount / (summaryTotals.totalSales || 1)) * 100;
                  const Icon = m.icon;
                  return (
                    <div key={m.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                          <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                          {m.label}
                        </span>
                        <span className="font-mono font-bold text-neutral-900 dark:text-white">
                          {formatBRL(amount)} <span className="text-[10px] text-neutral-500 font-normal">({share.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                        <div className={`h-full ${m.bg}`} style={{ width: `${share}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

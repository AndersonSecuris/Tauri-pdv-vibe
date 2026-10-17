import React, { useState, useEffect } from 'react';
import {
  OrdemDeServico,
  Cliente,
  ItemPDV,
  VendaPDV,
  CaixaSessao,
  ConfiguracaoImpressora,
  AppTheme,
  OSConfigOptions,
} from './types';
import {
  getStoredOrders,
  saveStoredOrders,
  getStoredClients,
  saveStoredClients,
  getStoredProducts,
  saveStoredProducts,
  getStoredPrinterConfig,
  saveStoredPrinterConfig,
  getStoredCaixa,
  saveStoredCaixa,
  getStoredOSConfig,
  saveStoredOSConfig,
  resetStoredOSConfig,
} from './services/storage';
import {
  generateOSCustomerReceipt,
  generateOSTechReceipt,
  generateOSWorkbenchSticker,
  generateSaleReceipt,
  generateCaixaReport,
  FormattedReceipt,
} from './services/escpos';
import { TopNav } from './components/TopNav';
import { OSListView } from './components/OSListView';
import { FastOSModal } from './components/FastOSModal';
import { OSDetailsModal } from './components/OSDetailsModal';
import { OSTrackerModal } from './components/OSTrackerModal';
import { ClientHistoryView } from './components/ClientHistoryView';
import { PDVView } from './components/PDVView';
import { CaixaModal } from './components/CaixaModal';
import { ThermalReceiptPreview } from './components/ThermalReceiptPreview';
import { ThermalPrinterSettingsModal } from './components/ThermalPrinterSettingsModal';
import { OSConfigView } from './components/OSConfigView';

export default function App() {
  // Theme State (Default to Black & Yellow cyber/tech theme as requested)
  const [theme, setTheme] = useState<AppTheme>('black-yellow');

  // Central Data States
  const [orders, setOrders] = useState<OrdemDeServico[]>(getStoredOrders);
  const [clients, setClients] = useState<Cliente[]>(getStoredClients);
  const [products, setProducts] = useState<ItemPDV[]>(getStoredProducts);
  const [caixa, setCaixa] = useState<CaixaSessao>(getStoredCaixa);
  const [printerConfig, setPrinterConfig] = useState<ConfiguracaoImpressora>(getStoredPrinterConfig);
  const [osConfig, setOSConfig] = useState<OSConfigOptions>(getStoredOSConfig);

  // Active Main Navigation Tab
  const [currentTab, setCurrentTab] = useState<
    'OS_LIST' | 'PDV' | 'CLIENTS' | 'TRACKER' | 'PRINTER_SETTINGS' | 'OS_CONFIG'
  >('OS_LIST');

  // Modals & Panels
  const [isFastOSOpen, setIsFastOSOpen] = useState(false);
  const [activeOSForDetails, setActiveOSForDetails] = useState<OrdemDeServico | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [trackerInitialQuery, setTrackerInitialQuery] = useState('');
  const [isCaixaModalOpen, setIsCaixaModalOpen] = useState(false);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);

  // Active Thermal Receipt Preview
  const [receiptPreview, setReceiptPreview] = useState<{
    receipt: FormattedReceipt;
    title: string;
  } | null>(null);

  // Pre-selected client for new OS
  const [preselectedClient, setPreselectedClient] = useState<Cliente | null>(null);

  // Synchronize storage whenever state changes
  useEffect(() => {
    saveStoredOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveStoredClients(clients);
  }, [clients]);

  useEffect(() => {
    saveStoredProducts(products);
  }, [products]);

  useEffect(() => {
    saveStoredCaixa(caixa);
  }, [caixa]);

  useEffect(() => {
    saveStoredPrinterConfig(printerConfig);
  }, [printerConfig]);

  useEffect(() => {
    saveStoredOSConfig(osConfig);
  }, [osConfig]);

  // Handler: Save and Reset OS Config
  const handleSaveOSConfig = (updated: OSConfigOptions) => {
    setOSConfig(updated);
    saveStoredOSConfig(updated);
  };

  const handleResetOSConfig = () => {
    const defaults = resetStoredOSConfig();
    setOSConfig(defaults);
  };

  // Handler: Save New Work Order (Fast OS Modal)
  const handleSaveNewOS = (
    newOS: OrdemDeServico,
    printMode?: 'CUSTOMER_RECEIPT' | 'TECH_RECEIPT' | 'WORKBENCH_STICKER'
  ) => {
    // 1. Add order to list
    const updatedOrders = [newOS, ...orders];
    setOrders(updatedOrders);

    // 2. Ensure client exists in client list
    const clientExists = clients.some(
      (c) => c.id === newOS.client.id || c.phone === newOS.client.phone
    );
    if (!clientExists) {
      setClients([newOS.client, ...clients]);
    }

    setIsFastOSOpen(false);
    setPreselectedClient(null);

    // 3. Trigger receipt preview if print requested
    if (printMode === 'CUSTOMER_RECEIPT') {
      const receipt = generateOSCustomerReceipt(newOS, printerConfig);
      setReceiptPreview({
        receipt,
        title: `Comprovante de Entrada - ${newOS.id}`,
      });
    } else if (printMode === 'TECH_RECEIPT') {
      const receipt = generateOSTechReceipt(newOS, printerConfig);
      setReceiptPreview({
        receipt,
        title: `O.S. Técnico (Reduzida) - ${newOS.id}`,
      });
    } else if (printMode === 'WORKBENCH_STICKER') {
      const receipt = generateOSWorkbenchSticker(newOS, printerConfig);
      setReceiptPreview({
        receipt,
        title: `Etiqueta de Bancada - ${newOS.id}`,
      });
    }
  };

  // Handler: Update Existing OS
  const handleUpdateOS = (updatedOS: OrdemDeServico) => {
    const updated = orders.map((o) => (o.id === updatedOS.id ? updatedOS : o));
    setOrders(updated);
    setActiveOSForDetails(updatedOS);
  };

  // Handler: Print OS Receipt or Sticker from anywhere
  const handlePrintOS = (
    os: OrdemDeServico,
    type: 'CUSTOMER_RECEIPT' | 'TECH_RECEIPT' | 'WORKBENCH_STICKER'
  ) => {
    if (type === 'CUSTOMER_RECEIPT') {
      const receipt = generateOSCustomerReceipt(os, printerConfig);
      setReceiptPreview({
        receipt,
        title: `Comprovante de Entrada - ${os.id}`,
      });
    } else if (type === 'TECH_RECEIPT') {
      const receipt = generateOSTechReceipt(os, printerConfig);
      setReceiptPreview({
        receipt,
        title: `O.S. Técnico (Reduzida) - ${os.id}`,
      });
    } else {
      const receipt = generateOSWorkbenchSticker(os, printerConfig);
      setReceiptPreview({
        receipt,
        title: `Etiqueta de Bancada - ${os.id}`,
      });
    }
  };

  // Handler: Complete Sale from PDV
  const handleCompleteSale = (sale: VendaPDV) => {
    // 1. Deduct products stock
    const updatedProducts = products.map((prod) => {
      const cartItem = sale.items.find((i) => i.product.id === prod.id);
      if (cartItem && prod.unit !== 'SV') {
        return {
          ...prod,
          stock: Math.max(0, prod.stock - cartItem.quantity),
        };
      }
      return prod;
    });
    setProducts(updatedProducts);

    // 2. Update Cashier session
    let updatedCash = caixa.expectedCash;
    let addSalesCash = caixa.totalSalesCash;
    let addSalesPix = caixa.totalSalesPix;
    let addSalesCard = caixa.totalSalesCard;

    if (sale.paymentMethod === 'DINHEIRO') {
      addSalesCash += sale.total;
      updatedCash += sale.total;
    } else if (sale.paymentMethod === 'PIX') {
      addSalesPix += sale.total;
    } else {
      addSalesCard += sale.total;
    }

    const updatedCaixa: CaixaSessao = {
      ...caixa,
      totalSalesCash: addSalesCash,
      totalSalesPix: addSalesPix,
      totalSalesCard: addSalesCard,
      expectedCash: updatedCash,
      movements: [
        {
          id: `mov-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'VENDA',
          amount: sale.total,
          reason: `Venda PDV #${sale.code} (${sale.paymentMethod})`,
          author: sale.cashierName,
        },
        ...caixa.movements,
      ],
    };
    setCaixa(updatedCaixa);

    // 3. Generate ESC/POS Thermal Sale Ticket
    const receipt = generateSaleReceipt(sale, printerConfig);
    setReceiptPreview({
      receipt,
      title: `Cupom de Venda - ${sale.code}`,
    });
  };

  // Handler: Print Caixa Closing Report
  const handlePrintCaixaReport = () => {
    const receipt = generateCaixaReport(caixa, printerConfig);
    setReceiptPreview({
      receipt,
      title: `Fechamento de Caixa - ${caixa.id}`,
    });
  };

  // Handler: Client Tracker Budget Approval
  const handleApproveBudget = (osId: string) => {
    const target = orders.find((o) => o.id === osId);
    if (!target) return;

    const updated: OrdemDeServico = {
      ...target,
      status: 'APROVADO',
      timeline: [
        {
          id: `ev-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'APROVADO',
          note: 'Orçamento aprovado pelo cliente através do Portal de Rastreamento Online.',
          author: 'Cliente (Via Portal Web)',
        },
        ...target.timeline,
      ],
    };

    handleUpdateOS(updated);
  };

  const isDark = theme === 'black-yellow' || theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 antialiased ${
        isDark
          ? 'bg-[#090A0D] text-neutral-100 selection:bg-yellow-400 selection:text-neutral-950'
          : 'bg-neutral-100 text-neutral-900 selection:bg-neutral-900 selection:text-white'
      }`}
    >
      {/* Universal Top Bar */}
      <TopNav
        currentTab={currentTab}
        onChangeTab={(tab) => {
          if (tab === 'PRINTER_SETTINGS') {
            setIsPrinterModalOpen(true);
          } else if (tab === 'TRACKER') {
            setIsTrackerOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        onOpenFastOS={() => {
          setPreselectedClient(null);
          setIsFastOSOpen(true);
        }}
        ordersCount={orders.length}
        theme={theme}
        onToggleTheme={() => setTheme((t: AppTheme) => (t === 'black-yellow' ? 'light' : 'black-yellow'))}
      />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentTab === 'OS_LIST' && (
          <OSListView
            orders={orders}
            printerConfig={printerConfig}
            theme={theme}
            onOpenOS={(os) => setActiveOSForDetails(os)}
            onNewOS={() => {
              setPreselectedClient(null);
              setIsFastOSOpen(true);
            }}
            onQuickPrint={(os, type) => handlePrintOS(os, type)}
            onOpenTracker={(query) => {
              setTrackerInitialQuery(query || '');
              setIsTrackerOpen(true);
            }}
            onOpenOSConfig={() => setCurrentTab('OS_CONFIG')}
          />
        )}

        {currentTab === 'PDV' && (
          <PDVView
            products={products}
            clients={clients}
            printerConfig={printerConfig}
            theme={theme}
            onCompleteSale={handleCompleteSale}
            onOpenCaixa={() => setIsCaixaModalOpen(true)}
          />
        )}

        {currentTab === 'CLIENTS' && (
          <ClientHistoryView
            clients={clients}
            orders={orders}
            theme={theme}
            onOpenOS={(os) => setActiveOSForDetails(os)}
            onNewOSForClient={(client) => {
              setPreselectedClient(client);
              setIsFastOSOpen(true);
            }}
          />
        )}

        {currentTab === 'OS_CONFIG' && (
          <OSConfigView
            config={osConfig}
            onSaveConfig={handleSaveOSConfig}
            onResetDefaults={handleResetOSConfig}
            theme={theme}
            onClose={() => setCurrentTab('OS_LIST')}
          />
        )}
      </main>

      {/* MODAL 1: Fast OS Entry */}
      {isFastOSOpen && (
        <FastOSModal
          existingClients={clients}
          existingOrders={orders}
          printerConfig={printerConfig}
          theme={theme}
          osConfig={osConfig}
          onOpenOSConfig={() => {
            setIsFastOSOpen(false);
            setCurrentTab('OS_CONFIG');
          }}
          onSave={handleSaveNewOS}
          onClose={() => {
            setIsFastOSOpen(false);
            setPreselectedClient(null);
          }}
        />
      )}

      {/* MODAL 2: OS Details & Workflow */}
      {activeOSForDetails && (
        <OSDetailsModal
          os={activeOSForDetails}
          printerConfig={printerConfig}
          theme={theme}
          onUpdate={handleUpdateOS}
          onPrint={(type) => handlePrintOS(activeOSForDetails, type)}
          onClose={() => setActiveOSForDetails(null)}
        />
      )}

      {/* MODAL 3: Online Repair Tracking Portal */}
      {isTrackerOpen && (
        <OSTrackerModal
          orders={orders}
          initialSearch={trackerInitialQuery}
          theme={theme}
          onApproveBudget={handleApproveBudget}
          onClose={() => {
            setIsTrackerOpen(false);
            setTrackerInitialQuery('');
          }}
        />
      )}

      {/* MODAL 4: Cash Drawer Management (Caixa) */}
      {isCaixaModalOpen && (
        <CaixaModal
          caixa={caixa}
          printerConfig={printerConfig}
          theme={theme}
          onUpdateCaixa={(newCaixa) => setCaixa(newCaixa)}
          onPrintReport={handlePrintCaixaReport}
          onClose={() => setIsCaixaModalOpen(false)}
        />
      )}

      {/* MODAL 5: Tauri ESC/POS Printer Settings */}
      {isPrinterModalOpen && (
        <ThermalPrinterSettingsModal
          config={printerConfig}
          theme={theme}
          onSaveConfig={(newConfig) => setPrinterConfig(newConfig)}
          onClose={() => setIsPrinterModalOpen(false)}
        />
      )}

      {/* MODAL 6: Thermal Receipt Preview & Print Controller */}
      {receiptPreview && (
        <ThermalReceiptPreview
          receipt={receiptPreview.receipt}
          config={printerConfig}
          title={receiptPreview.title}
          theme={theme}
          onClose={() => setReceiptPreview(null)}
        />
      )}
    </div>
  );
}

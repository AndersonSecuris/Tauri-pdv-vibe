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
  getStoredSales,
  saveStoredSales,
  saveStoredSnapshots,
  INITIAL_CAIXA,
  INITIAL_PRINTER_CONFIG,
  createBackupPayload,
  addStoredSnapshot,
} from './services/storage';
import { AnalyticsView } from './components/AnalyticsView';
import { BackupView } from './components/BackupView';
import { SelectiveResetOptions } from './components/ResetDatabaseModal';
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
  const [sales, setSales] = useState<VendaPDV[]>(getStoredSales);
  const [clients, setClients] = useState<Cliente[]>(getStoredClients);
  const [products, setProducts] = useState<ItemPDV[]>(getStoredProducts);
  const [caixa, setCaixa] = useState<CaixaSessao>(getStoredCaixa);
  const [printerConfig, setPrinterConfig] = useState<ConfiguracaoImpressora>(getStoredPrinterConfig);
  const [osConfig, setOSConfig] = useState<OSConfigOptions>(getStoredOSConfig);

  // Active Main Navigation Tab
  const [currentTab, setCurrentTab] = useState<
    'OS_LIST' | 'PDV' | 'ANALYTICS' | 'CLIENTS' | 'TRACKER' | 'PRINTER_SETTINGS' | 'OS_CONFIG' | 'BACKUP'
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
    saveStoredSales(sales);
  }, [sales]);

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

  // Handler: Restore Backup Data (Full Replace or Incremental Merge)
  const handleRestoreBackup = (data: {
    orders: OrdemDeServico[];
    clients: Cliente[];
    products: ItemPDV[];
    sales: VendaPDV[];
    caixa?: CaixaSessao;
    printerConfig?: ConfiguracaoImpressora;
    osConfig?: OSConfigOptions;
    mode: 'REPLACE' | 'MERGE';
  }) => {
    setOrders(data.orders);
    setClients(data.clients);
    setProducts(data.products);
    setSales(data.sales);
    if (data.caixa) setCaixa(data.caixa);
    if (data.printerConfig) setPrinterConfig(data.printerConfig);
    if (data.osConfig) setOSConfig(data.osConfig);
  };

  // Handler: Delete Work Order Individually
  const handleDeleteOS = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (activeOSForDetails?.id === orderId) {
      setActiveOSForDetails(null);
    }
  };

  // Handler: Delete Client
  const handleDeleteClient = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
  };

  // Handler: Delete Sale (and restore stock for tracked items)
  const handleDeleteSale = (saleId: string) => {
    const saleToDelete = sales.find((s) => s.id === saleId);
    if (saleToDelete && saleToDelete.status === 'CONCLUIDA') {
      setProducts((prev) => {
        const restored = prev.map((prod) => {
          const cartItem = saleToDelete.items.find((i) => i.product.id === prod.id);
          const isControlled = prod.controlStock !== false && prod.unit !== 'SV';
          if (cartItem && isControlled) {
            return {
              ...prod,
              stock: prod.stock + cartItem.quantity,
            };
          }
          return prod;
        });
        saveStoredProducts(restored);
        return restored;
      });
    }
    setSales((prev) => prev.filter((s) => s.id !== saleId));
  };

  // Handler: Update Sale Values
  const handleUpdateSale = (updatedSale: VendaPDV) => {
    setSales((prev) => prev.map((s) => (s.id === updatedSale.id ? updatedSale : s)));
  };

  // Handler: Save or Update Product (with stock control options)
  const handleSaveProduct = (product: ItemPDV) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      let updated: ItemPDV[];
      if (exists) {
        updated = prev.map((p) => (p.id === product.id ? product : p));
      } else {
        updated = [product, ...prev];
      }
      saveStoredProducts(updated);
      return updated;
    });
  };

  // Handler: Delete Product from Catalog
  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      saveStoredProducts(updated);
      return updated;
    });
  };

  // Handler: Selective Database Reset
  const handleSelectiveReset = (opts: SelectiveResetOptions) => {
    if (opts.createBackupFirst) {
      const currentLive = createBackupPayload({
        orders,
        clients,
        products,
        sales,
        caixa,
        printerConfig,
        osConfig,
        notes: 'Backup de segurança gerado antes do reset seletivo',
        source: 'pre_reset_safety',
      });
      addStoredSnapshot(`Segurança Pré-Reset (${new Date().toLocaleTimeString('pt-BR')})`, currentLive);
    }

    if (opts.deleteOrders) {
      setOrders([]);
      saveStoredOrders([]);
    }
    if (opts.deleteSales) {
      setSales([]);
      saveStoredSales([]);
    }
    if (opts.deleteClients) {
      setClients([]);
      saveStoredClients([]);
    }
    if (opts.deleteProducts) {
      setProducts([]);
      saveStoredProducts([]);
    }
    if (opts.resetCaixa) {
      setCaixa(INITIAL_CAIXA);
      saveStoredCaixa(INITIAL_CAIXA);
    }
    if (opts.resetOSConfig) {
      const def = resetStoredOSConfig();
      setOSConfig(def);
    }
    if (opts.resetPrinterConfig) {
      setPrinterConfig(INITIAL_PRINTER_CONFIG);
      saveStoredPrinterConfig(INITIAL_PRINTER_CONFIG);
    }
    if (opts.clearSnapshots) {
      saveStoredSnapshots([]);
    }
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
    // 1. Deduct products stock only if controlStock is enabled
    const updatedProducts = products.map((prod) => {
      const cartItem = sale.items.find((i) => i.product.id === prod.id);
      const isControlled = prod.controlStock !== false && prod.unit !== 'SV';
      if (cartItem && isControlled) {
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
    // 3. Save sale to sales history
    setSales((prev) => [sale, ...prev]);

    // 4. Generate ESC/POS Thermal Sale Ticket
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
            onDeleteOS={handleDeleteOS}
          />
        )}

        {currentTab === 'PDV' && (
          <PDVView
            products={products}
            clients={clients}
            sales={sales}
            printerConfig={printerConfig}
            theme={theme}
            onCompleteSale={handleCompleteSale}
            onDeleteSale={handleDeleteSale}
            onUpdateSale={handleUpdateSale}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onPrintReceipt={(s) =>
              setReceiptPreview({
                receipt: generateSaleReceipt(s, printerConfig),
                title: `Cupom de Venda ${s.code}`,
              })
            }
            onOpenCaixa={() => setIsCaixaModalOpen(true)}
          />
        )}

        {currentTab === 'ANALYTICS' && (
          <AnalyticsView
            orders={orders}
            sales={sales}
            theme={theme}
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
            onDeleteClient={handleDeleteClient}
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

        {currentTab === 'BACKUP' && (
          <BackupView
            orders={orders}
            clients={clients}
            products={products}
            sales={sales}
            caixa={caixa}
            printerConfig={printerConfig}
            osConfig={osConfig}
            theme={theme}
            onRestoreBackup={handleRestoreBackup}
            onSelectiveReset={handleSelectiveReset}
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
          onDelete={handleDeleteOS}
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

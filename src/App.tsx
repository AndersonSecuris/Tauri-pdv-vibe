import React, { useState, useEffect } from 'react';
import {
  OrdemDeServico,
  Cliente,
  ItemPDV,
  VendaPDV,
  CaixaSessao,
  ConfiguracaoImpressora,
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
} from './services/storage';
import {
  generateOSCustomerReceipt,
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

export default function App() {
  // Central Data States
  const [orders, setOrders] = useState<OrdemDeServico[]>(getStoredOrders);
  const [clients, setClients] = useState<Cliente[]>(getStoredClients);
  const [products, setProducts] = useState<ItemPDV[]>(getStoredProducts);
  const [caixa, setCaixa] = useState<CaixaSessao>(getStoredCaixa);
  const [printerConfig, setPrinterConfig] = useState<ConfiguracaoImpressora>(getStoredPrinterConfig);

  // Active Main Navigation Tab
  const [currentTab, setCurrentTab] = useState<
    'OS_LIST' | 'PDV' | 'CLIENTS' | 'TRACKER' | 'PRINTER_SETTINGS'
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

  // Handler: Save New Work Order (Fast OS Modal)
  const handleSaveNewOS = (
    newOS: OrdemDeServico,
    printMode?: 'CUSTOMER_RECEIPT' | 'WORKBENCH_STICKER'
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
    type: 'CUSTOMER_RECEIPT' | 'WORKBENCH_STICKER'
  ) => {
    if (type === 'CUSTOMER_RECEIPT') {
      const receipt = generateOSCustomerReceipt(os, printerConfig);
      setReceiptPreview({
        receipt,
        title: `Comprovante de Entrada - ${os.id}`,
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

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans selection:bg-neutral-900 selection:text-white antialiased">
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
      />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentTab === 'OS_LIST' && (
          <OSListView
            orders={orders}
            printerConfig={printerConfig}
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
          />
        )}

        {currentTab === 'PDV' && (
          <PDVView
            products={products}
            clients={clients}
            printerConfig={printerConfig}
            onCompleteSale={handleCompleteSale}
            onOpenCaixa={() => setIsCaixaModalOpen(true)}
          />
        )}

        {currentTab === 'CLIENTS' && (
          <ClientHistoryView
            clients={clients}
            orders={orders}
            onOpenOS={(os) => setActiveOSForDetails(os)}
            onNewOSForClient={(client) => {
              setPreselectedClient(client);
              setIsFastOSOpen(true);
            }}
          />
        )}
      </main>

      {/* MODAL 1: Fast OS Entry */}
      {isFastOSOpen && (
        <FastOSModal
          existingClients={clients}
          existingOrders={orders}
          printerConfig={printerConfig}
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
          onUpdateCaixa={(newCaixa) => setCaixa(newCaixa)}
          onPrintReport={handlePrintCaixaReport}
          onClose={() => setIsCaixaModalOpen(false)}
        />
      )}

      {/* MODAL 5: Tauri ESC/POS Printer Settings */}
      {isPrinterModalOpen && (
        <ThermalPrinterSettingsModal
          config={printerConfig}
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
          onClose={() => setReceiptPreview(null)}
        />
      )}
    </div>
  );
}

export type OSStatus =
  | 'RECEBIDO'
  | 'AGUARDANDO_APROVACAO'
  | 'APROVADO'
  | 'AGUARDANDO_PECA'
  | 'PRONTO'
  | 'ENTREGUE'
  | 'CANCELADO';

export interface Cliente {
  id: string;
  name: string;
  phone: string;
  cpf?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface Aparelho {
  brand: string;
  model: string;
  color: string;
  imei?: string;
  serialNumber?: string;
  passcode?: string;
  patternLock?: number[]; // indices 0 to 8 on 3x3 grid
  icloudStatus: 'SEM_CONTA' | 'COM_CONTA_CLIENTE' | 'BLOQUEADO' | 'NAO_INFORMADO';
}

export interface ItemOS {
  id: string;
  description: string;
  type: 'PECA' | 'SERVICO';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface HistoricoEvento {
  id: string;
  timestamp: string;
  status: OSStatus;
  note: string;
  author: string;
}

export interface OrdemDeServico {
  id: string; // e.g. OS-2026-0842
  trackingCode: string; // e.g. TRK-8429
  client: Cliente;
  device: Aparelho;
  entryDate: string;
  expectedDate?: string;
  exitDate?: string;
  technician: string;
  
  reportedDefect: string; // Defeito relatado pelo cliente
  initialChecklist: {
    screenCracked: boolean;
    housingScratched: boolean;
    buttonsWorking: boolean;
    camerasWorking: boolean;
    chargesNormal: boolean;
    speakerWorking: boolean;
    waterDamage: boolean;
    simTrayPresent: boolean;
  };
  accessoriesLeft: string[]; // ['Capa', 'Carregador', 'Cabo', 'Gaveta SIM']
  
  technicalDiagnosis?: string; // Laudo / Diagnóstico técnico
  internalNotes?: string;
  status: OSStatus;
  
  items: ItemOS[];
  partsCost: number;
  laborCost: number;
  discount: number;
  totalAmount: number;
  
  paymentMethod?: 'DINHEIRO' | 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'MISTO';
  paymentStatus: 'PENDENTE' | 'PAGO' | 'PARCIAL';
  amountPaid: number;
  
  warrantyDays: number;
  warrantyTerms: string;
  timeline: HistoricoEvento[];
}

export interface ItemPDV {
  id: string;
  code: string;
  barcode: string;
  name: string;
  category: 'ACESSORIOS' | 'PECAS' | 'SERVICOS' | 'PELICULAS' | 'CABOS' | 'BATERIAS';
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: string;
}

export interface ItemVenda {
  product: ItemPDV;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface VendaPDV {
  id: string;
  code: string; // V-2026-0129
  date: string;
  client?: Cliente;
  items: ItemVenda[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'DINHEIRO' | 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'MISTO';
  changeAmount?: number;
  cashReceived?: number;
  cashierName: string;
  status: 'CONCLUIDA' | 'CANCELADA';
}

export interface MovimentacaoCaixa {
  id: string;
  timestamp: string;
  type: 'ABERTURA' | 'SANGRIA' | 'SUPRIMENTO' | 'VENDA' | 'OS_PAGAMENTO' | 'FECHAMENTO';
  amount: number;
  reason: string;
  author: string;
}

export interface CaixaSessao {
  id: string;
  openedAt: string;
  closedAt?: string;
  initialCash: number;
  cashWithdrawals: number; // sangria
  cashAdditions: number; // suprimento
  totalSalesCash: number;
  totalSalesPix: number;
  totalSalesCard: number;
  totalOSCash: number;
  expectedCash: number;
  finalCash?: number;
  status: 'ABERTO' | 'FECHADO';
  cashierName: string;
  movements: MovimentacaoCaixa[];
}

export interface ConfiguracaoImpressora {
  driver: 'ESC_POS_TAURI' | 'BROWSER_PRINT';
  paperWidth: '58mm' | '80mm';
  connectionType: 'USB' | 'SERIAL' | 'NETWORK';
  devicePathOrIp: string; // e.g. "COM3" or "/dev/usb/lp0" or "192.168.1.200"
  port: number; // 9100 for network
  baudRate: number; // 9600 or 115200 for serial
  autoCut: boolean;
  openCashDrawerOnSale: boolean;
  printWorkbenchSticker: boolean;
  copiesCount: number;
  
  // Dados do Cabeçalho
  storeName: string;
  storeCnpj: string;
  storePhone: string;
  storeAddress: string;
  storeInstagram: string;
  customHeaderNote: string;
  customFooterNote: string;
}

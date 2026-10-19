import { OrdemDeServico, VendaPDV, CaixaSessao, ConfiguracaoImpressora } from '../types';

// Detect if running inside a Tauri Desktop environment
export const isTauriEnvironment = (): boolean => {
  return typeof window !== 'undefined' && Boolean((window as unknown as { __TAURI__?: unknown }).__TAURI__);
};

// Standard ESC/POS Control Byte Constants
export const ESC_POS = {
  INIT: [0x1B, 0x40], // ESC @
  ALIGN_LEFT: [0x1B, 0x61, 0x00],
  ALIGN_CENTER: [0x1B, 0x61, 0x01],
  ALIGN_RIGHT: [0x1B, 0x61, 0x02],
  BOLD_ON: [0x1B, 0x45, 0x01],
  BOLD_OFF: [0x1B, 0x45, 0x00],
  UNDERLINE_ON: [0x1B, 0x2D, 0x01],
  UNDERLINE_OFF: [0x1B, 0x2D, 0x00],
  FONT_NORMAL: [0x1B, 0x21, 0x00],
  FONT_DOUBLE_HEIGHT: [0x1B, 0x21, 0x10],
  FONT_DOUBLE_WIDTH: [0x1B, 0x21, 0x20],
  FONT_DOUBLE_BOTH: [0x1B, 0x21, 0x30],
  FEED_LINE: [0x0A],
  CUT_FULL: [0x1D, 0x56, 0x00],
  CUT_PARTIAL: [0x1D, 0x56, 0x01],
  DRAWER_KICK: [0x1B, 0x70, 0x00, 0x19, 0xFA], // 25ms on, 250ms off pin 2
};

// Character widths for standard receipt sizes
export const getLineWidth = (paperWidth: '58mm' | '80mm'): number => {
  return paperWidth === '58mm' ? 32 : 48;
};

// Helper: Pads and centers text
export const centerText = (text: string, width: number): string => {
  if (text.length >= width) return text.slice(0, width);
  const pad = Math.floor((width - text.length) / 2);
  return ' '.repeat(pad) + text;
};

// Helper: Formats a left/right key-value line
export const justifyLine = (left: string, right: string, width: number): string => {
  const combined = left + ' ' + right;
  if (combined.length >= width) {
    const availableLeft = Math.max(0, width - right.length - 1);
    return left.slice(0, availableLeft) + ' ' + right;
  }
  const spaces = width - left.length - right.length;
  return left + ' '.repeat(spaces) + right;
};

// Helper: Creates dashed divider
export const divider = (width: number, char = '-'): string => {
  return char.repeat(width);
};

// Format currency in BRL format
export const formatBRL = (value: number): string => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Format Date & Time in pt-BR
export const formatDateTime = (isoString?: string): string => {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

export interface FormattedReceipt {
  text: string;
  rawBytes: Uint8Array;
  hexDump: string;
  paperWidth: '58mm' | '80mm';
}

// Convert string to bytes with CP850/ASCII mapping
export const stringToBytes = (str: string): number[] => {
  const normalized = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove accents for clean thermal printing
  const bytes: number[] = [];
  for (let i = 0; i < normalized.length; i++) {
    bytes.push(normalized.charCodeAt(i) & 0xFF);
  }
  return bytes;
};

// Builder for thermal receipt
class EscPosBuilder {
  private bytes: number[] = [];
  private plainLines: string[] = [];
  private width: number;

  constructor(paperWidth: '58mm' | '80mm') {
    this.width = getLineWidth(paperWidth);
    this.init();
  }

  init() {
    this.bytes.push(...ESC_POS.INIT);
    return this;
  }

  alignCenter() {
    this.bytes.push(...ESC_POS.ALIGN_CENTER);
    return this;
  }

  alignLeft() {
    this.bytes.push(...ESC_POS.ALIGN_LEFT);
    return this;
  }

  alignRight() {
    this.bytes.push(...ESC_POS.ALIGN_RIGHT);
    return this;
  }

  bold(on: boolean) {
    this.bytes.push(...(on ? ESC_POS.BOLD_ON : ESC_POS.BOLD_OFF));
    return this;
  }

  doubleSize() {
    this.bytes.push(...ESC_POS.FONT_DOUBLE_BOTH);
    return this;
  }

  normalSize() {
    this.bytes.push(...ESC_POS.FONT_NORMAL);
    return this;
  }

  line(text = '') {
    this.bytes.push(...stringToBytes(text), ...ESC_POS.FEED_LINE);
    this.plainLines.push(text);
    return this;
  }

  center(text: string) {
    const centered = centerText(text, this.width);
    this.line(centered);
    return this;
  }

  divider(char = '-') {
    this.line(divider(this.width, char));
    return this;
  }

  justify(left: string, right: string) {
    this.line(justifyLine(left, right, this.width));
    return this;
  }

  feed(n = 1) {
    for (let i = 0; i < n; i++) {
      this.bytes.push(...ESC_POS.FEED_LINE);
      this.plainLines.push('');
    }
    return this;
  }

  cut(full = false) {
    this.feed(3);
    this.bytes.push(...(full ? ESC_POS.CUT_FULL : ESC_POS.CUT_PARTIAL));
    return this;
  }

  kickDrawer() {
    this.bytes.push(...ESC_POS.DRAWER_KICK);
    return this;
  }

  build(paperWidth: '58mm' | '80mm'): FormattedReceipt {
    const rawBytes = new Uint8Array(this.bytes);
    const hexDump = Array.from(rawBytes)
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');

    return {
      text: this.plainLines.join('\n'),
      rawBytes,
      hexDump,
      paperWidth,
    };
  }
}

// Generate ESC/POS for Customer Work Order receipt (Via do Cliente)
export const generateOSCustomerReceipt = (
  os: OrdemDeServico,
  config: ConfiguracaoImpressora
): FormattedReceipt => {
  const b = new EscPosBuilder(config.paperWidth);
  const opts = config.osPrintOptions || {
    showStoreHeader: true,
    showStoreCnpj: true,
    showStorePhone: true,
    showStoreAddress: true,
    showStoreInstagram: true,
    showOSNumber: true,
    showTrackingCode: true,
    showEntryDate: true,
    showExpectedDate: true,
    showStatus: true,
    showTechnician: true,
    showClientName: true,
    showClientPhone: true,
    showClientCpf: true,
    showDeviceModel: true,
    showDeviceColor: true,
    showDeviceImei: true,
    showDevicePassword: true,
    showIcloudStatus: true,
    showReportedDefect: true,
    showChecklist: true,
    showAccessories: true,
    showBudgetDetails: true,
    showTotalAmount: true,
    showPaymentStatus: true,
    showTrackingInfo: true,
    showWarrantyTerms: true,
    showSignatureLine: true,
    showCustomFooter: true,
  };

  // Header
  if (opts.showStoreHeader) {
    b.alignCenter();
    b.bold(true);
    b.doubleSize();
    b.line(config.storeName || 'CELLMASTER ASSISTENCIA');
    b.normalSize();
    b.bold(false);
    if (opts.showStorePhone && config.storePhone) b.line(config.storePhone);
    if (opts.showStoreAddress && config.storeAddress) b.line(config.storeAddress);
    if (opts.showStoreCnpj && config.storeCnpj) b.line(`CNPJ: ${config.storeCnpj}`);
    if (opts.showStoreInstagram && config.storeInstagram) b.line(`Instagram: ${config.storeInstagram}`);
    b.divider('=');
  }

  // OS Identification
  b.alignCenter();
  b.bold(true);
  b.line(`COMPROVANTE DE ENTRADA DE O.S.`);
  if (opts.showOSNumber) {
    b.line(`NUMERO: ${os.id}`);
  }
  b.bold(false);
  if (opts.showTrackingCode) {
    b.line(`CODIGO RASTREIO: ${os.trackingCode}`);
  }
  if (opts.showEntryDate) {
    b.line(`DATA: ${formatDateTime(os.entryDate)}`);
  }
  b.divider('-');

  // Client Info
  const hasClientInfo = opts.showClientName || opts.showClientPhone || opts.showClientCpf;
  if (hasClientInfo) {
    b.alignLeft();
    b.bold(true);
    b.line('[ DADOS DO CLIENTE ]');
    b.bold(false);
    if (opts.showClientName) b.justify('Nome:', os.client.name);
    if (opts.showClientPhone) b.justify('Fone:', os.client.phone);
    if (opts.showClientCpf && os.client.cpf) b.justify('CPF:', os.client.cpf);
    b.divider('-');
  }

  // Device Info
  const hasDeviceInfo =
    opts.showDeviceModel ||
    opts.showDeviceColor ||
    opts.showDeviceImei ||
    opts.showDevicePassword ||
    opts.showIcloudStatus;

  if (hasDeviceInfo) {
    b.alignLeft();
    b.bold(true);
    b.line('[ DADOS DO APARELHO ]');
    b.bold(false);
    if (opts.showDeviceModel) b.justify('Modelo:', `${os.device.brand} ${os.device.model}`);
    if (opts.showDeviceColor) b.justify('Cor:', os.device.color || 'Nao inf.');
    if (opts.showDeviceImei && os.device.imei) b.justify('IMEI:', os.device.imei);
    if (opts.showDevicePassword) {
      if (os.device.passcode) {
        b.justify('Senha Tela:', os.device.passcode);
      } else if (os.device.patternLock && os.device.patternLock.length > 0) {
        b.justify('Padrao 3x3:', os.device.patternLock.map(p => p + 1).join('-'));
      }
    }
    if (opts.showIcloudStatus) {
      b.justify('Conta iCloud/Google:', os.device.icloudStatus.replace(/_/g, ' '));
    }
    b.divider('-');
  }

  // Reported Defect
  if (opts.showReportedDefect) {
    b.alignLeft();
    b.bold(true);
    b.line('[ DEFEITO RECLAMADO ]');
    b.bold(false);
    b.line(os.reportedDefect || 'Sem defeito relatado');
    b.divider('-');
  }

  // Checklist of Initial Condition
  if (opts.showChecklist) {
    b.alignLeft();
    b.bold(true);
    b.line('[ ESTADO INICIAL / CHECKLIST ]');
    b.bold(false);
    const checklist: string[] = [];
    if (os.initialChecklist.screenCracked) checklist.push('Tela trincada');
    if (os.initialChecklist.housingScratched) checklist.push('Carcaca c/ riscos');
    if (!os.initialChecklist.buttonsWorking) checklist.push('Botoes c/ defeito');
    if (!os.initialChecklist.chargesNormal) checklist.push('Nao carrega');
    if (os.initialChecklist.waterDamage) checklist.push('Aparelho molhado');
    if (os.initialChecklist.simTrayPresent) checklist.push('Gaveta SIM presente');
    
    // Support dynamic checklist keys
    Object.keys(os.initialChecklist).forEach(key => {
      if (
        !['screenCracked', 'housingScratched', 'buttonsWorking', 'chargesNormal', 'waterDamage', 'simTrayPresent', 'camerasWorking', 'speakerWorking'].includes(key) &&
        os.initialChecklist[key]
      ) {
        checklist.push(key);
      }
    });

    if (checklist.length > 0) {
      b.line(checklist.join(' | '));
    } else {
      b.line('Aparelho em bom estado fisico.');
    }
  }

  // Accessories
  if (opts.showAccessories && os.accessoriesLeft && os.accessoriesLeft.length > 0) {
    b.alignLeft();
    b.justify('Acessorios:', os.accessoriesLeft.join(', '));
  }
  if (opts.showChecklist || (opts.showAccessories && os.accessoriesLeft && os.accessoriesLeft.length > 0)) {
    b.divider('-');
  }

  // Forecast & Values
  if (opts.showExpectedDate && os.expectedDate) {
    b.justify('Previsao Entrega:', formatDateTime(os.expectedDate));
  }
  if (opts.showTechnician && os.technician) {
    b.justify('Tecnico:', os.technician);
  }
  if (opts.showStatus) {
    b.justify('Status Atual:', os.status.replace(/_/g, ' '));
  }

  if (opts.showBudgetDetails && os.items && os.items.length > 0) {
    b.divider('-');
    b.bold(true);
    b.line('[ PECAS E SERVICOS PREVISTOS ]');
    b.bold(false);
    os.items.forEach(item => {
      b.justify(`${item.quantity}x ${item.description.slice(0, 18)}`, formatBRL(item.total));
    });
  }

  if (opts.showTotalAmount) {
    b.divider('-');
    if (os.totalAmount > 0) {
      b.bold(true);
      b.justify('Orcamento Estimado:', formatBRL(os.totalAmount));
      b.bold(false);
    } else {
      b.justify('Orcamento:', 'Sob Analise Tecnica');
    }
  }

  if (opts.showPaymentStatus) {
    b.justify('Pagamento:', os.paymentStatus === 'PAGO' ? 'PAGO' : 'PENDENTE');
  }

  b.divider('=');

  // Legal / Tracking / CDC Warranty Terms
  if (opts.showTrackingInfo) {
    b.alignCenter();
    b.line('RASTREIE SEU CONSERTO ONLINE:');
    b.bold(true);
    b.line(`app.cellmaster.com.br/rastreio`);
    b.line(`CODIGO: ${os.trackingCode}`);
    b.bold(false);
  }

  if (opts.showWarrantyTerms) {
    b.divider('-');
    b.alignCenter();
    b.line('TERMO DE RESPONSABILIDADE:');
    b.line('Aparelhos nao retirados em 90');
    b.line('dias serao encaminhados para');
    b.line('descarte/venda p/ cobrir custos');
    b.line('conforme Art. 1275 do CCB.');
  }

  if (opts.showSignatureLine) {
    b.feed(1);
    b.line('_________________________________');
    b.line('Assinatura do Cliente');
  }
  
  if (opts.showCustomFooter && config.customFooterNote) {
    b.feed(1);
    b.line(config.customFooterNote);
  }

  if (config.autoCut) {
    b.cut();
  }

  return b.build(config.paperWidth);
};

// Generate Compact Technician OS (O.S. Técnico - Via Reduzida para Bancada)
export const generateOSTechReceipt = (
  os: OrdemDeServico,
  config: ConfiguracaoImpressora
): FormattedReceipt => {
  const b = new EscPosBuilder(config.paperWidth);
  const opts = config.techOSPrintOptions || {
    showStoreHeader: true,
    showOSNumber: true,
    showTrackingCode: true,
    showDates: true,
    showTechnician: true,
    showClientName: true,
    showClientPhone: true,
    showDeviceModel: true,
    showDeviceColor: true,
    showDeviceImei: true,
    showDevicePassword: true,
    showIcloudStatus: true,
    showReportedDefect: true,
    showChecklist: true,
    showAccessories: true,
    showDiagnosisSpace: true,
    showBudget: true,
    showCustomFooter: true,
  };

  // Technician Header
  b.alignCenter();
  b.bold(true);
  b.line('*** O.S. TECNICO (VIA REDUZIDA) ***');
  if (opts.showStoreHeader && config.storeName) {
    b.line(config.storeName);
  }
  b.bold(false);
  b.divider('=');

  // OS Identifiers
  if (opts.showOSNumber) {
    b.alignCenter();
    b.bold(true);
    b.doubleSize();
    b.line(os.id);
    b.normalSize();
    b.bold(false);
  }

  b.alignLeft();
  if (opts.showTrackingCode) {
    b.justify('RASTREIO:', os.trackingCode);
  }
  if (opts.showTechnician) {
    b.bold(true);
    b.justify('TECNICO RESP.:', os.technician || 'Geral');
    b.bold(false);
  }
  if (opts.showDates) {
    b.justify('ENTRADA:', formatDateTime(os.entryDate));
    if (os.expectedDate) {
      b.justify('PREV. ENTREGA:', formatDateTime(os.expectedDate));
    }
  }
  b.divider('-');

  // Client info (concise)
  if (opts.showClientName || opts.showClientPhone) {
    b.bold(true);
    b.line('[ CONTATO CLIENTE ]');
    b.bold(false);
    if (opts.showClientName) b.justify('Cliente:', os.client.name);
    if (opts.showClientPhone) b.justify('WhatsApp:', os.client.phone);
    b.divider('-');
  }

  // Device details
  if (opts.showDeviceModel || opts.showDeviceColor || opts.showDeviceImei) {
    b.bold(true);
    b.line('[ APARELHO ]');
    b.bold(false);
    if (opts.showDeviceModel) b.justify('Modelo:', `${os.device.brand} ${os.device.model}`);
    if (opts.showDeviceColor) b.justify('Cor:', os.device.color || '-');
    if (opts.showDeviceImei && os.device.imei) b.justify('IMEI:', os.device.imei);
    b.divider('-');
  }

  // Security & Unlock (Critical for Bench Work)
  if (opts.showDevicePassword || opts.showIcloudStatus) {
    b.bold(true);
    b.line('[ SEGURANCA & DESBLOQUEIO ]');
    if (opts.showDevicePassword) {
      if (os.device.passcode) {
        b.justify('SENHA PIN:', `[ ${os.device.passcode} ]`);
      } else if (os.device.patternLock && os.device.patternLock.length > 0) {
        b.justify('PADRAO 3x3:', os.device.patternLock.map(p => p + 1).join(' -> '));
      } else {
        b.justify('SENHA TELA:', 'SEM SENHA / LIVRE');
      }
    }
    if (opts.showIcloudStatus) {
      b.bold(false);
      b.justify('Conta Vinculada:', os.device.icloudStatus.replace(/_/g, ' '));
    }
    b.divider('-');
  }

  // Defect
  if (opts.showReportedDefect) {
    b.bold(true);
    b.line('[ DEFEITO RECLAMADO ]');
    b.bold(false);
    b.line(os.reportedDefect);
    b.divider('-');
  }

  // Checklist
  if (opts.showChecklist) {
    b.bold(true);
    b.line('[ CHECKLIST FISICO ]');
    b.bold(false);
    const checks: string[] = [];
    if (os.initialChecklist.screenCracked) checks.push('TELA TRINCADA');
    if (os.initialChecklist.housingScratched) checks.push('CARCACA RISCADA');
    if (!os.initialChecklist.buttonsWorking) checks.push('BOTOES DEFEITO');
    if (!os.initialChecklist.chargesNormal) checks.push('NAO CARREGA');
    if (os.initialChecklist.waterDamage) checks.push('COM UMIDADE/OXIDACAO');
    if (os.initialChecklist.simTrayPresent) checks.push('GAVETA PRESENTE');
    
    if (checks.length > 0) {
      b.line(checks.join(' | '));
    } else {
      b.line('Checklist OK (sem avarias aparentes)');
    }
    b.divider('-');
  }

  // Accessories
  if (opts.showAccessories && os.accessoriesLeft && os.accessoriesLeft.length > 0) {
    b.bold(true);
    b.line('[ ACESSORIOS DEIXADOS ]');
    b.bold(false);
    b.line(os.accessoriesLeft.join(', '));
    b.divider('-');
  }

  // Budget
  if (opts.showBudget) {
    b.bold(true);
    if (os.totalAmount > 0) {
      b.justify('VALOR APROVADO:', formatBRL(os.totalAmount));
    } else {
      b.justify('VALOR:', 'SOB AVALIACAO TECNICA');
    }
    b.bold(false);
  }

  // Bench Testing Checklist & Notes Space
  if (opts.showDiagnosisSpace) {
    b.divider('-');
    b.bold(true);
    b.line('[ TESTES DE BANCADA ]');
    b.bold(false);
    b.line('( ) Teste de Display & Touch');
    b.line('( ) Consumo na Fonte de Bancada');
    b.line('( ) Conector de Carga & Dock');
    b.line('( ) Microfones & Alto-falantes');
    b.line('( ) Cameras Frontal & Traseira');
    b.feed(1);
    b.line('Laudo Tecnico: _________________');
    b.line('Assinatura Tec: ________________');
  }

  if (opts.showCustomFooter && config.customFooterNote) {
    b.feed(1);
    b.alignCenter();
    b.line(config.customFooterNote);
  }

  if (config.autoCut) {
    b.cut();
  }

  return b.build(config.paperWidth);
};

// Generate Compact Workbench Sticker (Etiqueta de Bancada para Celular)
export const generateOSWorkbenchSticker = (
  os: OrdemDeServico,
  config: ConfiguracaoImpressora
): FormattedReceipt => {
  const b = new EscPosBuilder(config.paperWidth);

  b.alignCenter();
  b.bold(true);
  b.line('*** BANCADA DE REPARO ***');
  b.doubleSize();
  b.line(os.id);
  b.normalSize();
  b.divider('=');

  b.alignLeft();
  b.bold(true);
  b.justify('CLIENTE:', os.client.name);
  b.justify('FONE:', os.client.phone);
  b.bold(false);
  b.justify('APARELHO:', `${os.device.brand} ${os.device.model}`);
  b.justify('COR:', os.device.color || '-');
  if (os.device.imei) b.justify('IMEI:', os.device.imei.slice(-8));
  
  // Security
  b.bold(true);
  if (os.device.passcode) {
    b.justify('SENHA PIN:', os.device.passcode);
  } else if (os.device.patternLock && os.device.patternLock.length > 0) {
    b.justify('DESENHO 3x3:', os.device.patternLock.map(p => p + 1).join(' -> '));
  } else {
    b.justify('SENHA:', 'SEM SENHA');
  }
  b.bold(false);
  b.divider('-');

  b.bold(true);
  b.line('DEFEITO:');
  b.bold(false);
  b.line(os.reportedDefect);

  b.divider('-');
  b.justify('ENTRADA:', formatDateTime(os.entryDate));
  if (os.expectedDate) b.justify('ENTREGA:', formatDateTime(os.expectedDate));
  b.justify('TECNICO:', os.technician || 'Geral');
  b.justify('STATUS:', os.status);

  b.feed(1);
  b.alignCenter();
  b.line(`[ RASTREIO: ${os.trackingCode} ]`);
  
  if (config.autoCut) {
    b.cut();
  }

  return b.build(config.paperWidth);
};

// Generate POS Sale Receipt (Cupom de Venda PDV)
export const generateSaleReceipt = (
  sale: VendaPDV,
  config: ConfiguracaoImpressora
): FormattedReceipt => {
  const b = new EscPosBuilder(config.paperWidth);
  const opts = config.salePrintOptions || {
    showStoreHeader: true,
    showStoreCnpj: true,
    showStorePhone: true,
    showStoreAddress: true,
    showStoreInstagram: true,
    showSaleCode: true,
    showDate: true,
    showCashierName: true,
    showClientName: true,
    showItemsList: true,
    showSubtotal: true,
    showDiscount: true,
    showTotal: true,
    showPaymentMethod: true,
    showCashReceivedAndChange: true,
    showWarrantyMessage: true,
    showCustomFooter: true,
  };

  if (config.openCashDrawerOnSale) {
    b.kickDrawer();
  }

  // Header
  if (opts.showStoreHeader) {
    b.alignCenter();
    b.bold(true);
    b.line(config.storeName || 'CELLMASTER PDV');
    b.bold(false);
    if (opts.showStoreCnpj && config.storeCnpj) b.line(`CNPJ: ${config.storeCnpj}`);
    if (opts.showStorePhone && config.storePhone) b.line(`Tel: ${config.storePhone}`);
    if (opts.showStoreAddress && config.storeAddress) b.line(config.storeAddress);
    b.divider('=');
  }

  b.alignCenter();
  b.line(`CUPOM NAO FISCAL DE VENDA`);
  if (opts.showSaleCode) {
    b.bold(true);
    b.line(`VENDA #${sale.code}`);
    b.bold(false);
  }
  if (opts.showDate) {
    b.line(`DATA: ${formatDateTime(sale.date)}`);
  }
  if (opts.showCashierName) {
    b.justify('Operador:', sale.cashierName);
  }
  if (opts.showClientName && sale.client) {
    b.justify('Cliente:', sale.client.name);
    if (sale.client.cpf) {
      b.justify('CPF:', sale.client.cpf);
    }
  }
  b.divider('-');

  // Items
  if (opts.showItemsList) {
    b.alignLeft();
    b.bold(true);
    b.line('ITEM   DESC       QTD   VL.UNIT   TOTAL');
    b.bold(false);
    b.divider('-');

    sale.items.forEach((item, index) => {
      const idx = (index + 1).toString().padStart(2, '0');
      const name = item.product.name.slice(0, 14);
      const line1 = `${idx} ${name}`;
      const line2 = `   ${item.quantity}x ${formatBRL(item.unitPrice)} = ${formatBRL(item.total)}`;
      b.line(line1);
      b.line(line2);
    });
    b.divider('-');
  }

  b.alignLeft();
  if (opts.showSubtotal) {
    b.bold(true);
    b.justify('SUBTOTAL:', formatBRL(sale.subtotal));
  }
  if (opts.showDiscount && sale.discount > 0) {
    b.justify('DESCONTO:', `- ${formatBRL(sale.discount)}`);
  }
  if (opts.showTotal) {
    b.doubleSize();
    b.justify('TOTAL:', formatBRL(sale.total));
    b.normalSize();
    b.bold(false);
  }
  b.divider('-');

  // Payment details
  if (opts.showPaymentMethod) {
    b.justify('FORMA PAGTO:', sale.paymentMethod);
  }
  if (opts.showCashReceivedAndChange && sale.cashReceived && sale.cashReceived > 0) {
    b.justify('VALOR RECEBIDO:', formatBRL(sale.cashReceived));
    if (sale.changeAmount && sale.changeAmount > 0) {
      b.justify('TROCO:', formatBRL(sale.changeAmount));
    }
  }

  b.divider('=');
  b.alignCenter();
  if (opts.showWarrantyMessage) {
    b.line('Obrigado pela preferencia!');
    b.line('Garantia de 90 dias com este cupom.');
  }
  if (opts.showStoreInstagram && config.storeInstagram) {
    b.line(`Siga: ${config.storeInstagram}`);
  }
  if (opts.showCustomFooter && config.customFooterNote) {
    b.line(config.customFooterNote);
  }

  if (config.autoCut) {
    b.cut();
  }

  return b.build(config.paperWidth);
};

// Generate Cashier Session Summary Receipt
export const generateCaixaReport = (
  caixa: CaixaSessao,
  config: ConfiguracaoImpressora
): FormattedReceipt => {
  const b = new EscPosBuilder(config.paperWidth);

  b.alignCenter();
  b.bold(true);
  b.line('FECHAMENTO DE CAIXA');
  b.line(config.storeName);
  b.bold(false);
  b.divider('=');

  b.alignLeft();
  b.justify('Abertura:', formatDateTime(caixa.openedAt));
  b.justify('Fechamento:', formatDateTime(caixa.closedAt || new Date().toISOString()));
  b.justify('Operador:', caixa.cashierName);
  b.divider('-');

  b.bold(true);
  b.line('[ RESUMO DE VALORES ]');
  b.bold(false);
  b.justify('Fundo Inicial (Abertura):', formatBRL(caixa.initialCash));
  b.justify('Suprimentos (Entradas):', formatBRL(caixa.cashAdditions));
  b.justify('Sangrias (Retiradas):', formatBRL(caixa.cashWithdrawals));
  b.divider('-');

  b.justify('Vendas em Dinheiro:', formatBRL(caixa.totalSalesCash));
  b.justify('Vendas em PIX:', formatBRL(caixa.totalSalesPix));
  b.justify('Vendas em Cartao:', formatBRL(caixa.totalSalesCard));
  b.justify('OS Recebidas em Dinheiro:', formatBRL(caixa.totalOSCash));
  b.divider('-');

  b.bold(true);
  b.justify('DINHEIRO ESPERADO EM CAIXA:', formatBRL(caixa.expectedCash));
  if (caixa.finalCash !== undefined) {
    b.justify('DINHEIRO INFORMADO:', formatBRL(caixa.finalCash));
    const diff = caixa.finalCash - caixa.expectedCash;
    b.justify('DIFERENCA:', formatBRL(diff));
  }
  b.bold(false);

  b.divider('=');
  b.alignCenter();
  b.line('Conferencia realizada.');
  b.feed(1);
  b.line('_________________________________');
  b.line('Assinatura do Responsavel');

  if (config.autoCut) {
    b.cut();
  }

  return b.build(config.paperWidth);
};

// Browser isolated iframe printing utility (Prevents double sheets and repetition)
export const printThermalReceiptBrowser = (
  text: string,
  paperWidth: '58mm' | '80mm' = '80mm',
  title = 'Comprovante CellMaster'
): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      // Remove any existing print iframe
      const oldFrame = document.getElementById('print-receipt-iframe');
      if (oldFrame) {
        oldFrame.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'print-receipt-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      iframe.style.zIndex = '-9999';
      document.body.appendChild(iframe);

      const is58mm = paperWidth === '58mm';
      const maxWidth = is58mm ? '58mm' : '80mm';
      const fontSize = is58mm ? '9.5px' : '11px';

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        window.print();
        resolve(true);
        return;
      }

      doc.open();
      doc.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      @page {
        size: ${maxWidth} auto;
        margin: 0 !important;
      }
      @media print {
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #000000 !important;
          width: ${maxWidth} !important;
          max-width: ${maxWidth} !important;
          height: auto !important;
          overflow: visible !important;
        }
      }
      body {
        margin: 0;
        padding: 2mm 3mm;
        font-family: 'Courier New', Courier, monospace;
        font-size: ${fontSize};
        line-height: 1.25;
        color: #000000;
        background: #ffffff;
        width: ${maxWidth};
        max-width: ${maxWidth};
        box-sizing: border-box;
      }
      pre {
        margin: 0;
        padding: 0;
        white-space: pre-wrap;
        word-break: break-all;
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
        color: #000000;
      }
    </style>
  </head>
  <body>
    <pre>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    <script>
      window.onload = function() {
        setTimeout(function() {
          try {
            window.focus();
            window.print();
          } catch(e) {
            console.error(e);
          }
          setTimeout(function() {
            try {
              if (window.frameElement) {
                window.parent.document.body.removeChild(window.frameElement);
              }
            } catch(e) {}
          }, 2000);
        }, 150);
      };
    </script>
  </body>
</html>`);
      doc.close();
      resolve(true);
    } catch (err) {
      console.warn('Iframe print error, falling back to window.print():', err);
      window.print();
      resolve(false);
    }
  });
};

// Tauri ESC/POS Execution Engine
export const executeEscPosPrint = async (
  receipt: FormattedReceipt,
  config: ConfiguracaoImpressora
): Promise<{ success: boolean; message: string; method: 'TAURI_PLUGIN' | 'BROWSER_FALLBACK' }> => {
  // Check if we are running in Tauri
  if (isTauriEnvironment()) {
    try {
      // Dynamic import of Tauri API to prevent compile-time breakage in web mode
      const tauri = (window as unknown as {
        __TAURI__: {
          core?: { invoke: (cmd: string, args?: unknown) => Promise<unknown> };
          invoke?: (cmd: string, args?: unknown) => Promise<unknown>;
        };
      }).__TAURI__;

      const invokeFn = tauri.core?.invoke || tauri.invoke;

      if (invokeFn) {
        // Try calling the Tauri esc-pos plugin command
        // Plugin signature convention: plugin:esc-pos|print or plugin:escpos|print
        await invokeFn('plugin:escpos|print_raw', {
          bytes: Array.from(receipt.rawBytes),
          target: config.devicePathOrIp,
          baudRate: config.baudRate,
          connection: config.connectionType,
        });

        return {
          success: true,
          message: `Impresso via Tauri ESC/POS (${config.connectionType} - ${config.devicePathOrIp})`,
          method: 'TAURI_PLUGIN',
        };
      }
    } catch (err: unknown) {
      console.warn('Tauri ESC/POS invoke error, falling back to Web Thermal mode:', err);
    }
  }

  // Fallback / Standard Web Browser Thermal Print
  try {
    await printThermalReceiptBrowser(receipt.text, config.paperWidth, 'Comprovante CellMaster');
    return {
      success: true,
      message: 'Comprovante térmico enviado para o spooler de impressão.',
      method: 'BROWSER_FALLBACK',
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: `Falha ao imprimir: ${(err as Error).message}`,
      method: 'BROWSER_FALLBACK',
    };
  }
};

// Download raw ESC/POS binary file (.bin) for testing directly on hardware
export const downloadEscPosBinary = (receipt: FormattedReceipt, filename = 'recibo_escpos.bin') => {
  const blob = new Blob([receipt.rawBytes as unknown as BlobPart], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

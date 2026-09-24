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
  const w = getLineWidth(config.paperWidth);

  // Header
  b.alignCenter();
  b.bold(true);
  b.doubleSize();
  b.line(config.storeName || 'CELLMASTER ASSISTENCIA');
  b.normalSize();
  b.bold(false);
  b.line(config.storePhone);
  if (config.storeAddress) b.line(config.storeAddress);
  if (config.storeCnpj) b.line(`CNPJ: ${config.storeCnpj}`);
  b.divider('=');

  // Title
  b.bold(true);
  b.line(`COMPROVANTE DE ENTRADA DE O.S.`);
  b.line(`NUMERO: ${os.id}`);
  b.bold(false);
  b.line(`CODIGO RASTREIO: ${os.trackingCode}`);
  b.line(`DATA: ${formatDateTime(os.entryDate)}`);
  b.divider('-');

  // Client Info
  b.alignLeft();
  b.bold(true);
  b.line('[ DADOS DO CLIENTE ]');
  b.bold(false);
  b.justify('Nome:', os.client.name);
  b.justify('Fone:', os.client.phone);
  if (os.client.cpf) b.justify('CPF:', os.client.cpf);
  b.divider('-');

  // Device Info
  b.bold(true);
  b.line('[ DADOS DO APARELHO ]');
  b.bold(false);
  b.justify('Modelo:', `${os.device.brand} ${os.device.model}`);
  b.justify('Cor:', os.device.color || 'Nao inf.');
  if (os.device.imei) b.justify('IMEI:', os.device.imei);
  if (os.device.passcode) {
    b.justify('Senha Tela:', os.device.passcode);
  } else if (os.device.patternLock && os.device.patternLock.length > 0) {
    b.justify('Padrao 3x3:', os.device.patternLock.map(p => p + 1).join('-'));
  }
  b.justify('Conta iCloud/Google:', os.device.icloudStatus.replace(/_/g, ' '));
  b.divider('-');

  // Reported Defect
  b.bold(true);
  b.line('[ DEFEITO RECLAMADO ]');
  b.bold(false);
  b.line(os.reportedDefect || 'Sem defeito relatado');
  b.divider('-');

  // Checklist of Initial Condition
  b.bold(true);
  b.line('[ ESTADO INICIAL / CHECKLIST ]');
  b.bold(false);
  const checklist = [];
  if (os.initialChecklist.screenCracked) checklist.push('Tela trincada');
  if (os.initialChecklist.housingScratched) checklist.push('Carcaca c/ riscos');
  if (!os.initialChecklist.buttonsWorking) checklist.push('Botoes c/ defeito');
  if (!os.initialChecklist.chargesNormal) checklist.push('Nao carrega');
  if (os.initialChecklist.waterDamage) checklist.push('Aparelho molhado');
  if (os.initialChecklist.simTrayPresent) checklist.push('Gaveta SIM presente');
  
  if (checklist.length > 0) {
    b.line(checklist.join(' | '));
  } else {
    b.line('Aparelho em bom estado fisico.');
  }

  if (os.accessoriesLeft && os.accessoriesLeft.length > 0) {
    b.justify('Acessorios:', os.accessoriesLeft.join(', '));
  }
  b.divider('-');

  // Forecast & Values
  if (os.expectedDate) {
    b.justify('Previsao Entrega:', formatDateTime(os.expectedDate));
  }
  b.justify('Status Atual:', os.status.replace(/_/g, ' '));
  if (os.totalAmount > 0) {
    b.bold(true);
    b.justify('Orcamento Estimado:', formatBRL(os.totalAmount));
    b.bold(false);
  } else {
    b.justify('Orcamento:', 'Sob Analise Tecnica');
  }
  b.divider('=');

  // Legal / CDC Warranty Terms
  b.alignCenter();
  b.line('RASTREIE SEU CONSERTO ONLINE:');
  b.bold(true);
  b.line(`app.cellmaster.com.br/rastreio`);
  b.line(`CODIGO: ${os.trackingCode}`);
  b.bold(false);
  b.divider('-');
  b.line('TERMO DE RESPONSABILIDADE:');
  b.line('Aparelhos nao retirados em 90');
  b.line('dias serao encaminhados para');
  b.line('descarte/venda p/ cobrir custos');
  b.line('conforme Art. 1275 do CCB.');
  b.feed(1);
  b.line('_________________________________');
  b.line('Assinatura do Cliente');
  
  if (config.customFooterNote) {
    b.feed(1);
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

  if (config.openCashDrawerOnSale) {
    b.kickDrawer();
  }

  // Header
  b.alignCenter();
  b.bold(true);
  b.line(config.storeName || 'CELLMASTER PDV');
  b.bold(false);
  if (config.storeCnpj) b.line(`CNPJ: ${config.storeCnpj}`);
  if (config.storePhone) b.line(`Tel: ${config.storePhone}`);
  b.divider('=');

  b.line(`CUPOM NAO FISCAL DE VENDA`);
  b.bold(true);
  b.line(`VENDA #${sale.code}`);
  b.bold(false);
  b.line(`DATA: ${formatDateTime(sale.date)}`);
  b.justify('Operador:', sale.cashierName);
  if (sale.client) {
    b.justify('Cliente:', sale.client.name);
  }
  b.divider('-');

  // Items
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
  b.bold(true);
  b.justify('SUBTOTAL:', formatBRL(sale.subtotal));
  if (sale.discount > 0) {
    b.justify('DESCONTO:', `- ${formatBRL(sale.discount)}`);
  }
  b.doubleSize();
  b.justify('TOTAL:', formatBRL(sale.total));
  b.normalSize();
  b.bold(false);
  b.divider('-');

  // Payment details
  b.justify('FORMA PAGTO:', sale.paymentMethod);
  if (sale.cashReceived && sale.cashReceived > 0) {
    b.justify('VALOR RECEBIDO:', formatBRL(sale.cashReceived));
    if (sale.changeAmount && sale.changeAmount > 0) {
      b.justify('TROCO:', formatBRL(sale.changeAmount));
    }
  }

  b.divider('=');
  b.alignCenter();
  b.line('Obrigado pela preferencia!');
  b.line('Garantia de 90 dias com este cupom.');
  if (config.storeInstagram) b.line(`Siga: ${config.storeInstagram}`);

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
    window.print();
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

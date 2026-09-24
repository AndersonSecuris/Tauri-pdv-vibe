import { OrdemDeServico, Cliente, ItemPDV, VendaPDV, CaixaSessao, ConfiguracaoImpressora } from '../types';

const STORAGE_KEYS = {
  ORDERS: 'cellmaster_orders_v1',
  CLIENTS: 'cellmaster_clients_v1',
  PRODUCTS: 'cellmaster_products_v1',
  SALES: 'cellmaster_sales_v1',
  CAIXA: 'cellmaster_caixa_v1',
  PRINTER: 'cellmaster_printer_config_v1',
};

export const INITIAL_CLIENTS: Cliente[] = [
  {
    id: 'cli-1',
    name: 'Carlos Eduardo Mendes',
    phone: '(11) 98765-4321',
    cpf: '321.654.987-12',
    email: 'carlos.mendes@email.com',
    address: 'Av. Paulista, 1000 - Bela Vista, SP',
    notes: 'Cliente antigo da loja, sempre indica conhecidos.',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'cli-2',
    name: 'Mariana Silveira Ramos',
    phone: '(11) 97123-8899',
    cpf: '456.789.012-34',
    email: 'mariana.ramos@email.com',
    address: 'Rua Augusta, 450 - Consolação, SP',
    notes: 'Exige peça original homologada.',
    createdAt: '2026-02-10T14:30:00Z',
  },
  {
    id: 'cli-3',
    name: 'Lucas Ferreira Santos',
    phone: '(11) 99876-5544',
    cpf: '123.456.789-00',
    email: 'lucas.santos@email.com',
    address: 'Rua Domingos de Morais, 820 - Vila Mariana, SP',
    notes: 'Trabalha com aplicativo de entrega, urgência no conserto.',
    createdAt: '2026-03-01T09:15:00Z',
  },
  {
    id: 'cli-4',
    name: 'Juliana Beatriz Costa',
    phone: '(11) 98456-1122',
    cpf: '789.012.345-67',
    email: 'juliana.costa@email.com',
    address: 'Rua Vergueiro, 1200 - Liberdade, SP',
    notes: 'Empresa corporativa, pede recibo discriminado.',
    createdAt: '2026-03-12T16:45:00Z',
  },
];

export const INITIAL_PRODUCTS: ItemPDV[] = [
  // Acessórios & Películas
  {
    id: 'prod-1',
    code: 'PEL-01',
    barcode: '78910001001',
    name: 'Película de Vidro 3D Temperada Premium',
    category: 'PELICULAS',
    price: 35.00,
    costPrice: 6.50,
    stock: 45,
    minStock: 10,
    unit: 'UN',
  },
  {
    id: 'prod-2',
    code: 'PEL-02',
    barcode: '78910001002',
    name: 'Película Cerâmica Privacidade Anti-Curioso',
    category: 'PELICULAS',
    price: 50.00,
    costPrice: 12.00,
    stock: 28,
    minStock: 8,
    unit: 'UN',
  },
  {
    id: 'prod-3',
    code: 'CAB-01',
    barcode: '78910001003',
    name: 'Cabo USB-C x Lightning 20W Reforçado 1.2m',
    category: 'CABOS',
    price: 49.90,
    costPrice: 15.00,
    stock: 32,
    minStock: 5,
    unit: 'UN',
  },
  {
    id: 'prod-4',
    code: 'CAB-02',
    barcode: '78910001004',
    name: 'Cabo Tipo-C x Tipo-C 60W Trançado',
    category: 'CABOS',
    price: 45.00,
    costPrice: 13.50,
    stock: 22,
    minStock: 5,
    unit: 'UN',
  },
  {
    id: 'prod-5',
    code: 'CAR-01',
    barcode: '78910001005',
    name: 'Fonte Carregador Turbo 20W PD Type-C Homologado',
    category: 'ACESSORIOS',
    price: 79.90,
    costPrice: 24.00,
    stock: 19,
    minStock: 5,
    unit: 'UN',
  },
  {
    id: 'prod-6',
    code: 'CAP-01',
    barcode: '78910001006',
    name: 'Capa Anti-Impacto Space Transparente Bumper',
    category: 'ACESSORIOS',
    price: 45.00,
    costPrice: 11.00,
    stock: 35,
    minStock: 10,
    unit: 'UN',
  },
  // Peças de Reparo
  {
    id: 'prod-7',
    code: 'TEL-IP13',
    barcode: '78920002001',
    name: 'Tela Display OLED iPhone 13 Original China',
    category: 'PECAS',
    price: 480.00,
    costPrice: 290.00,
    stock: 4,
    minStock: 2,
    unit: 'UN',
  },
  {
    id: 'prod-8',
    code: 'BAT-IP11',
    barcode: '78920002002',
    name: 'Bateria Gold iPhone 11 Alta Capacidade 3110mAh',
    category: 'BATERIAS',
    price: 180.00,
    costPrice: 75.00,
    stock: 6,
    minStock: 2,
    unit: 'UN',
  },
  {
    id: 'prod-9',
    code: 'CON-SAM-A14',
    barcode: '78920002003',
    name: 'Sub-placa de Carga Conector Type-C Galaxy A14 4G/5G',
    category: 'PECAS',
    price: 90.00,
    costPrice: 28.00,
    stock: 8,
    minStock: 3,
    unit: 'UN',
  },
  // Serviços de Bancada
  {
    id: 'prod-10',
    code: 'SRV-LIMPEZA',
    barcode: '78930003001',
    name: 'Desoxidação Ultrassônica e Limpeza Química',
    category: 'SERVICOS',
    price: 120.00,
    costPrice: 20.00,
    stock: 999,
    minStock: 0,
    unit: 'SV',
  },
  {
    id: 'prod-11',
    code: 'SRV-SOLDA',
    barcode: '78930003002',
    name: 'Mão de Obra Troca de Conector / Micro-solda',
    category: 'SERVICOS',
    price: 130.00,
    costPrice: 15.00,
    stock: 999,
    minStock: 0,
    unit: 'SV',
  },
  {
    id: 'prod-12',
    code: 'SRV-TELA',
    barcode: '78930003003',
    name: 'Mão de Obra Troca de Frontal / Calibração Touch',
    category: 'SERVICOS',
    price: 100.00,
    costPrice: 10.00,
    stock: 999,
    minStock: 0,
    unit: 'SV',
  },
];

export const INITIAL_ORDERS: OrdemDeServico[] = [
  {
    id: 'OS-2026-0842',
    trackingCode: 'TRK-8429',
    client: INITIAL_CLIENTS[0], // Carlos Eduardo Mendes
    device: {
      brand: 'Apple',
      model: 'iPhone 13',
      color: 'Meia-noite (Preto)',
      imei: '354890123456789',
      serialNumber: 'F17D90K4PL',
      passcode: '198402',
      patternLock: [],
      icloudStatus: 'COM_CONTA_CLIENTE',
    },
    entryDate: '2026-09-24T08:30:00Z',
    expectedDate: '2026-09-25T16:00:00Z',
    technician: 'Rafael Silveira (Bancada 1)',
    reportedDefect: 'Caiu no chão de tela, touch parou de responder na parte superior e display com listras verdes verticais.',
    initialChecklist: {
      screenCracked: true,
      housingScratched: true,
      buttonsWorking: true,
      camerasWorking: true,
      chargesNormal: true,
      speakerWorking: true,
      waterDamage: false,
      simTrayPresent: true,
    },
    accessoriesLeft: ['Capa protetora preta', 'Gaveta de chip instalada'],
    technicalDiagnosis: 'Display OLED com quebra interna da malha digitalizadora. Carcaça em bom alinhamento, Face ID testado e operante.',
    internalNotes: 'Cliente aprovou verbalmente a linha OLED Premium. Testar TrueTone após gravação de eeprom.',
    status: 'AGUARDANDO_APROVACAO',
    items: [
      {
        id: 'it-1',
        description: 'Tela Display OLED iPhone 13 Premium',
        type: 'PECA',
        quantity: 1,
        unitPrice: 480.00,
        total: 480.00,
      },
      {
        id: 'it-2',
        description: 'Mão de Obra Troca de Frontal e Calibração TrueTone',
        type: 'SERVICO',
        quantity: 1,
        unitPrice: 100.00,
        total: 100.00,
      },
    ],
    partsCost: 480.00,
    laborCost: 100.00,
    discount: 30.00,
    totalAmount: 550.00,
    paymentMethod: 'PIX',
    paymentStatus: 'PENDENTE',
    amountPaid: 0,
    warrantyDays: 90,
    warrantyTerms: 'Garantia legal de 90 dias referente a defeitos de fabricação no componente instalado. Não cobre quebras físicas posteriores ou contato com água.',
    timeline: [
      {
        id: 'ev-1',
        timestamp: '2026-09-24T08:30:00Z',
        status: 'RECEBIDO',
        note: 'Aparelho recebido na recepção com checklist e fotos de entrada registradas.',
        author: 'Atendente Beatriz',
      },
      {
        id: 'ev-2',
        timestamp: '2026-09-24T09:15:00Z',
        status: 'AGUARDANDO_APROVACAO',
        note: 'Laudo técnico concluído. Orçamento gerado no valor de R$ 550,00 e enviado para o cliente.',
        author: 'Rafael Silveira (Técnico)',
      },
    ],
  },
  {
    id: 'OS-2026-0839',
    trackingCode: 'TRK-8391',
    client: INITIAL_CLIENTS[1], // Mariana Silveira Ramos
    device: {
      brand: 'Samsung',
      model: 'Galaxy S23 Ultra',
      color: 'Verde',
      imei: '358901234567812',
      serialNumber: 'R58T3012ZZ',
      passcode: '',
      patternLock: [0, 1, 2, 5, 8], // Z pattern
      icloudStatus: 'COM_CONTA_CLIENTE',
    },
    entryDate: '2026-09-23T11:20:00Z',
    expectedDate: '2026-09-24T18:00:00Z',
    technician: 'Marcos Vinicius (Bancada 2)',
    reportedDefect: 'Mau contato no carregamento. Cabo fica solto e só carrega se ficar segurando em uma posição específica.',
    initialChecklist: {
      screenCracked: false,
      housingScratched: false,
      buttonsWorking: true,
      camerasWorking: true,
      chargesNormal: false,
      speakerWorking: true,
      waterDamage: false,
      simTrayPresent: true,
    },
    accessoriesLeft: ['Sem acessórios'],
    technicalDiagnosis: 'Conector Type-C oxidado e trilhas internas de dados danificadas. Necessária substituição da sub-placa original com antena NFC.',
    internalNotes: 'Peça original Samsung disponível no estoque.',
    status: 'APROVADO',
    items: [
      {
        id: 'it-3',
        description: 'Sub-placa Conector de Carga Original S23 Ultra',
        type: 'PECA',
        quantity: 1,
        unitPrice: 190.00,
        total: 190.00,
      },
      {
        id: 'it-4',
        description: 'Serviço de Desmontagem e Vedação Resistente a Água',
        type: 'SERVICO',
        quantity: 1,
        unitPrice: 110.00,
        total: 110.00,
      },
    ],
    partsCost: 190.00,
    laborCost: 110.00,
    discount: 0,
    totalAmount: 300.00,
    paymentMethod: 'CARTAO_CREDITO',
    paymentStatus: 'PENDENTE',
    amountPaid: 0,
    warrantyDays: 90,
    warrantyTerms: 'Garantia de 90 dias no conector de carga. A vedação recolocada não garante imersão profunda em líquidos.',
    timeline: [
      {
        id: 'ev-3',
        timestamp: '2026-09-23T11:20:00Z',
        status: 'RECEBIDO',
        note: 'Aparelho recebido para verificação de conector.',
        author: 'Atendente Beatriz',
      },
      {
        id: 'ev-4',
        timestamp: '2026-09-23T14:00:00Z',
        status: 'AGUARDANDO_APROVACAO',
        note: 'Orçamento enviado via WhatsApp.',
        author: 'Marcos Vinicius',
      },
      {
        id: 'ev-5',
        timestamp: '2026-09-23T15:10:00Z',
        status: 'APROVADO',
        note: 'Cliente aprovou o orçamento via link online de rastreio.',
        author: 'Sistema Rastreamento Web',
      },
    ],
  },
  {
    id: 'OS-2026-0835',
    trackingCode: 'TRK-8350',
    client: INITIAL_CLIENTS[2], // Lucas Ferreira Santos
    device: {
      brand: 'Xiaomi',
      model: 'Redmi Note 12',
      color: 'Azul',
      imei: '864201234567890',
      passcode: '0000',
      patternLock: [],
      icloudStatus: 'SEM_CONTA',
    },
    entryDate: '2026-09-22T10:00:00Z',
    expectedDate: '2026-09-23T17:00:00Z',
    exitDate: undefined,
    technician: 'Rafael Silveira (Bancada 1)',
    reportedDefect: 'Caiu na pia com água. Desligou imediatamente. Não liga mais e não dá sinal na fonte de alimentação.',
    initialChecklist: {
      screenCracked: false,
      housingScratched: true,
      buttonsWorking: true,
      camerasWorking: true,
      chargesNormal: false,
      speakerWorking: false,
      waterDamage: true,
      simTrayPresent: true,
    },
    accessoriesLeft: ['Capa de silicone'],
    technicalDiagnosis: 'Oxidação acentuada no setor do CI Power Management. Realizado banho ultrassônico de 40 minutos com álcool isopropílico e ressolda de capacitor SMD em curto.',
    internalNotes: 'Aparelho ressuscitado com sucesso! Câmeras e biometria 100% testadas.',
    status: 'PRONTO',
    items: [
      {
        id: 'it-5',
        description: 'Banho Químico Ultrassônico e Desoxidação de Placa',
        type: 'SERVICO',
        quantity: 1,
        unitPrice: 120.00,
        total: 120.00,
      },
      {
        id: 'it-6',
        description: 'Reparo em Micro-solda SMD (Eliminação de curto na linha primária)',
        type: 'SERVICO',
        quantity: 1,
        unitPrice: 130.00,
        total: 130.00,
      },
    ],
    partsCost: 0,
    laborCost: 250.00,
    discount: 20.00,
    totalAmount: 230.00,
    paymentMethod: 'PIX',
    paymentStatus: 'PENDENTE',
    amountPaid: 0,
    warrantyDays: 60,
    warrantyTerms: 'Garantia de 60 dias referente à desoxidação e componentes ressoldados.',
    timeline: [
      {
        id: 'ev-6',
        timestamp: '2026-09-22T10:00:00Z',
        status: 'RECEBIDO',
        note: 'Entrada com indício grave de líquido.',
        author: 'Atendente Beatriz',
      },
      {
        id: 'ev-7',
        timestamp: '2026-09-22T11:30:00Z',
        status: 'APROVADO',
        note: 'Cliente aprovou previamente limite de até R$ 250 para desoxidação.',
        author: 'Rafael Silveira',
      },
      {
        id: 'ev-8',
        timestamp: '2026-09-23T16:00:00Z',
        status: 'PRONTO',
        note: 'Testes de bancada finalizados. Aparelho pronto na prateleira P-03.',
        author: 'Rafael Silveira',
      },
    ],
  },
  {
    id: 'OS-2026-0810',
    trackingCode: 'TRK-8105',
    client: INITIAL_CLIENTS[0], // Carlos Eduardo Mendes (Histórico anterior)
    device: {
      brand: 'Apple',
      model: 'iPhone 11',
      color: 'Branco',
      imei: '359998877665544',
      passcode: '198402',
      icloudStatus: 'COM_CONTA_CLIENTE',
    },
    entryDate: '2026-08-10T14:00:00Z',
    expectedDate: '2026-08-11T12:00:00Z',
    exitDate: '2026-08-11T14:30:00Z',
    technician: 'Marcos Vinicius',
    reportedDefect: 'Bateria descarrega muito rápido, saúde em 74% nas configurações do iOS.',
    initialChecklist: {
      screenCracked: false,
      housingScratched: true,
      buttonsWorking: true,
      camerasWorking: true,
      chargesNormal: true,
      speakerWorking: true,
      waterDamage: false,
      simTrayPresent: true,
    },
    accessoriesLeft: [],
    technicalDiagnosis: 'Bateria em ciclo final de vida útil (840 ciclos). Efetuada troca por bateria homologada com tag original.',
    status: 'ENTREGUE',
    items: [
      {
        id: 'it-7',
        description: 'Bateria Gold iPhone 11 Homologada',
        type: 'PECA',
        quantity: 1,
        unitPrice: 180.00,
        total: 180.00,
      },
      {
        id: 'it-8',
        description: 'Mão de Obra e Calibração de Bateria',
        type: 'SERVICO',
        quantity: 1,
        unitPrice: 70.00,
        total: 70.00,
      },
    ],
    partsCost: 180.00,
    laborCost: 70.00,
    discount: 0,
    totalAmount: 250.00,
    paymentMethod: 'PIX',
    paymentStatus: 'PAGO',
    amountPaid: 250.00,
    warrantyDays: 90,
    warrantyTerms: 'Garantia de 90 dias contra estufamento ou perda precoce de carga.',
    timeline: [
      {
        id: 'ev-9',
        timestamp: '2026-08-10T14:00:00Z',
        status: 'RECEBIDO',
        note: 'Entrada para troca de bateria.',
        author: 'Recepção',
      },
      {
        id: 'ev-10',
        timestamp: '2026-08-11T11:00:00Z',
        status: 'PRONTO',
        note: 'Serviço concluído.',
        author: 'Marcos Vinicius',
      },
      {
        id: 'ev-11',
        timestamp: '2026-08-11T14:30:00Z',
        status: 'ENTREGUE',
        note: 'Entregue ao cliente Carlos com cupom de garantia impresso.',
        author: 'Beatriz',
      },
    ],
  },
  {
    id: 'OS-2026-0801',
    trackingCode: 'TRK-8012',
    client: INITIAL_CLIENTS[3], // Juliana Beatriz Costa
    device: {
      brand: 'Motorola',
      model: 'Moto G84 5G',
      color: 'Grafite',
      imei: '354112233445566',
      passcode: '4321',
      icloudStatus: 'SEM_CONTA',
    },
    entryDate: '2026-08-01T09:30:00Z',
    expectedDate: '2026-08-02T16:00:00Z',
    exitDate: '2026-08-02T17:00:00Z',
    technician: 'Rafael Silveira',
    reportedDefect: 'Alto-falante auricular chiando e som muito baixo durante ligações normais.',
    initialChecklist: {
      screenCracked: false,
      housingScratched: false,
      buttonsWorking: true,
      camerasWorking: true,
      chargesNormal: true,
      speakerWorking: false,
      waterDamage: false,
      simTrayPresent: true,
    },
    accessoriesLeft: [],
    technicalDiagnosis: 'Grade acústica entupida por sujeira e alto-falante auricular danificado. Efetuada limpeza ultrassônica da tela e substituição da cápsula de áudio.',
    status: 'ENTREGUE',
    items: [
      {
        id: 'it-9',
        description: 'Cápsula Alto-Falante Auricular Moto G84',
        type: 'PECA',
        quantity: 1,
        unitPrice: 65.00,
        total: 65.00,
      },
      {
        id: 'it-10',
        description: 'Serviço de Limpeza e Desobstrução de Grelha',
        type: 'SERVICO',
        quantity: 1,
        unitPrice: 55.00,
        total: 55.00,
      },
    ],
    partsCost: 65.00,
    laborCost: 55.00,
    discount: 0,
    totalAmount: 120.00,
    paymentMethod: 'CARTAO_DEBITO',
    paymentStatus: 'PAGO',
    amountPaid: 120.00,
    warrantyDays: 90,
    warrantyTerms: 'Garantia de 90 dias no alto falante.',
    timeline: [
      {
        id: 'ev-12',
        timestamp: '2026-08-01T09:30:00Z',
        status: 'RECEBIDO',
        note: 'Recebido na loja.',
        author: 'Recepção',
      },
      {
        id: 'ev-13',
        timestamp: '2026-08-02T17:00:00Z',
        status: 'ENTREGUE',
        note: 'Retirado por Juliana.',
        author: 'Beatriz',
      },
    ],
  },
];

export const INITIAL_PRINTER_CONFIG: ConfiguracaoImpressora = {
  driver: 'ESC_POS_TAURI',
  paperWidth: '80mm',
  connectionType: 'USB',
  devicePathOrIp: 'USB001 (POS-80)',
  port: 9100,
  baudRate: 115200,
  autoCut: true,
  openCashDrawerOnSale: true,
  printWorkbenchSticker: true,
  copiesCount: 1,
  storeName: 'CELLMASTER ASSISTÊNCIA TÉCNICA',
  storeCnpj: '48.912.345/0001-90',
  storePhone: '(11) 98765-0000 / (11) 3200-4000',
  storeAddress: 'Rua Santa Ifigênia, 420 - Centro, São Paulo - SP',
  storeInstagram: '@cellmaster.tecnica',
  customHeaderNote: 'Especialistas em Apple, Samsung, Xiaomi e Motorola',
  customFooterNote: 'Consulte o status do seu conserto em tempo real!',
};

export const INITIAL_CAIXA: CaixaSessao = {
  id: 'CX-2026-0924-1',
  openedAt: '2026-09-24T08:00:00Z',
  initialCash: 200.00,
  cashWithdrawals: 0,
  cashAdditions: 50.00,
  totalSalesCash: 125.00,
  totalSalesPix: 210.00,
  totalSalesCard: 180.00,
  totalOSCash: 150.00,
  expectedCash: 525.00, // 200 + 50 + 125 + 150 = 525
  status: 'ABERTO',
  cashierName: 'Beatriz Almeida (Caixa 01)',
  movements: [
    {
      id: 'mov-1',
      timestamp: '2026-09-24T08:00:00Z',
      type: 'ABERTURA',
      amount: 200.00,
      reason: 'Fundo de troco inicial do dia',
      author: 'Beatriz Almeida',
    },
    {
      id: 'mov-2',
      timestamp: '2026-09-24T08:45:00Z',
      type: 'SUPRIMENTO',
      amount: 50.00,
      reason: 'Reforço de moedas e cédulas miúdas',
      author: 'Gerente Carlos',
    },
  ],
};

// Storage helper functions
export const getStoredOrders = (): OrdemDeServico[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : INITIAL_ORDERS;
  } catch {
    return INITIAL_ORDERS;
  }
};

export const saveStoredOrders = (orders: OrdemDeServico[]) => {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

export const getStoredClients = (): Cliente[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return raw ? JSON.parse(raw) : INITIAL_CLIENTS;
  } catch {
    return INITIAL_CLIENTS;
  }
};

export const saveStoredClients = (clients: Cliente[]) => {
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

export const getStoredProducts = (): ItemPDV[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
};

export const saveStoredProducts = (products: ItemPDV[]) => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const getStoredPrinterConfig = (): ConfiguracaoImpressora => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRINTER);
    return raw ? JSON.parse(raw) : INITIAL_PRINTER_CONFIG;
  } catch {
    return INITIAL_PRINTER_CONFIG;
  }
};

export const saveStoredPrinterConfig = (config: ConfiguracaoImpressora) => {
  localStorage.setItem(STORAGE_KEYS.PRINTER, JSON.stringify(config));
};

export const getStoredCaixa = (): CaixaSessao => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CAIXA);
    return raw ? JSON.parse(raw) : INITIAL_CAIXA;
  } catch {
    return INITIAL_CAIXA;
  }
};

export const saveStoredCaixa = (caixa: CaixaSessao) => {
  localStorage.setItem(STORAGE_KEYS.CAIXA, JSON.stringify(caixa));
};

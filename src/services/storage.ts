import {
  OrdemDeServico,
  Cliente,
  ItemPDV,
  VendaPDV,
  CaixaSessao,
  ConfiguracaoImpressora,
  OSConfigOptions,
  PrintOSOptions,
  PrintSaleOptions,
  PrintTechOSOptions,
  CellMasterBackupData,
  BackupSnapshotItem,
} from '../types';

const STORAGE_KEYS = {
  ORDERS: 'cellmaster_orders_v1',
  CLIENTS: 'cellmaster_clients_v1',
  PRODUCTS: 'cellmaster_products_v1',
  SALES: 'cellmaster_sales_v1',
  CAIXA: 'cellmaster_caixa_v1',
  PRINTER: 'cellmaster_printer_config_v1',
  OS_CONFIG: 'cellmaster_os_config_v1',
  BACKUP_SNAPSHOTS: 'cellmaster_backup_snapshots_v1',
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
    controlStock: true,
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
    controlStock: true,
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
    controlStock: true,
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
    controlStock: true,
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
    controlStock: true,
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
    controlStock: true,
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
    controlStock: true,
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
    controlStock: true,
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
    controlStock: true,
  },
  // Serviços de Bancada (sem controle de estoque)
  {
    id: 'prod-10',
    code: 'SRV-LIMPEZA',
    barcode: '78930003001',
    name: 'Desoxidação Ultrassônica e Limpeza Química',
    category: 'SERVICOS',
    price: 120.00,
    costPrice: 20.00,
    stock: 0,
    minStock: 0,
    unit: 'SV',
    controlStock: false,
  },
  {
    id: 'prod-11',
    code: 'SRV-SOLDA',
    barcode: '78930003002',
    name: 'Mão de Obra Troca de Conector / Micro-solda',
    category: 'SERVICOS',
    price: 130.00,
    costPrice: 15.00,
    stock: 0,
    minStock: 0,
    unit: 'SV',
    controlStock: false,
  },
  {
    id: 'prod-12',
    code: 'SRV-TELA',
    barcode: '78930003003',
    name: 'Mão de Obra Troca de Frontal / Calibração Touch',
    category: 'SERVICOS',
    price: 100.00,
    costPrice: 10.00,
    stock: 0,
    minStock: 0,
    unit: 'SV',
    controlStock: false,
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
  {
    id: 'OS-2026-0830',
    trackingCode: 'TRK-8302',
    client: INITIAL_CLIENTS[1],
    device: {
      brand: 'Samsung',
      model: 'Galaxy A54 5G',
      color: 'Preto',
      imei: '358129034567890',
      passcode: '2580',
      patternLock: [],
      icloudStatus: 'SEM_CONTA',
    },
    entryDate: '2026-09-21T09:00:00Z',
    expectedDate: '2026-09-22T15:00:00Z',
    exitDate: '2026-09-22T16:20:00Z',
    technician: 'Rafael Silveira (Bancada 1)',
    reportedDefect: 'Display trincado após queda de bicicleta. Touch fantasma acionando sozinho.',
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
    accessoriesLeft: ['Capa de proteção'],
    technicalDiagnosis: 'Módulo frontal AMOLED danificado. Troca completa com aro.',
    status: 'ENTREGUE',
    items: [
      {
        id: 'it-a54-1',
        description: 'Frontal AMOLED Samsung Galaxy A54 Original com Aro',
        type: 'PECA',
        quantity: 1,
        unitPrice: 380.00,
        total: 380.00,
      },
      {
        id: 'it-a54-2',
        description: 'Serviço de Instalação e Testes de Biometria',
        type: 'SERVICO',
        quantity: 1,
        unitPrice: 90.00,
        total: 90.00,
      },
    ],
    partsCost: 380.00,
    laborCost: 90.00,
    discount: 20.00,
    totalAmount: 450.00,
    paymentMethod: 'PIX',
    paymentStatus: 'PAGO',
    amountPaid: 450.00,
    warrantyDays: 90,
    warrantyTerms: 'Garantia de 90 dias na tela contra defeitos de fabricação.',
    timeline: [
      {
        id: 'ev-a54-1',
        timestamp: '2026-09-21T09:00:00Z',
        status: 'RECEBIDO',
        note: 'Recebido para troca de tela.',
        author: 'Recepção',
      },
      {
        id: 'ev-a54-2',
        timestamp: '2026-09-22T16:20:00Z',
        status: 'ENTREGUE',
        note: 'Retirado pelo cliente. Testado na bancada.',
        author: 'Rafael Silveira',
      },
    ],
  },
  {
    id: 'OS-2026-0824',
    trackingCode: 'TRK-8241',
    client: INITIAL_CLIENTS[2],
    device: {
      brand: 'Apple',
      model: 'iPhone 12',
      color: 'Azul Pacífico',
      imei: '357980123456711',
      passcode: '0852',
      patternLock: [],
      icloudStatus: 'COM_CONTA_CLIENTE',
    },
    entryDate: '2026-09-20T14:15:00Z',
    expectedDate: '2026-09-21T18:00:00Z',
    exitDate: '2026-09-21T17:30:00Z',
    technician: 'Marcos Vinicius (Bancada 2)',
    reportedDefect: 'Bateria estufou levemente levantando a lateral esquerda da tela.',
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
    technicalDiagnosis: 'Bateria estufada por sobretensão. Descarte seguro e substituição por bateria de alta densidade.',
    status: 'ENTREGUE',
    items: [
      {
        id: 'it-ip12-1',
        description: 'Bateria Premium iPhone 12 Alta Densidade Homologada',
        type: 'PECA',
        quantity: 1,
        unitPrice: 220.00,
        total: 220.00,
      },
      {
        id: 'it-ip12-2',
        description: 'Mão de Obra e Vedação de Carcaça',
        type: 'SERVICO',
        quantity: 1,
        unitPrice: 80.00,
        total: 80.00,
      },
    ],
    partsCost: 220.00,
    laborCost: 80.00,
    discount: 0,
    totalAmount: 300.00,
    paymentMethod: 'CARTAO_CREDITO',
    paymentStatus: 'PAGO',
    amountPaid: 300.00,
    warrantyDays: 90,
    warrantyTerms: 'Garantia de 90 dias na bateria.',
    timeline: [
      {
        id: 'ev-ip12-1',
        timestamp: '2026-09-20T14:15:00Z',
        status: 'RECEBIDO',
        note: 'Entrada urgente devido a bateria estufada.',
        author: 'Recepção',
      },
      {
        id: 'ev-ip12-2',
        timestamp: '2026-09-21T17:30:00Z',
        status: 'ENTREGUE',
        note: 'Aparelho alinhado e entregue.',
        author: 'Marcos Vinicius',
      },
    ],
  },
  {
    id: 'OS-2026-0818',
    trackingCode: 'TRK-8180',
    client: INITIAL_CLIENTS[3],
    device: {
      brand: 'Xiaomi',
      model: 'Redmi Note 13 Pro',
      color: 'Verde Floresta',
      imei: '861234567890123',
      passcode: '9988',
      patternLock: [],
      icloudStatus: 'SEM_CONTA',
    },
    entryDate: '2026-09-18T10:30:00Z',
    expectedDate: '2026-09-19T17:00:00Z',
    exitDate: '2026-09-19T16:00:00Z',
    technician: 'Rafael Silveira (Bancada 1)',
    reportedDefect: 'Vidro traseiro trincado após impacto. Câmera traseira funcionando normalmente.',
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
    accessoriesLeft: ['Capa de silicone'],
    technicalDiagnosis: 'Tampa traseira trincada. Remoção a laser e aplicação de tampa original com cola B-7000.',
    status: 'ENTREGUE',
    items: [
      {
        id: 'it-rn13-1',
        description: 'Tampa Traseira Vidro Redmi Note 13 Pro Original',
        type: 'PECA',
        quantity: 1,
        unitPrice: 140.00,
        total: 140.00,
      },
      {
        id: 'it-rn13-2',
        description: 'Serviço de Remoção e Colagem Especializada',
        type: 'SERVICO',
        quantity: 1,
        unitPrice: 80.00,
        total: 80.00,
      },
    ],
    partsCost: 140.00,
    laborCost: 80.00,
    discount: 0,
    totalAmount: 220.00,
    paymentMethod: 'PIX',
    paymentStatus: 'PAGO',
    amountPaid: 220.00,
    warrantyDays: 60,
    warrantyTerms: 'Garantia de 60 dias referente à colagem.',
    timeline: [
      {
        id: 'ev-rn13-1',
        timestamp: '2026-09-18T10:30:00Z',
        status: 'RECEBIDO',
        note: 'Entrada para troca de vidro traseiro.',
        author: 'Recepção',
      },
    ],
  },
  {
    id: 'OS-2026-0812',
    trackingCode: 'TRK-8122',
    client: INITIAL_CLIENTS[0],
    device: {
      brand: 'Motorola',
      model: 'Moto G54 5G',
      color: 'Azul',
      imei: '356789012345678',
      passcode: '1234',
      patternLock: [],
      icloudStatus: 'SEM_CONTA',
    },
    entryDate: '2026-09-15T11:00:00Z',
    expectedDate: '2026-09-16T16:00:00Z',
    exitDate: '2026-09-16T15:30:00Z',
    technician: 'Marcos Vinicius (Bancada 2)',
    reportedDefect: 'Não dá sinal de rede celular após queda (Sem serviço).',
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
    technicalDiagnosis: 'Antena coaxial rompida e cabo flat de RF desencaixado.',
    status: 'ENTREGUE',
    items: [
      {
        id: 'it-g54-1',
        description: 'Cabo Coaxial RF Antena Moto G54',
        type: 'PECA',
        quantity: 1,
        unitPrice: 50.00,
        total: 50.00,
      },
      {
        id: 'it-g54-2',
        description: 'Serviço de Diagnóstico de Sinal e Reparo de Antena',
        type: 'SERVICO',
        quantity: 1,
        unitPrice: 110.00,
        total: 110.00,
      },
    ],
    partsCost: 50.00,
    laborCost: 110.00,
    discount: 10.00,
    totalAmount: 150.00,
    paymentMethod: 'DINHEIRO',
    paymentStatus: 'PAGO',
    amountPaid: 150.00,
    warrantyDays: 90,
    warrantyTerms: 'Garantia de 90 dias na antena.',
    timeline: [
      {
        id: 'ev-g54-1',
        timestamp: '2026-09-15T11:00:00Z',
        status: 'RECEBIDO',
        note: 'Sem sinal de operadora.',
        author: 'Recepção',
      },
    ],
  },
  // Histórico meses anteriores de 2026
  {
    id: 'OS-2026-0775',
    trackingCode: 'TRK-7751',
    client: INITIAL_CLIENTS[1],
    device: {
      brand: 'Apple',
      model: 'iPhone 14 Pro',
      color: 'Roxo Profundo',
      imei: '351234567890123',
      passcode: '9090',
      patternLock: [],
      icloudStatus: 'COM_CONTA_CLIENTE',
    },
    entryDate: '2026-07-22T10:00:00Z',
    exitDate: '2026-07-23T16:00:00Z',
    technician: 'Rafael Silveira',
    reportedDefect: 'Câmera principal tremendo e fazendo barulho de clique (estabilizador óptico OIS danificado).',
    initialChecklist: {
      screenCracked: false,
      housingScratched: false,
      buttonsWorking: true,
      camerasWorking: false,
      chargesNormal: true,
      speakerWorking: true,
      waterDamage: false,
      simTrayPresent: true,
    },
    accessoriesLeft: [],
    technicalDiagnosis: 'Módulo de câmera traseira 48MP com bobina OIS queimada após vibração forte no suporte de moto.',
    status: 'ENTREGUE',
    items: [
      {
        id: 'it-cam-14',
        description: 'Módulo Câmera Traseira 48MP iPhone 14 Pro Original Apple',
        type: 'PECA',
        quantity: 1,
        unitPrice: 650.00,
        total: 650.00,
      },
      {
        id: 'it-cam-srv',
        description: 'Mão de Obra e Calibração de Foco',
        type: 'SERVICO',
        quantity: 1,
        unitPrice: 150.00,
        total: 150.00,
      },
    ],
    partsCost: 650.00,
    laborCost: 150.00,
    discount: 50.00,
    totalAmount: 750.00,
    paymentMethod: 'CARTAO_CREDITO',
    paymentStatus: 'PAGO',
    amountPaid: 750.00,
    warrantyDays: 90,
    warrantyTerms: 'Garantia de 90 dias na câmera.',
    timeline: [],
  },
  {
    id: 'OS-2026-0720',
    trackingCode: 'TRK-7201',
    client: INITIAL_CLIENTS[2],
    device: {
      brand: 'Samsung',
      model: 'Galaxy S22',
      color: 'Branco',
      imei: '354567890123456',
      passcode: '1122',
      patternLock: [],
      icloudStatus: 'SEM_CONTA',
    },
    entryDate: '2026-06-19T14:00:00Z',
    exitDate: '2026-06-20T17:00:00Z',
    technician: 'Marcos Vinicius',
    reportedDefect: 'Conector de carga esquentando muito e não carregando.',
    initialChecklist: {
      screenCracked: false,
      housingScratched: true,
      buttonsWorking: true,
      camerasWorking: true,
      chargesNormal: false,
      speakerWorking: true,
      waterDamage: false,
      simTrayPresent: true,
    },
    accessoriesLeft: [],
    technicalDiagnosis: 'Troca da placa do conector Type-C original.',
    status: 'ENTREGUE',
    items: [
      {
        id: 'it-s22-con',
        description: 'Placa Conector Type-C S22 Original',
        type: 'PECA',
        quantity: 1,
        unitPrice: 160.00,
        total: 160.00,
      },
      {
        id: 'it-s22-srv',
        description: 'Mão de Obra Especializada',
        type: 'SERVICO',
        quantity: 1,
        unitPrice: 90.00,
        total: 90.00,
      },
    ],
    partsCost: 160.00,
    laborCost: 90.00,
    discount: 0,
    totalAmount: 250.00,
    paymentMethod: 'PIX',
    paymentStatus: 'PAGO',
    amountPaid: 250.00,
    warrantyDays: 90,
    warrantyTerms: 'Garantia de 90 dias.',
    timeline: [],
  },
  {
    id: 'OS-2026-0650',
    trackingCode: 'TRK-6502',
    client: INITIAL_CLIENTS[3],
    device: {
      brand: 'Apple',
      model: 'iPhone 13',
      color: 'Estelar',
      imei: '359876543210987',
      passcode: '3344',
      patternLock: [],
      icloudStatus: 'COM_CONTA_CLIENTE',
    },
    entryDate: '2026-05-25T11:00:00Z',
    exitDate: '2026-05-26T16:00:00Z',
    technician: 'Rafael Silveira',
    reportedDefect: 'Troca de frontal OLED trincada.',
    initialChecklist: {
      screenCracked: true,
      housingScratched: false,
      buttonsWorking: true,
      camerasWorking: true,
      chargesNormal: true,
      speakerWorking: true,
      waterDamage: false,
      simTrayPresent: true,
    },
    accessoriesLeft: [],
    technicalDiagnosis: 'Substituição frontal OLED.',
    status: 'ENTREGUE',
    items: [
      {
        id: 'it-ip13-may',
        description: 'Tela Display OLED iPhone 13 Premium',
        type: 'PECA',
        quantity: 1,
        unitPrice: 480.00,
        total: 480.00,
      },
      {
        id: 'it-ip13-srv',
        description: 'Mão de Obra e Calibração TrueTone',
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
    paymentMethod: 'CARTAO_CREDITO',
    paymentStatus: 'PAGO',
    amountPaid: 550.00,
    warrantyDays: 90,
    warrantyTerms: 'Garantia de 90 dias.',
    timeline: [],
  },
  {
    id: 'OS-2026-0580',
    trackingCode: 'TRK-5801',
    client: INITIAL_CLIENTS[0],
    device: {
      brand: 'Motorola',
      model: 'Moto G84 5G',
      color: 'Azul',
      imei: '351239874561234',
      passcode: '5678',
      patternLock: [],
      icloudStatus: 'SEM_CONTA',
    },
    entryDate: '2026-04-18T10:30:00Z',
    exitDate: '2026-04-19T14:30:00Z',
    technician: 'Marcos Vinicius',
    reportedDefect: 'Troca de tela frontal.',
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
    accessoriesLeft: [],
    technicalDiagnosis: 'Frontal Moto G84 substituída.',
    status: 'ENTREGUE',
    items: [
      {
        id: 'it-g84-apr',
        description: 'Frontal Moto G84 OLED Original',
        type: 'PECA',
        quantity: 1,
        unitPrice: 280.00,
        total: 280.00,
      },
      {
        id: 'it-g84-srv',
        description: 'Mão de Obra de Instalação',
        type: 'SERVICO',
        quantity: 1,
        unitPrice: 80.00,
        total: 80.00,
      },
    ],
    partsCost: 280.00,
    laborCost: 80.00,
    discount: 10.00,
    totalAmount: 350.00,
    paymentMethod: 'PIX',
    paymentStatus: 'PAGO',
    amountPaid: 350.00,
    warrantyDays: 90,
    warrantyTerms: 'Garantia de 90 dias.',
    timeline: [],
  },
  {
    id: 'OS-2026-0410',
    trackingCode: 'TRK-4109',
    client: INITIAL_CLIENTS[1],
    device: {
      brand: 'Apple',
      model: 'iPhone 11',
      color: 'Preto',
      imei: '357890123456789',
      passcode: '0000',
      patternLock: [],
      icloudStatus: 'COM_CONTA_CLIENTE',
    },
    entryDate: '2026-03-20T15:00:00Z',
    exitDate: '2026-03-21T18:00:00Z',
    technician: 'Rafael Silveira',
    reportedDefect: 'Troca de tela e bateria.',
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
    accessoriesLeft: [],
    technicalDiagnosis: 'Substituição conjunta tela LCD Incell + bateria nova.',
    status: 'ENTREGUE',
    items: [
      {
        id: 'it-ip11-tela',
        description: 'Tela Frontal iPhone 11 Incell FHD',
        type: 'PECA',
        quantity: 1,
        unitPrice: 240.00,
        total: 240.00,
      },
      {
        id: 'it-ip11-bat',
        description: 'Bateria Gold iPhone 11 Homologada',
        type: 'PECA',
        quantity: 1,
        unitPrice: 180.00,
        total: 180.00,
      },
      {
        id: 'it-ip11-combo-srv',
        description: 'Mão de Obra Combo Tela + Bateria',
        type: 'SERVICO',
        quantity: 1,
        unitPrice: 120.00,
        total: 120.00,
      },
    ],
    partsCost: 420.00,
    laborCost: 120.00,
    discount: 40.00,
    totalAmount: 500.00,
    paymentMethod: 'CARTAO_CREDITO',
    paymentStatus: 'PAGO',
    amountPaid: 500.00,
    warrantyDays: 90,
    warrantyTerms: 'Garantia de 90 dias.',
    timeline: [],
  },
  {
    id: 'OS-2026-0305',
    trackingCode: 'TRK-3051',
    client: INITIAL_CLIENTS[2],
    device: {
      brand: 'Xiaomi',
      model: 'Redmi Note 12',
      color: 'Cinza',
      imei: '861122334455667',
      passcode: '1212',
      patternLock: [],
      icloudStatus: 'SEM_CONTA',
    },
    entryDate: '2026-02-14T11:00:00Z',
    exitDate: '2026-02-15T16:00:00Z',
    technician: 'Marcos Vinicius',
    reportedDefect: 'Conector de carga com mau contato.',
    initialChecklist: {
      screenCracked: false,
      housingScratched: true,
      buttonsWorking: true,
      camerasWorking: true,
      chargesNormal: false,
      speakerWorking: true,
      waterDamage: false,
      simTrayPresent: true,
    },
    accessoriesLeft: [],
    technicalDiagnosis: 'Sub-placa conector substituída.',
    status: 'ENTREGUE',
    items: [
      {
        id: 'it-rn12-sub',
        description: 'Sub-placa Carga Redmi Note 12',
        type: 'PECA',
        quantity: 1,
        unitPrice: 75.00,
        total: 75.00,
      },
      {
        id: 'it-rn12-srv',
        description: 'Mão de Obra de Troca',
        type: 'SERVICO',
        quantity: 1,
        unitPrice: 65.00,
        total: 65.00,
      },
    ],
    partsCost: 75.00,
    laborCost: 65.00,
    discount: 0,
    totalAmount: 140.00,
    paymentMethod: 'PIX',
    paymentStatus: 'PAGO',
    amountPaid: 140.00,
    warrantyDays: 90,
    warrantyTerms: 'Garantia de 90 dias.',
    timeline: [],
  },
  {
    id: 'OS-2026-0180',
    trackingCode: 'TRK-1804',
    client: INITIAL_CLIENTS[3],
    device: {
      brand: 'Apple',
      model: 'iPhone XR',
      color: 'Coral',
      imei: '359012345678901',
      passcode: '7788',
      patternLock: [],
      icloudStatus: 'COM_CONTA_CLIENTE',
    },
    entryDate: '2026-01-22T09:30:00Z',
    exitDate: '2026-01-23T15:00:00Z',
    technician: 'Rafael Silveira',
    reportedDefect: 'Bateria descarrega muito rápido.',
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
    technicalDiagnosis: 'Substituição de bateria XR.',
    status: 'ENTREGUE',
    items: [
      {
        id: 'it-xr-bat',
        description: 'Bateria Gold iPhone XR 2942mAh',
        type: 'PECA',
        quantity: 1,
        unitPrice: 170.00,
        total: 170.00,
      },
      {
        id: 'it-xr-srv',
        description: 'Mão de Obra Troca de Bateria',
        type: 'SERVICO',
        quantity: 1,
        unitPrice: 70.00,
        total: 70.00,
      },
    ],
    partsCost: 170.00,
    laborCost: 70.00,
    discount: 0,
    totalAmount: 240.00,
    paymentMethod: 'CARTAO_DEBITO',
    paymentStatus: 'PAGO',
    amountPaid: 240.00,
    warrantyDays: 90,
    warrantyTerms: 'Garantia de 90 dias.',
    timeline: [],
  },
];

export const INITIAL_SALES: VendaPDV[] = [
  // 24 de Setembro de 2026 (Hoje)
  {
    id: 'sale-2026-0924-1',
    code: 'V-2026-0924-1',
    date: '2026-09-24T09:15:00Z',
    client: INITIAL_CLIENTS[0],
    cashierName: 'Beatriz Almeida (Caixa 01)',
    status: 'CONCLUIDA',
    paymentMethod: 'PIX',
    subtotal: 129.90,
    discount: 9.90,
    total: 120.00,
    items: [
      {
        product: INITIAL_PRODUCTS[0], // Película 3D
        quantity: 2,
        unitPrice: 35.00,
        total: 70.00,
      },
      {
        product: INITIAL_PRODUCTS[2], // Cabo USB-C Lightning
        quantity: 1,
        unitPrice: 49.90,
        total: 49.90,
      },
    ],
  },
  {
    id: 'sale-2026-0924-2',
    code: 'V-2026-0924-2',
    date: '2026-09-24T11:40:00Z',
    cashierName: 'Beatriz Almeida (Caixa 01)',
    status: 'CONCLUIDA',
    paymentMethod: 'DINHEIRO',
    subtotal: 124.90,
    discount: 0,
    total: 124.90,
    cashReceived: 130.00,
    changeAmount: 5.10,
    items: [
      {
        product: INITIAL_PRODUCTS[4], // Fonte 20W PD
        quantity: 1,
        unitPrice: 79.90,
        total: 79.90,
      },
      {
        product: INITIAL_PRODUCTS[5], // Capa Anti-Impacto
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00,
      },
    ],
  },
  {
    id: 'sale-2026-0924-3',
    code: 'V-2026-0924-3',
    date: '2026-09-24T14:20:00Z',
    cashierName: 'Beatriz Almeida (Caixa 01)',
    status: 'CONCLUIDA',
    paymentMethod: 'CARTAO_CREDITO',
    subtotal: 180.00,
    discount: 10.00,
    total: 170.00,
    items: [
      {
        product: INITIAL_PRODUCTS[7], // Bateria Gold iPhone 11 avulsa
        quantity: 1,
        unitPrice: 180.00,
        total: 180.00,
      },
    ],
  },

  // 23 de Setembro de 2026
  {
    id: 'sale-2026-0923-1',
    code: 'V-2026-0923-1',
    date: '2026-09-23T10:10:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'PIX',
    subtotal: 95.00,
    discount: 5.00,
    total: 90.00,
    items: [
      {
        product: INITIAL_PRODUCTS[1], // Película Cerâmica
        quantity: 1,
        unitPrice: 50.00,
        total: 50.00,
      },
      {
        product: INITIAL_PRODUCTS[5], // Capa
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00,
      },
    ],
  },
  {
    id: 'sale-2026-0923-2',
    code: 'V-2026-0923-2',
    date: '2026-09-23T13:30:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'CARTAO_DEBITO',
    subtotal: 124.90,
    discount: 0,
    total: 124.90,
    items: [
      {
        product: INITIAL_PRODUCTS[4], // Fonte 20W
        quantity: 1,
        unitPrice: 79.90,
        total: 79.90,
      },
      {
        product: INITIAL_PRODUCTS[3], // Cabo Type-C x Type-C
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00,
      },
    ],
  },
  {
    id: 'sale-2026-0923-3',
    code: 'V-2026-0923-3',
    date: '2026-09-23T16:45:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'DINHEIRO',
    subtotal: 70.00,
    discount: 0,
    total: 70.00,
    items: [
      {
        product: INITIAL_PRODUCTS[0], // Película 3D
        quantity: 2,
        unitPrice: 35.00,
        total: 70.00,
      },
    ],
  },

  // 22 de Setembro de 2026
  {
    id: 'sale-2026-0922-1',
    code: 'V-2026-0922-1',
    date: '2026-09-22T09:40:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'PIX',
    subtotal: 135.00,
    discount: 15.00,
    total: 120.00,
    items: [
      {
        product: INITIAL_PRODUCTS[1], // Película Cerâmica
        quantity: 1,
        unitPrice: 50.00,
        total: 50.00,
      },
      {
        product: INITIAL_PRODUCTS[5], // Capa
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00,
      },
      {
        product: INITIAL_PRODUCTS[3], // Cabo
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00,
      },
    ],
  },
  {
    id: 'sale-2026-0922-2',
    code: 'V-2026-0922-2',
    date: '2026-09-22T14:10:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'CARTAO_CREDITO',
    subtotal: 159.80,
    discount: 0,
    total: 159.80,
    items: [
      {
        product: INITIAL_PRODUCTS[4], // Fonte 20W PD
        quantity: 2,
        unitPrice: 79.90,
        total: 159.80,
      },
    ],
  },

  // 21 de Setembro de 2026
  {
    id: 'sale-2026-0921-1',
    code: 'V-2026-0921-1',
    date: '2026-09-21T10:00:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'PIX',
    subtotal: 80.00,
    discount: 0,
    total: 80.00,
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        unitPrice: 35.00,
        total: 35.00,
      },
      {
        product: INITIAL_PRODUCTS[5],
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00,
      },
    ],
  },
  {
    id: 'sale-2026-0921-2',
    code: 'V-2026-0921-2',
    date: '2026-09-21T15:30:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'CARTAO_DEBITO',
    subtotal: 140.00,
    discount: 10.00,
    total: 130.00,
    items: [
      {
        product: INITIAL_PRODUCTS[2],
        quantity: 1,
        unitPrice: 49.90,
        total: 49.90,
      },
      {
        product: INITIAL_PRODUCTS[9], // Desoxidação avulsa balcão
        quantity: 1,
        unitPrice: 90.10,
        total: 90.10,
      },
    ],
  },

  // 20 de Setembro de 2026
  {
    id: 'sale-2026-0920-1',
    code: 'V-2026-0920-1',
    date: '2026-09-20T11:20:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'DINHEIRO',
    subtotal: 105.00,
    discount: 5.00,
    total: 100.00,
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 3,
        unitPrice: 35.00,
        total: 105.00,
      },
    ],
  },
  {
    id: 'sale-2026-0920-2',
    code: 'V-2026-0920-2',
    date: '2026-09-20T16:00:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'PIX',
    subtotal: 124.90,
    discount: 0,
    total: 124.90,
    items: [
      {
        product: INITIAL_PRODUCTS[4],
        quantity: 1,
        unitPrice: 79.90,
        total: 79.90,
      },
      {
        product: INITIAL_PRODUCTS[5],
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00,
      },
    ],
  },

  // 19 de Setembro de 2026
  {
    id: 'sale-2026-0919-1',
    code: 'V-2026-0919-1',
    date: '2026-09-19T10:15:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'CARTAO_CREDITO',
    subtotal: 215.00,
    discount: 15.00,
    total: 200.00,
    items: [
      {
        product: INITIAL_PRODUCTS[4],
        quantity: 1,
        unitPrice: 79.90,
        total: 79.90,
      },
      {
        product: INITIAL_PRODUCTS[5],
        quantity: 2,
        unitPrice: 45.00,
        total: 90.00,
      },
      {
        product: INITIAL_PRODUCTS[3],
        quantity: 1,
        unitPrice: 45.10,
        total: 45.10,
      },
    ],
  },
  {
    id: 'sale-2026-0919-2',
    code: 'V-2026-0919-2',
    date: '2026-09-19T14:40:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'PIX',
    subtotal: 85.00,
    discount: 5.00,
    total: 80.00,
    items: [
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 1,
        unitPrice: 50.00,
        total: 50.00,
      },
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        unitPrice: 35.00,
        total: 35.00,
      },
    ],
  },

  // 18 de Setembro de 2026
  {
    id: 'sale-2026-0918-1',
    code: 'V-2026-0918-1',
    date: '2026-09-18T13:00:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'DINHEIRO',
    subtotal: 94.90,
    discount: 4.90,
    total: 90.00,
    items: [
      {
        product: INITIAL_PRODUCTS[2],
        quantity: 1,
        unitPrice: 49.90,
        total: 49.90,
      },
      {
        product: INITIAL_PRODUCTS[5],
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00,
      },
    ],
  },

  // 15 de Setembro de 2026
  {
    id: 'sale-2026-0915-1',
    code: 'V-2026-0915-1',
    date: '2026-09-15T11:10:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'PIX',
    subtotal: 130.00,
    discount: 10.00,
    total: 120.00,
    items: [
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 1,
        unitPrice: 50.00,
        total: 50.00,
      },
      {
        product: INITIAL_PRODUCTS[4],
        quantity: 1,
        unitPrice: 80.00,
        total: 80.00,
      },
    ],
  },

  // 12 de Setembro de 2026
  {
    id: 'sale-2026-0912-1',
    code: 'V-2026-0912-1',
    date: '2026-09-12T15:20:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'CARTAO_CREDITO',
    subtotal: 159.80,
    discount: 0,
    total: 159.80,
    items: [
      {
        product: INITIAL_PRODUCTS[4],
        quantity: 2,
        unitPrice: 79.90,
        total: 159.80,
      },
    ],
  },

  // 08 de Setembro de 2026
  {
    id: 'sale-2026-0908-1',
    code: 'V-2026-0908-1',
    date: '2026-09-08T10:45:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'PIX',
    subtotal: 80.00,
    discount: 0,
    total: 80.00,
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        unitPrice: 35.00,
        total: 35.00,
      },
      {
        product: INITIAL_PRODUCTS[5],
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00,
      },
    ],
  },

  // 03 de Setembro de 2026
  {
    id: 'sale-2026-0903-1',
    code: 'V-2026-0903-1',
    date: '2026-09-03T14:15:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'CARTAO_DEBITO',
    subtotal: 95.00,
    discount: 5.00,
    total: 90.00,
    items: [
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 1,
        unitPrice: 50.00,
        total: 50.00,
      },
      {
        product: INITIAL_PRODUCTS[5],
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00,
      },
    ],
  },

  // Agosto de 2026 (Amostras de Vendas)
  {
    id: 'sale-2026-0828-1',
    code: 'V-2026-0828-1',
    date: '2026-08-28T11:00:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'PIX',
    subtotal: 180.00,
    discount: 0,
    total: 180.00,
    items: [
      {
        product: INITIAL_PRODUCTS[7],
        quantity: 1,
        unitPrice: 180.00,
        total: 180.00,
      },
    ],
  },
  {
    id: 'sale-2026-0820-1',
    code: 'V-2026-0820-1',
    date: '2026-08-20T14:30:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'CARTAO_CREDITO',
    subtotal: 160.00,
    discount: 10.00,
    total: 150.00,
    items: [
      {
        product: INITIAL_PRODUCTS[4],
        quantity: 1,
        unitPrice: 79.90,
        total: 79.90,
      },
      {
        product: INITIAL_PRODUCTS[2],
        quantity: 1,
        unitPrice: 49.90,
        total: 49.90,
      },
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        unitPrice: 30.20,
        total: 30.20,
      },
    ],
  },
  {
    id: 'sale-2026-0810-1',
    code: 'V-2026-0810-1',
    date: '2026-08-10T16:00:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'PIX',
    subtotal: 115.00,
    discount: 0,
    total: 115.00,
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 2,
        unitPrice: 35.00,
        total: 70.00,
      },
      {
        product: INITIAL_PRODUCTS[5],
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00,
      },
    ],
  },
  {
    id: 'sale-2026-0801-1',
    code: 'V-2026-0801-1',
    date: '2026-08-01T10:20:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'DINHEIRO',
    subtotal: 90.00,
    discount: 0,
    total: 90.00,
    items: [
      {
        product: INITIAL_PRODUCTS[3],
        quantity: 2,
        unitPrice: 45.00,
        total: 90.00,
      },
    ],
  },

  // Julho de 2026
  {
    id: 'sale-2026-0722-1',
    code: 'V-2026-0722-1',
    date: '2026-07-22T14:00:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'PIX',
    subtotal: 174.90,
    discount: 14.90,
    total: 160.00,
    items: [
      {
        product: INITIAL_PRODUCTS[4],
        quantity: 1,
        unitPrice: 79.90,
        total: 79.90,
      },
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 1,
        unitPrice: 50.00,
        total: 50.00,
      },
      {
        product: INITIAL_PRODUCTS[5],
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00,
      },
    ],
  },
  {
    id: 'sale-2026-0705-1',
    code: 'V-2026-0705-1',
    date: '2026-07-05T11:30:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'CARTAO_CREDITO',
    subtotal: 140.00,
    discount: 0,
    total: 140.00,
    items: [
      {
        product: INITIAL_PRODUCTS[5],
        quantity: 2,
        unitPrice: 45.00,
        total: 90.00,
      },
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 1,
        unitPrice: 50.00,
        total: 50.00,
      },
    ],
  },

  // Junho de 2026
  {
    id: 'sale-2026-0619-1',
    code: 'V-2026-0619-1',
    date: '2026-06-19T15:00:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'PIX',
    subtotal: 180.00,
    discount: 0,
    total: 180.00,
    items: [
      {
        product: INITIAL_PRODUCTS[7],
        quantity: 1,
        unitPrice: 180.00,
        total: 180.00,
      },
    ],
  },

  // Maio de 2026
  {
    id: 'sale-2026-0525-1',
    code: 'V-2026-0525-1',
    date: '2026-05-25T10:00:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'CARTAO_CREDITO',
    subtotal: 155.00,
    discount: 5.00,
    total: 150.00,
    items: [
      {
        product: INITIAL_PRODUCTS[4],
        quantity: 1,
        unitPrice: 79.90,
        total: 79.90,
      },
      {
        product: INITIAL_PRODUCTS[2],
        quantity: 1,
        unitPrice: 49.90,
        total: 49.90,
      },
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        unitPrice: 25.20,
        total: 25.20,
      },
    ],
  },

  // Abril de 2026
  {
    id: 'sale-2026-0418-1',
    code: 'V-2026-0418-1',
    date: '2026-04-18T13:40:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'PIX',
    subtotal: 125.00,
    discount: 0,
    total: 125.00,
    items: [
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 1,
        unitPrice: 50.00,
        total: 50.00,
      },
      {
        product: INITIAL_PRODUCTS[4],
        quantity: 1,
        unitPrice: 75.00,
        total: 75.00,
      },
    ],
  },

  // Março de 2026
  {
    id: 'sale-2026-0320-1',
    code: 'V-2026-0320-1',
    date: '2026-03-20T11:00:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'DINHEIRO',
    subtotal: 95.00,
    discount: 5.00,
    total: 90.00,
    items: [
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 1,
        unitPrice: 50.00,
        total: 50.00,
      },
      {
        product: INITIAL_PRODUCTS[5],
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00,
      },
    ],
  },

  // Fevereiro de 2026
  {
    id: 'sale-2026-0214-1',
    code: 'V-2026-0214-1',
    date: '2026-02-14T16:30:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'CARTAO_DEBITO',
    subtotal: 115.00,
    discount: 0,
    total: 115.00,
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 2,
        unitPrice: 35.00,
        total: 70.00,
      },
      {
        product: INITIAL_PRODUCTS[5],
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00,
      },
    ],
  },

  // Janeiro de 2026
  {
    id: 'sale-2026-0122-1',
    code: 'V-2026-0122-1',
    date: '2026-01-22T10:15:00Z',
    cashierName: 'Beatriz Almeida',
    status: 'CONCLUIDA',
    paymentMethod: 'PIX',
    subtotal: 140.00,
    discount: 10.00,
    total: 130.00,
    items: [
      {
        product: INITIAL_PRODUCTS[4],
        quantity: 1,
        unitPrice: 79.90,
        total: 79.90,
      },
      {
        product: INITIAL_PRODUCTS[3],
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00,
      },
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        unitPrice: 15.10,
        total: 15.10,
      },
    ],
  },
];

export const DEFAULT_OS_PRINT_OPTIONS: PrintOSOptions = {
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

export const DEFAULT_SALE_PRINT_OPTIONS: PrintSaleOptions = {
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

export const DEFAULT_TECH_OS_PRINT_OPTIONS: PrintTechOSOptions = {
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
  osPrintOptions: DEFAULT_OS_PRINT_OPTIONS,
  salePrintOptions: DEFAULT_SALE_PRINT_OPTIONS,
  techOSPrintOptions: DEFAULT_TECH_OS_PRINT_OPTIONS,
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
    const list: ItemPDV[] = raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
    return list.map((p) => ({
      ...p,
      controlStock:
        p.controlStock !== undefined
          ? p.controlStock
          : p.category !== 'SERVICOS' && p.unit !== 'SV',
    }));
  } catch {
    return INITIAL_PRODUCTS;
  }
};

export const saveStoredProducts = (products: ItemPDV[]) => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const getStoredSales = (): VendaPDV[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    return raw ? JSON.parse(raw) : INITIAL_SALES;
  } catch {
    return INITIAL_SALES;
  }
};

export const saveStoredSales = (sales: VendaPDV[]) => {
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
};

export const getStoredPrinterConfig = (): ConfiguracaoImpressora => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRINTER);
    if (!raw) return INITIAL_PRINTER_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_PRINTER_CONFIG,
      ...parsed,
      osPrintOptions: {
        ...DEFAULT_OS_PRINT_OPTIONS,
        ...(parsed.osPrintOptions || {}),
      },
      salePrintOptions: {
        ...DEFAULT_SALE_PRINT_OPTIONS,
        ...(parsed.salePrintOptions || {}),
      },
      techOSPrintOptions: {
        ...DEFAULT_TECH_OS_PRINT_OPTIONS,
        ...(parsed.techOSPrintOptions || {}),
      },
    };
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

export const DEFAULT_OS_CONFIG: OSConfigOptions = {
  brands: [
    { id: 'brand-apple', name: 'Apple', icon: 'Smartphone' },
    { id: 'brand-samsung', name: 'Samsung', icon: 'Smartphone' },
    { id: 'brand-motorola', name: 'Motorola', icon: 'Radio' },
    { id: 'brand-xiaomi', name: 'Xiaomi', icon: 'Flame' },
    { id: 'brand-realme', name: 'Realme', icon: 'Sparkles' },
    { id: 'brand-lg', name: 'LG', icon: 'Tv' },
    { id: 'brand-outro', name: 'Outro', icon: 'Cpu' },
  ],
  modelsByBrand: {
    Apple: ['iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15', 'iPhone 15 Pro Max', 'iPhone 16', 'iPhone XR', 'iPhone 8 Plus'],
    Samsung: ['Galaxy A14', 'Galaxy A15', 'Galaxy A34', 'Galaxy A54', 'Galaxy S21', 'Galaxy S22', 'Galaxy S23', 'Galaxy S24 Ultra'],
    Motorola: ['Moto G53', 'Moto G54', 'Moto G84', 'Moto G22', 'Moto G32', 'Edge 40 Neo', 'Moto E22'],
    Xiaomi: ['Redmi Note 11', 'Redmi Note 12', 'Redmi Note 13 Pro', 'Poco X5 Pro', 'Poco X6 Pro', 'Redmi 12C'],
    Realme: ['Realme C55', 'Realme 11 Pro+', 'Realme C53', 'Realme 9'],
    LG: ['K41S', 'K51S', 'K61', 'Velvet'],
    Outro: ['Asus Zenfone', 'Infinix Hot 30', 'Positivo', 'Nokia G21'],
  },
  defects: [
    {
      id: 'def-tela',
      title: 'Tela Quebrada',
      desc: 'Touch / Display / Linhas',
      tag: 'Tela quebrada / Touch parou',
      icon: 'Smartphone',
      color: 'text-yellow-400',
      badge: 'Frequente',
    },
    {
      id: 'def-carga',
      title: 'Não Carrega',
      desc: 'Conector / Mau contato',
      tag: 'Não carrega / Conector folgado',
      icon: 'ZapOff',
      color: 'text-amber-400',
      badge: 'Hardware',
    },
    {
      id: 'def-bateria',
      title: 'Bateria Viciada',
      desc: 'Descarrega rápido / Estufada',
      tag: 'Bateria descarrega rápido / Estufada',
      icon: 'BatteryWarning',
      color: 'text-yellow-500',
      badge: 'Consumo',
    },
    {
      id: 'def-agua',
      title: 'Molhou / Água',
      desc: 'Desoxidação na cuba',
      tag: 'Molhou / Caiu na água',
      icon: 'Droplets',
      color: 'text-cyan-400',
      badge: 'Urgente',
    },
    {
      id: 'def-nao-liga',
      title: 'Não Liga',
      desc: 'Apagado / Curto primário',
      tag: 'Não liga / Totalmente apagado',
      icon: 'PowerOff',
      color: 'text-neutral-400',
      badge: 'Placa',
    },
    {
      id: 'def-audio',
      title: 'Sem Áudio',
      desc: 'Alto-falante / Microfone',
      tag: 'Sem áudio / Microfone mudo',
      icon: 'VolumeX',
      color: 'text-orange-400',
      badge: 'Áudio',
    },
    {
      id: 'def-camera',
      title: 'Câmera Falhando',
      desc: 'Preta / Trincada / Foco',
      tag: 'Câmera não abre / Trincada',
      icon: 'Camera',
      color: 'text-purple-400',
      badge: 'Sensor',
    },
    {
      id: 'def-traseira',
      title: 'Vidro Traseiro',
      desc: 'Tampa traseira trincada',
      tag: 'Vidro traseiro quebrado',
      icon: 'Layers',
      color: 'text-rose-400',
      badge: 'Carcaça',
    },
    {
      id: 'def-loop',
      title: 'Loop Infinito',
      desc: 'Reiniciando no logo',
      tag: 'Reiniciando em loop',
      icon: 'RotateCcw',
      color: 'text-blue-400',
      badge: 'Sistema',
    },
    {
      id: 'def-botoes',
      title: 'Botões Travados',
      desc: 'Power / Volume emperrado',
      tag: 'Botão Power / Volume travado',
      icon: 'SlidersHorizontal',
      color: 'text-emerald-400',
      badge: 'Chaves',
    },
  ],
  accessories: [
    { id: 'acc-1', name: 'Capa protetora', icon: 'Shield' },
    { id: 'acc-2', name: 'Cabo carregador', icon: 'Zap' },
    { id: 'acc-3', name: 'Fonte de tomada', icon: 'Cpu' },
    { id: 'acc-4', name: 'Gaveta de chip presente', icon: 'HardDrive' },
    { id: 'acc-5', name: 'Película instalada', icon: 'Layers' },
    { id: 'acc-6', name: 'Caixa original do aparelho', icon: 'Package' },
    { id: 'acc-7', name: 'Fone de ouvido', icon: 'Headphones' },
  ],
  checklistItems: [
    { id: 'chk-1', key: 'screenCracked', label: 'Tela já trincada / com risco fundo', icon: 'AlertTriangle', dangerIfChecked: true },
    { id: 'chk-2', key: 'housingScratched', label: 'Carcaça com marcas / amassados', icon: 'AlertTriangle', dangerIfChecked: true },
    { id: 'chk-3', key: 'waterDamage', label: 'Indício de contato com líquido / água', icon: 'Droplets', dangerIfChecked: true },
    { id: 'chk-4', key: 'simTrayPresent', label: 'Gaveta de chip (SIM) presente', icon: 'HardDrive', dangerIfChecked: false },
    { id: 'chk-5', key: 'buttonsWorking', label: 'Botões físicos funcionando', icon: 'SlidersHorizontal', dangerIfChecked: false },
    { id: 'chk-6', key: 'camerasWorking', label: 'Câmeras operacionais', icon: 'Camera', dangerIfChecked: false },
    { id: 'chk-7', key: 'chargesNormal', label: 'Conector carrega normalmente', icon: 'Zap', dangerIfChecked: false },
    { id: 'chk-8', key: 'speakerWorking', label: 'Alto-falante e microfone OK', icon: 'Volume2', dangerIfChecked: false },
  ],
  colors: ['Preto', 'Branco', 'Azul', 'Verde', 'Dourado', 'Prata', 'Grafite', 'Vermelho', 'Roxo', 'Titânio Natural'],
  technicians: [
    'Rafael Silveira (Bancada 1)',
    'Lucas Mecânico (Bancada 2)',
    'Amanda Técnica (Bancada 3)',
  ],
};

export const getStoredOSConfig = (): OSConfigOptions => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OS_CONFIG);
    if (!raw) return DEFAULT_OS_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      brands: parsed.brands || DEFAULT_OS_CONFIG.brands,
      modelsByBrand: parsed.modelsByBrand || DEFAULT_OS_CONFIG.modelsByBrand,
      defects: parsed.defects || DEFAULT_OS_CONFIG.defects,
      accessories: parsed.accessories || DEFAULT_OS_CONFIG.accessories,
      checklistItems: parsed.checklistItems || DEFAULT_OS_CONFIG.checklistItems,
      colors: parsed.colors || DEFAULT_OS_CONFIG.colors,
      technicians: parsed.technicians || DEFAULT_OS_CONFIG.technicians,
    };
  } catch {
    return DEFAULT_OS_CONFIG;
  }
};

export const saveStoredOSConfig = (config: OSConfigOptions) => {
  localStorage.setItem(STORAGE_KEYS.OS_CONFIG, JSON.stringify(config));
};

export const resetStoredOSConfig = (): OSConfigOptions => {
  saveStoredOSConfig(DEFAULT_OS_CONFIG);
  return DEFAULT_OS_CONFIG;
};

// ==========================================
// BACKUP & RESTORE UTILITIES
// ==========================================

export interface CreateBackupParams {
  orders: OrdemDeServico[];
  clients: Cliente[];
  products: ItemPDV[];
  sales: VendaPDV[];
  caixa?: CaixaSessao;
  printerConfig?: ConfiguracaoImpressora;
  osConfig?: OSConfigOptions;
  notes?: string;
  source?: string;
}

export const createBackupPayload = (params: CreateBackupParams): CellMasterBackupData => {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    systemName: 'CellMaster OS & PDV',
    notes: params.notes || 'Backup completo gerado pelo usuário',
    orders: params.orders || [],
    clients: params.clients || [],
    products: params.products || [],
    sales: params.sales || [],
    caixa: params.caixa,
    printerConfig: params.printerConfig,
    osConfig: params.osConfig,
    metadata: {
      totalOrders: params.orders?.length || 0,
      totalClients: params.clients?.length || 0,
      totalProducts: params.products?.length || 0,
      totalSales: params.sales?.length || 0,
      backupSource: params.source || 'cellmaster_app',
    },
  };
};

export const downloadBackupJSONFile = (backup: CellMasterBackupData, customFilename?: string) => {
  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = customFilename || `cellmaster_backup_${dateStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export interface BackupValidationResult {
  valid: boolean;
  data?: CellMasterBackupData;
  error?: string;
  summary?: {
    version: string;
    timestamp: string;
    totalOrders: number;
    totalClients: number;
    totalProducts: number;
    totalSales: number;
    hasCaixa: boolean;
    hasPrinterConfig: boolean;
    hasOSConfig: boolean;
    systemName: string;
  };
}

export const validateAndParseBackupJSON = (rawContent: string): BackupValidationResult => {
  try {
    const parsed = JSON.parse(rawContent);

    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'O arquivo informado não contém um objeto JSON válido.' };
    }

    // Check minimum required collections
    const hasOrders = Array.isArray(parsed.orders);
    const hasClients = Array.isArray(parsed.clients);
    const hasProducts = Array.isArray(parsed.products);
    const hasSales = Array.isArray(parsed.sales);

    if (!hasOrders && !hasClients && !hasProducts && !hasSales) {
      return {
        valid: false,
        error:
          'Estrutura de dados incompatível. O arquivo não possui listas válidas de Ordens de Serviço, Clientes, Produtos ou Vendas do CellMaster.',
      };
    }

    const backupData: CellMasterBackupData = {
      version: typeof parsed.version === 'string' ? parsed.version : '1.0.0',
      timestamp: typeof parsed.timestamp === 'string' ? parsed.timestamp : new Date().toISOString(),
      systemName: typeof parsed.systemName === 'string' ? parsed.systemName : 'CellMaster OS & PDV',
      notes: typeof parsed.notes === 'string' ? parsed.notes : undefined,
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      clients: Array.isArray(parsed.clients) ? parsed.clients : [],
      products: Array.isArray(parsed.products) ? parsed.products : [],
      sales: Array.isArray(parsed.sales) ? parsed.sales : [],
      caixa: parsed.caixa && typeof parsed.caixa === 'object' ? parsed.caixa : undefined,
      printerConfig:
        parsed.printerConfig && typeof parsed.printerConfig === 'object'
          ? parsed.printerConfig
          : undefined,
      osConfig: parsed.osConfig && typeof parsed.osConfig === 'object' ? parsed.osConfig : undefined,
      metadata: {
        totalOrders: Array.isArray(parsed.orders) ? parsed.orders.length : 0,
        totalClients: Array.isArray(parsed.clients) ? parsed.clients.length : 0,
        totalProducts: Array.isArray(parsed.products) ? parsed.products.length : 0,
        totalSales: Array.isArray(parsed.sales) ? parsed.sales.length : 0,
        backupSource: parsed.metadata?.backupSource || 'imported_file',
      },
    };

    return {
      valid: true,
      data: backupData,
      summary: {
        version: backupData.version,
        timestamp: backupData.timestamp,
        totalOrders: backupData.orders.length,
        totalClients: backupData.clients.length,
        totalProducts: backupData.products.length,
        totalSales: backupData.sales.length,
        hasCaixa: !!backupData.caixa,
        hasPrinterConfig: !!backupData.printerConfig,
        hasOSConfig: !!backupData.osConfig,
        systemName: backupData.systemName,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro de sintaxe JSON';
    return {
      valid: false,
      error: `Falha ao interpretar o arquivo JSON: ${errorMsg}`,
    };
  }
};

export const getStoredSnapshots = (): BackupSnapshotItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BACKUP_SNAPSHOTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredSnapshots = (snapshots: BackupSnapshotItem[]) => {
  try {
    // Keep max 10 to avoid exceeding quota
    const limited = snapshots.slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.BACKUP_SNAPSHOTS, JSON.stringify(limited));
  } catch (err) {
    console.error('Falha ao salvar snapshots locais:', err);
  }
};

export const addStoredSnapshot = (
  name: string,
  backupData: CellMasterBackupData
): BackupSnapshotItem[] => {
  const current = getStoredSnapshots();
  const rawString = JSON.stringify(backupData);
  const newSnapshot: BackupSnapshotItem = {
    id: `snap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim() || `Snapshot ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
    createdAt: new Date().toISOString(),
    data: backupData,
    sizeBytes: new Blob([rawString]).size,
  };

  const updated = [newSnapshot, ...current].slice(0, 10);
  saveStoredSnapshots(updated);
  return updated;
};

export const deleteStoredSnapshot = (id: string): BackupSnapshotItem[] => {
  const current = getStoredSnapshots();
  const updated = current.filter((s) => s.id !== id);
  saveStoredSnapshots(updated);
  return updated;
};

/**
 * Intelligent merge logic that combines incoming backup with current records,
 * avoiding duplicate keys by ID/Code/Phone.
 */
export const mergeBackupDatasets = (
  current: {
    orders: OrdemDeServico[];
    clients: Cliente[];
    products: ItemPDV[];
    sales: VendaPDV[];
  },
  incoming: CellMasterBackupData
) => {
  // 1. Merge Orders: match by id or trackingCode
  const orderMap = new Map<string, OrdemDeServico>();
  current.orders.forEach((o) => orderMap.set(o.id, o));
  let newOrdersCount = 0;
  incoming.orders.forEach((o) => {
    if (!orderMap.has(o.id)) {
      orderMap.set(o.id, o);
      newOrdersCount++;
    }
  });

  // 2. Merge Clients: match by id, or phone, or CPF
  const clientMap = new Map<string, Cliente>();
  current.clients.forEach((c) => {
    clientMap.set(c.id, c);
    if (c.phone) clientMap.set(`phone:${c.phone}`, c);
    if (c.cpf) clientMap.set(`cpf:${c.cpf}`, c);
  });
  let newClientsCount = 0;
  const mergedClientsList = [...current.clients];
  incoming.clients.forEach((c) => {
    const existingById = clientMap.get(c.id);
    const existingByPhone = c.phone ? clientMap.get(`phone:${c.phone}`) : null;
    const existingByCpf = c.cpf ? clientMap.get(`cpf:${c.cpf}`) : null;

    if (!existingById && !existingByPhone && !existingByCpf) {
      mergedClientsList.push(c);
      clientMap.set(c.id, c);
      if (c.phone) clientMap.set(`phone:${c.phone}`, c);
      if (c.cpf) clientMap.set(`cpf:${c.cpf}`, c);
      newClientsCount++;
    }
  });

  // 3. Merge Products: match by id or barcode
  const prodMap = new Map<string, ItemPDV>();
  current.products.forEach((p) => {
    prodMap.set(p.id, p);
    if (p.barcode) prodMap.set(`barcode:${p.barcode}`, p);
  });
  let newProductsCount = 0;
  const mergedProductsList = [...current.products];
  incoming.products.forEach((p) => {
    const existingById = prodMap.get(p.id);
    const existingByBarcode = p.barcode ? prodMap.get(`barcode:${p.barcode}`) : null;

    if (!existingById && !existingByBarcode) {
      mergedProductsList.push(p);
      prodMap.set(p.id, p);
      if (p.barcode) prodMap.set(`barcode:${p.barcode}`, p);
      newProductsCount++;
    }
  });

  // 4. Merge Sales: match by id or code
  const salesMap = new Map<string, VendaPDV>();
  current.sales.forEach((s) => {
    salesMap.set(s.id, s);
    if (s.code) salesMap.set(`code:${s.code}`, s);
  });
  let newSalesCount = 0;
  const mergedSalesList = [...current.sales];
  incoming.sales.forEach((s) => {
    const existingById = salesMap.get(s.id);
    const existingByCode = s.code ? salesMap.get(`code:${s.code}`) : null;

    if (!existingById && !existingByCode) {
      mergedSalesList.push(s);
      salesMap.set(s.id, s);
      if (s.code) salesMap.set(`code:${s.code}`, s);
      newSalesCount++;
    }
  });

  return {
    mergedOrders: Array.from(orderMap.values()),
    mergedClients: mergedClientsList,
    mergedProducts: mergedProductsList,
    mergedSales: mergedSalesList,
    counts: {
      addedOrders: newOrdersCount,
      addedClients: newClientsCount,
      addedProducts: newProductsCount,
      addedSales: newSalesCount,
    },
  };
};



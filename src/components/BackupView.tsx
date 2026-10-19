import React, { useState, useRef, useEffect } from 'react';
import {
  OrdemDeServico,
  Cliente,
  ItemPDV,
  VendaPDV,
  CaixaSessao,
  ConfiguracaoImpressora,
  OSConfigOptions,
  CellMasterBackupData,
  BackupSnapshotItem,
  AppTheme,
} from '../types';
import {
  createBackupPayload,
  downloadBackupJSONFile,
  validateAndParseBackupJSON,
  getStoredSnapshots,
  addStoredSnapshot,
  deleteStoredSnapshot,
  mergeBackupDatasets,
  BackupValidationResult,
} from '../services/storage';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Trash2,
  Layers,
  Wrench,
  Users,
  ShoppingCart,
  TrendingUp,
  HardDrive,
  Save,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';
import { ResetDatabaseModal, SelectiveResetOptions } from './ResetDatabaseModal';

interface BackupViewProps {
  orders: OrdemDeServico[];
  clients: Cliente[];
  products: ItemPDV[];
  sales: VendaPDV[];
  caixa: CaixaSessao;
  printerConfig: ConfiguracaoImpressora;
  osConfig: OSConfigOptions;
  theme?: AppTheme;
  onRestoreBackup: (data: {
    orders: OrdemDeServico[];
    clients: Cliente[];
    products: ItemPDV[];
    sales: VendaPDV[];
    caixa?: CaixaSessao;
    printerConfig?: ConfiguracaoImpressora;
    osConfig?: OSConfigOptions;
    mode: 'REPLACE' | 'MERGE';
  }) => void;
  onSelectiveReset?: (options: SelectiveResetOptions) => void;
}

export const BackupView: React.FC<BackupViewProps> = ({
  orders,
  clients,
  products,
  sales,
  caixa,
  printerConfig,
  osConfig,
  theme = 'black-yellow',
  onRestoreBackup,
  onSelectiveReset,
}) => {
  const isDark = theme === 'black-yellow' || theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [snapshots, setSnapshots] = useState<BackupSnapshotItem[]>(getStoredSnapshots);
  const [backupNote, setBackupNote] = useState('');
  const [includeConfigs, setIncludeConfigs] = useState(true);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Import / Recovery State
  const [rawPastedJson, setRawPastedJson] = useState('');
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [validationResult, setValidationResult] = useState<BackupValidationResult | null>(null);
  const [restoreMode, setRestoreMode] = useState<'REPLACE' | 'MERGE'>('REPLACE');
  const [createSafetySnapshotBeforeRestore, setCreateSafetySnapshotBeforeRestore] = useState(true);
  const [isProcessingRestore, setIsProcessingRestore] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToastMessage({ type, text });
  };

  // Helper to build current live backup object
  const getCurrentLiveBackup = (noteText?: string): CellMasterBackupData => {
    return createBackupPayload({
      orders,
      clients,
      products,
      sales,
      caixa: includeConfigs ? caixa : undefined,
      printerConfig: includeConfigs ? printerConfig : undefined,
      osConfig: includeConfigs ? osConfig : undefined,
      notes: noteText || backupNote || undefined,
      source: 'manual_export',
    });
  };

  // Action: Download JSON file
  const handleDownloadBackup = () => {
    const backup = getCurrentLiveBackup();
    downloadBackupJSONFile(backup);
    showToast(
      'success',
      `Arquivo de backup baixado com sucesso! (${backup.orders.length} OS, ${backup.clients.length} Clientes, ${backup.sales.length} Vendas)`
    );
  };

  // Action: Copy JSON to Clipboard
  const handleCopyClipboard = async () => {
    try {
      const backup = getCurrentLiveBackup();
      await navigator.clipboard.writeText(JSON.stringify(backup, null, 2));
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
      showToast('success', 'Conteúdo do backup copiado para a área de transferência.');
    } catch {
      showToast('error', 'Não foi possível copiar automaticamente para a área de transferência.');
    }
  };

  // Action: Create Local Snapshot
  const handleCreateSnapshot = () => {
    const backup = getCurrentLiveBackup();
    const updated = addStoredSnapshot(backupNote || `Backup do Sistema (${new Date().toLocaleDateString('pt-BR')})`, backup);
    setSnapshots(updated);
    setBackupNote('');
    showToast('success', 'Ponto de restauração (Snapshot) criado localmente com sucesso!');
  };

  // Action: Delete Snapshot
  const handleDeleteSnapshot = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o ponto de restauração "${name}"?`)) {
      const updated = deleteStoredSnapshot(id);
      setSnapshots(updated);
      showToast('info', `Ponto "${name}" foi excluído.`);
    }
  };

  // File Upload Handlers
  const handleFileSelect = (file: File) => {
    if (!file) return;
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      processIncomingJson(content);
    };
    reader.onerror = () => {
      showToast('error', 'Erro ao ler o arquivo selecionado.');
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Process raw JSON string from file or paste
  const processIncomingJson = (jsonText: string) => {
    const result = validateAndParseBackupJSON(jsonText);
    setValidationResult(result);
    if (result.valid) {
      showToast('success', 'Backup verificado com sucesso! Verifique os dados abaixo antes de restaurar.');
    } else {
      showToast('error', result.error || 'Arquivo de backup inválido.');
    }
  };

  // Trigger restore from an existing Snapshot
  const handleInspectSnapshot = (snapshot: BackupSnapshotItem) => {
    setValidationResult({
      valid: true,
      data: snapshot.data,
      summary: {
        version: snapshot.data.version,
        timestamp: snapshot.data.timestamp,
        totalOrders: snapshot.data.orders.length,
        totalClients: snapshot.data.clients.length,
        totalProducts: snapshot.data.products.length,
        totalSales: snapshot.data.sales.length,
        hasCaixa: !!snapshot.data.caixa,
        hasPrinterConfig: !!snapshot.data.printerConfig,
        hasOSConfig: !!snapshot.data.osConfig,
        systemName: snapshot.data.systemName,
      },
    });
    setSelectedFileName(`Snapshot Local: ${snapshot.name}`);
    window.scrollTo({ top: 400, behavior: 'smooth' });
    showToast('info', `Ponto "${snapshot.name}" pronto para conferência e restauração.`);
  };

  // Execute Restore (either Replace or Merge)
  const handleExecuteRestore = () => {
    if (!validationResult || !validationResult.valid || !validationResult.data) {
      showToast('error', 'Nenhum backup válido carregado para restauração.');
      return;
    }

    const data = validationResult.data;

    // Safety snapshot before proceeding
    if (createSafetySnapshotBeforeRestore) {
      const currentLive = getCurrentLiveBackup('Cópia de segurança automática antes da restauração');
      const updatedSnapshots = addStoredSnapshot(
        `Segurança Pré-Restauração (${new Date().toLocaleTimeString('pt-BR')})`,
        currentLive
      );
      setSnapshots(updatedSnapshots);
    }

    setIsProcessingRestore(true);

    try {
      if (restoreMode === 'REPLACE') {
        onRestoreBackup({
          orders: data.orders,
          clients: data.clients,
          products: data.products,
          sales: data.sales,
          caixa: data.caixa,
          printerConfig: data.printerConfig,
          osConfig: data.osConfig,
          mode: 'REPLACE',
        });
        showToast(
          'success',
          `Restauração completa efetuada! ${data.orders.length} O.S., ${data.clients.length} Clientes e ${data.sales.length} Vendas restaurados.`
        );
      } else {
        // Merge mode
        const merged = mergeBackupDatasets(
          { orders, clients, products, sales },
          data
        );

        onRestoreBackup({
          orders: merged.mergedOrders,
          clients: merged.mergedClients,
          products: merged.mergedProducts,
          sales: merged.mergedSales,
          caixa: data.caixa || caixa,
          printerConfig: data.printerConfig || printerConfig,
          osConfig: data.osConfig || osConfig,
          mode: 'MERGE',
        });

        showToast(
          'success',
          `Mesclagem concluída! Adicionados: +${merged.counts.addedOrders} O.S., +${merged.counts.addedClients} Clientes, +${merged.counts.addedProducts} Produtos, +${merged.counts.addedSales} Vendas.`
        );
      }

      // Reset inspection after short delay
      setTimeout(() => {
        setValidationResult(null);
        setSelectedFileName(null);
        setRawPastedJson('');
        setIsProcessingRestore(false);
      }, 800);
    } catch (err) {
      console.error(err);
      setIsProcessingRestore(false);
      showToast('error', 'Ocorreu um erro ao aplicar a restauração dos dados.');
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={`p-4 md:p-6 lg:p-8 min-h-screen ${isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-50 text-neutral-900'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm transition-all animate-in slide-in-from-top-2 ${
              toastMessage.type === 'success'
                ? isDark
                  ? 'bg-neutral-900 border-yellow-400/40 text-yellow-300'
                  : 'bg-white border-green-500 text-green-800 shadow-green-100'
                : toastMessage.type === 'error'
                ? isDark
                  ? 'bg-neutral-900 border-rose-500/50 text-rose-300'
                  : 'bg-white border-rose-500 text-rose-800 shadow-rose-100'
                : isDark
                ? 'bg-neutral-900 border-neutral-700 text-neutral-200'
                : 'bg-white border-neutral-300 text-neutral-800'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-yellow-400 shrink-0" />}
            {toastMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
            <span className="font-medium">{toastMessage.text}</span>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-600'}`}>
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                  Backup & Recuperação do Sistema
                </h1>
                <p className={`text-xs md:text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Gere arquivos de segurança completos (.json), crie snapshots locais ou restaure dados a qualquer momento.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border ${
              isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offline-First Seguro</span>
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border ${
              isDark ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400' : 'bg-yellow-50 border-yellow-300 text-yellow-700'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>JSON v1.0</span>
            </span>
          </div>
        </div>

        {/* Current Database Summary Ribbon */}
        <div className={`p-4 rounded-xl border grid grid-cols-2 sm:grid-cols-4 gap-4 ${
          isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-neutral-800 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-[11px] uppercase tracking-wider font-semibold ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Ordens de Serviço
              </p>
              <p className="text-lg font-bold font-mono">{orders.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-neutral-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-[11px] uppercase tracking-wider font-semibold ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Clientes Registrados
              </p>
              <p className="text-lg font-bold font-mono">{clients.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-neutral-800 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}`}>
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-[11px] uppercase tracking-wider font-semibold ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Itens & Produtos PDV
              </p>
              <p className="text-lg font-bold font-mono">{products.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-neutral-800 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-[11px] uppercase tracking-wider font-semibold ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Vendas Realizadas
              </p>
              <p className="text-lg font-bold font-mono">{sales.length}</p>
            </div>
          </div>
        </div>

        {/* Main Grid: Create Backup & Restore Backup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* SECTION 1: ADICIONAR / GERAR BACKUP */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-5 ${
            isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base">Adicionar & Baixar Backup</h2>
                    <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Gera uma cópia completa dos seus dados em formato JSON portátil.
                    </p>
                  </div>
                </div>
              </div>

              {/* Note / Label input */}
              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Anotação ou Título do Backup (opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Backup quinzenal antes de atualizar tabelas..."
                  value={backupNote}
                  onChange={(e) => setBackupNote(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-colors outline-none focus:ring-2 focus:ring-yellow-400/40 ${
                    isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-500' : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder:text-neutral-400'
                  }`}
                />
              </div>

              {/* Checkbox configs */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeConfigs}
                  onChange={(e) => setIncludeConfigs(e.target.checked)}
                  className="mt-0.5 accent-yellow-400 rounded w-4 h-4 cursor-pointer"
                />
                <span className={`text-xs ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Incluir também <strong>Configurações da Impressora ESC/POS</strong>, opções de personalização de O.S. (marcas, modelos, checklist) e dados do caixa atual.
                </span>
              </label>

              {/* Content items breakdown */}
              <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                isDark ? 'bg-neutral-950/60 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-600'
              }`}>
                <div className="flex items-center justify-between">
                  <span>Ordens de Serviço completas com histórico:</span>
                  <span className="font-mono font-semibold text-neutral-200">{orders.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cadastro de Clientes e endereços:</span>
                  <span className="font-mono font-semibold text-neutral-200">{clients.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Catálogo de Produtos, Estoque e Peças:</span>
                  <span className="font-mono font-semibold text-neutral-200">{products.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Histórico de Vendas Balcão e Itens:</span>
                  <span className="font-mono font-semibold text-neutral-200">{sales.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Opções de O.S. (Marcas, Modelos, Técnicos):</span>
                  <span className="font-mono font-semibold text-emerald-400">{includeConfigs ? 'Incluso' : 'Ignorado'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleDownloadBackup}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs md:text-sm text-neutral-950 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(250,204,21,0.25)] hover:shadow-[0_0_25px_rgba(250,204,21,0.35)]"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Baixar Arquivo de Backup (.json)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCreateSnapshot}
                  className={`py-2 px-3 rounded-xl font-semibold text-xs border transition-colors flex items-center justify-center gap-1.5 ${
                    isDark
                      ? 'bg-neutral-900 border-neutral-700 hover:bg-neutral-800 text-neutral-200'
                      : 'bg-white border-neutral-300 hover:bg-neutral-100 text-neutral-800'
                  }`}
                  title="Cria um ponto de restauração instantâneo salvo no próprio navegador"
                >
                  <Save className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Salvar Snapshot Interno</span>
                </button>

                <button
                  onClick={handleCopyClipboard}
                  className={`py-2 px-3 rounded-xl font-semibold text-xs border transition-colors flex items-center justify-center gap-1.5 ${
                    isDark
                      ? 'bg-neutral-900 border-neutral-700 hover:bg-neutral-800 text-neutral-200'
                      : 'bg-white border-neutral-300 hover:bg-neutral-100 text-neutral-800'
                  }`}
                  title="Copia o conteúdo do backup como texto JSON para compartilhar ou colar"
                >
                  {copiedNotification ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Copiar JSON</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: RECUPERAR / RESTAURAR BACKUP */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-5 ${
            isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base">Recuperar / Restaurar Backup</h2>
                    <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Selecione um arquivo .json ou cole o código para restaurar.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowPasteArea(!showPasteArea)}
                  className={`text-[11px] font-semibold underline underline-offset-2 ${
                    isDark ? 'text-neutral-400 hover:text-yellow-400' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {showPasteArea ? 'Carregar Arquivo' : 'Colar Texto JSON'}
                </button>
              </div>

              {!showPasteArea ? (
                /* Drag & Drop File Area */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-2.5 ${
                    isDragging
                      ? isDark
                        ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
                        : 'border-yellow-500 bg-yellow-50 text-yellow-800'
                      : isDark
                      ? 'border-neutral-700 hover:border-yellow-400/60 bg-neutral-950/40 hover:bg-neutral-900/60 text-neutral-300'
                      : 'border-neutral-300 hover:border-yellow-500 bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className={`p-3 rounded-full ${isDark ? 'bg-neutral-800 text-yellow-400' : 'bg-neutral-200 text-yellow-600'}`}>
                    <FileJson className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">
                      {selectedFileName ? selectedFileName : 'Clique para selecionar o arquivo .json'}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                      ou arraste e solte o arquivo aqui
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    Suporta arquivos exportados do CellMaster (.json)
                  </span>
                </div>
              ) : (
                /* Paste JSON Area */
                <div className="space-y-2">
                  <textarea
                    rows={6}
                    value={rawPastedJson}
                    onChange={(e) => {
                      setRawPastedJson(e.target.value);
                      if (e.target.value.trim()) {
                        processIncomingJson(e.target.value);
                      } else {
                        setValidationResult(null);
                      }
                    }}
                    placeholder="Cole aqui o conteúdo JSON completo do backup..."
                    className={`w-full p-3 rounded-xl border text-xs font-mono transition-colors outline-none focus:ring-2 focus:ring-yellow-400/40 resize-none ${
                      isDark
                        ? 'bg-neutral-950 border-neutral-700 text-neutral-200 placeholder:text-neutral-600'
                        : 'bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400'
                    }`}
                  />
                  <div className="flex justify-between items-center text-[11px]">
                    <span className={isDark ? 'text-neutral-500' : 'text-neutral-500'}>
                      Tamanho: {rawPastedJson.length} caracteres
                    </span>
                    {rawPastedJson && (
                      <button
                        onClick={() => {
                          setRawPastedJson('');
                          setValidationResult(null);
                        }}
                        className="text-rose-400 hover:underline"
                      >
                        Limpar texto
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Status / Hint */}
              <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                isDark ? 'bg-neutral-950/60 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-600'
              }`}>
                <Info className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <span>
                  O sistema confere e valida a integridade do arquivo antes de aplicar qualquer alteração. Você poderá escolher entre <strong>Substituir Tudo</strong> ou <strong>Mesclar sem Apagar</strong> os registros atuais.
                </span>
              </div>
            </div>

            {/* If validation is active, show jump indicator */}
            {validationResult?.valid && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('inspection-panel');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 px-3 rounded-xl font-bold text-xs border border-yellow-400/40 bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Ver Painel de Conferência & Restaurar Abaixo</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: INSPECTION & CONFIRMATION PANEL (Appears when a valid backup is loaded) */}
        {validationResult && (
          <div
            id="inspection-panel"
            className={`p-6 rounded-2xl border-2 space-y-6 transition-all animate-in fade-in-50 duration-300 ${
              validationResult.valid
                ? isDark
                  ? 'bg-neutral-900 border-yellow-400/40 shadow-[0_0_30px_rgba(250,204,21,0.1)]'
                  : 'bg-white border-yellow-400 shadow-xl'
                : isDark
                ? 'bg-neutral-900 border-rose-500/50'
                : 'bg-white border-rose-400 shadow-md'
            }`}
          >
            {/* Validation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${validationResult.valid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {validationResult.valid ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    {validationResult.valid ? 'Backup Validado com Sucesso' : 'Falha na Validação do Arquivo'}
                    {selectedFileName && (
                      <span className={`text-xs font-normal font-mono px-2 py-0.5 rounded ${
                        isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {selectedFileName}
                      </span>
                    )}
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {validationResult.valid
                      ? 'Confira os dados detectados e selecione a modalidade de restauração.'
                      : validationResult.error}
                  </p>
                </div>
              </div>

              {validationResult.valid && validationResult.summary && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className={`px-2 py-1 rounded border ${isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-neutral-100 border-neutral-300 text-neutral-600'}`}>
                    Gerado em: {new Date(validationResult.summary.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
            </div>

            {/* Comparison Metrics Grid */}
            {validationResult.valid && validationResult.summary && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-neutral-950/80 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Ordens de Serviço
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold font-mono text-yellow-400">
                        {validationResult.summary.totalOrders}
                      </span>
                      <span className={`text-[11px] ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                        (atual: {orders.length})
                      </span>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-neutral-950/80 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Clientes Registrados
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold font-mono text-emerald-400">
                        {validationResult.summary.totalClients}
                      </span>
                      <span className={`text-[11px] ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                        (atual: {clients.length})
                      </span>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-neutral-950/80 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Produtos / Estoque
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold font-mono text-cyan-400">
                        {validationResult.summary.totalProducts}
                      </span>
                      <span className={`text-[11px] ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                        (atual: {products.length})
                      </span>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-neutral-950/80 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Vendas Balcão
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold font-mono text-amber-400">
                        {validationResult.summary.totalSales}
                      </span>
                      <span className={`text-[11px] ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                        (atual: {sales.length})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mode Selector */}
                <div className="space-y-3">
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Escolha a Modalidade de Restauração:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    
                    {/* Option 1: Replace */}
                    <div
                      onClick={() => setRestoreMode('REPLACE')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        restoreMode === 'REPLACE'
                          ? isDark
                            ? 'border-yellow-400 bg-yellow-400/10 text-neutral-100'
                            : 'border-yellow-500 bg-yellow-50 text-neutral-900'
                          : isDark
                          ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40 text-neutral-400'
                          : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50 text-neutral-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 text-yellow-400" />
                          Substituição Total (Recomendado)
                        </span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          restoreMode === 'REPLACE' ? 'border-yellow-400 bg-yellow-400' : 'border-neutral-600'
                        }`}>
                          {restoreMode === 'REPLACE' && <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />}
                        </div>
                      </div>
                      <p className="text-xs">
                        Substitui completamente as listas atuais pelos dados contidos neste backup. Ideal para restaurar um ponto exato no tempo ou migrar para outro dispositivo.
                      </p>
                    </div>

                    {/* Option 2: Merge */}
                    <div
                      onClick={() => setRestoreMode('MERGE')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        restoreMode === 'MERGE'
                          ? isDark
                            ? 'border-yellow-400 bg-yellow-400/10 text-neutral-100'
                            : 'border-yellow-500 bg-yellow-50 text-neutral-900'
                          : isDark
                          ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40 text-neutral-400'
                          : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50 text-neutral-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm flex items-center gap-2">
                          <Layers className="w-4 h-4 text-yellow-400" />
                          Mesclagem Inteligente (Sem Duplicações)
                        </span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          restoreMode === 'MERGE' ? 'border-yellow-400 bg-yellow-400' : 'border-neutral-600'
                        }`}>
                          {restoreMode === 'MERGE' && <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />}
                        </div>
                      </div>
                      <p className="text-xs">
                        Mantém todas as O.S., Clientes e Produtos atuais e adiciona apenas os registros que ainda não existem no sistema (baseado no código/ID/telefone).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Safety Snapshot Checkbox */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={createSafetySnapshotBeforeRestore}
                    onChange={(e) => setCreateSafetySnapshotBeforeRestore(e.target.checked)}
                    className="accent-yellow-400 rounded w-4 h-4 cursor-pointer"
                  />
                  <span className={`text-xs ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Criar snapshot local de segurança automático do estado atual antes de executar a restauração (Altamente recomendado).
                  </span>
                </label>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={handleExecuteRestore}
                    disabled={isProcessingRestore}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs md:text-sm text-neutral-950 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(250,204,21,0.3)]"
                  >
                    {isProcessingRestore ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Restaurando Dados...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                        <span>Confirmar e Executar Restauração</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setValidationResult(null);
                      setSelectedFileName(null);
                      setRawPastedJson('');
                    }}
                    className={`w-full sm:w-auto px-4 py-3 rounded-xl font-semibold text-xs border transition-colors ${
                      isDark ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-300' : 'border-neutral-300 hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* SECTION 4: LOCAL SNAPSHOTS HISTORY */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Pontos de Restauração Salvos (Snapshots Locais)</h3>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Crie cópias de segurança rápidas armazenadas no próprio navegador para recuperação instantânea em 1 clique.
                </p>
              </div>
            </div>

            <button
              onClick={handleCreateSnapshot}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                isDark
                  ? 'bg-neutral-900 border-neutral-700 hover:border-yellow-400/40 text-yellow-400'
                  : 'bg-yellow-50 border-yellow-200 hover:border-yellow-300 text-yellow-800'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Criar Novo Snapshot Agora</span>
            </button>
          </div>

          {snapshots.length === 0 ? (
            <div className={`py-12 border border-dashed rounded-xl flex flex-col items-center justify-center text-center space-y-2 ${
              isDark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-400'
            }`}>
              <HardDrive className="w-8 h-8 stroke-1 text-neutral-600" />
              <p className="text-xs font-medium">Nenhum snapshot salvo localmente ainda.</p>
              <p className="text-[11px]">
                Clique no botão acima ou em <strong>"Salvar Snapshot Interno"</strong> para criar seu primeiro ponto de restauração.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-colors ${
                    isDark ? 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700' : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs line-clamp-1" title={snap.name}>
                        {snap.name}
                      </h4>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                        isDark ? 'bg-neutral-900 text-neutral-400' : 'bg-neutral-200 text-neutral-600'
                      }`}>
                        {formatBytes(snap.sizeBytes)}
                      </span>
                    </div>

                    <p className={`text-[11px] font-mono ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      {new Date(snap.createdAt).toLocaleString('pt-BR')}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <span className="font-medium text-yellow-400 font-mono">
                        {snap.data.orders?.length || 0} OS
                      </span>
                      <span className={isDark ? 'text-neutral-600' : 'text-neutral-300'}>•</span>
                      <span className="font-medium text-emerald-400 font-mono">
                        {snap.data.clients?.length || 0} Clientes
                      </span>
                      <span className={isDark ? 'text-neutral-600' : 'text-neutral-300'}>•</span>
                      <span className="font-medium text-amber-400 font-mono">
                        {snap.data.sales?.length || 0} Vendas
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/60">
                    <button
                      onClick={() => handleInspectSnapshot(snap)}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                        isDark
                          ? 'bg-neutral-900 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10'
                          : 'bg-white border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar</span>
                    </button>

                    <button
                      onClick={() => downloadBackupJSONFile(snap.data, `snapshot_${snap.id}.json`)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isDark ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-neutral-300' : 'bg-white border-neutral-300 hover:bg-neutral-100 text-neutral-700'
                      }`}
                      title="Baixar este snapshot como arquivo .json"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteSnapshot(snap.id, snap.name)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isDark ? 'bg-neutral-900 border-neutral-800 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400' : 'bg-white border-neutral-300 hover:bg-rose-50 text-neutral-500 hover:text-rose-600'
                      }`}
                      title="Excluir este snapshot local"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 5: SELECTIVE DATABASE RESET / PURGE */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDark ? 'bg-neutral-900/30 border-rose-500/20' : 'bg-white border-rose-200 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-rose-400">Reset & Limpeza Seletiva do Banco de Dados</h3>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Precisa zerar dados de teste ou iniciar um novo ciclo? Escolha detalhadamente o que excluir e o que manter (como modelos de aparelhos cadastrados e defeitos).
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsResetModalOpen(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 transition-all flex items-center gap-2 whitespace-nowrap active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Configurar Limpeza Seletiva...</span>
            </button>
          </div>
        </div>

      </div>

      {/* SELECTIVE RESET MODAL */}
      <ResetDatabaseModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        ordersCount={orders.length}
        salesCount={sales.length}
        clientsCount={clients.length}
        productsCount={products.length}
        snapshotsCount={snapshots.length}
        theme={theme}
        onConfirmReset={(opts) => {
          if (onSelectiveReset) {
            onSelectiveReset(opts);
          }
          // Refresh snapshots list in case one was created or snapshots were cleared
          setTimeout(() => {
            setSnapshots(getStoredSnapshots());
          }, 300);
          showToast('success', 'Limpeza seletiva do banco de dados aplicada com sucesso!');
        }}
      />
    </div>
  );
};

import React, { useState } from 'react';
import {
  OSConfigOptions,
  MarcaConfig,
  DefeitoConfig,
  AcessorioConfig,
  ChecklistItemConfig,
  AppTheme,
} from '../types';
import {
  Smartphone,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Check,
  X,
  Search,
  Sparkles,
  Shield,
  Layers,
  Wrench,
  SlidersHorizontal,
  HardDrive,
  Cpu,
  Package,
  AlertTriangle,
  UserCheck,
  Palette,
  ChevronRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { AVAILABLE_ICONS, DynamicIcon } from '../utils/iconResolver';

interface OSConfigViewProps {
  config: OSConfigOptions;
  onSaveConfig: (updated: OSConfigOptions) => void;
  onResetDefaults: () => void;
  theme?: AppTheme;
  onClose?: () => void;
}

type ConfigTab = 'BRANDS' | 'MODELS' | 'DEFECTS' | 'ACCESSORIES' | 'CHECKLIST' | 'COLORS_TECHS';

export const OSConfigView: React.FC<OSConfigViewProps> = ({
  config,
  onSaveConfig,
  onResetDefaults,
  theme = 'black-yellow',
  onClose,
}) => {
  const isDark = theme === 'black-yellow' || theme === 'dark';

  const [activeTab, setActiveTab] = useState<ConfigTab>('BRANDS');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search inside tabs
  const [searchTerm, setSearchTerm] = useState('');

  // Brand Management State
  const [editingBrand, setEditingBrand] = useState<MarcaConfig | null>(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandIcon, setNewBrandIcon] = useState('Smartphone');
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);

  // Model Management State
  const [selectedBrandForModels, setSelectedBrandForModels] = useState<string>(
    config.brands[0]?.name || 'Apple'
  );
  const [newModelName, setNewModelName] = useState('');
  const [bulkModelsText, setBulkModelsText] = useState('');
  const [showBulkAddModels, setShowBulkAddModels] = useState(false);
  const [editingModelIndex, setEditingModelIndex] = useState<{ brand: string; index: number; name: string } | null>(null);

  // Defect Management State
  const [editingDefect, setEditingDefect] = useState<DefeitoConfig | null>(null);
  const [showAddDefectModal, setShowAddDefectModal] = useState(false);
  const [defectForm, setDefectForm] = useState<DefeitoConfig>({
    id: '',
    title: '',
    desc: '',
    tag: '',
    icon: 'Wrench',
    color: 'text-yellow-400',
    badge: 'Hardware',
  });

  // Accessory Management State
  const [editingAccessory, setEditingAccessory] = useState<AcessorioConfig | null>(null);
  const [showAddAccessoryModal, setShowAddAccessoryModal] = useState(false);
  const [accessoryForm, setAccessoryForm] = useState<AcessorioConfig>({
    id: '',
    name: '',
    icon: 'Package',
  });

  // Checklist Management State
  const [editingChecklistItem, setEditingChecklistItem] = useState<ChecklistItemConfig | null>(null);
  const [showAddChecklistModal, setShowAddChecklistModal] = useState(false);
  const [checklistForm, setChecklistForm] = useState<ChecklistItemConfig>({
    id: '',
    key: '',
    label: '',
    icon: 'CheckCircle2',
    dangerIfChecked: false,
  });

  // Colors & Techs State
  const [newColor, setNewColor] = useState('');
  const [newTechnician, setNewTechnician] = useState('');

  // Flash notification helper
  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ----------------------------------------------------
  // BRAND ACTIONS
  // ----------------------------------------------------
  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    if (editingBrand) {
      const oldName = editingBrand.name;
      const updatedBrands = config.brands.map((b) =>
        b.id === editingBrand.id ? { ...b, name: newBrandName.trim(), icon: newBrandIcon } : b
      );
      // If brand renamed, migrate its models mapping
      const updatedModels = { ...config.modelsByBrand };
      if (oldName !== newBrandName.trim()) {
        updatedModels[newBrandName.trim()] = updatedModels[oldName] || [];
        delete updatedModels[oldName];
      }
      onSaveConfig({
        ...config,
        brands: updatedBrands,
        modelsByBrand: updatedModels,
      });
      notify(`Marca "${newBrandName.trim()}" atualizada com sucesso!`);
      setEditingBrand(null);
    } else {
      const brandId = `brand-${Date.now()}`;
      const newB: MarcaConfig = {
        id: brandId,
        name: newBrandName.trim(),
        icon: newBrandIcon,
      };
      const updatedModels = { ...config.modelsByBrand };
      if (!updatedModels[newBrandName.trim()]) {
        updatedModels[newBrandName.trim()] = [];
      }
      onSaveConfig({
        ...config,
        brands: [...config.brands, newB],
        modelsByBrand: updatedModels,
      });
      notify(`Marca "${newBrandName.trim()}" adicionada!`);
      setShowAddBrandModal(false);
    }
    setNewBrandName('');
    setNewBrandIcon('Smartphone');
  };

  const handleDeleteBrand = (brand: MarcaConfig) => {
    if (config.brands.length <= 1) {
      notify('Você precisa manter pelo menos uma marca configurada.');
      return;
    }
    if (confirm(`Tem certeza que deseja remover a marca "${brand.name}" e seus modelos associados?`)) {
      const updatedBrands = config.brands.filter((b) => b.id !== brand.id);
      const updatedModels = { ...config.modelsByBrand };
      delete updatedModels[brand.name];

      onSaveConfig({
        ...config,
        brands: updatedBrands,
        modelsByBrand: updatedModels,
      });
      if (selectedBrandForModels === brand.name) {
        setSelectedBrandForModels(updatedBrands[0]?.name || '');
      }
      notify(`Marca "${brand.name}" removida.`);
    }
  };

  // ----------------------------------------------------
  // MODEL ACTIONS
  // ----------------------------------------------------
  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName.trim() || !selectedBrandForModels) return;

    const currentModels = config.modelsByBrand[selectedBrandForModels] || [];
    if (currentModels.includes(newModelName.trim())) {
      notify('Este modelo já está cadastrado para esta marca.');
      return;
    }

    const updated = {
      ...config.modelsByBrand,
      [selectedBrandForModels]: [...currentModels, newModelName.trim()],
    };
    onSaveConfig({ ...config, modelsByBrand: updated });
    notify(`Modelo "${newModelName.trim()}" adicionado a ${selectedBrandForModels}!`);
    setNewModelName('');
  };

  const handleBulkAddModels = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkModelsText.trim() || !selectedBrandForModels) return;

    const parsed = bulkModelsText
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const currentModels = config.modelsByBrand[selectedBrandForModels] || [];
    const uniqueNew = parsed.filter((m) => !currentModels.includes(m));

    const updated = {
      ...config.modelsByBrand,
      [selectedBrandForModels]: [...currentModels, ...uniqueNew],
    };
    onSaveConfig({ ...config, modelsByBrand: updated });
    notify(`${uniqueNew.length} modelos adicionados a ${selectedBrandForModels}!`);
    setBulkModelsText('');
    setShowBulkAddModels(false);
  };

  const handleSaveEditModel = () => {
    if (!editingModelIndex || !editingModelIndex.name.trim()) return;
    const { brand, index, name } = editingModelIndex;
    const currentModels = [...(config.modelsByBrand[brand] || [])];
    currentModels[index] = name.trim();

    const updated = {
      ...config.modelsByBrand,
      [brand]: currentModels,
    };
    onSaveConfig({ ...config, modelsByBrand: updated });
    notify('Modelo atualizado!');
    setEditingModelIndex(null);
  };

  const handleDeleteModel = (brand: string, modelIndex: number) => {
    const currentModels = config.modelsByBrand[brand] || [];
    const removed = currentModels[modelIndex];
    const updatedModels = currentModels.filter((_, i) => i !== modelIndex);

    const updated = {
      ...config.modelsByBrand,
      [brand]: updatedModels,
    };
    onSaveConfig({ ...config, modelsByBrand: updated });
    notify(`Modelo "${removed}" removido.`);
  };

  // ----------------------------------------------------
  // DEFECT ACTIONS
  // ----------------------------------------------------
  const handleSaveDefect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defectForm.title.trim() || !defectForm.tag.trim()) {
      notify('Preencha pelo menos o título e a tag descritiva do defeito.');
      return;
    }

    if (editingDefect) {
      const updated = config.defects.map((d) =>
        d.id === editingDefect.id ? { ...defectForm, id: editingDefect.id } : d
      );
      onSaveConfig({ ...config, defects: updated });
      notify(`Defeito "${defectForm.title}" atualizado!`);
      setEditingDefect(null);
    } else {
      const newDef: DefeitoConfig = {
        ...defectForm,
        id: `def-${Date.now()}`,
      };
      onSaveConfig({ ...config, defects: [...config.defects, newDef] });
      notify(`Defeito "${newDef.title}" cadastrado com sucesso!`);
      setShowAddDefectModal(false);
    }

    setDefectForm({
      id: '',
      title: '',
      desc: '',
      tag: '',
      icon: 'Wrench',
      color: 'text-yellow-400',
      badge: 'Hardware',
    });
  };

  const handleDeleteDefect = (defect: DefeitoConfig) => {
    if (confirm(`Deseja realmente remover o defeito "${defect.title}"?`)) {
      const updated = config.defects.filter((d) => d.id !== defect.id);
      onSaveConfig({ ...config, defects: updated });
      notify(`Defeito "${defect.title}" removido.`);
    }
  };

  // ----------------------------------------------------
  // ACCESSORY ACTIONS
  // ----------------------------------------------------
  const handleSaveAccessory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessoryForm.name.trim()) return;

    if (editingAccessory) {
      const updated = config.accessories.map((a) =>
        a.id === editingAccessory.id ? { ...accessoryForm, id: editingAccessory.id } : a
      );
      onSaveConfig({ ...config, accessories: updated });
      notify(`Acessório "${accessoryForm.name}" atualizado!`);
      setEditingAccessory(null);
    } else {
      const newAcc: AcessorioConfig = {
        ...accessoryForm,
        id: `acc-${Date.now()}`,
      };
      onSaveConfig({ ...config, accessories: [...config.accessories, newAcc] });
      notify(`Acessório "${newAcc.name}" cadastrado!`);
      setShowAddAccessoryModal(false);
    }

    setAccessoryForm({ id: '', name: '', icon: 'Package' });
  };

  const handleDeleteAccessory = (accessory: AcessorioConfig) => {
    if (confirm(`Remover acessório "${accessory.name}"?`)) {
      const updated = config.accessories.filter((a) => a.id !== accessory.id);
      onSaveConfig({ ...config, accessories: updated });
      notify(`Acessório "${accessory.name}" removido.`);
    }
  };

  // ----------------------------------------------------
  // CHECKLIST ACTIONS
  // ----------------------------------------------------
  const handleSaveChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checklistForm.label.trim()) return;

    const generatedKey = checklistForm.key.trim()
      ? checklistForm.key.trim()
      : checklistForm.label
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9]/g, '_');

    if (editingChecklistItem) {
      const updated = config.checklistItems.map((c) =>
        c.id === editingChecklistItem.id ? { ...checklistForm, key: generatedKey } : c
      );
      onSaveConfig({ ...config, checklistItems: updated });
      notify(`Item de checklist "${checklistForm.label}" atualizado!`);
      setEditingChecklistItem(null);
    } else {
      const newItem: ChecklistItemConfig = {
        ...checklistForm,
        id: `chk-${Date.now()}`,
        key: generatedKey,
      };
      onSaveConfig({ ...config, checklistItems: [...config.checklistItems, newItem] });
      notify(`Item de checklist "${newItem.label}" cadastrado!`);
      setShowAddChecklistModal(false);
    }

    setChecklistForm({
      id: '',
      key: '',
      label: '',
      icon: 'CheckCircle2',
      dangerIfChecked: false,
    });
  };

  const handleDeleteChecklist = (item: ChecklistItemConfig) => {
    if (confirm(`Remover o item "${item.label}" do checklist físico de entrada?`)) {
      const updated = config.checklistItems.filter((c) => c.id !== item.id);
      onSaveConfig({ ...config, checklistItems: updated });
      notify(`Item "${item.label}" removido do checklist.`);
    }
  };

  // ----------------------------------------------------
  // COLORS & TECHNICIANS ACTIONS
  // ----------------------------------------------------
  const handleAddColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColor.trim()) return;
    if (config.colors.includes(newColor.trim())) {
      notify('Esta cor já está cadastrada.');
      return;
    }
    onSaveConfig({ ...config, colors: [...config.colors, newColor.trim()] });
    notify(`Cor "${newColor.trim()}" adicionada!`);
    setNewColor('');
  };

  const handleDeleteColor = (color: string) => {
    if (config.colors.length <= 1) {
      notify('Mantenha pelo menos uma cor cadastrada.');
      return;
    }
    onSaveConfig({ ...config, colors: config.colors.filter((c) => c !== color) });
    notify(`Cor "${color}" removida.`);
  };

  const handleAddTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechnician.trim()) return;
    if (config.technicians.includes(newTechnician.trim())) {
      notify('Este técnico já está cadastrado.');
      return;
    }
    onSaveConfig({ ...config, technicians: [...config.technicians, newTechnician.trim()] });
    notify(`Técnico "${newTechnician.trim()}" cadastrado!`);
    setNewTechnician('');
  };

  const handleDeleteTechnician = (tech: string) => {
    if (config.technicians.length <= 1) {
      notify('Mantenha pelo menos um técnico cadastrado.');
      return;
    }
    onSaveConfig({ ...config, technicians: config.technicians.filter((t) => t !== tech) });
    notify(`Técnico "${tech}" removido.`);
  };

  const handleReset = () => {
    if (
      confirm(
        'Tem certeza que deseja restaurar todas as opções de O.S. para os padrões de fábrica? Marcas, modelos e defeitos customizados serão redefinidos.'
      )
    ) {
      onResetDefaults();
      notify('Padrões de fábrica restaurados com sucesso!');
    }
  };

  return (
    <div
      className={`min-h-full flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-[#090A0D] text-neutral-100' : 'bg-neutral-100 text-neutral-900'
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-yellow-400 text-neutral-950 px-4 py-2.5 rounded-xl font-bold shadow-2xl flex items-center gap-2 border border-yellow-300 animate-bounce">
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* View Header */}
      <div
        className={`px-6 py-5 border-b flex flex-wrap items-center justify-between gap-4 ${
          isDark ? 'bg-[#121317] border-[#22242C]' : 'bg-white border-neutral-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 text-neutral-950 flex items-center justify-center font-black shadow-[0_0_15px_rgba(250,204,21,0.3)]">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight">
                Menu de Opções & Parâmetros de O.S.
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 uppercase font-bold">
                Personalizável
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Adicione, edite ou remova marcas, modelos rápidos, defeitos, acessórios e checklist da entrada de O.S.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isDark
                ? 'border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'
            }`}
            title="Restaura a lista original de marcas, modelos e defeitos recomendados"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-yellow-400 text-neutral-950 font-bold hover:bg-yellow-300 transition-colors shadow-xs"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Navigation Category Tabs */}
        <div
          className={`p-1.5 rounded-2xl border flex flex-wrap items-center gap-1.5 ${
            isDark ? 'bg-[#121317] border-[#22242C]' : 'bg-white border-neutral-200'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('BRANDS');
              setSearchTerm('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'BRANDS'
                ? 'bg-yellow-400 text-neutral-950 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                : isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Marcas de Aparelhos</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'BRANDS' ? 'bg-neutral-950 text-yellow-400' : 'bg-[#22242D] text-neutral-300'
              }`}
            >
              {config.brands.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('MODELS');
              setSearchTerm('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'MODELS'
                ? 'bg-yellow-400 text-neutral-950 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                : isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Modelos por Marca</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'MODELS' ? 'bg-neutral-950 text-yellow-400' : 'bg-[#22242D] text-neutral-300'
              }`}
            >
              {Object.values(config.modelsByBrand).reduce((acc, curr) => acc + curr.length, 0)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('DEFECTS');
              setSearchTerm('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'DEFECTS'
                ? 'bg-yellow-400 text-neutral-950 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                : isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Defeitos Recorrentes</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'DEFECTS' ? 'bg-neutral-950 text-yellow-400' : 'bg-[#22242D] text-neutral-300'
              }`}
            >
              {config.defects.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ACCESSORIES');
              setSearchTerm('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ACCESSORIES'
                ? 'bg-yellow-400 text-neutral-950 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                : isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Acessórios Deixados</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'ACCESSORIES' ? 'bg-neutral-950 text-yellow-400' : 'bg-[#22242D] text-neutral-300'
              }`}
            >
              {config.accessories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('CHECKLIST');
              setSearchTerm('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'CHECKLIST'
                ? 'bg-yellow-400 text-neutral-950 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                : isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Checklist Físico</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'CHECKLIST' ? 'bg-neutral-950 text-yellow-400' : 'bg-[#22242D] text-neutral-300'
              }`}
            >
              {config.checklistItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('COLORS_TECHS');
              setSearchTerm('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'COLORS_TECHS'
                ? 'bg-yellow-400 text-neutral-950 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                : isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Cores & Técnicos</span>
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: MARCAS DE APARELHOS                           */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'BRANDS' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-yellow-400" />
                  <span>Marcas Cadastradas para Seleção Rápida</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Estas marcas aparecem como botões visuais na tela de abertura de O.S. Ágil.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingBrand(null);
                  setNewBrandName('');
                  setNewBrandIcon('Smartphone');
                  setShowAddBrandModal(true);
                }}
                className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(250,204,21,0.25)] active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Nova Marca</span>
              </button>
            </div>

            {/* Brands Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {config.brands.map((brand) => {
                const countModels = config.modelsByBrand[brand.name]?.length || 0;
                return (
                  <div
                    key={brand.id}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all group ${
                      isDark
                        ? 'bg-[#121317] border-[#22242C] hover:border-yellow-400/40'
                        : 'bg-white border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 flex items-center justify-center">
                        <DynamicIcon name={brand.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{brand.name}</div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-yellow-400" />
                          <span>{countModels} modelo(s) cadastrado(s)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBrand(brand);
                          setNewBrandName(brand.name);
                          setNewBrandIcon(brand.icon || 'Smartphone');
                          setShowAddBrandModal(true);
                        }}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isDark
                            ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                            : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                        }`}
                        title="Editar Marca"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBrand(brand)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isDark
                            ? 'border-red-900/40 text-red-400 hover:bg-red-500/20 hover:border-red-500'
                            : 'border-red-200 text-red-600 hover:bg-red-50'
                        }`}
                        title="Excluir Marca"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add / Edit Brand Modal */}
            {showAddBrandModal && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                <div
                  className={`max-w-md w-full rounded-2xl border p-5 space-y-4 shadow-2xl ${
                    isDark ? 'bg-[#14151B] border-[#292B35]' : 'bg-white border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-3 border-[#272832]">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-yellow-400" />
                      <span>{editingBrand ? 'Editar Marca' : 'Adicionar Nova Marca'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddBrandModal(false)}
                      className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveBrand} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Nome da Marca *</label>
                      <input
                        type="text"
                        required
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        placeholder="Ex: Asus, Infinix, Huawei, Multilaser..."
                        className={`w-full text-xs px-3 py-2 rounded-lg border outline-none font-bold ${
                          isDark
                            ? 'bg-[#1C1D24] border-[#2E303C] text-white focus:border-yellow-400'
                            : 'bg-white border-neutral-300 focus:border-neutral-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5">
                        Escolha um Ícone para a Marca:
                      </label>
                      <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1 border rounded-lg border-[#272832] bg-[#0E0F12]">
                        {AVAILABLE_ICONS.map((iconName) => (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setNewBrandIcon(iconName)}
                            className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${
                              newBrandIcon === iconName
                                ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-xs'
                                : 'bg-[#181920] border-[#272832] text-neutral-400 hover:text-white hover:border-neutral-600'
                            }`}
                            title={iconName}
                          >
                            <DynamicIcon name={iconName} className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#272832]">
                      <button
                        type="button"
                        onClick={() => setShowAddBrandModal(false)}
                        className="px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-yellow-400 text-neutral-950 font-bold rounded-lg text-xs hover:bg-yellow-300 transition-colors shadow-xs"
                      >
                        {editingBrand ? 'Salvar Alterações' : 'Cadastrar Marca'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: MODELOS POR MARCA                             */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'MODELS' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-yellow-400" />
                  <span>Modelos de Aparelhos (Atalhos de 1 Toque)</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Gerencie os modelos frequentes que aparecem ao clicar na marca durante o cadastro de O.S.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkAddModels(!showBulkAddModels)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    showBulkAddModels
                      ? 'bg-yellow-400 text-neutral-950 border-yellow-400'
                      : isDark
                      ? 'border-[#2D2E38] text-neutral-300 hover:bg-[#202129]'
                      : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Importar em Lote</span>
                </button>
              </div>
            </div>

            {/* Select Brand Carousel / Pills */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-neutral-400">Selecione a Marca:</span>
              <div className="flex flex-wrap gap-2">
                {config.brands.map((b) => {
                  const count = config.modelsByBrand[b.name]?.length || 0;
                  const isSelected = selectedBrandForModels === b.name;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setSelectedBrandForModels(b.name);
                        setEditingModelIndex(null);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-yellow-400 text-neutral-950 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                          : isDark
                          ? 'bg-[#181920] border border-[#272832] text-neutral-300 hover:text-white hover:border-yellow-400/40'
                          : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <DynamicIcon name={b.icon} className="w-3.5 h-3.5" />
                      <span>{b.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isSelected ? 'bg-neutral-950 text-yellow-400' : 'bg-[#262732] text-neutral-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bulk Add Form */}
            {showBulkAddModels && (
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-[#14151B] border-yellow-400/30' : 'bg-yellow-50/50 border-yellow-300'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1.5 text-yellow-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Adicionar Vários Modelos para {selectedBrandForModels}</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Cole uma lista de modelos separados por vírgula ou por linha (ex: iPhone 14, iPhone 14 Pro, iPhone 14 Pro Max).
                </p>
                <form onSubmit={handleBulkAddModels} className="space-y-3">
                  <textarea
                    rows={3}
                    value={bulkModelsText}
                    onChange={(e) => setBulkModelsText(e.target.value)}
                    placeholder="Cole aqui os modelos..."
                    className={`w-full text-xs p-3 rounded-lg border outline-none font-sans ${
                      isDark
                        ? 'bg-[#1C1D24] border-[#2E303C] text-white focus:border-yellow-400'
                        : 'bg-white border-neutral-300 focus:border-neutral-900'
                    }`}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBulkAddModels(false)}
                      className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-yellow-400 text-neutral-950 font-bold rounded-lg text-xs hover:bg-yellow-300 transition-colors shadow-xs"
                    >
                      Processar e Inserir
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Quick Add Single Model */}
            <form onSubmit={handleAddModel} className="flex gap-2">
              <input
                type="text"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder={`Adicionar novo modelo para ${selectedBrandForModels} (ex: Galaxy S24 Ultra)...`}
                className={`flex-1 text-xs px-3.5 py-2.5 rounded-xl border outline-none font-semibold ${
                  isDark
                    ? 'bg-[#121317] border-[#22242C] text-white focus:border-yellow-400'
                    : 'bg-white border-neutral-300 focus:border-neutral-900'
                }`}
              />
              <button
                type="submit"
                disabled={!newModelName.trim()}
                className="px-4 py-2 bg-yellow-400 text-neutral-950 font-bold rounded-xl text-xs hover:bg-yellow-300 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Adicionar</span>
              </button>
            </form>

            {/* Models Chip Grid */}
            <div
              className={`p-4 rounded-2xl border min-h-[160px] ${
                isDark ? 'bg-[#121317] border-[#22242C]' : 'bg-white border-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3 border-b pb-2 border-[#22242C]">
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Modelos cadastrados para {selectedBrandForModels}:</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filtrar nesta marca..."
                    className={`text-xs px-2.5 py-1 pl-7 rounded-lg border outline-none ${
                      isDark
                        ? 'bg-[#181920] border-[#2A2B35] text-white focus:border-yellow-400'
                        : 'bg-neutral-50 border-neutral-300'
                    }`}
                  />
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2" />
                </div>
              </div>

              {(!config.modelsByBrand[selectedBrandForModels] ||
                config.modelsByBrand[selectedBrandForModels].length === 0) && (
                <div className="py-8 text-center text-xs text-neutral-500 italic">
                  Nenhum modelo cadastrado para {selectedBrandForModels}. Use o campo acima para adicionar.
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {(config.modelsByBrand[selectedBrandForModels] || [])
                  .filter((m) => m.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((modelName, idx) => {
                    const isEditing =
                      editingModelIndex?.brand === selectedBrandForModels &&
                      editingModelIndex?.index === idx;

                    if (isEditing) {
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-1 bg-[#1F2028] border border-yellow-400 p-1 rounded-lg"
                        >
                          <input
                            type="text"
                            value={editingModelIndex.name}
                            onChange={(e) =>
                              setEditingModelIndex({ ...editingModelIndex, name: e.target.value })
                            }
                            autoFocus
                            className="text-xs px-2 py-0.5 rounded bg-[#101114] text-white outline-none w-36 font-semibold"
                          />
                          <button
                            type="button"
                            onClick={handleSaveEditModel}
                            className="p-1 rounded hover:bg-yellow-400 hover:text-neutral-950 text-yellow-400"
                            title="Salvar"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingModelIndex(null)}
                            className="p-1 rounded hover:bg-neutral-700 text-neutral-400"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        className={`group px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                          isDark
                            ? 'bg-[#181920] border-[#2A2B35] text-neutral-200 hover:border-yellow-400/50'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                        }`}
                      >
                        <span>{modelName}</span>
                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingModelIndex({
                                brand: selectedBrandForModels,
                                index: idx,
                                name: modelName,
                              })
                            }
                            className="p-0.5 text-neutral-400 hover:text-yellow-400"
                            title="Editar Nome do Modelo"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteModel(selectedBrandForModels, idx)}
                            className="p-0.5 text-neutral-400 hover:text-red-400"
                            title="Excluir Modelo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: DEFEITOS RECORRENTES COM CARDS VISUAIS        */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'DEFECTS' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-yellow-400" />
                  <span>Defeitos Recorrentes & Cartões de Triagem</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Estes cartões são exibidos com ícones na tela de abertura de O.S. para seleção com 1 clique.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingDefect(null);
                  setDefectForm({
                    id: '',
                    title: '',
                    desc: '',
                    tag: '',
                    icon: 'Wrench',
                    color: 'text-yellow-400',
                    badge: 'Frequente',
                  });
                  setShowAddDefectModal(true);
                }}
                className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(250,204,21,0.25)] active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Novo Defeito</span>
              </button>
            </div>

            {/* Defects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {config.defects.map((defect) => {
                return (
                  <div
                    key={defect.id}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all group ${
                      isDark
                        ? 'bg-[#121317] border-[#22242C] hover:border-yellow-400/50'
                        : 'bg-white border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 flex items-center justify-center font-bold">
                          <DynamicIcon name={defect.icon} className="w-5 h-5" />
                        </div>
                        {defect.badge && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1F2028] text-yellow-400 border border-[#2D2E3A] font-semibold">
                            {defect.badge}
                          </span>
                        )}
                      </div>

                      <div className="mt-3">
                        <div className="font-bold text-xs text-white leading-tight">
                          {defect.title}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                          {defect.desc}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-500 mt-2 bg-[#0E0F12] p-1.5 rounded-lg border border-[#202128] truncate">
                          Tag O.S.: {defect.tag}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 mt-3 pt-2 border-t border-[#1F2027]">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDefect(defect);
                          setDefectForm(defect);
                          setShowAddDefectModal(true);
                        }}
                        className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 ${
                          isDark
                            ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                            : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                        }`}
                        title="Editar Defeito"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span className="text-[11px]">Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDefect(defect)}
                        className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 ${
                          isDark
                            ? 'border-red-900/40 text-red-400 hover:bg-red-500/20 hover:border-red-500'
                            : 'border-red-200 text-red-600 hover:bg-red-50'
                        }`}
                        title="Excluir Defeito"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span className="text-[11px]">Excluir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add / Edit Defect Modal */}
            {showAddDefectModal && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                <div
                  className={`max-w-lg w-full rounded-2xl border p-5 space-y-4 shadow-2xl ${
                    isDark ? 'bg-[#14151B] border-[#292B35]' : 'bg-white border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-3 border-[#272832]">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-yellow-400" />
                      <span>{editingDefect ? 'Editar Defeito' : 'Cadastrar Novo Defeito'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddDefectModal(false)}
                      className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveDefect} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Título do Cartão *</label>
                        <input
                          type="text"
                          required
                          value={defectForm.title}
                          onChange={(e) => setDefectForm({ ...defectForm, title: e.target.value })}
                          placeholder="Ex: Não Carrega Tipo-C"
                          className={`w-full text-xs px-3 py-2 rounded-lg border outline-none font-bold ${
                            isDark
                              ? 'bg-[#1C1D24] border-[#2E303C] text-white focus:border-yellow-400'
                              : 'bg-white border-neutral-300 focus:border-neutral-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">Badge / Categoria</label>
                        <input
                          type="text"
                          value={defectForm.badge || ''}
                          onChange={(e) => setDefectForm({ ...defectForm, badge: e.target.value })}
                          placeholder="Ex: Hardware, Urgente, Placa..."
                          className={`w-full text-xs px-3 py-2 rounded-lg border outline-none font-mono ${
                            isDark
                              ? 'bg-[#1C1D24] border-[#2E303C] text-yellow-400 focus:border-yellow-400'
                              : 'bg-white border-neutral-300 focus:border-neutral-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Descrição Curta</label>
                      <input
                        type="text"
                        value={defectForm.desc}
                        onChange={(e) => setDefectForm({ ...defectForm, desc: e.target.value })}
                        placeholder="Ex: Conector com mau contato / folga..."
                        className={`w-full text-xs px-3 py-2 rounded-lg border outline-none ${
                          isDark
                            ? 'bg-[#1C1D24] border-[#2E303C] text-white focus:border-yellow-400'
                            : 'bg-white border-neutral-300 focus:border-neutral-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Texto Inserido no Laudo / O.S. *
                      </label>
                      <input
                        type="text"
                        required
                        value={defectForm.tag}
                        onChange={(e) => setDefectForm({ ...defectForm, tag: e.target.value })}
                        placeholder="Ex: Conector de carga danificado / não passa amperagem"
                        className={`w-full text-xs px-3 py-2 rounded-lg border outline-none ${
                          isDark
                            ? 'bg-[#1C1D24] border-[#2E303C] text-white focus:border-yellow-400'
                            : 'bg-white border-neutral-300 focus:border-neutral-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5">Escolha um Ícone:</label>
                      <div className="grid grid-cols-7 gap-2 max-h-36 overflow-y-auto p-1.5 border rounded-lg border-[#272832] bg-[#0E0F12]">
                        {AVAILABLE_ICONS.map((iconName) => (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setDefectForm({ ...defectForm, icon: iconName })}
                            className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${
                              defectForm.icon === iconName
                                ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-xs'
                                : 'bg-[#181920] border-[#272832] text-neutral-400 hover:text-white hover:border-neutral-600'
                            }`}
                            title={iconName}
                          >
                            <DynamicIcon name={iconName} className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#272832]">
                      <button
                        type="button"
                        onClick={() => setShowAddDefectModal(false)}
                        className="px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-yellow-400 text-neutral-950 font-bold rounded-lg text-xs hover:bg-yellow-300 transition-colors shadow-xs"
                      >
                        {editingDefect ? 'Salvar Alterações' : 'Salvar Defeito'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: ACESSÓRIOS DEIXADOS                           */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'ACCESSORIES' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Package className="w-4 h-4 text-yellow-400" />
                  <span>Acessórios Deixados com o Aparelho</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Itens físicos recebidos junto ao smartphone (capa, carregador, fone, etc.) impressos no comprovante.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingAccessory(null);
                  setAccessoryForm({ id: '', name: '', icon: 'Package' });
                  setShowAddAccessoryModal(true);
                }}
                className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(250,204,21,0.25)] active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Novo Acessório</span>
              </button>
            </div>

            {/* Accessories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {config.accessories.map((acc) => (
                <div
                  key={acc.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all group ${
                    isDark
                      ? 'bg-[#121317] border-[#22242C] hover:border-yellow-400/40'
                      : 'bg-white border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 flex items-center justify-center font-bold">
                      <DynamicIcon name={acc.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">{acc.name}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">Ícone: {acc.icon || 'Padrão'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAccessory(acc);
                        setAccessoryForm(acc);
                        setShowAddAccessoryModal(true);
                      }}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isDark
                          ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                          : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                      }`}
                      title="Editar Acessório"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAccessory(acc)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isDark
                          ? 'border-red-900/40 text-red-400 hover:bg-red-500/20 hover:border-red-500'
                          : 'border-red-200 text-red-600 hover:bg-red-50'
                      }`}
                      title="Excluir Acessório"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add / Edit Accessory Modal */}
            {showAddAccessoryModal && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                <div
                  className={`max-w-md w-full rounded-2xl border p-5 space-y-4 shadow-2xl ${
                    isDark ? 'bg-[#14151B] border-[#292B35]' : 'bg-white border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-3 border-[#272832]">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Package className="w-4 h-4 text-yellow-400" />
                      <span>{editingAccessory ? 'Editar Acessório' : 'Adicionar Acessório'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddAccessoryModal(false)}
                      className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveAccessory} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Nome do Acessório *</label>
                      <input
                        type="text"
                        required
                        value={accessoryForm.name}
                        onChange={(e) => setAccessoryForm({ ...accessoryForm, name: e.target.value })}
                        placeholder="Ex: Caneta S-Pen / Carregador MagSafe..."
                        className={`w-full text-xs px-3 py-2 rounded-lg border outline-none font-bold ${
                          isDark
                            ? 'bg-[#1C1D24] border-[#2E303C] text-white focus:border-yellow-400'
                            : 'bg-white border-neutral-300 focus:border-neutral-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5">Escolha o Ícone:</label>
                      <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1.5 border rounded-lg border-[#272832] bg-[#0E0F12]">
                        {AVAILABLE_ICONS.map((iconName) => (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setAccessoryForm({ ...accessoryForm, icon: iconName })}
                            className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${
                              accessoryForm.icon === iconName
                                ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-xs'
                                : 'bg-[#181920] border-[#272832] text-neutral-400 hover:text-white hover:border-neutral-600'
                            }`}
                            title={iconName}
                          >
                            <DynamicIcon name={iconName} className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#272832]">
                      <button
                        type="button"
                        onClick={() => setShowAddAccessoryModal(false)}
                        className="px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-yellow-400 text-neutral-950 font-bold rounded-lg text-xs hover:bg-yellow-300 transition-colors shadow-xs"
                      >
                        {editingAccessory ? 'Salvar Alterações' : 'Salvar Acessório'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: CHECKLIST FÍSICO DE ENTRADA                   */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'CHECKLIST' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-yellow-400" />
                  <span>Checklist Físico & Proteção de Recepção</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Itens de verificação de entrada para proteger sua assistência de divergências ou danos prévios.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingChecklistItem(null);
                  setChecklistForm({
                    id: '',
                    key: '',
                    label: '',
                    icon: 'CheckCircle2',
                    dangerIfChecked: false,
                  });
                  setShowAddChecklistModal(true);
                }}
                className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(250,204,21,0.25)] active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Novo Item de Checklist</span>
              </button>
            </div>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {config.checklistItems.map((chk) => (
                <div
                  key={chk.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all group ${
                    isDark
                      ? 'bg-[#121317] border-[#22242C] hover:border-yellow-400/40'
                      : 'bg-white border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold border ${
                        chk.dangerIfChecked
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30'
                      }`}
                    >
                      <DynamicIcon name={chk.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">{chk.label}</div>
                      <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>Chave: {chk.key}</span>
                        {chk.dangerIfChecked && (
                          <span className="text-amber-400 font-bold bg-amber-500/10 px-1 rounded">
                            Alerta de Dano
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingChecklistItem(chk);
                        setChecklistForm(chk);
                        setShowAddChecklistModal(true);
                      }}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isDark
                          ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                          : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                      }`}
                      title="Editar Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteChecklist(chk)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isDark
                          ? 'border-red-900/40 text-red-400 hover:bg-red-500/20 hover:border-red-500'
                          : 'border-red-200 text-red-600 hover:bg-red-50'
                      }`}
                      title="Excluir Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add / Edit Checklist Modal */}
            {showAddChecklistModal && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                <div
                  className={`max-w-md w-full rounded-2xl border p-5 space-y-4 shadow-2xl ${
                    isDark ? 'bg-[#14151B] border-[#292B35]' : 'bg-white border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-3 border-[#272832]">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Shield className="w-4 h-4 text-yellow-400" />
                      <span>{editingChecklistItem ? 'Editar Item' : 'Novo Item de Checklist'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddChecklistModal(false)}
                      className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveChecklist} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Rótulo da Pergunta / Item *
                      </label>
                      <input
                        type="text"
                        required
                        value={checklistForm.label}
                        onChange={(e) => setChecklistForm({ ...checklistForm, label: e.target.value })}
                        placeholder="Ex: Face ID / Biometria funcionando..."
                        className={`w-full text-xs px-3 py-2 rounded-lg border outline-none font-bold ${
                          isDark
                            ? 'bg-[#1C1D24] border-[#2E303C] text-white focus:border-yellow-400'
                            : 'bg-white border-neutral-300 focus:border-neutral-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Chave Técnica (opcional)</label>
                      <input
                        type="text"
                        value={checklistForm.key}
                        onChange={(e) => setChecklistForm({ ...checklistForm, key: e.target.value })}
                        placeholder="Ex: biometricsWorking (gerado automaticamente se vazio)"
                        className={`w-full text-xs px-3 py-2 rounded-lg border outline-none font-mono ${
                          isDark
                            ? 'bg-[#1C1D24] border-[#2E303C] text-yellow-400 focus:border-yellow-400'
                            : 'bg-white border-neutral-300 focus:border-neutral-900'
                        }`}
                      />
                    </div>

                    <div className="pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={checklistForm.dangerIfChecked}
                          onChange={(e) =>
                            setChecklistForm({ ...checklistForm, dangerIfChecked: e.target.checked })
                          }
                          className="w-4 h-4 accent-amber-400"
                        />
                        <span className="font-semibold text-neutral-300">
                          Este item representa avaria prévia (destacar em amarelo/vermelho de alerta)
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5">Escolha o Ícone:</label>
                      <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1.5 border rounded-lg border-[#272832] bg-[#0E0F12]">
                        {AVAILABLE_ICONS.map((iconName) => (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setChecklistForm({ ...checklistForm, icon: iconName })}
                            className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${
                              checklistForm.icon === iconName
                                ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-xs'
                                : 'bg-[#181920] border-[#272832] text-neutral-400 hover:text-white hover:border-neutral-600'
                            }`}
                            title={iconName}
                          >
                            <DynamicIcon name={iconName} className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#272832]">
                      <button
                        type="button"
                        onClick={() => setShowAddChecklistModal(false)}
                        className="px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-yellow-400 text-neutral-950 font-bold rounded-lg text-xs hover:bg-yellow-300 transition-colors shadow-xs"
                      >
                        {editingChecklistItem ? 'Salvar Alterações' : 'Salvar Item'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: CORES & TÉCNICOS                              */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'COLORS_TECHS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* COLORS SECTION */}
            <div
              className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-[#121317] border-[#22242C]' : 'bg-white border-neutral-200'
              }`}
            >
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Palette className="w-4 h-4 text-yellow-400" />
                  <span>Cores de Aparelhos</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Opções disponíveis no menu suspenso de cor do smartphone.
                </p>
              </div>

              <form onSubmit={handleAddColor} className="flex gap-2">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Nova cor (ex: Titânio Natural, Rose Gold)..."
                  className={`flex-1 text-xs px-3 py-2 rounded-xl border outline-none font-semibold ${
                    isDark
                      ? 'bg-[#181920] border-[#2A2B35] text-white focus:border-yellow-400'
                      : 'bg-white border-neutral-300 focus:border-neutral-900'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!newColor.trim()}
                  className="px-3.5 py-2 bg-yellow-400 text-neutral-950 font-bold rounded-xl text-xs hover:bg-yellow-300 transition-colors disabled:opacity-50 flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Adicionar</span>
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                {config.colors.map((color) => (
                  <div
                    key={color}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                      isDark
                        ? 'bg-[#181920] border-[#2A2B35] text-neutral-200'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                    }`}
                  >
                    <span>{color}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteColor(color)}
                      className="text-neutral-400 hover:text-red-400 p-0.5"
                      title="Excluir Cor"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* TECHNICIANS SECTION */}
            <div
              className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-[#121317] border-[#22242C]' : 'bg-white border-neutral-200'
              }`}
            >
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-yellow-400" />
                  <span>Técnicos & Bancadas de Reparo</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Profissionais responsáveis pela execução dos serviços.
                </p>
              </div>

              <form onSubmit={handleAddTechnician} className="flex gap-2">
                <input
                  type="text"
                  value={newTechnician}
                  onChange={(e) => setNewTechnician(e.target.value)}
                  placeholder="Nome do técnico (ex: Lucas - Bancada 2)..."
                  className={`flex-1 text-xs px-3 py-2 rounded-xl border outline-none font-semibold ${
                    isDark
                      ? 'bg-[#181920] border-[#2A2B35] text-white focus:border-yellow-400'
                      : 'bg-white border-neutral-300 focus:border-neutral-900'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!newTechnician.trim()}
                  className="px-3.5 py-2 bg-yellow-400 text-neutral-950 font-bold rounded-xl text-xs hover:bg-yellow-300 transition-colors disabled:opacity-50 flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Adicionar</span>
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                {config.technicians.map((tech) => (
                  <div
                    key={tech}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                      isDark
                        ? 'bg-[#181920] border-[#2A2B35] text-neutral-200'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                    }`}
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTechnician(tech)}
                      className="text-neutral-400 hover:text-red-400 p-0.5"
                      title="Excluir Técnico"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

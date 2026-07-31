import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RequisitionOrder, StorageLocationType, ItemCategory, ItemConditionStatus, RequisitionItem, RequisitionItemStatus, Supplier, SparePartItem } from '../../types';
import { 
  ShoppingCart, Plus, Truck, Building2, Package, CheckCircle2, 
  Clock, DollarSign, ArrowRightLeft, Ship, MapPin, Droplets, BookOpen, 
  AlertTriangle, Wrench, RefreshCw, AlertCircle, Anchor, Search, Trash2, Star, Phone, Mail, Award, Edit3, XCircle 
} from 'lucide-react';

export const InventoryProcurement: React.FC = () => {
  const { 
    vessels, selectedVessel, requisitions, addRequisition, updateRequisitionMetadata, updateRequisitionStatus, updateRequisitionItem, removeRequisitionItem, deleteRequisition,
    suppliers, addSupplier, updateSupplier, deleteSupplier, spareParts, addSparePart, updateSparePart, deleteSparePart, transferPartToShip, 
    updateItemConditionStatus, activeRole 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inventory_mgmt' | 'requisitions' | 'vendors'>('inventory_mgmt');
  const [searchTerm, setSearchTerm] = useState('');
  const [storageFilter, setStorageFilter] = useState<'All' | 'Ship Storage' | 'Land Storage'>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Spare Part' | 'Consumable'>('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'All' | 'Healthy' | 'Low Stock'>('All');

  // Requisition Filters
  const [reqFilterStatus, setReqFilterStatus] = useState<string>('All');
  const [reqFilterVendor, setReqFilterVendor] = useState<string>('All');
  const [reqFilterUrgency, setReqFilterUrgency] = useState<string>('All');
  const [reqSortBy, setReqSortBy] = useState<string>('Date (Newest)');
  const [conditionFilter, setConditionFilter] = useState<string>('All');

  // Modals
  const [isAddRequisitionModalOpen, setIsAddRequisitionModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);

  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [editingVendor, setEditingVendor] = useState<Supplier | null>(null);

  // Transfer & Condition Modals
  const [transferModalPart, setTransferModalPart] = useState<SparePartItem | null>(null);
  const [transferVesselId, setTransferVesselId] = useState<string>(vessels[0]?.id || 'vessel-1');
  const [transferLocationName, setTransferLocationName] = useState<string>('Engine Room Store');

  const [conditionModalPart, setConditionModalPart] = useState<SparePartItem | null>(null);
  const [conditionStatusInput, setConditionStatusInput] = useState<ItemConditionStatus>('Good / Ready');
  const [conditionNotesInput, setConditionNotesInput] = useState<string>('');
  const [offloadVesselNameInput, setOffloadVesselNameInput] = useState<string>(selectedVessel.name);

  // Per-Item Edit Modal State
  const [itemEditState, setItemEditState] = useState<{
    reqId: string;
    itemIndex: number;
    item: RequisitionItem;
  } | null>(null);
  const [itemEditSupplier, setItemEditSupplier] = useState<string>('');
  const [itemEditStatus, setItemEditStatus] = useState<RequisitionItemStatus>('Requested');
  const [itemEditDenialReason, setItemEditDenialReason] = useState<string>('');
  const [itemEditComment, setItemEditComment] = useState<string>('');
  const [itemEditSize, setItemEditSize] = useState<string>('');
  const [itemEditQty, setItemEditQty] = useState<number>(0);
  const [itemEditUnit, setItemEditUnit] = useState<string>('');
  const [itemEditUnitPrice, setItemEditUnitPrice] = useState<number>(0);

  // Vendor Form
  const [vendorFormData, setVendorFormData] = useState({
    name: '',
    category: 'Main Propulsion Spares & Technical Service',
    rating: 4.8,
    contactEmail: 'spares@vendor.com',
    phone: '+65 6800 1234',
    country: 'Singapore',
    address: '10 Marine Logistics Way, Singapore',
    status: 'Approved Supplier' as Supplier['status'],
    performanceNotes: 'OEM certified marine technical vendor.',
    picName: 'Klaus Lindner (Head of Sales)',
    picPhone: '+49 40 3110 889',
    picEmail: 'klaus.lindner@man-es.de',
    areaCoverage: 'Singapore, Rotterdam, Houston, Shanghai',
  });

  // Inventory Item Form
  const [itemFormData, setItemFormData] = useState({
    partName: '',
    partNumber: '',
    itemCategory: 'Consumable (Oils, Supplies, Chemicals, Logbooks)' as ItemCategory,
    stockQty: 10,
    minStockQty: 3,
    unitCostIDR: 120,
    locationType: 'Land Storage' as StorageLocationType,
    locationName: 'Singapore Central Marine Depot (Bay 4)',
    conditionStatus: 'Good / Ready' as ItemConditionStatus,
  });

  // Multi-Item Requisition Form with Per-Item Vendors & Dynamic Item Creation
  const [reqFormData, setReqFormData] = useState({
    requestedBy: activeRole === 'chief_engineer' ? 'Chief Engineer H. Vance' : '2nd Engineer M. Kowalski',
    dateRequested: new Date().toISOString().split('T')[0],
    originLocationType: 'Land Storage' as StorageLocationType,
    originLocationName: 'Singapore Central Marine Depot (Bay 4)',
    deliveryPort: 'Port of Singapore',
    estimatedDeliveryDate: '2026-08-05',
    itemsList: [
      { 
        partName: 'Lube Oil Cartridge Filter', 
        partNumber: 'DH-LOF-40911', 
        qtyRequested: 10, 
        unitPriceIDR: 180, 
        itemCategory: 'Spare Part (Non-Consumable)' as ItemCategory,
        supplierName: suppliers[0]?.name || 'MAN Energy Solutions Singapore Hub',
        status: 'Requested' as RequisitionItemStatus
      },
      { 
        partName: 'System Degreaser Chemical (20L)', 
        partNumber: 'CHEM-DEG-20L', 
        qtyRequested: 5, 
        unitPriceIDR: 110, 
        itemCategory: 'Consumable (Oils, Supplies, Chemicals, Logbooks)' as ItemCategory,
        supplierName: suppliers[1]?.name || 'Alfa Laval Marine Rotterdam Central Depot',
        status: 'Requested' as RequisitionItemStatus
      }
    ] as RequisitionItem[]
  });

  // New Item Row in Requisition Form
  const [newItemRow, setNewItemRow] = useState<RequisitionItem>({
    partName: '',
    partNumber: '',
    qtyRequested: 1,
    unitPriceIDR: 100,
    itemCategory: 'Spare Part (Non-Consumable)',
    supplierName: suppliers[0]?.name || 'MAN Energy Solutions Singapore Hub',
    status: 'Requested',
  });

  const isAllVessels = selectedVessel.id === 'all_vessels';
  const targetVesselId = isAllVessels ? undefined : selectedVessel.id;

  const vesselRequisitions = requisitions.filter(r => {
    if (targetVesselId && r.vesselId !== targetVesselId) return false;
    
    // Search Term
    if (searchTerm) {
      const matchSearch = r.requisitionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.items.some(i => i.partName.toLowerCase().includes(searchTerm.toLowerCase()) || (i.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchSearch) return false;
    }

    // Advanced Filters
    if (reqFilterStatus !== 'All' && r.overallStatus !== reqFilterStatus) return false;
    if (reqFilterUrgency === 'Urgent Only' && !r.items.some(i => i.isUrgent)) return false;
    if (reqFilterVendor !== 'All') {
      const hasVendor = r.items.some(item => item.supplierName === reqFilterVendor);
      if (!hasVendor) return false;
    }
    return true;
  }).sort((a, b) => {
    if (reqSortBy === 'Date (Newest)') return new Date(b.dateRequested).getTime() - new Date(a.dateRequested).getTime();
    if (reqSortBy === 'Date (Oldest)') return new Date(a.dateRequested).getTime() - new Date(b.dateRequested).getTime();
    if (reqSortBy === 'Price (Highest)') return (b.totalCostIDR || 0) - (a.totalCostIDR || 0);
    if (reqSortBy === 'Price (Lowest)') return (a.totalCostIDR || 0) - (b.totalCostIDR || 0);
    if (reqSortBy === 'Urgency') {
      const aUrgent = a.items.some(i => i.isUrgent);
      const bUrgent = b.items.some(i => i.isUrgent);
      if (aUrgent && !bUrgent) return -1;
      if (!aUrgent && bUrgent) return 1;
      return 0;
    }
    return 0;
  });

  const filteredSpareParts = spareParts.filter(sp => {
    const matchesVessel = sp.locationType === 'Land Storage' || !targetVesselId || sp.vesselId === targetVesselId;
    const matchesStorage = storageFilter === 'All' || sp.locationType === storageFilter;
    const matchesCategory = categoryFilter === 'All' || 
      (categoryFilter === 'Spare Part' && sp.itemCategory.includes('Spare Part')) ||
      (categoryFilter === 'Consumable' && sp.itemCategory.includes('Consumable'));
    
    let matchesStock = true;
    if (stockStatusFilter === 'Low Stock') matchesStock = sp.stockQty <= sp.minStockQty;
    if (stockStatusFilter === 'Healthy') matchesStock = sp.stockQty > sp.minStockQty;

    const matchesCondition = conditionFilter === 'All' || sp.conditionStatus === conditionFilter;
    const matchesSearch = sp.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sp.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (sp.locationName || '').toLowerCase().includes(searchTerm.toLowerCase());
                          
    return matchesVessel && matchesStorage && matchesCategory && matchesStock && matchesCondition && matchesSearch;
  });

  const openAddItemModal = () => {
    setEditingPartId(null);
    setItemFormData({
      partName: '',
      partNumber: '',
      itemCategory: 'Consumable (Oils, Supplies, Chemicals, Logbooks)',
      stockQty: 10,
      minStockQty: 3,
      unitCostIDR: 120,
      expectedLifespanHours: 6000,
      locationType: 'Land Storage',
      locationName: 'Singapore Central Marine Depot (Bay 4)',
      conditionStatus: 'Good / Ready',
    });
    setIsAddItemModalOpen(true);
  };

  const openEditItemModal = (part: SparePartItem) => {
    setEditingPartId(part.id);
    setItemFormData({
      partName: part.partName,
      partNumber: part.partNumber,
      itemCategory: part.itemCategory,
      stockQty: part.stockQty,
      minStockQty: part.minStockQty,
      unitCostIDR: part.unitCostIDR,
      expectedLifespanHours: part.expectedLifespanHours || 6000,
      locationType: part.locationType,
      locationName: part.locationName,
      conditionStatus: part.conditionStatus,
    });
    setIsAddItemModalOpen(true);
  };

  const handleItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPartId) {
      updateSparePart(editingPartId, {
        partName: itemFormData.partName,
        partNumber: itemFormData.partNumber,
        itemCategory: itemFormData.itemCategory,
        stockQty: Number(itemFormData.stockQty),
        minStockQty: Number(itemFormData.minStockQty),
        unitCostIDR: Number(itemFormData.unitCostIDR),
        expectedLifespanHours: Number(itemFormData.expectedLifespanHours || 6000),
        locationType: itemFormData.locationType,
        locationName: itemFormData.locationName,
        conditionStatus: itemFormData.conditionStatus,
      });
    } else {
      addSparePart({
        ...itemFormData,
        vesselId: itemFormData.locationType === 'Ship Storage' ? (selectedVessel.id === 'all_vessels' ? vessels[0].id : selectedVessel.id) : undefined,
        stockQty: Number(itemFormData.stockQty),
        minStockQty: Number(itemFormData.minStockQty),
        unitCostIDR: Number(itemFormData.unitCostIDR),
        expectedLifespanHours: Number(itemFormData.expectedLifespanHours || 6000),
      });
    }
    setIsAddItemModalOpen(false);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalPart) return;
    transferPartToShip(transferModalPart.id, transferVesselId, transferLocationName);
    setTransferModalPart(null);
  };

  const handleConditionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conditionModalPart) return;
    updateItemConditionStatus(conditionModalPart.id, conditionStatusInput, conditionNotesInput, offloadVesselNameInput);
    setConditionModalPart(null);
  };

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVendor) {
      updateSupplier(editingVendor.id, vendorFormData);
      setEditingVendor(null);
    } else {
      addSupplier(vendorFormData);
    }
    setIsAddVendorModalOpen(false);
  };

  const handleAddItemToReqForm = () => {
    if (!newItemRow.partName) return;
    setReqFormData(prev => ({
      ...prev,
      itemsList: [...prev.itemsList, newItemRow]
    }));
    setNewItemRow({
      partName: '',
      partNumber: '',
      qtyRequested: 1,
      unitPriceIDR: 100,
      itemCategory: 'Spare Part (Non-Consumable)',
      supplierName: suppliers[0]?.name || 'MAN Energy Solutions Singapore Hub',
      status: 'Requested',
    });
  };

  const handleRemoveItemFromReqForm = (index: number) => {
    setReqFormData(prev => ({
      ...prev,
      itemsList: prev.itemsList.filter((_, idx) => idx !== index)
    }));
  };

  const handleRequisitionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalCost = reqFormData.itemsList.reduce((acc, item) => acc + (item.qtyRequested * item.unitPriceIDR), 0);
    const firstSupplierName = reqFormData.itemsList[0]?.supplierName || suppliers[0]?.name || 'Multiple Suppliers';

    addRequisition({
      vesselId: selectedVessel.id === 'all_vessels' ? vessels[0].id : selectedVessel.id,
      requestedBy: reqFormData.requestedBy,
      dateRequested: reqFormData.dateRequested,
      supplierName: firstSupplierName,
      items: reqFormData.itemsList,
      totalCostIDR: totalCost,
      status: 'Vessel Requested',
      originLocationType: reqFormData.originLocationType,
      originLocationName: reqFormData.originLocationName,
      deliveryPort: reqFormData.deliveryPort,
      estimatedDeliveryDate: reqFormData.estimatedDeliveryDate,
    });

    setIsAddRequisitionModalOpen(false);
  };

  const openEditReqModal = (req: RequisitionOrder) => {
    setEditingReqId(req.id);
    setReqFormData({
      requestedBy: req.requestedBy,
      dateRequested: req.dateRequested,
      originLocationType: req.originLocationType,
      originLocationName: req.originLocationName,
      deliveryPort: req.deliveryPort,
      estimatedDeliveryDate: req.estimatedDeliveryDate,
      attachmentLink: req.attachmentLink || '',
      documentLink: req.documentLink || '',
      itemsList: req.items,
    });
  };

  const handleSaveReqMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReqId) return;
    updateRequisitionMetadata(editingReqId, {
      requestedBy: reqFormData.requestedBy,
      deliveryPort: reqFormData.deliveryPort,
      estimatedDeliveryDate: reqFormData.estimatedDeliveryDate,
      originLocationType: reqFormData.originLocationType,
      originLocationName: reqFormData.originLocationName,
      attachmentLink: (reqFormData as any).attachmentLink,
      documentLink: (reqFormData as any).documentLink,
    });
    setEditingReqId(null);
  };

  const openItemEditModal = (reqId: string, itemIndex: number, item: RequisitionItem) => {
    setItemEditState({ reqId, itemIndex, item });
    setItemEditSupplier(item.supplierName || suppliers[0]?.name || '');
    setItemEditStatus(item.status || 'Requested');
    setItemEditDenialReason(item.denialReason || '');
    setItemEditComment(item.comment || '');
    setItemEditSize(item.size || '');
    setItemEditQty(item.qtyRequested || 0);
    setItemEditUnit(item.unit || '');
    setItemEditUnitPrice(item.unitPriceIDR || 0);
  };

  const handleSaveItemEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemEditState) return;
    updateRequisitionItem(itemEditState.reqId, itemEditState.itemIndex, {
      supplierName: itemEditSupplier,
      status: itemEditStatus,
      denialReason: itemEditStatus === 'Denied / Rejected' ? itemEditDenialReason : undefined,
      comment: itemEditComment,
      size: itemEditSize,
      qtyRequested: itemEditQty,
      unit: itemEditUnit,
      unitPriceIDR: itemEditUnitPrice,
    });
    setItemEditState(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-sea-accent" />
            Inventory, Multi-Vendor Procurement & Supply Chain
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {selectedVessel.name} — Shore depots, shipboard spare parts, multi-vendor PO requisitions & supplier directory
          </p>
        </div>

        {activeRole !== 'owner' && (
          <div className="flex items-center gap-2">
            <button
              onClick={openAddItemModal}
              className="px-3.5 py-2 rounded-xl bg-ocean-900 border border-ocean-700 text-sea-accent font-semibold text-xs hover:bg-ocean-850 transition flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Add Inventory Item
            </button>

            <button
              onClick={() => setIsAddRequisitionModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-sea-accent text-ocean-950 font-semibold text-xs hover:bg-sea-accent/90 transition shadow-lg shadow-sea-accent/15 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Multi-Vendor Requisition
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-ocean-900 border border-ocean-800 w-fit">
          <button
            onClick={() => setActiveTab('inventory_mgmt')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'inventory_mgmt' ? 'bg-sea-accent text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Inventory Master ({filteredSpareParts.length})
          </button>
          <button
            onClick={() => setActiveTab('requisitions')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'requisitions' ? 'bg-sea-accent text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Requisition Orders ({vesselRequisitions.length})
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'vendors' ? 'bg-sea-accent text-ocean-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Suppliers & Vendors ({suppliers.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search parts, orders, vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-ocean-900 border border-ocean-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sea-accent/50"
          />
        </div>
      </div>

      {/* TAB 1: INVENTORY MASTER */}
      {activeTab === 'inventory_mgmt' && (
        <div className="space-y-4">
          {/* Storage & Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-mono">
            <span className="text-slate-400">Location:</span>
            {['All', 'Ship Storage', 'Land Storage'].map(f => (
              <button
                key={f}
                onClick={() => setStorageFilter(f as any)}
                className={`px-3 py-1 rounded-xl transition ${
                  storageFilter === f ? 'bg-sea-accent text-ocean-950 font-bold' : 'bg-ocean-900 text-slate-400 border border-ocean-800'
                }`}
              >
                {f}
              </button>
            ))}

            <span className="text-slate-400 ml-4">Category:</span>
            {['All', 'Spare Part', 'Consumable'].map(c => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c as any)}
                className={`px-3 py-1 rounded-xl transition ${
                  categoryFilter === c ? 'bg-sea-accent text-ocean-950 font-bold' : 'bg-ocean-900 text-slate-400 border border-ocean-800'
                }`}
              >
                {c}
              </button>
            ))}

            <span className="text-slate-400 ml-4">Stock Status:</span>
            <select 
              value={stockStatusFilter} 
              onChange={e => setStockStatusFilter(e.target.value as any)}
              className="bg-ocean-900 border border-ocean-700 rounded-lg px-2 py-1 text-white"
            >
              <option value="All">All</option>
              <option value="Healthy">Healthy Stock</option>
              <option value="Low Stock">Low / Reorder</option>
            </select>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpareParts.map(part => (
              <div key={part.id} className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-3 border border-ocean-800 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                      part.locationType === 'Land Storage' ? 'bg-sea-purple/20 text-sea-purple border-sea-purple/40' : 'bg-sea-accent/20 text-sea-accent border-sea-accent/40'
                    }`}>
                      {part.locationType}
                    </span>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-ocean-800 text-slate-300">
                      {part.conditionStatus}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{part.partName}</h3>
                  <p className="text-xs text-slate-400 font-mono">P/N: {part.partNumber} • Category: {part.itemCategory}</p>

                  <div className="p-3 rounded-xl bg-ocean-950/80 border border-ocean-850 space-y-1 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Stock Qty:</span>
                      <span className={`font-bold text-sm ${part.stockQty <= part.minStockQty ? 'text-sea-rose' : 'text-sea-emerald'}`}>
                        {part.stockQty} units (Min: {part.minStockQty})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Location: {part.locationName}</span>
                      <span>Unit: Rp {(part.unitCostIDR || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-ocean-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-sea-accent font-mono">Rp {(part.stockQty * part.unitCostIDR).toLocaleString('id-ID')}</span>

                  {activeRole !== 'owner' && (
                    <div className="flex items-center gap-1.5">
                      {part.locationType === 'Land Storage' && (
                        <button
                          onClick={() => {
                            setTransferModalPart(part);
                            setTransferVesselId(vessels[0]?.id || 'vessel-1');
                          }}
                          className="px-2 py-1 rounded-lg bg-sea-accent/20 text-sea-accent text-xs font-bold hover:bg-sea-accent/30 transition flex items-center gap-1"
                          title="Transfer Shore Stock to Vessel"
                        >
                          <Ship className="w-3.5 h-3.5" />
                          Transfer
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setConditionModalPart(part);
                          setConditionStatusInput(part.conditionStatus);
                          setConditionNotesInput(part.conditionNotes || '');
                        }}
                        className="px-2 py-1 rounded-lg bg-ocean-800 text-slate-300 text-xs font-bold hover:bg-ocean-750 transition"
                        title="Update Condition / Offload to Land"
                      >
                        Condition
                      </button>

                      <button
                        onClick={() => openEditItemModal(part)}
                        className="p-1.5 rounded-xl bg-ocean-800 hover:bg-ocean-750 text-sea-accent border border-ocean-700 text-xs transition"
                        title="Edit Spare Part"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${part.partName}"?`)) {
                            deleteSparePart(part.id);
                          }
                        }}
                        className="p-1.5 rounded-xl bg-sea-rose/10 hover:bg-sea-rose/20 text-sea-rose border border-sea-rose/30 text-xs transition"
                        title="Delete Spare Part"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: REQUISITION ORDERS */}
      {activeTab === 'requisitions' && (
        <div className="space-y-4">
          
          {/* Requisition Filters & Sort */}
          <div className="flex flex-wrap items-center gap-3 bg-ocean-950 p-3 rounded-xl border border-ocean-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Status:</span>
              <select value={reqFilterStatus} onChange={e => setReqFilterStatus(e.target.value)} className="bg-ocean-900 border border-ocean-700 rounded-lg px-2 py-1 text-white">
                <option value="All">All</option>
                <option value="Draft">Draft</option>
                <option value="Vessel Requested">Vessel Requested</option>
                <option value="PO Issued">PO Issued</option>
                <option value="In Transit">In Transit</option>
                <option value="Partially Delivered">Partially Delivered</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Vendor:</span>
              <select value={reqFilterVendor} onChange={e => setReqFilterVendor(e.target.value)} className="bg-ocean-900 border border-ocean-700 rounded-lg px-2 py-1 text-white max-w-[150px] truncate">
                <option value="All">All Vendors</option>
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Urgency:</span>
              <select value={reqFilterUrgency} onChange={e => setReqFilterUrgency(e.target.value)} className="bg-ocean-900 border border-ocean-700 rounded-lg px-2 py-1 text-white">
                <option value="All">All</option>
                <option value="Urgent Only">Urgent Only</option>
              </select>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-slate-400">Sort By:</span>
              <select value={reqSortBy} onChange={e => setReqSortBy(e.target.value)} className="bg-ocean-900 border border-ocean-700 rounded-lg px-2 py-1 text-white">
                <option value="Date (Newest)">Date (Newest)</option>
                <option value="Date (Oldest)">Date (Oldest)</option>
                <option value="Price (Highest)">Price (Highest)</option>
                <option value="Price (Lowest)">Price (Lowest)</option>
                <option value="Urgency">Urgency</option>
              </select>
            </div>
          </div>

          {vesselRequisitions.length === 0 && (
            <div className="text-center py-10 text-slate-400 font-mono text-sm">
              No requisitions found matching the current filters.
            </div>
          )}

          {vesselRequisitions.map(req => (
            <div key={req.id} className="glass-panel rounded-2xl p-5 space-y-4 border border-ocean-800 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ocean-800 pb-3 font-mono">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-sea-accent" />
                    {req.requisitionNo}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Requested by <strong className="text-white">{req.requestedBy}</strong> on {new Date(req.dateRequested).toLocaleDateString()}
                    <span className="mx-2">•</span> Ship: <strong className="text-white">{req.vesselName || '-'}</strong>
                    <span className="mx-2">•</span> Dept: <strong className="text-white">{req.department || '-'}</strong>
                    <span className="mx-2">•</span> Bagian: <strong className="text-white">{req.bagian || '-'}</strong>
                  </p>
                  {(req.attachmentLink || req.documentLink) && (
                    <div className="flex gap-3 mt-1.5 font-sans">
                      {req.attachmentLink && <a href={req.attachmentLink} target="_blank" rel="noreferrer" className="text-[11px] text-sea-accent hover:underline flex items-center gap-1">View Attachment</a>}
                      {req.documentLink && <a href={req.documentLink} target="_blank" rel="noreferrer" className="text-[11px] text-sea-accent hover:underline flex items-center gap-1">View Document</a>}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={req.status}
                    onChange={e => updateRequisitionStatus(req.id, e.target.value as RequisitionOrder['status'])}
                    className="bg-ocean-950 border border-ocean-750 text-xs font-bold text-sea-accent rounded-lg px-2.5 py-1"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Vessel Requested">Vessel Requested</option>
                    <option value="Office Approved">Office Approved</option>
                    <option value="PO Issued">PO Issued</option>
                    <option value="Delivered & Received">Delivered & Received</option>
                  </select>

                  {activeRole !== 'owner' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditReqModal(req)}
                        className="px-3 py-1 rounded-lg bg-ocean-800 hover:bg-ocean-750 text-sea-accent text-xs font-bold transition flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Order
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete requisition "${req.requisitionNo}"?`)) {
                            deleteRequisition(req.id);
                          }
                        }}
                        className="p-1 rounded-lg bg-sea-rose/10 text-sea-rose hover:bg-sea-rose/20 transition"
                        title="Delete Requisition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List in Order with Per-Item Vendors & Statuses */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 font-mono uppercase">Requisition Line Items ({req.items.length})</h4>
                  <div className="text-sm font-bold text-white bg-ocean-900 px-3 py-1.5 rounded-lg border border-ocean-700">
                    Order Total: <span className="text-sea-accent">Rp {req.items.reduce((sum, item) => item.status !== 'Denied / Rejected' ? sum + (item.qtyRequested * (item.unitPriceIDR || 0)) : sum, 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-ocean-800">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-ocean-900 text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Category</th>
                        <th className="px-4 py-3 font-semibold">Item & P/N</th>
                        <th className="px-4 py-3 font-semibold">Size / Spec</th>
                        <th className="px-4 py-3 font-semibold">Qty</th>
                        <th className="px-4 py-3 font-semibold">Unit Price</th>
                        <th className="px-4 py-3 font-semibold">Total Price</th>
                        <th className="px-4 py-3 font-semibold">Status & Vendor</th>
                        <th className="px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ocean-850 bg-ocean-950/50">
                      {req.items.map((item, idx) => (
                        <tr key={idx} className={item.status === 'Denied / Rejected' ? 'opacity-60 bg-sea-rose/5' : 'hover:bg-ocean-800/30'}>
                          <td className="px-4 py-3 text-slate-300">{item.itemCategory}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{item.partName}</span>
                                {item.isUrgent && <span className="text-[9px] font-bold uppercase bg-sea-amber/20 text-sea-amber border border-sea-amber/30 px-1 rounded">Urgent</span>}
                              </div>
                              <span className="text-slate-400 text-[10px] font-mono">P/N: {item.partNumber}</span>
                              {item.notes && <span className="text-[10px] italic text-slate-400">Crew: {item.notes}</span>}
                              {item.comment && <span className="text-[10px] italic text-blue-400">Office: {item.comment}</span>}
                              {item.denialReason && <span className="text-[10px] italic text-sea-rose">Reject: {item.denialReason}</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-300">{item.size || '-'}</td>
                          <td className="px-4 py-3 font-bold text-white">{item.qtyRequested} {item.unit || 'pcs'}</td>
                          <td className="px-4 py-3 font-mono text-slate-300">Rp {(item.unitPriceIDR || 0).toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 font-mono font-bold text-sea-accent">Rp {(item.qtyRequested * (item.unitPriceIDR || 0)).toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1.5 items-start">
                              <strong className={`px-1.5 py-0.5 rounded text-[10px] ${
                                item.status === 'Approved' ? 'bg-sea-emerald/20 text-sea-emerald' :
                                item.status === 'Denied / Rejected' ? 'bg-sea-rose/20 text-sea-rose' :
                                item.status === 'Ordered to Vendor' ? 'bg-sea-accent/20 text-sea-accent' : 'bg-ocean-800 text-slate-300'
                              }`}>{item.status || 'Requested'}</strong>
                              <span className="text-[10px] text-slate-400">Vendor: <span className="text-white">{item.supplierName || 'Unassigned'}</span></span>
                              
                              {item.status === 'Delivered & Received' && (
                                <div className="mt-1 flex items-center gap-1 bg-ocean-900/50 p-1 rounded border border-ocean-800">
                                  <span className="text-[9px] text-slate-400 font-bold uppercase">Rate:</span>
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <button
                                        key={star}
                                        onClick={() => updateRequisitionItem(req.id, idx, { vendorRating: star })}
                                        className={`p-0.5 rounded transition ${item.vendorRating && item.vendorRating >= star ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400/50'}`}
                                      >
                                        <Star className="w-3 h-3 fill-current" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {item.vendorRating && item.status !== 'Delivered & Received' && (
                                <div className="mt-1 flex items-center gap-1 bg-ocean-900/50 p-1 rounded border border-ocean-800">
                                  <span className="text-[9px] text-slate-400 font-bold uppercase">Rating:</span>
                                  <div className="flex gap-0.5">
                                    {[...Array(item.vendorRating)].map((_, i) => <span key={i} className="text-amber-400 text-[10px]">★</span>)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-2 items-end">
                              {activeRole !== 'owner' && (
                                <button
                                  onClick={() => openItemEditModal(req.id, idx, item)}
                                  className="px-2.5 py-1 rounded bg-ocean-800 hover:bg-ocean-750 text-sea-accent text-[10px] font-bold w-full"
                                >
                                  Edit Item
                                </button>
                              )}
                              {activeRole !== 'owner' && req.items.length > 1 && (
                                <button
                                  onClick={() => removeRequisitionItem(req.id, idx)}
                                  className="text-sea-rose hover:underline text-[10px] w-full text-right"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: VENDORS */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {activeRole !== 'owner' && (
              <button
                onClick={() => {
                  setEditingVendor(null);
                  setVendorFormData({
                    name: '',
                    category: 'Main Propulsion Spares & Technical Service',
                    rating: 4.8,
                    contactEmail: 'spares@vendor.com',
                    phone: '+65 6800 1234',
                    country: 'Singapore',
                    address: '10 Marine Logistics Way, Singapore',
                    status: 'Approved Supplier',
                    performanceNotes: 'OEM certified marine technical vendor.',
                  });
                  setIsAddVendorModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-sea-accent text-ocean-950 font-bold text-xs hover:bg-sea-accent/90 transition shadow-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Vendor
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
            {suppliers.map(sup => (
              <div key={sup.id} className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-3 border border-ocean-800 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-sm font-bold text-white">{sup.name}</span>
                    <span className="px-2.5 py-0.5 rounded bg-sea-emerald/20 text-sea-emerald text-[10px] font-bold border border-sea-emerald/30">
                      {sup.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-mono">{sup.category} • Country: {sup.country}</p>
                  
                  {/* PIC Contact & Area Coverage Fields */}
                  <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-850 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-200 font-bold">
                      <span>PIC: {sup.picName || 'Direct Sales Dept'}</span>
                      <span className="text-sea-accent">{sup.picPhone || sup.phone}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <span>Email: <strong className="text-slate-200">{sup.picEmail || sup.contactEmail}</strong></span>
                    </div>
                    <div className="text-[11px] text-sea-amber">
                      <span>Ports Coverage: <strong>{sup.areaCoverage || 'Global Maritime Ports'}</strong></span>
                    </div>
                    {sup.supplyCategories && sup.supplyCategories.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-1">
                        {sup.supplyCategories.map((cat, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-ocean-900 text-slate-300 text-[9px] border border-ocean-800">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 italic bg-ocean-900 p-2.5 rounded-lg border border-ocean-800 font-sans">
                    "{sup.performanceNotes}"
                  </p>
                </div>

                <div className="pt-3 border-t border-ocean-800 flex items-center justify-between font-mono text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sea-amber font-bold text-sm">⭐ {sup.rating} / 5.0 Rating</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Dynamic Delivery Avg</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setReqFilterVendor(sup.name);
                        setActiveTab('requisitions');
                      }}
                      className="px-2 py-1.5 rounded-lg bg-ocean-900 hover:bg-ocean-800 text-sea-accent border border-sea-accent/30 text-xs transition flex items-center gap-1"
                      title="View Orders"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Orders</span>
                    </button>
                    {activeRole !== 'owner' && (
                      <>
                      <button
                        onClick={() => {
                          setEditingVendor(sup);
                          setVendorFormData({
                            name: sup.name,
                            category: sup.category,
                            rating: sup.rating,
                            contactEmail: sup.contactEmail,
                            phone: sup.phone || '',
                            country: sup.country,
                            address: sup.address || '',
                            status: sup.status,
                            performanceNotes: sup.performanceNotes || '',
                            picName: sup.picName || '',
                            picPhone: sup.picPhone || '',
                            picEmail: sup.picEmail || '',
                            areaCoverage: sup.areaCoverage || '',
                          });
                          setIsAddVendorModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl bg-ocean-800 hover:bg-ocean-750 text-sea-accent border border-ocean-700 text-xs transition"
                        title="Edit Vendor"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete vendor "${sup.name}"?`)) {
                            deleteSupplier(sup.id);
                          }
                        }}
                        className="p-1.5 rounded-xl bg-sea-rose/10 hover:bg-sea-rose/20 text-sea-rose border border-sea-rose/30 text-xs transition"
                        title="Delete Vendor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      </>
                    )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Transfer Part to Ship Modal */}
      {transferModalPart && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Ship className="w-5 h-5 text-sea-accent" />
              Transfer Shore Stock to Vessel Storage
            </h2>
            <p className="text-xs text-slate-400 font-mono">{transferModalPart.partName} (P/N: {transferModalPart.partNumber})</p>

            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Vessel</label>
                <select
                  value={transferVesselId}
                  onChange={e => setTransferVesselId(e.target.value)}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                >
                  {vessels.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.vesselType})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Shipboard Location Name</label>
                <input
                  type="text"
                  required
                  value={transferLocationName}
                  onChange={e => setTransferLocationName(e.target.value)}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setTransferModalPart(null)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Condition / Offload Modal */}
      {conditionModalPart && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-sea-accent" />
              Update Item Condition & Location Status
            </h2>

            <form onSubmit={handleConditionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Condition Status</label>
                <select
                  value={conditionStatusInput}
                  onChange={e => setConditionStatusInput(e.target.value as ItemConditionStatus)}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                >
                  <option value="Good / Ready">Good / Ready</option>
                  <option value="Broken / Damaged">Broken / Damaged</option>
                  <option value="Offloaded to Land (Ship-to-Shore)">Offloaded to Land (Ship-to-Shore)</option>
                  <option value="In Workshop / Under Overhaul">In Workshop / Under Overhaul</option>
                  <option value="Scrapped">Scrapped</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Condition Notes / Reason</label>
                <textarea
                  rows={2}
                  value={conditionNotesInput}
                  onChange={e => setConditionNotesInput(e.target.value)}
                  placeholder="Notes regarding overhaul, damage or shore depot name..."
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setConditionModalPart(null)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Line Item Status & Vendor Assignment Modal */}
      {itemEditState && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-sea-accent" />
              Edit Line Item Vendor & Status
            </h2>
            <p className="text-xs text-slate-400 font-mono">{itemEditState.item.partName} (P/N: {itemEditState.item.partNumber})</p>

            <form onSubmit={handleSaveItemEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Assign Vendor to this Item</label>
                <select
                  value={itemEditSupplier}
                  onChange={e => setItemEditSupplier(e.target.value)}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Item Status</label>
                <select
                  value={itemEditStatus}
                  onChange={e => setItemEditStatus(e.target.value as RequisitionItemStatus)}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Requested">Requested</option>
                  <option value="Approved">Approved</option>
                  <option value="Denied / Rejected">Denied / Rejected</option>
                  <option value="Ordered to Vendor">Ordered to Vendor</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered & Received">Delivered & Received</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Quantity</label>
                  <input type="number" value={itemEditQty} onChange={e => setItemEditQty(Number(e.target.value))} className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Unit</label>
                  <input type="text" value={itemEditUnit} onChange={e => setItemEditUnit(e.target.value)} className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Unit Price (Rp)</label>
                  <input type="number" value={itemEditUnitPrice} onChange={e => setItemEditUnitPrice(Number(e.target.value))} className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Size / Spec</label>
                  <input type="text" value={itemEditSize} onChange={e => setItemEditSize(e.target.value)} className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Office Comment</label>
                  <input type="text" value={itemEditComment} onChange={e => setItemEditComment(e.target.value)} className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white" />
                </div>
              </div>

              {itemEditStatus === 'Denied / Rejected' && (
                <div>
                  <label className="block text-slate-400 mb-1">Rejection / Denial Reason</label>
                  <input
                    type="text"
                    required
                    value={itemEditDenialReason}
                    onChange={e => setItemEditDenialReason(e.target.value)}
                    placeholder="e.g. Excessive cost, budget exceeded"
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setItemEditState(null)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold"
                >
                  Save Item Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Requisition Modal with Dynamic Items List */}
      {isAddRequisitionModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-sea-accent" />
              Create Multi-Vendor Purchase Requisition
            </h2>

            <form onSubmit={handleRequisitionSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Requested By</label>
                  <input
                    type="text"
                    required
                    value={reqFormData.requestedBy}
                    onChange={e => setReqFormData({ ...reqFormData, requestedBy: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Delivery Port</label>
                  <input
                    type="text"
                    required
                    value={reqFormData.deliveryPort}
                    onChange={e => setReqFormData({ ...reqFormData, deliveryPort: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Dynamic Items Builder */}
              <div className="p-4 rounded-xl bg-ocean-900 border border-ocean-800 space-y-3">
                <h4 className="font-bold text-white text-xs">Requisition Items List ({reqFormData.itemsList.length})</h4>
                
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 font-mono text-[11px]">
                  {reqFormData.itemsList.map((item, idx) => (
                    <div key={idx} className="p-2 rounded bg-ocean-950 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white">{item.partName}</span> (P/N: {item.partNumber}) • {item.qtyRequested}x @ Rp {(item.unitPriceIDR || 0).toLocaleString('id-ID')}
                        <p className="text-slate-400 text-[10px]">Vendor: <strong className="text-sea-accent">{item.supplierName}</strong></p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItemFromReqForm(idx)}
                        className="text-sea-rose text-[10px] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-ocean-800">
                  <input
                    type="text"
                    placeholder="Part / Material Name"
                    value={newItemRow.partName}
                    onChange={e => setNewItemRow({ ...newItemRow, partName: e.target.value })}
                    className="bg-ocean-950 border border-ocean-750 rounded px-2 py-1 text-white"
                  />
                  <input
                    type="text"
                    placeholder="P/N"
                    value={newItemRow.partNumber}
                    onChange={e => setNewItemRow({ ...newItemRow, partNumber: e.target.value })}
                    className="bg-ocean-950 border border-ocean-750 rounded px-2 py-1 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={newItemRow.qtyRequested}
                    onChange={e => setNewItemRow({ ...newItemRow, qtyRequested: Number(e.target.value) })}
                    className="bg-ocean-950 border border-ocean-750 rounded px-2 py-1 text-white"
                  />
                  <select
                    value={newItemRow.supplierName}
                    onChange={e => setNewItemRow({ ...newItemRow, supplierName: e.target.value })}
                    className="bg-ocean-950 border border-ocean-750 rounded px-2 py-1 text-white"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddItemToReqForm}
                  className="px-3 py-1 rounded bg-sea-accent/20 text-sea-accent text-xs font-bold hover:bg-sea-accent/30 transition"
                >
                  + Add Line Item
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setIsAddRequisitionModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold"
                >
                  Create Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Requisition Metadata Modal */}
      {editingReqId && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-sea-accent" />
              Edit Requisition Order Details
            </h2>

            <form onSubmit={handleSaveReqMetadata} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Requested By Engineer</label>
                <input
                  type="text"
                  required
                  value={reqFormData.requestedBy}
                  onChange={e => setReqFormData({ ...reqFormData, requestedBy: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Delivery Port</label>
                <input
                  type="text"
                  required
                  value={reqFormData.deliveryPort}
                  onChange={e => setReqFormData({ ...reqFormData, deliveryPort: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Estimated Delivery Date</label>
                <input
                  type="date"
                  required
                  value={reqFormData.estimatedDeliveryDate}
                  onChange={e => setReqFormData({ ...reqFormData, estimatedDeliveryDate: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setEditingReqId(null)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Inventory Item Modal */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-sea-accent" />
              {editingPartId ? 'Edit Spare Part / Consumable' : 'Add New Inventory Item'}
            </h2>

            <form onSubmit={handleItemSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Part Name *</label>
                <input
                  type="text"
                  required
                  value={itemFormData.partName}
                  onChange={e => setItemFormData({ ...itemFormData, partName: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Part Number (P/N)</label>
                  <input
                    type="text"
                    value={itemFormData.partNumber}
                    onChange={e => setItemFormData({ ...itemFormData, partNumber: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={itemFormData.itemCategory}
                    onChange={e => setItemFormData({ ...itemFormData, itemCategory: e.target.value as any })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Spare Part (Non-Consumable)">Spare Part (Non-Consumable)</option>
                    <option value="Consumable (Oils, Supplies, Chemicals, Logbooks)">Consumable (Oils, Supplies, Chemicals)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    value={itemFormData.stockQty}
                    onChange={e => setItemFormData({ ...itemFormData, stockQty: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Min Stock Qty</label>
                  <input
                    type="number"
                    value={itemFormData.minStockQty}
                    onChange={e => setItemFormData({ ...itemFormData, minStockQty: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Unit Cost (Rp)</label>
                  <input
                    type="number"
                    value={itemFormData.unitCostIDR}
                    onChange={e => setItemFormData({ ...itemFormData, unitCostIDR: Number(e.target.value) })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold"
                >
                  {editingPartId ? 'Save Changes' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      {isAddVendorModalOpen && (
        <div className="fixed inset-0 z-50 bg-ocean-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 border border-ocean-700 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sea-accent" />
              {editingVendor ? 'Edit Supplier Details' : 'Add New Marine Supplier'}
            </h2>

            <form onSubmit={handleVendorSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={vendorFormData.name}
                  onChange={e => setVendorFormData({ ...vendorFormData, name: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Supply Category</label>
                <input
                  type="text"
                  value={vendorFormData.category}
                  onChange={e => setVendorFormData({ ...vendorFormData, category: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* PIC Contact & Coverage Details */}
              <div className="p-3 rounded-xl bg-ocean-950 border border-ocean-850 space-y-2">
                <span className="text-[10px] font-mono font-bold text-sea-accent uppercase block">PIC DIRECT CONTACT DETAILS</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">PIC Name & Position</label>
                    <input
                      type="text"
                      placeholder="e.g. Klaus Lindner (Sales Head)"
                      value={vendorFormData.picName}
                      onChange={e => setVendorFormData({ ...vendorFormData, picName: e.target.value })}
                      className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">PIC Direct Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +49 40 3110 889"
                      value={vendorFormData.picPhone}
                      onChange={e => setVendorFormData({ ...vendorFormData, picPhone: e.target.value })}
                      className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">PIC Direct Email</label>
                    <input
                      type="email"
                      placeholder="spares@vendor.com"
                      value={vendorFormData.picEmail}
                      onChange={e => setVendorFormData({ ...vendorFormData, picEmail: e.target.value })}
                      className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Area Coverage Ports</label>
                    <input
                      type="text"
                      placeholder="Singapore, Rotterdam, Houston"
                      value={vendorFormData.areaCoverage}
                      onChange={e => setVendorFormData({ ...vendorFormData, areaCoverage: e.target.value })}
                      className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Company Contact Email</label>
                  <input
                    type="email"
                    required
                    value={vendorFormData.contactEmail}
                    onChange={e => setVendorFormData({ ...vendorFormData, contactEmail: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Country</label>
                  <input
                    type="text"
                    value={vendorFormData.country}
                    onChange={e => setVendorFormData({ ...vendorFormData, country: e.target.value })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Supplier Status</label>
                  <select
                    value={vendorFormData.status}
                    onChange={e => setVendorFormData({ ...vendorFormData, status: e.target.value as any })}
                    className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white font-bold"
                  >
                    <option value="Approved Supplier">Approved Supplier</option>
                    <option value="Under Audit">Under Audit</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Performance Notes</label>
                <textarea
                  rows={2}
                  value={vendorFormData.performanceNotes}
                  onChange={e => setVendorFormData({ ...vendorFormData, performanceNotes: e.target.value })}
                  className="w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ocean-800">
                <button
                  type="button"
                  onClick={() => setIsAddVendorModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sea-accent text-ocean-950 font-bold"
                >
                  {editingVendor ? 'Save Changes' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

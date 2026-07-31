import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Send, ArrowLeft, AlertCircle } from 'lucide-react';
import { 
  useAuthStore, 
  useInventoryStore, 
  RequisitionOrder, 
  RequisitionItem, 
  ItemCategory 
} from '@marineos/shared';

const MARINE_CATEGORIES: ItemCategory[] = [
  'Maintenance', 
  'Mesin', 
  'Listrik', 
  'Navigasi', 
  'Akomodasi', 
  'Safety', 
  'Perlengkapan Bantu', 
  'ATK', 
  'Alat Kerja', 
  'Pengiriman', 
  'Dokumen atau Sertifikat',
  'Spare Part (Non-Consumable)',
  'Consumable (Oils, Supplies, Chemicals, Logbooks)'
];

export const RequisitionForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { addRequisition, requisitions } = useInventoryStore();

  const [items, setItems] = useState<Partial<RequisitionItem>[]>([
    { itemCategory: 'Maintenance', partName: '', qtyRequested: 1, unit: 'pcs', unitPriceIDR: 0, isUrgent: false, notes: '' },
    { itemCategory: 'Mesin', partName: '', qtyRequested: 1, unit: 'pcs', unitPriceIDR: 0, isUrgent: false, notes: '' },
    { itemCategory: 'Listrik', partName: '', qtyRequested: 1, unit: 'pcs', unitPriceIDR: 0, isUrgent: false, notes: '' },
  ]);



  const getBagianCode = (role: string) => {
    if (role.toLowerCase().includes('engineer') || role.toLowerCase().includes('engine') || role.toLowerCase().includes('motor')) return 'E';
    return 'D';
  };

  const getDeptCode = (dept?: string) => {
    const d = (dept || 'Technical').toUpperCase();
    if (d === 'ARMADA') return 'ARM';
    if (d === 'HSSE') return 'HSSE';
    if (d === 'OPERASIONAL' || d === 'OPERATIONS') return 'OPS';
    if (d === 'IT') return 'IT';
    return 'TECH';
  };

  const getShipCode = (vesselName: string) => {
    const words = vesselName.trim().split(' ');
    // Extract the number at the end
    const lastWord = words[words.length - 1];
    const hasNumber = /\d+/.test(lastWord);
    
    if (words.length === 2 && hasNumber) {
      // One word + one number (e.g. Atlantic 26 -> AT26)
      const firstWord = words[0];
      return firstWord.substring(0, 2).toUpperCase() + lastWord;
    } else if (words.length > 2) {
      // Two or more words (e.g. The Really Good 17 -> TRG17)
      let initials = '';
      for (let i = 0; i < words.length - (hasNumber ? 1 : 0); i++) {
        initials += words[i].charAt(0).toUpperCase();
      }
      return initials + (hasNumber ? lastWord : '');
    }
    
    return vesselName.substring(0, 4).toUpperCase();
  };

  const romanMonth = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

  const generateRequisitionNo = () => {
    const now = new Date();
    const deptCode = getDeptCode(currentUser?.department);
    const bagianCode = getBagianCode(currentUser?.role || '');
    const shipCode = getShipCode('MV Pacific Star');
    
    const deptReqs = requisitions.filter(r => r.requisitionNo.includes(`/${deptCode}/`));
    const nextNum = deptReqs.length + 1;
    
    return `${nextNum}/${bagianCode}/${deptCode}/${shipCode}/${romanMonth[now.getMonth()]}/${now.getFullYear().toString().slice(-2)}`;
  };

  const handleAddItem = () => {
    setItems([...items, { itemCategory: 'Maintenance', partName: '', qtyRequested: 1, unit: 'pcs', unitPriceIDR: 0, isUrgent: false, notes: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof RequisitionItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = items.filter(i => i.partName && i.partName.trim() !== '') as RequisitionItem[];
    if (validItems.length === 0) {
      alert("Please add at least one valid item with a name.");
      return;
    }

    const orderId = `req-${Date.now()}`;
    const reqNo = generateRequisitionNo();

    const newReq: RequisitionOrder = {
      id: orderId,
      vesselId: 'v-1',
      vesselName: 'MV Pacific Star',
      department: getDeptCode(currentUser?.department),
      bagian: getBagianCode(currentUser?.role || ''),
      requisitionNo: reqNo,
      requestedBy: currentUser?.fullName || 'Unknown Crew',
      dateRequested: new Date().toISOString(),
      items: validItems.map(item => ({
        ...item,
        id: `item-${Math.random().toString(36).substr(2, 9)}`,
        status: 'Requested',
        partNumber: item.partNumber || '-',
      })),
      totalCostIDR: 0,
      status: 'Vessel Requested',
      originLocationType: 'Ship Storage',
      originLocationName: 'Main Deck Store',
      deliveryPort: '-',
      estimatedDeliveryDate: '-',
    };

    addRequisition(newReq);
    navigate('/requisitions/track');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Create Requisition Order</h1>
          <p className="text-sm text-slate-400">Request materials and services for the vessel</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-start space-x-3 text-sm">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-slate-300">
              <p className="font-semibold text-white mb-1">Requester Information</p>
              <p>Your details are automatically pulled from your logged-in profile. You do not need to enter your name or ship.</p>
              <div className="mt-3 grid grid-cols-2 gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-xs mb-1">Full Name</span>
                  <span className="text-white font-medium">{currentUser?.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs mb-1">Role / Rank</span>
                  <span className="text-white font-medium capitalize">{currentUser?.role.replace(/_/g, ' ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-base font-bold text-white">Requested Items</h2>
            <button 
              type="button" 
              onClick={handleAddItem}
              className="flex items-center space-x-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Row</span>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-950/50 text-slate-400 text-xs">
                <tr>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Item Name</th>
                  <th className="px-4 py-3 font-semibold w-20">Qty</th>
                  <th className="px-4 py-3 font-semibold w-24">Unit</th>
                  <th className="px-4 py-3 font-semibold">Notes</th>
                  <th className="px-4 py-3 font-semibold text-center">Urgent</th>
                  <th className="px-4 py-3 font-semibold w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-800/20">
                    <td className="px-4 py-2">
                      <select 
                        value={item.itemCategory} 
                        onChange={(e) => handleItemChange(index, 'itemCategory', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 min-w-[140px]"
                      >
                        {MARINE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="text" 
                        value={item.partName} 
                        onChange={(e) => handleItemChange(index, 'partName', e.target.value)}
                        placeholder="e.g. Engine Oil 15W40"
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 min-w-[150px]"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        min="1"
                        value={item.qtyRequested} 
                        onChange={(e) => handleItemChange(index, 'qtyRequested', parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 min-w-[70px]"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="text" 
                        value={item.unit || ''} 
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        placeholder="e.g. pcs"
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 min-w-[80px]"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="text" 
                        value={item.notes || ''} 
                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                        placeholder="Additional details..."
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 min-w-[150px]"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input 
                        type="checkbox" 
                        checked={item.isUrgent || false} 
                        onChange={(e) => handleItemChange(index, 'isUrgent', e.target.checked)}
                        className="w-4 h-4 bg-slate-950 border-slate-800 rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button 
                        type="button" 
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
          >
            <Send className="w-5 h-5" />
            <span>Submit Requisition</span>
          </button>
        </div>
      </form>
    </div>
  );
};

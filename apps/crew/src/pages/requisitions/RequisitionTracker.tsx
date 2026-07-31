import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Plus, Clock, CheckCircle2, XCircle, Star } from 'lucide-react';
import { useAuthStore, useInventoryStore, RequisitionStatus, RequisitionItemStatus } from '@marineos/shared';

const StatusBadge = ({ status }: { status: RequisitionStatus | RequisitionItemStatus }) => {
  const colors: Record<string, string> = {
    'Draft': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    'Vessel Requested': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Requested': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Office Approved': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Approved': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'PO Issued': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    'Ordered to Vendor': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    'In Transit': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Delivered & Received': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Denied / Rejected': 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  const colorClass = colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {status}
    </span>
  );
};

export const RequisitionTracker = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { requisitions, updateRequisitionItem } = useInventoryStore();

  // Sort by date requested, newest first
  const sortedReqs = [...requisitions].sort((a, b) => 
    new Date(b.dateRequested).getTime() - new Date(a.dateRequested).getTime()
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">My Requisitions</h1>
            <p className="text-sm text-slate-400">Track status of your orders</p>
          </div>
        </div>
        <Link 
          to="/requisitions/new"
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </Link>
      </div>

      {sortedReqs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center">
          <Package className="w-12 h-12 text-slate-600 mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">No requisitions found</h2>
          <p className="text-slate-400 mb-6">You haven't requested any items yet.</p>
          <Link to="/requisitions/new" className="text-blue-400 hover:text-blue-300 font-medium">Create your first request</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedReqs.map(req => (
            <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h2 className="text-base font-bold text-white">{req.requisitionNo}</h2>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {new Date(req.dateRequested).toLocaleDateString()}</span>
                    <span>Name: <span className="text-slate-300">{req.requestedBy}</span></span>
                    <span>Ship: <span className="text-slate-300">{req.vesselName || '-'}</span></span>
                    <span>Dept: <span className="text-slate-300">{req.department || '-'}</span></span>
                    <span>Bagian: <span className="text-slate-300">{req.bagian || '-'}</span></span>
                  </div>
                </div>
              </div>
              
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-900 text-slate-400 text-xs">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Category</th>
                      <th className="px-5 py-3 font-semibold">Item</th>
                      <th className="px-5 py-3 font-semibold">Qty</th>
                      <th className="px-5 py-3 font-semibold">Unit</th>
                      <th className="px-5 py-3 font-semibold">Urgent</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold w-1/3">Notes / Comments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {req.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-800/20">
                        <td className="px-5 py-3 text-slate-300">{item.itemCategory}</td>
                        <td className="px-5 py-3 font-medium text-white">{item.partName}</td>
                        <td className="px-5 py-3 text-slate-300">{item.qtyRequested}</td>
                        <td className="px-5 py-3 text-slate-300">{item.unit || '-'}</td>
                        <td className="px-5 py-3">
                          {item.isUrgent ? <span className="text-amber-400 font-bold text-xs uppercase bg-amber-500/10 px-2 py-0.5 rounded">Yes</span> : <span className="text-slate-500">-</span>}
                        </td>
                        <td className="px-5 py-3"><StatusBadge status={item.status || 'Requested'} /></td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col gap-1">
                            {item.notes && (
                              <span className="text-xs text-slate-400"><span className="font-semibold text-slate-500">Note:</span> {item.notes}</span>
                            )}
                            {(item.comment || item.denialReason) && (
                              <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded inline-block mt-1">
                                <span className="font-semibold">Comment:</span> {item.comment || item.denialReason}
                              </span>
                            )}
                            {!item.notes && !item.comment && !item.denialReason && <span className="text-slate-600">-</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

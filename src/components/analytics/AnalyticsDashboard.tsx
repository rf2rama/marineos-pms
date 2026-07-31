import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, TrendingUp, ShieldCheck, DollarSign, Download, Ship, Award, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export const AnalyticsDashboard: React.FC = () => {
  const { selectedVessel, vessels, equipment, jobs, requisitions, workOrders, crewMembers, incidents, drills } = useApp();

  const isAllVessels = selectedVessel.id === 'all_vessels';
  const targetVesselId = isAllVessels ? undefined : selectedVessel.id;

  const targetVessels = targetVesselId ? vessels.filter(v => v.id === targetVesselId) : vessels;

  const fleetComparisonData = targetVessels.map(vessel => {
    const vesselJobs = jobs.filter(j => j.vesselId === vessel.id);
    const overdueCount = vesselJobs.filter(j => j.status === 'Overdue').length;
    const completedCount = vesselJobs.filter(j => j.status === 'Completed').length;
    const totalJobs = vesselJobs.length || 1;
    const complianceRate = Math.round(((totalJobs - overdueCount) / totalJobs) * 100);

    const vesselReqsCost = requisitions.filter(r => r.vesselId === vessel.id).reduce((acc, c) => acc + c.totalCostIDR, 0);
    const vesselDrydockCost = workOrders.filter(w => w.vesselId === vessel.id).reduce((acc, c) => acc + (c.actualCostIDR || c.contractorQuoteIDR || 0), 0);

    const vesselCrew = crewMembers.filter(c => c.currentVesselId === vessel.id);
    const vesselIncidents = incidents.filter(i => i.vesselId === vessel.id).length;
    const vesselDrills = drills.filter(d => d.vesselId === vessel.id).length;

    return {
      name: vessel.name.replace('MV ', ''),
      complianceRate,
      overdueCount,
      totalRunningHours: vessel.totalRunningHours,
      procurementSpendIDR: vesselReqsCost,
      drydockSpendIDR: vesselDrydockCost,
      crewCount: vesselCrew.length,
      incidentsCount: vesselIncidents,
      drillsCount: vesselDrills,
    };
  });

  const handleExportCSV = () => {
    const headers = ['Vessel Name', 'Class Society', 'Status', 'Compliance Rate (%)', 'Overdue Jobs', 'Crew Onboard', 'Incidents', 'Drills Done', 'Procurement Spend (IDR)', 'Drydock Spend (IDR)'];
    const rows = targetVessels.map(v => {
      const data = fleetComparisonData.find(d => d.name === v.name.replace('MV ', ''));
      return [
        `"${v.name}"`,
        `"${v.classSociety}"`,
        `"${v.status}"`,
        data?.complianceRate || 0,
        data?.overdueCount || 0,
        data?.crewCount || 0,
        data?.incidentsCount || 0,
        data?.drillsCount || 0,
        data?.procurementSpendIDR || 0,
        data?.drydockSpendIDR || 0,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MarineOS_Fleet_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sea-accent" />
            Fleet Analytics & Executive Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Fleet-wide KPI benchmarking, cross-vessel comparisons, maintenance compliance rate, and OPEX spend breakdown
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-ocean-900 hover:bg-ocean-850 border border-ocean-700 text-sea-accent text-xs font-semibold transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Fleet Report (CSV)
        </button>
      </div>

      {/* Fleet Comparison Chart */}
      <div className="glass-panel rounded-2xl p-6 space-y-4 font-sans border border-ocean-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-ocean-800 pb-3">
          <TrendingUp className="w-5 h-5 text-sea-accent" />
          Fleet Maintenance Compliance Rate (%) by Vessel
        </h2>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fleetComparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e385c" opacity={0.4} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0b172a',
                  borderColor: '#1e385c',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="complianceRate" name="PMS Compliance Rate (%)" fill="#00e5ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cross-Vessel Comparison Table */}
      <div className="glass-panel rounded-2xl p-6 space-y-4 border border-ocean-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-ocean-800 pb-3">
          <Ship className="w-5 h-5 text-sea-emerald" />
          Cross-Vessel Fleet Performance & Safety Comparison
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-ocean-800 font-mono text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Vessel Name</th>
                <th className="py-2.5 px-3">Class</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">PMS Compliance</th>
                <th className="py-2.5 px-3">Overdue Jobs</th>
                <th className="py-2.5 px-3">Crew Onboard</th>
                <th className="py-2.5 px-3">Incidents</th>
                <th className="py-2.5 px-3">Drills Done</th>
                <th className="py-2.5 px-3">Procurement Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ocean-850 font-mono text-slate-200">
              {vessels.map(v => {
                const data = fleetComparisonData.find(d => d.name === v.name.replace('MV ', ''));
                return (
                  <tr key={v.id} className="hover:bg-ocean-900/50 transition">
                    <td className="py-3 px-3 font-bold text-white">{v.name}</td>
                    <td className="py-3 px-3 text-sea-accent">{v.classSociety}</td>
                    <td className="py-3 px-3 text-slate-300 font-sans">{v.status}</td>
                    <td className="py-3 px-3 text-sea-emerald font-bold">{data?.complianceRate}%</td>
                    <td className={`py-3 px-3 font-bold ${data?.overdueCount ? 'text-sea-rose' : 'text-slate-400'}`}>
                      {data?.overdueCount} jobs
                    </td>
                    <td className="py-3 px-3 text-white">{data?.crewCount} crew</td>
                    <td className={`py-3 px-3 font-bold ${data?.incidentsCount ? 'text-sea-amber' : 'text-slate-400'}`}>
                      {data?.incidentsCount} events
                    </td>
                    <td className="py-3 px-3 text-sea-accent">{data?.drillsCount} drills</td>
                    <td className="py-3 px-3">${data?.procurementSpendIDR.toLocaleString()} IDR</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

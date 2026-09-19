import { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from 'recharts';
import { Download, Printer, Filter } from 'lucide-react';
import useToastStore from '../../store/useToastStore';

export default function Reports() {
  const addToast = useToastStore(state => state.addToast);
  const [dateRange, setDateRange] = useState('6M');

  const revenueData = [
    { name: 'Jan', amount: 45000, target: 40000 },
    { name: 'Feb', amount: 52000, target: 40000 },
    { name: 'Mar', amount: 85500, target: 40000 },
    { name: 'Apr', amount: 30000, target: 40000 },
    { name: 'May', amount: 90000, target: 40000 },
    { name: 'Jun', amount: 95000, target: 40000 },
  ];

  const maintenanceData = [
    { name: 'Plumbing', tickets: 24, color: 'var(--neu-primary)' },
    { name: 'Electrical', tickets: 18, color: 'var(--neu-warning)' },
    { name: 'Landscaping', tickets: 35, color: 'var(--neu-success)' },
    { name: 'General', tickets: 12, color: 'var(--neu-text-muted)' },
  ];

  const kpis = [
    { label: 'Total Revenue (YTD)', value: '₱ 397,500', subtitle: '+14% vs last year' },
    { label: 'Collection Rate', value: '88%', subtitle: 'Target: 95%' },
    { label: 'Avg Payment / Resident', value: '₱ 2,548', subtitle: 'Stable' },
    { label: 'Total Open Tickets', value: '28', subtitle: '-5 from last month' },
  ];

  const handleExportCSV = (reportName) => {
    // Generate dummy CSV
    const csvContent = "data:text/csv;charset=utf-8,Month,Revenue,Target\nJan,45000,40000\nFeb,52000,40000\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`${reportName} CSV downloaded successfully!`, 'success');
  };

  const handlePrint = () => {
    addToast('Preparing document for printing...', 'info');
    setTimeout(() => window.print(), 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Controls */}
      <div className="neu-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          {['1M', '3M', '6M', 'YTD', '1Y'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              style={{
                padding: '6px 16px', borderRadius: '20px', border: 'none', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
                backgroundColor: dateRange === range ? 'var(--neu-primary)' : 'var(--neu-surface)',
                color: dateRange === range ? 'white' : 'var(--neu-text-muted)',
                boxShadow: dateRange === range ? '0 4px 12px var(--neu-primary-glow)' : 'var(--shadow-sm)'
              }}
            >
              {range}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="neu-button" onClick={() => handleExportCSV('Financial_Report')}>
            <Download size={18} /> Export CSV
          </button>
          <button className="neu-button gradient" onClick={handlePrint}>
            <Printer size={18} /> Print Report
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        {kpis.map((kpi, i) => (
          <div key={i} className="neu-card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--neu-text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>{kpi.label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--neu-text-main)', marginBottom: '4px' }}>{kpi.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--neu-primary)', fontWeight: '600' }}>{kpi.subtitle}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }} className="grid-mobile-1">
        
        {/* Revenue Trend Area Chart */}
        <div className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '400px' }}>
          <h3 style={{ margin: 0 }}>Revenue & Collection Trend</h3>
          <div style={{ flex: 1, width: '100%', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--neu-primary)" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="var(--neu-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--neu-text-muted)', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--neu-text-muted)', fontWeight: 600 }} tickFormatter={(val) => `₱${val/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--neu-surface)', borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)', fontWeight: 'bold' }}
                  formatter={(value) => [`₱ ${value.toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="target" stroke="var(--neu-text-muted)" strokeDasharray="5 5" fillOpacity={0} name="Target" />
                <Area type="monotone" dataKey="amount" stroke="var(--neu-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" name="Actual Revenue" />
                <Legend verticalAlign="top" height={36} iconType="circle" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Bar Chart */}
        <div className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Maintenance Tickets</h3>
            <button className="neu-button icon-only" style={{ padding: '8px', boxShadow: 'none' }} onClick={() => handleExportCSV('Maintenance_Report')}><Download size={16} /></button>
          </div>
          <div style={{ flex: 1, width: '100%', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--neu-text-muted)', fontWeight: 600 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--neu-text-main)', fontWeight: 700 }} width={80} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ backgroundColor: 'var(--neu-surface)', borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)', fontWeight: 'bold' }}
                />
                <Bar dataKey="tickets" radius={[0, 4, 4, 0]} barSize={24}>
                  {maintenanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
    </div>
  );
}

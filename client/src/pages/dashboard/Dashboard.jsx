import { useState, useEffect } from 'react';
import { Users, DollarSign, Wrench, Calendar, TrendingUp, TrendingDown, ArrowRight, Bell, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useAuthStore from '../../store/useAuthStore';
import Avatar from '../../components/ui/Avatar';
import api from '../../api';

export default function Dashboard() {
  const { user } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const revenueData = [
    { name: 'Jan', amount: 30000 },
    { name: 'Feb', amount: 45000 },
    { name: 'Mar', amount: 42000 },
    { name: 'Apr', amount: 80000 },
    { name: 'May', amount: 65000 },
    { name: 'Jun', amount: 95000 },
  ];

  const [dashboardStats, setDashboardStats] = useState({
    totalResidents: 0,
    totalCollected: 0,
    totalPending: 0,
    openTickets: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/reports/dashboard');
      setDashboardStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalExpected = dashboardStats.totalCollected + dashboardStats.totalPending;
  const collectionRate = totalExpected > 0 ? Math.round((dashboardStats.totalCollected / totalExpected) * 100) : 0;

  const stats = [
    { label: 'Total Residents', value: dashboardStats.totalResidents.toString(), trend: 'Active', isPositive: true, icon: Users, color: 'var(--neu-primary)' },
    { label: 'Pending Dues', value: `₱ ${dashboardStats.totalPending.toLocaleString()}`, trend: 'Needs action', isPositive: false, icon: DollarSign, color: 'var(--neu-danger)' },
    { label: 'Open Tickets', value: dashboardStats.openTickets.toString(), trend: 'Pending', isPositive: false, icon: Wrench, color: 'var(--neu-warning)' },
    { label: 'Upcoming Events', value: '3', trend: 'This week', isPositive: true, icon: Calendar, color: 'var(--neu-success)' },
  ];

  const recentActivity = [
    { id: 1, type: 'payment', text: 'John Doe paid dues for March', time: '10 mins ago', icon: DollarSign },
    { id: 2, type: 'ticket', text: 'New maintenance ticket #T-004 created', time: '1 hour ago', icon: Wrench },
    { id: 3, type: 'announcement', text: 'Admin posted "Pool Maintenance Schedule"', time: '3 hours ago', icon: Bell },
    { id: 4, type: 'security', text: 'System backup completed successfully', time: 'Yesterday', icon: ShieldCheck },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Greeting Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 8px 0', fontWeight: '800' }}>{getGreeting()}, {user?.name?.split(' ')[0] || 'Admin'}! 👋</h2>
          <p style={{ color: 'var(--neu-text-muted)', margin: 0, fontSize: '1.1rem' }}>Here's what's happening in your community today.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--neu-success)' }}>{collectionRate}%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--neu-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Collection Rate</div>
          </div>
          {/* Circular Progress Ring */}
          <div style={{ position: 'relative', width: '64px', height: '64px' }}>
            <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="32" cy="32" r="28" fill="none" stroke="var(--neu-surface)" strokeWidth="6" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="var(--neu-success)" strokeWidth="6" strokeDasharray="175.93" strokeDashoffset={175.93 - (175.93 * collectionRate / 100)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        {stats.map((stat, i) => (
          <div key={i} className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '48px', height: '48px', 
                borderRadius: '16px', 
                backgroundColor: 'var(--neu-surface)', 
                boxShadow: 'var(--shadow-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: stat.color
              }}>
                <stat.icon size={24} />
              </div>
              <div className={`neu-badge ${stat.isPositive ? 'badge-success' : 'badge-danger'}`} style={{ opacity: 0.9 }}>
                {stat.isPositive ? <TrendingUp size={14}/> : <TrendingDown size={14}/>} {stat.trend}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--neu-text-main)', letterSpacing: '-0.03em' }}>{stat.value}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--neu-text-muted)', fontWeight: '600' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }} className="grid-mobile-1">
        
        {/* Revenue Chart */}
        <div className="neu-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Revenue Overview</h3>
            <select className="neu-input" style={{ width: 'auto', padding: '8px 16px', fontWeight: '600', fontSize: '0.85rem' }}>
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div style={{ flex: 1, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--neu-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--neu-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--neu-text-muted)', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--neu-text-muted)', fontWeight: 600 }} tickFormatter={(val) => `₱${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--neu-surface)', borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)', fontWeight: 'bold' }}
                  itemStyle={{ color: 'var(--neu-primary)' }}
                  formatter={(value) => [`₱ ${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="amount" stroke="var(--neu-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Actions */}
          <div className="neu-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button className="neu-button" style={{ flexDirection: 'column', padding: '16px 8px', gap: '12px' }}>
                <div style={{ color: 'var(--neu-primary)' }}><Bell size={24} /></div>
                <span style={{ fontSize: '0.8rem' }}>Announce</span>
              </button>
              <button className="neu-button" style={{ flexDirection: 'column', padding: '16px 8px', gap: '12px' }}>
                <div style={{ color: 'var(--neu-success)' }}><DollarSign size={24} /></div>
                <span style={{ fontSize: '0.8rem' }}>Payment</span>
              </button>
              <button className="neu-button" style={{ flexDirection: 'column', padding: '16px 8px', gap: '12px' }}>
                <div style={{ color: 'var(--neu-accent)' }}><Users size={24} /></div>
                <span style={{ fontSize: '0.8rem' }}>Resident</span>
              </button>
              <button className="neu-button" style={{ flexDirection: 'column', padding: '16px 8px', gap: '12px' }}>
                <div style={{ color: 'var(--neu-warning)' }}><Wrench size={24} /></div>
                <span style={{ fontSize: '0.8rem' }}>Ticket</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="neu-card" style={{ padding: '24px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Recent Activity</h3>
              <button style={{ background: 'none', border: 'none', color: 'var(--neu-primary)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <ArrowRight size={14} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {recentActivity.map((activity) => (
                <div key={activity.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ 
                    padding: '10px', borderRadius: '50%', 
                    backgroundColor: 'var(--neu-surface)', 
                    boxShadow: 'var(--shadow-pressed)',
                    color: 'var(--neu-text-muted)' 
                  }}>
                    <activity.icon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--neu-text-main)', lineHeight: 1.4 }}>{activity.text}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--neu-text-muted)', fontWeight: '600', marginTop: '2px' }}>{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

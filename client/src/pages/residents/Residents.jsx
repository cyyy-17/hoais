import { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit2, Archive, User } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import useToastStore from '../../store/useToastStore';
import api from '../../api';

export default function Residents() {
  const addToast = useToastStore(state => state.addToast);
  
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const res = await api.get('/residents');
      // Format backend data to match our frontend needs
      const formattedData = res.data.map(r => ({
        id: r.id,
        name: r.user?.name || 'Unknown',
        email: r.user?.email || 'N/A',
        block: r.block,
        lot: r.lot,
        status: r.status,
        moveIn: new Date(r.moveInDate).toISOString().split('T')[0]
      }));
      setResidents(formattedData);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch residents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', email: '', block: '', lot: '', status: 'ACTIVE' });

  const filteredResidents = residents.filter(r => activeTab === 'ALL' || r.status === activeTab);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        moveInDate: new Date().toISOString()
      };
      await api.post('/residents', payload);
      addToast('Resident added successfully!', 'success');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', block: '', lot: '', status: 'ACTIVE' });
      fetchResidents();
    } catch (err) {
      console.error(err);
      addToast('Failed to add resident', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header & Controls */}
      <div className="neu-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1, maxWidth: '500px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neu-text-muted)' }} />
            <input type="text" className="neu-input" placeholder="Search residents..." style={{ paddingLeft: '48px' }} />
          </div>
          <button className="neu-button icon-only">
            <Filter size={18} />
          </button>
        </div>
        <button className="neu-button gradient" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add Resident
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', padding: '0 8px' }}>
        {['ALL', 'ACTIVE', 'RENTING', 'DELINQUENT'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 24px',
              borderRadius: '20px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              backgroundColor: activeTab === tab ? 'var(--neu-primary)' : 'var(--neu-surface)',
              color: activeTab === tab ? 'white' : 'var(--neu-text-muted)',
              boxShadow: activeTab === tab ? '0 4px 12px var(--neu-primary-glow)' : 'var(--shadow-sm)'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="neu-card" style={{ padding: '0', overflowX: 'auto', borderRadius: 'var(--radius-lg)' }}>
        <table className="neu-table">
          <thead>
            <tr>
              <th>Resident</th>
              <th>Contact Info</th>
              <th>Block / Lot</th>
              <th>Status</th>
              <th>Move-In Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--neu-text-muted)' }}>Loading...</td>
              </tr>
            ) : filteredResidents.map((resident) => (
              <tr key={resident.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Avatar name={resident.name} size={40} />
                    <span style={{ fontWeight: '700', color: 'var(--neu-text-main)' }}>{resident.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--neu-text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>{resident.email}</td>
                <td style={{ fontWeight: '700' }}>Blk {resident.block} <span style={{ color: 'var(--neu-text-muted)' }}>Lot {resident.lot}</span></td>
                <td>
                  <span className={`neu-badge ${
                    resident.status === 'ACTIVE' ? 'badge-success' : 
                    resident.status === 'DELINQUENT' ? 'badge-danger' : 'badge-warning'
                  }`}>
                    {resident.status}
                  </span>
                </td>
                <td style={{ color: 'var(--neu-text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>{resident.moveIn}</td>
                <td style={{ textAlign: 'right', position: 'relative' }}>
                  <button 
                    className="neu-button icon-only" 
                    style={{ padding: '8px', boxShadow: 'none', background: 'transparent' }}
                    onClick={() => setOpenDropdownId(openDropdownId === resident.id ? null : resident.id)}
                  >
                    <MoreVertical size={20} color="var(--neu-text-muted)" />
                  </button>
                  
                  {openDropdownId === resident.id && (
                    <div className="animate-fade-in-up" style={{
                      position: 'absolute', right: '40px', top: '10px',
                      backgroundColor: 'var(--neu-bg)', borderRadius: 'var(--radius-sm)',
                      boxShadow: 'var(--shadow-lg)', padding: '8px', zIndex: 10,
                      display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '150px'
                    }}>
                      <button className="neu-button" style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem', boxShadow: 'none' }} onClick={() => setOpenDropdownId(null)}>
                        <User size={16} /> View Profile
                      </button>
                      <button className="neu-button" style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem', boxShadow: 'none' }} onClick={() => setOpenDropdownId(null)}>
                        <Edit2 size={16} /> Edit Details
                      </button>
                      <button className="neu-button" style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem', boxShadow: 'none', color: 'var(--neu-danger)' }} onClick={() => setOpenDropdownId(null)}>
                        <Archive size={16} /> Archive
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Resident Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Resident">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="neu-label">Full Name</label>
            <input type="text" className="neu-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="neu-label">Email Address</label>
            <input type="email" className="neu-input" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="neu-label">Block</label>
              <input type="text" className="neu-input" required value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})} />
            </div>
            <div>
              <label className="neu-label">Lot</label>
              <input type="text" className="neu-input" required value={formData.lot} onChange={e => setFormData({...formData, lot: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="neu-label">Status</label>
            <select className="neu-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="ACTIVE">Active</option>
              <option value="RENTING">Renting</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
            <button type="button" className="neu-button" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="neu-button gradient">Save Resident</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

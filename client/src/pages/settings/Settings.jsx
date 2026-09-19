import { useState } from 'react';
import { Save, Shield, Users, FileText, Upload, Plus, Trash2, Edit2 } from 'lucide-react';
import useToastStore from '../../store/useToastStore';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';

export default function Settings() {
  const addToast = useToastStore(state => state.addToast);
  
  const [activeTab, setActiveTab] = useState('PROFILE');
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: 'Sunnyvale Homeowners Association',
    address: '123 Sunnyvale Ave, Brgy. San Antonio, Metro Manila',
    email: 'admin@sunnyvale.com',
    phone: '+63 917 123 4567'
  });

  const [board, setBoard] = useState([
    { id: 1, name: 'Michael Scott', role: 'President', email: 'michael@sunnyvale.com' },
    { id: 2, name: 'Dwight Schrute', role: 'Vice President', email: 'dwight@sunnyvale.com' },
    { id: 3, name: 'Angela Martin', role: 'Treasurer', email: 'angela@sunnyvale.com' },
  ]);

  const handleProfileSave = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      addToast('HOA Profile settings saved successfully!', 'success');
    }, 500);
  };

  const handleAddBoardMember = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setBoard([...board, {
      id: Date.now(),
      name: formData.get('name'),
      role: formData.get('role'),
      email: formData.get('email')
    }]);
    setIsBoardModalOpen(false);
    addToast('Board member added.', 'success');
  };

  const removeBoardMember = (id) => {
    setBoard(board.filter(b => b.id !== id));
    addToast('Board member removed.', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid rgba(0,0,0,0.05)', paddingBottom: '16px', overflowX: 'auto' }}>
        {[
          { id: 'PROFILE', label: 'HOA Profile', icon: Shield },
          { id: 'BOARD', label: 'Board of Trustees', icon: Users },
          { id: 'DOCS', label: 'By-Laws & Documents', icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: 'none', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'var(--transition-fast)', whiteSpace: 'nowrap',
              backgroundColor: activeTab === tab.id ? 'var(--neu-surface)' : 'transparent',
              color: activeTab === tab.id ? 'var(--neu-primary)' : 'var(--neu-text-muted)',
              boxShadow: activeTab === tab.id ? 'var(--shadow-pressed)' : 'none'
            }}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in-up">
        {/* Profile Tab */}
        {activeTab === 'PROFILE' && (
          <div className="neu-card" style={{ maxWidth: '800px' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.4rem' }}>General Information</h3>
            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="grid-mobile-1">
                <div>
                  <label className="neu-label">Association Name</label>
                  <input type="text" className="neu-input" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} required />
                </div>
                <div>
                  <label className="neu-label">Contact Email</label>
                  <input type="email" className="neu-input" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} required />
                </div>
              </div>
              
              <div>
                <label className="neu-label">Contact Phone</label>
                <input type="text" className="neu-input" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
              </div>

              <div>
                <label className="neu-label">Registered Address</label>
                <textarea className="neu-input" rows={3} value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} style={{ resize: 'vertical' }} required />
              </div>
              
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', paddingTop: '24px', borderTop: '2px solid rgba(0,0,0,0.05)' }}>
                <button type="submit" className="neu-button gradient"><Save size={18} /> Save Changes</button>
              </div>
            </form>
          </div>
        )}

        {/* Board Tab */}
        {activeTab === 'BOARD' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="neu-button gradient" onClick={() => setIsBoardModalOpen(true)}><Plus size={18} /> Add Member</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {board.map(member => (
                <div key={member.id} className="neu-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                  <Avatar name={member.name} size={80} />
                  <div>
                    <h3 style={{ margin: '0 0 4px 0' }}>{member.name}</h3>
                    <div className="neu-badge badge-neutral" style={{ margin: '4px 0 8px 0' }}>{member.role}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--neu-text-muted)' }}>{member.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px', width: '100%', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px' }}>
                    <button className="neu-button" style={{ flex: 1, padding: '8px' }}><Edit2 size={16} /></button>
                    <button className="neu-button" style={{ flex: 1, padding: '8px', color: 'var(--neu-danger)' }} onClick={() => removeBoardMember(member.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'DOCS' && (
          <div className="neu-card" style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Official Documents</h3>
              <button className="neu-button primary"><Upload size={18} /> Upload New</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--neu-surface)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-pressed)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ color: 'var(--neu-primary)' }}><FileText size={24} /></div>
                  <div>
                    <div style={{ fontWeight: '700' }}>HOA Master Deed & By-Laws (2024 Rev)</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--neu-text-muted)' }}>PDF • 2.4 MB • Uploaded Jan 15, 2024</div>
                  </div>
                </div>
                <button className="neu-button icon-only" style={{ boxShadow: 'none' }} onClick={() => addToast('Downloading...', 'info')}><Download size={18} /></button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--neu-surface)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-pressed)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ color: 'var(--neu-primary)' }}><FileText size={24} /></div>
                  <div>
                    <div style={{ fontWeight: '700' }}>Community Guidelines & Park Rules</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--neu-text-muted)' }}>PDF • 1.1 MB • Uploaded Feb 02, 2024</div>
                  </div>
                </div>
                <button className="neu-button icon-only" style={{ boxShadow: 'none' }} onClick={() => addToast('Downloading...', 'info')}><Download size={18} /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Board Modal */}
      <Modal isOpen={isBoardModalOpen} onClose={() => setIsBoardModalOpen(false)} title="Add Board Member">
        <form onSubmit={handleAddBoardMember} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="neu-label">Full Name</label>
            <input type="text" name="name" className="neu-input" required />
          </div>
          <div>
            <label className="neu-label">Role / Position</label>
            <input type="text" name="role" className="neu-input" required placeholder="e.g. Secretary" />
          </div>
          <div>
            <label className="neu-label">Contact Email</label>
            <input type="email" name="email" className="neu-input" required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
            <button type="button" className="neu-button" onClick={() => setIsBoardModalOpen(false)}>Cancel</button>
            <button type="submit" className="neu-button gradient">Add Member</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

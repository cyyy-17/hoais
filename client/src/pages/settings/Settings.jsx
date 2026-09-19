import { useState, useEffect } from 'react';
import { Save, Shield, Users, FileText, Upload, Plus, Trash2, Edit2, Download } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useToastStore from '../../store/useToastStore';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import api from '../../api';

const profileSchema = z.object({
  name: z.string().min(2, 'Association name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  address: z.string().min(5, 'Address is required')
});

const boardSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  role: z.string().min(2, 'Role is required'),
  email: z.string().email('Invalid email address')
});

export default function Settings() {
  const addToast = useToastStore(state => state.addToast);
  
  const [activeTab, setActiveTab] = useState('PROFILE');
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  
  const profileForm = useForm({
    resolver: zodResolver(profileSchema)
  });

  const boardForm = useForm({
    resolver: zodResolver(boardSchema)
  });

  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [profileRes, boardRes] = await Promise.all([
        api.get('/settings/profile'),
        api.get('/settings/board')
      ]);
      if (profileRes.data) {
        profileForm.reset(profileRes.data);
      }
      setBoard(boardRes.data || []);
    } catch (err) {
      addToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (data) => {
    try {
      await api.put('/settings/profile', data);
      addToast('HOA Profile settings saved successfully!', 'success');
    } catch (err) {
      addToast('Failed to save profile', 'error');
    }
  };

  const handleAddBoardMember = async (data) => {
    try {
      const res = await api.post('/settings/board', data);
      setBoard([...board, res.data]);
      setIsBoardModalOpen(false);
      boardForm.reset();
      addToast('Board member added.', 'success');
    } catch (err) {
      addToast('Failed to add board member', 'error');
    }
  };

  const removeBoardMember = async (id) => {
    try {
      await api.delete(`/settings/board/${id}`);
      setBoard(board.filter(b => b.id !== id));
      addToast('Board member removed.', 'info');
    } catch (err) {
      addToast('Failed to remove board member', 'error');
    }
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
            <form onSubmit={profileForm.handleSubmit(handleProfileSave)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="grid-mobile-1">
                <div>
                  <label className="neu-label">Association Name</label>
                  <input type="text" className={`neu-input ${profileForm.formState.errors.name ? 'error' : ''}`} {...profileForm.register('name')} />
                  {profileForm.formState.errors.name && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{profileForm.formState.errors.name.message}</span>}
                </div>
                <div>
                  <label className="neu-label">Contact Email</label>
                  <input type="email" className={`neu-input ${profileForm.formState.errors.email ? 'error' : ''}`} {...profileForm.register('email')} />
                  {profileForm.formState.errors.email && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{profileForm.formState.errors.email.message}</span>}
                </div>
              </div>
              
              <div>
                <label className="neu-label">Contact Phone</label>
                <input type="text" className={`neu-input ${profileForm.formState.errors.phone ? 'error' : ''}`} {...profileForm.register('phone')} />
                {profileForm.formState.errors.phone && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{profileForm.formState.errors.phone.message}</span>}
              </div>

              <div>
                <label className="neu-label">Registered Address</label>
                <textarea className={`neu-input ${profileForm.formState.errors.address ? 'error' : ''}`} rows={3} {...profileForm.register('address')} style={{ resize: 'vertical' }} />
                {profileForm.formState.errors.address && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{profileForm.formState.errors.address.message}</span>}
              </div>
              
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', paddingTop: '24px', borderTop: '2px solid rgba(0,0,0,0.05)' }}>
                <button type="submit" className="neu-button gradient" disabled={profileForm.formState.isSubmitting}>
                  <Save size={18} /> {profileForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
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
      <Modal isOpen={isBoardModalOpen} onClose={() => { setIsBoardModalOpen(false); boardForm.reset(); }} title="Add Board Member">
        <form onSubmit={boardForm.handleSubmit(handleAddBoardMember)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="neu-label">Full Name</label>
            <input type="text" className={`neu-input ${boardForm.formState.errors.name ? 'error' : ''}`} {...boardForm.register('name')} />
            {boardForm.formState.errors.name && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{boardForm.formState.errors.name.message}</span>}
          </div>
          <div>
            <label className="neu-label">Role / Position</label>
            <input type="text" className={`neu-input ${boardForm.formState.errors.role ? 'error' : ''}`} placeholder="e.g. Secretary" {...boardForm.register('role')} />
            {boardForm.formState.errors.role && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{boardForm.formState.errors.role.message}</span>}
          </div>
          <div>
            <label className="neu-label">Contact Email</label>
            <input type="email" className={`neu-input ${boardForm.formState.errors.email ? 'error' : ''}`} {...boardForm.register('email')} />
            {boardForm.formState.errors.email && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{boardForm.formState.errors.email.message}</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
            <button type="button" className="neu-button" onClick={() => { setIsBoardModalOpen(false); boardForm.reset(); }}>Cancel</button>
            <button type="submit" className="neu-button gradient" disabled={boardForm.formState.isSubmitting}>
              {boardForm.formState.isSubmitting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

import { useState, useEffect } from 'react';
import { Megaphone, Calendar, Clock, Pin, Plus } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import useToastStore from '../../store/useToastStore';
import api from '../../api';

export default function Announcements() {
  const addToast = useToastStore(state => state.addToast);
  
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      const formattedData = res.data.map(a => ({
        id: a.id,
        title: a.title,
        content: a.body,
        type: a.category,
        pinned: a.pinned,
        date: new Date(a.createdAt).toISOString().split('T')[0],
        time: new Date(a.createdAt).toTimeString().substring(0, 5)
      }));
      setAnnouncements(formattedData);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [readModalItem, setReadModalItem] = useState(null);

  const filtered = announcements.filter(a => activeTab === 'ALL' || a.type === activeTab);
  // Sort pinned items first, then by date descending
  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date) - new Date(a.date);
  });

  const getCategoryColor = (type) => {
    switch(type) {
      case 'EVENTS': return 'var(--neu-primary)';
      case 'MAINTENANCE': return 'var(--neu-warning)';
      case 'GENERAL': return 'var(--neu-success)';
      default: return 'var(--neu-text-muted)';
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await api.post('/announcements', {
        title: formData.get('title'),
        category: formData.get('type'),
        body: formData.get('content'),
        pinned: formData.get('pinned') === 'on'
      });
      addToast('Announcement published successfully', 'success');
      setIsCreateModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      addToast('Failed to publish announcement', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div className="neu-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['ALL', 'EVENTS', 'MAINTENANCE', 'GENERAL'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 20px',
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
        <button className="neu-button gradient" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={18} /> New Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {loading ? (
          <div className="neu-card" style={{ textAlign: 'center', padding: '48px', color: 'var(--neu-text-muted)' }}>
            Loading...
          </div>
        ) : sorted.map((ann, index) => (
          <div key={ann.id} className="neu-card animate-fade-in-up" style={{ display: 'flex', gap: '24px', animationDelay: `${index * 0.1}s` }}>
            
            {/* Left Date Block */}
            <div style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '16px', minWidth: '100px',
              backgroundColor: 'var(--neu-surface)', borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-pressed)'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--neu-primary)' }}>
                {new Date(ann.date).getDate()}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--neu-text-muted)', textTransform: 'uppercase' }}>
                {new Date(ann.date).toLocaleString('default', { month: 'short' })}
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ 
                      fontSize: '0.75rem', fontWeight: '800', padding: '4px 12px', borderRadius: '12px',
                      backgroundColor: 'var(--neu-bg)', color: getCategoryColor(ann.type), boxShadow: 'var(--shadow-sm)'
                    }}>
                      {ann.type}
                    </span>
                    {ann.pinned && <span style={{ color: 'var(--neu-danger)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: '700' }}><Pin size={14}/> Pinned</span>}
                  </div>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '1.4rem' }}>{ann.title}</h3>
                </div>
              </div>
              
              <p style={{ color: 'var(--neu-text-muted)', margin: '0 0 16px 0', lineHeight: 1.6, flex: 1 }}>
                {ann.content.length > 150 ? `${ann.content.substring(0, 150)}...` : ann.content}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--neu-text-muted)', fontWeight: '600' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14}/> {ann.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14}/> {ann.time}</span>
                </div>
                <button className="neu-button" onClick={() => setReadModalItem(ann)}>Read Full <Megaphone size={16}/></button>
              </div>
            </div>
          </div>
        ))}
        {!loading && sorted.length === 0 && (
          <div className="neu-card" style={{ textAlign: 'center', padding: '48px', color: 'var(--neu-text-muted)' }}>
            No announcements found for this category.
          </div>
        )}
      </div>

      {/* Read More Modal */}
      <Modal isOpen={!!readModalItem} onClose={() => setReadModalItem(null)} title={readModalItem?.title}>
        {readModalItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ 
                fontSize: '0.75rem', fontWeight: '800', padding: '4px 12px', borderRadius: '12px',
                backgroundColor: 'var(--neu-bg)', color: getCategoryColor(readModalItem.type), boxShadow: 'var(--shadow-sm)'
              }}>
                {readModalItem.type}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--neu-text-muted)', fontWeight: '600' }}>
                Posted on {readModalItem.date} at {readModalItem.time}
              </span>
            </div>
            
            <div style={{ padding: '24px', backgroundColor: 'var(--neu-surface)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-pressed)' }}>
              <p style={{ margin: 0, lineHeight: 1.8, color: 'var(--neu-text-main)' }}>
                {readModalItem.content}
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="neu-button primary" onClick={() => setReadModalItem(null)}>Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="New Announcement">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="neu-label">Title</label>
            <input name="title" type="text" className="neu-input" required placeholder="e.g. Annual Meeting" />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="neu-label">Category</label>
              <select name="type" className="neu-input" required>
                <option value="GENERAL">General</option>
                <option value="EVENTS">Event</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
              <input type="checkbox" name="pinned" id="pinned" style={{ width: '20px', height: '20px' }} />
              <label htmlFor="pinned" style={{ fontWeight: '600', cursor: 'pointer' }}>Pin to top</label>
            </div>
          </div>

          <div>
            <label className="neu-label">Message Body</label>
            <textarea name="content" className="neu-input" rows="6" required placeholder="Write your announcement here..." style={{ resize: 'vertical' }}></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
            <button type="button" className="neu-button" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
            <button type="submit" className="neu-button gradient">Publish Announcement</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

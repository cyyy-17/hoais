import { useState, useEffect } from 'react';
import { Search, Filter, Wrench, AlertCircle, CheckCircle, LayoutGrid, List, Plus } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import useToastStore from '../../store/useToastStore';
import api from '../../api';

export default function Maintenance() {
  const addToast = useToastStore(state => state.addToast);
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/maintenance');
      const formattedData = res.data.map(t => ({
        id: t.id,
        resident: t.resident?.user?.name || 'Unknown',
        category: t.category,
        issue: t.description,
        status: t.status,
        priority: 'MEDIUM', // Mocking priority as it's not in Prisma schema
        date: new Date(t.createdAt).toISOString().split('T')[0],
        assigned: t.assignedTo || 'Unassigned'
      }));
      setTickets(formattedData);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch maintenance tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  const stats = {
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'OPEN': return 'badge-danger';
      case 'IN_PROGRESS': return 'badge-warning';
      case 'RESOLVED': return 'badge-success';
      default: return 'badge-neutral';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'CRITICAL': return 'var(--neu-danger)';
      case 'HIGH': return '#ed8936';
      case 'MEDIUM': return 'var(--neu-warning)';
      case 'LOW': return 'var(--neu-success)';
      default: return 'var(--neu-text-muted)';
    }
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newStatus = formData.get('status');
    const newAssigned = formData.get('assigned');
    
    try {
      await api.patch(`/maintenance/${selectedTicket.id}/status`, {
        status: newStatus,
        assignedTo: newAssigned
      });
      addToast(`Ticket ${selectedTicket.id.substring(0, 8)}... updated successfully`, 'success');
      setIsModalOpen(false);
      fetchTickets();
    } catch (err) {
      console.error(err);
      addToast('Failed to update ticket', 'error');
    }
  };

  const openUpdateModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Top Summary Pills */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div className="neu-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '200px' }}>
          <div style={{ padding: '12px', background: 'var(--neu-surface)', borderRadius: '50%', color: 'var(--neu-danger)', boxShadow: 'var(--shadow-pressed)' }}><AlertCircle size={24}/></div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{stats.open}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--neu-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Open Tickets</div>
          </div>
        </div>
        <div className="neu-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '200px' }}>
          <div style={{ padding: '12px', background: 'var(--neu-surface)', borderRadius: '50%', color: 'var(--neu-warning)', boxShadow: 'var(--shadow-pressed)' }}><Wrench size={24}/></div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{stats.inProgress}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--neu-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>In Progress</div>
          </div>
        </div>
        <div className="neu-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '200px' }}>
          <div style={{ padding: '12px', background: 'var(--neu-surface)', borderRadius: '50%', color: 'var(--neu-success)', boxShadow: 'var(--shadow-pressed)' }}><CheckCircle size={24}/></div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{stats.resolved}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--neu-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Resolved</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="neu-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1, maxWidth: '500px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neu-text-muted)' }} />
            <input type="text" className="neu-input" placeholder="Search tickets..." style={{ paddingLeft: '48px' }} />
          </div>
          <button className="neu-button icon-only">
            <Filter size={18} />
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--neu-surface)', padding: '4px', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-pressed)' }}>
            <button 
              className="neu-button icon-only" 
              style={{ boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none', background: viewMode === 'grid' ? 'var(--neu-bg)' : 'transparent', color: viewMode === 'grid' ? 'var(--neu-primary)' : 'var(--neu-text-muted)' }}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              className="neu-button icon-only" 
              style={{ boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none', background: viewMode === 'list' ? 'var(--neu-bg)' : 'transparent', color: viewMode === 'list' ? 'var(--neu-primary)' : 'var(--neu-text-muted)' }}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
          <button className="neu-button gradient">
            <Plus size={18} /> New Ticket
          </button>
        </div>
      </div>

      {/* Ticket Grid View */}
      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--neu-text-muted)' }}>Loading...</div>
          ) : tickets.map((ticket) => (
            <div key={ticket.id} className="neu-card animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--neu-primary)', fontWeight: '800', fontFamily: 'monospace' }}>{ticket.id.substring(0, 8)}...</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: getPriorityColor(ticket.priority), padding: '2px 8px', borderRadius: '12px', background: 'var(--neu-surface)' }}>{ticket.priority}</span>
                  </div>
                  <h3 style={{ margin: '0', fontSize: '1.2rem' }}>{ticket.category}</h3>
                </div>
                <div className={`neu-badge ${getStatusBadgeClass(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </div>
              </div>
              
              <p style={{ color: 'var(--neu-text-main)', margin: '0', fontSize: '0.95rem', lineHeight: 1.5, flex: 1 }}>{ticket.issue}</p>
              
              <div style={{ padding: '12px', background: 'var(--neu-surface)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-pressed)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--neu-text-muted)', marginBottom: '4px' }}>Assigned to:</div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{ticket.assigned}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '16px', borderTop: '2px solid rgba(255,255,255,0.4)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--neu-text-muted)', fontWeight: '600' }}>
                  Reported by: <span style={{ color: 'var(--neu-text-main)' }}>{ticket.resident}</span><br/>
                  {ticket.date}
                </div>
                <button className="neu-button" onClick={() => openUpdateModal(ticket)}>Update</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket List View */}
      {viewMode === 'list' && (
        <div className="neu-card animate-fade-in-up" style={{ padding: '0', overflowX: 'auto', borderRadius: 'var(--radius-lg)' }}>
          <table className="neu-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Details</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--neu-text-muted)' }}>Loading...</td>
                </tr>
              ) : tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td style={{ fontWeight: '800', color: 'var(--neu-primary)', fontFamily: 'monospace' }}>{ticket.id.substring(0, 8)}...</td>
                  <td>
                    <div style={{ fontWeight: '700' }}>{ticket.category}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--neu-text-muted)' }}>{ticket.issue}</div>
                  </td>
                  <td><span style={{ color: getPriorityColor(ticket.priority), fontWeight: '800', fontSize: '0.85rem' }}>{ticket.priority}</span></td>
                  <td style={{ fontWeight: '600', fontSize: '0.9rem' }}>{ticket.assigned}</td>
                  <td><span className={`neu-badge ${getStatusBadgeClass(ticket.status)}`}>{ticket.status.replace('_', ' ')}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="neu-button" onClick={() => openUpdateModal(ticket)}>Update</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Update Ticket ${selectedTicket?.id?.substring(0, 8)}...`}>
        {selectedTicket && (
          <form onSubmit={handleUpdateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ padding: '16px', background: 'var(--neu-surface)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-pressed)' }}>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>Issue description:</div>
              <div style={{ color: 'var(--neu-text-muted)' }}>{selectedTicket.issue}</div>
            </div>
            
            <div>
              <label className="neu-label">Status</label>
              <select name="status" className="neu-input" defaultValue={selectedTicket.status}>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div>
              <label className="neu-label">Assign To</label>
              <input type="text" name="assigned" className="neu-input" defaultValue={selectedTicket.assigned} />
            </div>
            
            <div>
              <label className="neu-label">Add Note (Optional)</label>
              <textarea className="neu-input" rows="3" placeholder="Enter resolution notes..."></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
              <button type="button" className="neu-button" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" className="neu-button gradient">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}

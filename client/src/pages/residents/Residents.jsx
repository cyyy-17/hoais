import { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit2, Archive, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import Pagination from '../../components/ui/Pagination';
import Skeleton, { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import useToastStore from '../../store/useToastStore';
import api from '../../api';

const addResidentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  block: z.string().min(1, 'Block is required'),
  lot: z.string().min(1, 'Lot is required'),
  status: z.enum(['ACTIVE', 'RENTING'])
});

const editResidentSchema = z.object({
  block: z.string().min(1, 'Block is required'),
  lot: z.string().min(1, 'Lot is required'),
  status: z.enum(['ACTIVE', 'RENTING', 'DELINQUENT', 'ARCHIVED'])
});

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

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedResident, setSelectedResident] = useState(null);
  
  const addForm = useForm({
    resolver: zodResolver(addResidentSchema),
    defaultValues: { name: '', email: '', block: '', lot: '', status: 'ACTIVE' }
  });

  const editForm = useForm({
    resolver: zodResolver(editResidentSchema)
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredResidents = residents.filter(r => {
    const matchesTab = activeTab === 'ALL' || r.status === activeTab;
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.lot.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const totalPages = Math.ceil(filteredResidents.length / ITEMS_PER_PAGE);
  const paginatedResidents = filteredResidents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset to page 1 if tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const onAddSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        moveInDate: new Date().toISOString()
      };
      await api.post('/residents', payload);
      addToast('Resident added successfully!', 'success');
      setIsModalOpen(false);
      addForm.reset();
      fetchResidents();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.error || 'Failed to add resident', 'error');
    }
  };

  const onEditSubmit = async (data) => {
    try {
      await api.put(`/residents/${selectedResident.id}`, data);
      addToast('Resident updated successfully!', 'success');
      setIsEditModalOpen(false);
      fetchResidents();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update resident', 'error');
    }
  };

  const handleArchive = async () => {
    // Optimistic Update
    const prevResidents = [...residents];
    setResidents(residents.map(r => r.id === selectedResident.id ? { ...r, status: 'ARCHIVED' } : r));
    setIsArchiveConfirmOpen(false);

    try {
      await api.put(`/residents/${selectedResident.id}`, { status: 'ARCHIVED' });
      addToast('Resident archived successfully!', 'success');
      // No need to fetchResidents() here since we optimistically updated, 
      // but doing it silently ensures data consistency
      fetchResidents();
    } catch (err) {
      // Revert on failure
      setResidents(prevResidents);
      addToast(err.response?.data?.error || 'Failed to archive resident', 'error');
    }
  };

  const openEditModal = (resident) => {
    setSelectedResident(resident);
    editForm.reset({ block: resident.block, lot: resident.lot, status: resident.status });
    setIsEditModalOpen(true);
  };

  const openArchiveConfirm = (resident) => {
    setSelectedResident(resident);
    setIsArchiveConfirmOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header & Controls */}
      <div className="neu-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1, maxWidth: '500px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neu-text-muted)' }} />
            <input 
              type="text" 
              className="neu-input" 
              placeholder="Search residents..." 
              style={{ paddingLeft: '48px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
              <TableSkeleton columns={6} rows={5} />
            ) : paginatedResidents.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '0' }}>
                  <EmptyState title="No Residents Found" message="Try adjusting your filters or add a new resident." />
                </td>
              </tr>
            ) : paginatedResidents.map((resident) => (
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdownId(openDropdownId === resident.id ? null : resident.id);
                    }}
                  >
                    <MoreVertical size={20} color="var(--neu-text-muted)" />
                  </button>
                  
                  {openDropdownId === resident.id && (
                    <div className="animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{
                      position: 'absolute', right: '40px', top: '10px',
                      backgroundColor: 'var(--neu-bg)', borderRadius: 'var(--radius-sm)',
                      boxShadow: 'var(--shadow-lg)', padding: '8px', zIndex: 10,
                      display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '150px'
                    }}>
                      <button className="neu-button" style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem', boxShadow: 'none' }} onClick={() => setOpenDropdownId(null)}>
                        <User size={16} /> View Profile
                      </button>
                      <button className="neu-button" style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem', boxShadow: 'none' }} onClick={() => { setOpenDropdownId(null); openEditModal(resident); }}>
                        <Edit2 size={16} /> Edit Details
                      </button>
                      <button className="neu-button" style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem', boxShadow: 'none', color: 'var(--neu-danger)' }} onClick={() => { setOpenDropdownId(null); openArchiveConfirm(resident); }}>
                        <Archive size={16} /> Archive
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '0 24px 24px' }}>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      </div>

      {/* Add Resident Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); addForm.reset(); }} title="Add New Resident">
        <form onSubmit={addForm.handleSubmit(onAddSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="neu-label">Full Name</label>
            <input type="text" className={`neu-input ${addForm.formState.errors.name ? 'error' : ''}`} {...addForm.register('name')} />
            {addForm.formState.errors.name && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{addForm.formState.errors.name.message}</span>}
          </div>
          <div>
            <label className="neu-label">Email Address</label>
            <input type="email" className={`neu-input ${addForm.formState.errors.email ? 'error' : ''}`} {...addForm.register('email')} />
            {addForm.formState.errors.email && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{addForm.formState.errors.email.message}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="neu-label">Block</label>
              <input type="text" className={`neu-input ${addForm.formState.errors.block ? 'error' : ''}`} {...addForm.register('block')} />
              {addForm.formState.errors.block && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{addForm.formState.errors.block.message}</span>}
            </div>
            <div>
              <label className="neu-label">Lot</label>
              <input type="text" className={`neu-input ${addForm.formState.errors.lot ? 'error' : ''}`} {...addForm.register('lot')} />
              {addForm.formState.errors.lot && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{addForm.formState.errors.lot.message}</span>}
            </div>
          </div>
          <div>
            <label className="neu-label">Status</label>
            <select className="neu-input" {...addForm.register('status')}>
              <option value="ACTIVE">Active</option>
              <option value="RENTING">Renting</option>
            </select>
            {addForm.formState.errors.status && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{addForm.formState.errors.status.message}</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
            <button type="button" className="neu-button" onClick={() => { setIsModalOpen(false); addForm.reset(); }}>Cancel</button>
            <button type="submit" className="neu-button gradient" disabled={addForm.formState.isSubmitting}>
              {addForm.formState.isSubmitting ? 'Saving...' : 'Save Resident'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Resident Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Resident Details">
        <form onSubmit={editForm.handleSubmit(onEditSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="neu-label">Block</label>
              <input type="text" className={`neu-input ${editForm.formState.errors.block ? 'error' : ''}`} {...editForm.register('block')} />
              {editForm.formState.errors.block && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{editForm.formState.errors.block.message}</span>}
            </div>
            <div>
              <label className="neu-label">Lot</label>
              <input type="text" className={`neu-input ${editForm.formState.errors.lot ? 'error' : ''}`} {...editForm.register('lot')} />
              {editForm.formState.errors.lot && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{editForm.formState.errors.lot.message}</span>}
            </div>
          </div>
          <div>
            <label className="neu-label">Status</label>
            <select className="neu-input" {...editForm.register('status')}>
              <option value="ACTIVE">Active</option>
              <option value="RENTING">Renting</option>
              <option value="DELINQUENT">Delinquent</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            {editForm.formState.errors.status && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{editForm.formState.errors.status.message}</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
            <button type="button" className="neu-button" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="neu-button primary" disabled={editForm.formState.isSubmitting}>
              {editForm.formState.isSubmitting ? 'Updating...' : 'Update Details'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={isArchiveConfirmOpen} 
        onClose={() => setIsArchiveConfirmOpen(false)} 
        onConfirm={handleArchive}
        title="Archive Resident"
        message={`Are you sure you want to archive ${selectedResident?.name}? This will restrict their access.`}
        confirmText="Yes, Archive"
      />
    </div>
  );
}

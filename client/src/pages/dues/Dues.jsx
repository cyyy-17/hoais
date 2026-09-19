import { useState, useEffect } from 'react';
import { Search, Filter, FileText, Check, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import Skeleton, { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import useToastStore from '../../store/useToastStore';
import api from '../../api';

export default function Dues() {
  const addToast = useToastStore(state => state.addToast);
  
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDues();
  }, []);

  const fetchDues = async () => {
    try {
      const res = await api.get('/dues');
      const formattedData = res.data.map(d => ({
        id: d.id,
        resident: d.resident?.user?.name || 'Unknown',
        period: d.period,
        amount: d.amount,
        dueDate: new Date(d.dueDate).toISOString().split('T')[0],
        status: d.status
      }));
      setDues(formattedData);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch dues', 'error');
    } finally {
      setLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDue, setSelectedDue] = useState(null);

  const filteredDues = dues.filter(d => 
    d.resident.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const totalPages = Math.ceil(filteredDues.length / ITEMS_PER_PAGE);
  const paginatedDues = filteredDues.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalCollected = dues.filter(d => d.status === 'PAID').reduce((sum, d) => sum + d.amount, 0);
  const totalPending = dues.filter(d => d.status === 'PENDING').reduce((sum, d) => sum + d.amount, 0);
  const totalExpected = dues.reduce((sum, d) => sum + d.amount, 0);
  const collectionRate = Math.round((totalCollected / totalExpected) * 100) || 0;

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.post('/dues/payment', {
        duesId: selectedDue.id,
        amount: selectedDue.amount,
        method: formData.get('method'),
        referenceNo: formData.get('referenceNo')
      });
      addToast(`Payment of ₱${selectedDue.amount.toLocaleString()} recorded for ${selectedDue.resident}`, 'success');
      setIsPaymentModalOpen(false);
      fetchDues();
    } catch (err) {
      console.error(err);
      addToast('Failed to record payment', 'error');
    }
  };

  const openPaymentModal = (due = null) => {
    setSelectedDue(due || dues.find(d => d.status !== 'PAID'));
    setIsPaymentModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Progress Bar Header */}
      <div className="neu-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>Monthly Collection Progress</h3>
            <p style={{ margin: 0, color: 'var(--neu-text-muted)' }}>
              <strong>₱ {totalCollected.toLocaleString()}</strong> collected out of ₱ {totalExpected.toLocaleString()}
            </p>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--neu-primary)' }}>
            {collectionRate}%
          </div>
        </div>
        <div style={{ width: '100%', height: '16px', borderRadius: '8px', backgroundColor: 'var(--neu-surface)', boxShadow: 'var(--shadow-pressed)', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${collectionRate}%`, 
            background: 'var(--gradient-primary)',
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <div className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--neu-text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>Collected</span>
            <TrendingUp size={16} color="var(--neu-success)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800' }}>₱ {totalCollected.toLocaleString()}</div>
        </div>
        
        <div className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--neu-text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>Pending</span>
            <DollarSign size={16} color="var(--neu-warning)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800' }}>₱ {totalPending.toLocaleString()}</div>
        </div>

        <div className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--neu-text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>Overdue</span>
            <TrendingDown size={16} color="var(--neu-danger)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800' }}>₱ {(totalExpected - totalCollected - totalPending).toLocaleString()}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="neu-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1, maxWidth: '500px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neu-text-muted)' }} />
            <input 
              type="text" 
              className="neu-input" 
              placeholder="Search by name or reference..." 
              style={{ paddingLeft: '48px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="neu-button icon-only">
            <Filter size={18} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="neu-button" onClick={() => addToast('Bills generated for current month!', 'success')}>Generate Bills</button>
          <button className="neu-button gradient" onClick={() => openPaymentModal()}>Record Payment</button>
        </div>
      </div>

      {/* Table */}
      <div className="neu-card" style={{ padding: '0', overflowX: 'auto', borderRadius: 'var(--radius-lg)' }}>
        <table className="neu-table">
          <thead>
            <tr>
              <th>Inv ID</th>
              <th>Resident</th>
              <th>Period</th>
              <th>Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton columns={6} rows={5} />
            ) : paginatedDues.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '0' }}>
                  <EmptyState title="No Dues Found" message="Try adjusting your filters or record a payment." />
                </td>
              </tr>
            ) : paginatedDues.map((due) => (
              <tr key={due.id}>
                <td style={{ fontFamily: 'monospace', color: 'var(--neu-primary)', fontWeight: 'bold' }}>{due.id.substring(0, 8)}...</td>
                <td style={{ fontWeight: '700', color: 'var(--neu-text-main)' }}>{due.resident}</td>
                <td style={{ color: 'var(--neu-text-muted)', fontWeight: '600' }}>{due.period}</td>
                <td style={{ fontWeight: '700', fontSize: '1.1rem' }}>₱ {due.amount.toLocaleString()}</td>
                <td>
                  <span className={`neu-badge ${
                    due.status === 'PAID' ? 'badge-success' : 
                    due.status === 'OVERDUE' ? 'badge-danger' : 'badge-warning'
                  }`}>
                    {due.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {due.status !== 'PAID' && (
                      <button className="neu-button icon-only" style={{ padding: '8px', color: 'var(--neu-success)' }} title="Mark Paid" onClick={() => openPaymentModal(due)}>
                        <Check size={18} />
                      </button>
                    )}
                    <button className="neu-button icon-only" style={{ padding: '8px' }} title="View SOA" onClick={() => addToast('Downloading Statement of Account...', 'info')}>
                      <FileText size={18} color="var(--neu-text-muted)" />
                    </button>
                  </div>
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

      {/* Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Payment">
        <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="neu-label">Select Resident / Invoice</label>
            <select 
              className="neu-input" 
              value={selectedDue?.id || ''} 
              onChange={e => setSelectedDue(dues.find(d => d.id === e.target.value))}
              required
            >
              <option value="">-- Select Pending Invoice --</option>
              {dues.filter(d => d.status !== 'PAID').map(d => (
                <option key={d.id} value={d.id}>{d.resident} ({d.period}) - ₱ {d.amount.toLocaleString()}</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="neu-label">Amount Received</label>
              <input type="number" className="neu-input" required value={selectedDue?.amount || ''} readOnly />
            </div>
            <div>
              <label className="neu-label">Payment Method</label>
              <select name="method" className="neu-input" required>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="GCASH">GCash</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="neu-label">Reference Number (Optional)</label>
            <input name="referenceNo" type="text" className="neu-input" placeholder="e.g. GCash Ref No." />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
            <button type="button" className="neu-button" onClick={() => setIsPaymentModalOpen(false)}>Cancel</button>
            <button type="submit" className="neu-button gradient" disabled={!selectedDue}>Confirm Payment</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

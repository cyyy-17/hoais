import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Plus, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../api';
import useToastStore from '../../store/useToastStore';
import Pagination from '../../components/ui/Pagination';
import Skeleton, { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

const bookingSchema = z.object({
  facilityId: z.string().min(1, 'Facility is required'),
  residentId: z.string().min(1, 'Resident ID is required'),
  date: z.string().min(1, 'Date is required'),
  timeFrom: z.string().min(1, 'Start time is required'),
  timeTo: z.string().min(1, 'End time is required')
});

export default function Facilities() {
  const [bookings, setBookings] = useState([]);
  const [facilitiesList, setFacilitiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(bookingSchema)
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facilitiesRes, bookingsRes] = await Promise.all([
        api.get('/facilities'),
        api.get('/facilities/bookings')
      ]);
      setFacilitiesList(facilitiesRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to load facilities data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  
  const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = bookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/facilities/bookings/${id}/status`, { status: 'APPROVED' });
      addToast('Booking approved', 'success');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to approve booking', 'error');
    }
  };

  const handleCreateBooking = async (data) => {
    try {
      await api.post('/facilities/bookings', data);
      addToast('Booking created', 'success');
      setShowModal(false);
      reset();
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to create booking', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        
        {/* Bookings List */}
        <div className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Recent Bookings</h3>
            <button onClick={() => setShowModal(true)} className="neu-button primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              <Plus size={16} /> New Booking
            </button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--neu-bg)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--neu-text-muted)' }}>Facility</th>
                  <th style={{ padding: '12px 16px', color: 'var(--neu-text-muted)' }}>Resident</th>
                  <th style={{ padding: '12px 16px', color: 'var(--neu-text-muted)' }}>Date & Time</th>
                  <th style={{ padding: '12px 16px', color: 'var(--neu-text-muted)' }}>Status</th>
                  <th style={{ padding: '12px 16px', color: 'var(--neu-text-muted)', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeleton columns={5} rows={5} />
                ) : paginatedBookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '0' }}>
                      <EmptyState title="No Bookings" message="There are no facility bookings yet." />
                    </td>
                  </tr>
                ) : paginatedBookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>{b.facility?.name}</td>
                    <td style={{ padding: '12px 16px' }}>{b.resident?.user?.name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CalendarIcon size={14}/> {new Date(b.date).toLocaleDateString()}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> {b.timeFrom} - {b.timeTo}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        backgroundColor: b.status === 'APPROVED' ? 'var(--neu-success)' : 'var(--neu-warning)',
                        color: b.status === 'APPROVED' ? '#fff' : '#000'
                      }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {b.status === 'PENDING' && (
                        <button onClick={() => handleApprove(b.id)} className="neu-button icon-only" style={{ padding: '6px', color: 'var(--neu-success)' }} title="Approve">
                          <Check size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '24px' }}>
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          </div>
        </div>

        {/* Facilities Summary */}
        <div className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0 }}>Available Facilities</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? (
              <>
                <Skeleton height="60px" borderRadius="var(--radius-sm)" />
                <Skeleton height="60px" borderRadius="var(--radius-sm)" />
                <Skeleton height="60px" borderRadius="var(--radius-sm)" />
              </>
            ) : facilitiesList.length === 0 ? (
              <EmptyState title="No Facilities" message="Add a facility to start taking bookings." />
            ) : facilitiesList.map((f) => (
              <div key={f.id} style={{ padding: '12px', backgroundColor: 'var(--neu-bg)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-pressed)' }}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>{f.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--neu-text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14}/> Max {f.capacity}</span>
                  <span>{f.rate ? `₱ ${f.rate}` : 'Free'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Basic Create Booking Modal inline since it's just a quick form */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="neu-card" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3>New Booking</h3>
            <form onSubmit={handleSubmit(handleCreateBooking)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label>Facility</label>
                <select className={`neu-input ${errors.facilityId ? 'error' : ''}`} {...register('facilityId')}>
                  <option value="">Select Facility</option>
                  {facilitiesList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                {errors.facilityId && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.facilityId.message}</span>}
              </div>
              <div>
                <label>Resident ID</label>
                <input className={`neu-input ${errors.residentId ? 'error' : ''}`} placeholder="Resident UUID..." {...register('residentId')} />
                {errors.residentId && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.residentId.message}</span>}
              </div>
              <div>
                <label>Date</label>
                <input type="date" className={`neu-input ${errors.date ? 'error' : ''}`} {...register('date')} />
                {errors.date && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.date.message}</span>}
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label>Time From</label>
                  <input type="time" className={`neu-input ${errors.timeFrom ? 'error' : ''}`} {...register('timeFrom')} />
                  {errors.timeFrom && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.timeFrom.message}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <label>Time To</label>
                  <input type="time" className={`neu-input ${errors.timeTo ? 'error' : ''}`} {...register('timeTo')} />
                  {errors.timeTo && <span style={{ color: 'var(--neu-danger)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.timeTo.message}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="neu-button" onClick={() => { setShowModal(false); reset(); }}>Cancel</button>
                <button type="submit" className="neu-button primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Booking...' : 'Book Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

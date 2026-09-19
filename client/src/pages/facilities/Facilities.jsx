import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Plus, Check } from 'lucide-react';

export default function Facilities() {
  const [bookings] = useState([
    { id: 'B-001', facility: 'Clubhouse Hall A', resident: 'John Doe', date: '2024-04-10', time: '14:00 - 18:00', guests: 50, status: 'APPROVED' },
    { id: 'B-002', facility: 'Basketball Court', resident: 'Robert Johnson', date: '2024-03-25', time: '08:00 - 10:00', guests: 10, status: 'PENDING' },
    { id: 'B-003', facility: 'Swimming Pool Cabana', resident: 'Jane Smith', date: '2024-03-22', time: '10:00 - 14:00', guests: 5, status: 'APPROVED' },
  ]);

  const [facilitiesList] = useState([
    { name: 'Clubhouse Hall A', capacity: 100, rate: '₱ 2,500' },
    { name: 'Clubhouse Hall B', capacity: 50, rate: '₱ 1,500' },
    { name: 'Swimming Pool Cabana', capacity: 15, rate: '₱ 500' },
    { name: 'Basketball Court', capacity: 30, rate: 'Free' },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        
        {/* Bookings List */}
        <div className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Recent Bookings</h3>
            <button className="neu-button primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
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
                {bookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>{b.facility}</td>
                    <td style={{ padding: '12px 16px' }}>{b.resident}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CalendarIcon size={14}/> {b.date}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> {b.time}</span>
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
                        <button className="neu-button icon-only" style={{ padding: '6px', color: 'var(--neu-success)' }} title="Approve">
                          <Check size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Facilities Summary */}
        <div className="neu-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0 }}>Available Facilities</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {facilitiesList.map((f, i) => (
              <div key={i} style={{ padding: '12px', backgroundColor: 'var(--neu-bg)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-pressed)' }}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>{f.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--neu-text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14}/> Max {f.capacity}</span>
                  <span>{f.rate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

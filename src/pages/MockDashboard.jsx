import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity, 
  Plus, 
  Search,
  FileText,
  Clock,
  Printer
} from 'lucide-react';

export default function MockDashboard({ tab, onNavigate }) {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('patients');
    if (saved) {
      setPatients(JSON.parse(saved));
    }
  }, [tab]);

  // Render Dashboard View
  if (tab === 'dashboard') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Metric Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ padding: '20px', gap: '16px', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Patients</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '2px' }}>{patients.length}</h3>
            </div>
          </div>
          <div className="card" style={{ padding: '20px', gap: '16px', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'hsl(142, 70%, 95%)', color: 'hsl(142, 70%, 40%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Appointments Today</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '2px' }}>8</h3>
            </div>
          </div>
          <div className="card" style={{ padding: '20px', gap: '16px', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'hsl(36, 100%, 95%)', color: 'hsl(36, 100%, 45%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Today's Revenue</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '2px' }}>$1,240</h3>
            </div>
          </div>
          <div className="card" style={{ padding: '20px', gap: '16px', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'hsl(325, 75%, 95%)', color: 'hsl(325, 75%, 45%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Treatments Active</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '2px' }}>14</h3>
            </div>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="dashboard-grid">
          {/* Recent Patients */}
          <div className="card" style={{ gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="card-title">Recent Patients</h3>
                <p className="card-subtitle">List of newly registered clinic patients.</p>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => onNavigate('patient-registry')}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <Plus size={16} /> Add Patient
              </button>
            </div>

            {patients.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <Users size={40} style={{ opacity: 0.3 }} />
                <p>No patients registered yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>ID</th>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>Name</th>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>Mobile</th>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>City</th>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>Chief Complaint</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.slice(-5).reverse().map((patient, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--primary)' }}>{patient.patientId}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 500 }}>{patient.patientName}</td>
                        <td style={{ padding: '12px 8px' }}>{patient.mobileNumber}</td>
                        <td style={{ padding: '12px 8px' }}>{patient.city || '—'}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {patient.chiefComplaint || 'No complaints recorded'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Today's Queue */}
          <div className="card" style={{ gap: '16px' }}>
            <h3 className="card-title">Doctor's Schedule</h3>
            <p className="card-subtitle">Upcoming appointments for Dr. Arjun.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-input)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: '6px' }}>09:30 AM</div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Amit Patel</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Teeth Cleaning</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-input)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: '6px' }}>11:00 AM</div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sara Khan</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Root Canal Checkup</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-input)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: '6px' }}>02:15 PM</div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>John Doe</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Filling Placement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Appointments View
  if (tab === 'appointments') {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Appointments</h2>
          <p className="card-subtitle">Manage patient visit slots and schedules.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Calendar simulation */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
            <h4 style={{ marginBottom: '16px', fontWeight: 600 }}>June 2026</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontSize: '0.85rem' }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{d}</div>
              ))}
              {Array.from({ length: 30 }, (_, i) => {
                const day = i + 1;
                const isSelected = day === 15; // Current date in system
                return (
                  <div 
                    key={day} 
                    style={{ 
                      padding: '8px', 
                      borderRadius: '8px', 
                      backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                      color: isSelected ? 'white' : 'var(--text-primary)',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontWeight: 600 }}>Active Appointments Today (June 15)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ border: '1px solid var(--border-color)', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h5 style={{ fontWeight: 600, fontSize: '0.9rem' }}>Arjun Kumar</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reason: Tooth Pain Consult</p>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '20px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>
                  10:00 AM
                </span>
              </div>
              <div style={{ border: '1px solid var(--border-color)', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h5 style={{ fontWeight: 600, fontSize: '0.9rem' }}>Nandini Iyer</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reason: Dental Crown</p>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '20px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>
                  11:30 AM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Treatments View
  if (tab === 'treatments') {
    const treatments = [
      { id: 'T-101', name: 'Root Canal Therapy', cost: '$450', duration: '60 mins', color: 'var(--primary-light)' },
      { id: 'T-102', name: 'Teeth Scaling & Polishing', cost: '$120', duration: '30 mins', color: 'hsl(142, 70%, 95%)' },
      { id: 'T-103', name: 'Dental Veneers / Crowns', cost: '$800', duration: '90 mins', color: 'hsl(36, 100%, 95%)' },
      { id: 'T-104', name: 'Composite Teeth Filling', cost: '$150', duration: '40 mins', color: 'hsl(325, 75%, 95%)' },
      { id: 'T-105', name: 'Wisdom Tooth Extraction', cost: '$300', duration: '60 mins', color: 'hsl(190, 80%, 94%)' }
    ];

    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Treatments & Services</h2>
          <p className="card-subtitle">Pricing list and service catalogue of Dental ERP.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {treatments.map((tr) => (
            <div key={tr.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{tr.id}</div>
              <h4 style={{ fontWeight: 600, fontSize: '1.05rem', minHeight: '44px' }}>{tr.name}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{tr.cost}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tr.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render Billing View
  if (tab === 'billing') {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Billing & Invoices</h2>
          <p className="card-subtitle">Manage billing accounts, pending balances, and printed invoices.</p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Invoice No</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Patient</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Total Amount</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 8px', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                <td style={{ padding: '12px 8px', fontWeight: 600 }}>INV-2026-001</td>
                <td style={{ padding: '12px 8px', fontWeight: 500 }}>Arjun Kumar</td>
                <td style={{ padding: '12px 8px' }}>June 15, 2026</td>
                <td style={{ padding: '12px 8px', fontWeight: 600 }}>$150.00</td>
                <td style={{ padding: '12px 8px' }}><span style={{ backgroundColor: 'hsl(142, 70%, 95%)', color: 'hsl(142, 70%, 40%)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Paid</span></td>
                <td style={{ padding: '12px 8px' }}><button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}><Printer size={12} /> Print</button></td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                <td style={{ padding: '12px 8px', fontWeight: 600 }}>INV-2026-002</td>
                <td style={{ padding: '12px 8px', fontWeight: 500 }}>Nandini Iyer</td>
                <td style={{ padding: '12px 8px' }}>June 14, 2026</td>
                <td style={{ padding: '12px 8px', fontWeight: 600 }}>$800.00</td>
                <td style={{ padding: '12px 8px' }}><span style={{ backgroundColor: 'hsl(36, 100%, 95%)', color: 'hsl(36, 100%, 45%)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Pending</span></td>
                <td style={{ padding: '12px 8px' }}><button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}><Printer size={12} /> Print</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Render Prescriptions & Reports Default Fallback
  return (
    <div className="card" style={{ alignItems: 'center', padding: '60px 20px', gap: '16px' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center' }}>
        <FileText size={32} />
      </div>
      <h2 style={{ textTransform: 'capitalize', fontSize: '1.4rem', fontWeight: 600 }}>{tab} Panel</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', textAlign: 'center', fontSize: '0.9rem' }}>
        This module is fully integrated with your core database. Real-time patient information updates will propagate here automatically.
      </p>
    </div>
  );
}

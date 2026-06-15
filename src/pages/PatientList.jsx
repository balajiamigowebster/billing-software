import React, { useState, useEffect } from 'react';
import { Search, Eye, X, Printer, User, Phone, MapPin, Stethoscope } from 'lucide-react';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Load patients from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('patients');
    if (saved) {
      setPatients(JSON.parse(saved));
    }
  }, []);

  // Filter patients based on search term (name, ID, or mobile)
  const filteredPatients = patients.filter((patient) => {
    const term = searchTerm.toLowerCase();
    return (
      patient.patientName?.toLowerCase().includes(term) ||
      patient.patientId?.toLowerCase().includes(term) ||
      patient.mobileNumber?.toLowerCase().includes(term) ||
      patient.city?.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header and Search Card */}
        <div className="card" style={{ gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="card-title">Patient Database</h2>
              <p className="card-subtitle">Search, view, and inspect registered patient profiles.</p>
            </div>
            
            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search name, ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '44px', width: '100%' }}
              />
              <Search 
                size={18} 
                color="var(--text-secondary)" 
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Data Table */}
          {filteredPatients.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Search size={40} style={{ opacity: 0.3 }} />
              <p>{patients.length === 0 ? "No patients registered yet." : "No patients matching search criteria."}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                    <th style={{ padding: '16px 14px', fontWeight: 600 }}>Patient ID</th>
                    <th style={{ padding: '16px 14px', fontWeight: 600 }}>Patient Name</th>
                    <th style={{ padding: '16px 14px', fontWeight: 600 }}>Mobile Number</th>
                    <th style={{ padding: '16px 14px', fontWeight: 600 }}>Age</th>
                    <th style={{ padding: '16px 14px', fontWeight: 600 }}>Gender</th>
                    <th style={{ padding: '16px 14px', fontWeight: 600 }}>City</th>
                    <th style={{ padding: '16px 14px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr 
                      key={patient.patientId} 
                      style={{ 
                        borderBottom: '1px solid var(--border-color)', 
                        fontSize: '0.92rem', 
                        transition: 'background var(--transition-fast)',
                        cursor: 'pointer'
                      }}
                      className="table-row-hover"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <td style={{ padding: '14px', fontWeight: 600, color: 'var(--primary)' }}>{patient.patientId}</td>
                      <td style={{ padding: '14px', fontWeight: 500 }}>{patient.patientName}</td>
                      <td style={{ padding: '14px' }}>{patient.mobileNumber}</td>
                      <td style={{ padding: '14px' }}>{patient.age}</td>
                      <td style={{ padding: '14px', textTransform: 'capitalize' }}>{patient.gender}</td>
                      <td style={{ padding: '14px' }}>{patient.city || '—'}</td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', gap: '6px', borderRadius: '6px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatient(patient);
                          }}
                        >
                          <Eye size={14} /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Slide-out Patient Details Drawer */}
      {selectedPatient && (
        <>
          {/* Overlay backdrop */}
          <div 
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(2px)',
              zIndex: 110,
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={() => setSelectedPatient(null)}
          />

          {/* Drawer Panel */}
          <div 
            style={{
              position: 'fixed',
              top: 0, right: 0, bottom: 0,
              width: '100%',
              maxWidth: '500px',
              backgroundColor: 'var(--bg-sidebar)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 120,
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              borderLeft: '1px solid var(--border-color)'
            }}
          >
            {/* Drawer Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '24px',
              borderBottom: '1px solid var(--border-color)' 
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '4px 8px', borderRadius: '6px' }}>
                  {selectedPatient.patientId}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '8px' }}>Patient Chart</h3>
              </div>
              <button 
                onClick={() => setSelectedPatient(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                className="btn-secondary"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Profile Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 600 }}>
                  {selectedPatient.patientName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{selectedPatient.patientName}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                    {selectedPatient.gender} • {selectedPatient.age} years old
                  </p>
                </div>
              </div>

              {/* Core Information Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact & Address</h5>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Phone size={16} color="var(--primary)" style={{ marginTop: '3px' }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mobile</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{selectedPatient.mobileNumber}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <User size={16} color="var(--primary)" style={{ marginTop: '3px' }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 500, wordBreak: 'break-all' }}>{selectedPatient.email || '—'}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <MapPin size={16} color="var(--primary)" style={{ marginTop: '3px' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Full Address</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>
                      {selectedPatient.address ? `${selectedPatient.address}, ` : ''}
                      {selectedPatient.city ? `${selectedPatient.city} ` : ''}
                      {selectedPatient.pincode ? ` - ${selectedPatient.pincode}` : ''}
                      {!selectedPatient.address && !selectedPatient.city && !selectedPatient.pincode && '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical visit records */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clinical Visit Details</h5>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Stethoscope size={16} color="var(--primary)" style={{ marginTop: '3px' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Assigned Practitioner</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{selectedPatient.doctorName || 'Dr. Arjun'}</div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-input)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Chief Complaint:</div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    "{selectedPatient.chiefComplaint || 'No complaints registered.'}"
                  </p>
                </div>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <div style={{ 
              padding: '20px 24px', 
              borderTop: '1px solid var(--border-color)', 
              display: 'flex', 
              gap: '12px',
              backgroundColor: 'var(--bg-input)'
            }}>
              <button className="btn btn-secondary" style={{ flexGrow: 1 }} onClick={() => window.print()}>
                <Printer size={16} /> Print Chart
              </button>
              <button className="btn btn-primary" style={{ flexGrow: 1 }} onClick={() => setSelectedPatient(null)}>
                Dismiss
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

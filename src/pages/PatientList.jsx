import React, { useState, useEffect } from 'react';
import { Search, Eye, X, Printer, User, Phone, MapPin, Stethoscope, AlertTriangle, Loader2, Plus, Calendar, Pencil } from 'lucide-react';
import PatientRegistry from './PatientRegistry';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import { API_BASE } from '../config';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[monthIdx]} ${day}, ${year}`;
};

export default function PatientList({ onNavigate, openRegisterModal, onCloseRegisterModal, onSaveSuccess }) {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Edit Patient state variables
  const [editingPatient, setEditingPatient] = useState(null);
  const [editFormData, setEditFormData] = useState({
    patientName: '',
    mobileNumber: '',
    age: '',
    gender: '',
    email: '',
    pincode: '',
    city: '',
    address: ''
  });
  const [editErrors, setEditErrors] = useState({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editApiError, setEditApiError] = useState(null);

  // Populate edit form details when editingPatient state changes
  useEffect(() => {
    if (editingPatient) {
      setEditFormData({
        patientName: editingPatient.patient_name || '',
        mobileNumber: editingPatient.mobile_number || '',
        age: editingPatient.age || '',
        gender: editingPatient.gender || '',
        email: editingPatient.email || '',
        pincode: editingPatient.pincode || '',
        city: editingPatient.city || '',
        address: editingPatient.address || ''
      });
      setEditErrors({});
      setEditApiError(null);
    }
  }, [editingPatient]);

  const handleEditChange = (e) => {
    const { id, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error for this field
    if (editErrors[id]) {
      setEditErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const validateEdit = () => {
    const newErrors = {};
    if (!editFormData.patientName.trim()) {
      newErrors.patientName = 'Patient Name is required';
    }
    if (!editFormData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile Number is required';
    } else if (!/^\d{10}$/.test(editFormData.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Mobile Number must be 10 digits';
    }
    if (!editFormData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(editFormData.age) || parseInt(editFormData.age) <= 0) {
      newErrors.age = 'Enter a valid age';
    }
    if (!editFormData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (editFormData.email && !/\S+@\S+\.\S+/.test(editFormData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (isSavingEdit) return;

    if (validateEdit()) {
      setIsSavingEdit(true);
      setEditApiError(null);
      try {
        const response = await fetch(`${API_BASE}/api/patients/${editingPatient.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editFormData)
        });

        const data = await response.json();

        if (response.ok) {
          if (onSaveSuccess) {
            onSaveSuccess(`Patient ${editFormData.patientName} updated successfully!`);
          }
          setEditingPatient(null);
          fetchPatients();
        } else {
          setEditApiError(data.error || 'Server error, update failed.');
        }
      } catch (error) {
        console.error('Network error updating patient:', error);
        setEditApiError('Network connection failed. Make sure the database backend server is running!');
      } finally {
        setIsSavingEdit(false);
      }
    }
  };

  useEffect(() => {
    if (openRegisterModal) {
      setShowRegisterModal(true);
      if (onCloseRegisterModal) {
        onCloseRegisterModal();
      }
    }
  }, [openRegisterModal, onCloseRegisterModal]);

  // Fetch patients from backend API
  const fetchPatients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/patients`);
      if (!response.ok) {
        throw new Error('Failed to load patient records from server.');
      }
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Cannot connect to database server. Please verify the backend Express server is running on port 5001.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter patients based on search term (name, ID, or mobile)
  const filteredPatients = patients.filter((patient) => {
    const term = searchTerm.toLowerCase();
    const name = patient.patient_name || '';
    const id = patient.patient_id_seq || '';
    const mobile = patient.mobile_number || '';
    const city = patient.city || '';
    
    return (
      name.toLowerCase().includes(term) ||
      id.toLowerCase().includes(term) ||
      mobile.toLowerCase().includes(term) ||
      city.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      {error && (
        <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontWeight: 600, fontSize: '0.9rem', border: '1px solid hsl(0, 75%, 90%)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header and Search Card */}
        <div className="card" style={{ gap: '16px' }}>
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Patient Database</h2>
              <p className="card-subtitle">Search, view, and inspect registered patient profiles.</p>
            </div>
            
            <div className="header-actions">
              <button 
                className="btn btn-primary" 
                onClick={() => setShowRegisterModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              >
                <Plus size={16} /> Add Patient
              </button>

              {/* Search Input */}
              <div className="search-input-container">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search name, ID, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '44px', width: '100%' }}
                  disabled={isLoading}
                />
                <Search 
                  size={18} 
                  color="var(--text-secondary)" 
                  style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>
          </div>

          {/* Data Table states */}
          {isLoading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <p>Loading patient records from MariaDB...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Search size={40} style={{ opacity: 0.3 }} />
              <p>{patients.length === 0 ? "No patients registered yet." : "No patients matching search criteria."}</p>
            </div>
          ) : (
            <div className="table-responsive-container">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                    <th style={{ padding: '16px 14px', fontWeight: 600 }}>Patient ID</th>
                    <th style={{ padding: '16px 14px', fontWeight: 600 }}>Patient Name</th>
                    <th style={{ padding: '16px 14px', fontWeight: 600 }}>Mobile Number</th>
                    <th style={{ padding: '16px 14px', fontWeight: 600 }}>Age</th>
                    <th style={{ padding: '16px 14px', fontWeight: 600 }}>Gender</th>
                    <th style={{ padding: '16px 14px', fontWeight: 600 }}>City</th>
                    <th style={{ padding: '16px 14px', fontWeight: 600 }}>Next Appointment</th>
                    <th style={{ padding: '16px 14px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr 
                      key={patient.patient_id_seq} 
                      style={{ 
                        borderBottom: '1px solid var(--border-color)', 
                        fontSize: '0.92rem', 
                        transition: 'background var(--transition-fast)',
                        cursor: 'pointer'
                      }}
                      className="table-row-hover"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <td style={{ padding: '14px', fontWeight: 600, color: 'var(--primary)' }}>{patient.patient_id_seq}</td>
                      <td style={{ padding: '14px', fontWeight: 500 }}>{patient.patient_name}</td>
                      <td style={{ padding: '14px' }}>{patient.mobile_number}</td>
                      <td style={{ padding: '14px' }}>{patient.age}</td>
                      <td style={{ padding: '14px', textTransform: 'capitalize' }}>{patient.gender}</td>
                      <td style={{ padding: '14px' }}>{patient.city || '—'}</td>
                      <td style={{ padding: '14px' }}>
                        {patient.next_appointment_date ? (
                          <div style={{ fontSize: '0.85rem' }}>
                            <span style={{ fontWeight: 600 }}>{formatDate(patient.next_appointment_date)}</span>
                            <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>({patient.appointment_time})</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', gap: '6px', borderRadius: '6px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPatient(patient);
                          }}
                        >
                          <Pencil size={14} /> Edit
                        </button>
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
                  {selectedPatient.patient_id_seq}
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
                  {selectedPatient.patient_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{selectedPatient.patient_name}</h4>
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
                      <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{selectedPatient.mobile_number}</div>
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
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{selectedPatient.doctor_name || 'Dr. Arjun Sharma'}</div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-input)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Latest Chief Complaint:</div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    "{selectedPatient.chief_complaint || 'No complaints registered.'}"
                  </p>
                </div>
              </div>

              {/* Next Scheduled Appointment */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Next Scheduled Appointment</h5>
                
                {selectedPatient.next_appointment_date ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <Calendar size={16} color="var(--primary)" style={{ marginTop: '3px' }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Date & Time</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                          {formatDate(selectedPatient.next_appointment_date)} at {selectedPatient.appointment_time}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <User size={16} color="var(--primary)" style={{ marginTop: '3px' }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Assigned Doctor</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                          {selectedPatient.appt_doctor_name || selectedPatient.doctor_name || 'Dr. Arjun Sharma'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontStyle: 'italic' }}>
                    No upcoming appointments scheduled.
                  </div>
                )}
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
              <button className="btn btn-secondary" style={{ flexGrow: 1 }} onClick={() => {
                setEditingPatient(selectedPatient);
                setSelectedPatient(null);
              }}>
                <Pencil size={16} /> Edit Profile
              </button>
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

      {/* Patient Register Modal Overlay */}
      {showRegisterModal && (
        <div className="modal-backdrop" onClick={() => setShowRegisterModal(false)}>
          <div className="invoice-modal" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <h3 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Register New Patient</h3>
              <button 
                onClick={() => setShowRegisterModal(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="invoice-modal-body">
              <PatientRegistry 
                isModal={true} 
                onCancel={() => setShowRegisterModal(false)} 
                onSaveSuccess={(message) => {
                  setShowRegisterModal(false);
                  if (onSaveSuccess) {
                    onSaveSuccess(message);
                  }
                  fetchPatients();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Patient Edit Modal Overlay */}
      {editingPatient && (
        <div className="modal-backdrop" onClick={() => setEditingPatient(null)}>
          <div className="invoice-modal" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '4px 8px', borderRadius: '6px' }}>
                  {editingPatient.patient_id_seq}
                </span>
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Edit Patient Profile</h3>
              </div>
              <button 
                onClick={() => setEditingPatient(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="invoice-modal-body">
              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {editApiError && (
                  <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontWeight: 600, fontSize: '0.9rem', border: '1px solid hsl(0, 75%, 90%)' }}>
                    {editApiError}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-grid">
                    <FormInput
                      label="Patient Name"
                      id="patientName"
                      value={editFormData.patientName}
                      onChange={handleEditChange}
                      placeholder="Arjun Kumar"
                      error={editErrors.patientName}
                      disabled={isSavingEdit}
                    />
                    <FormInput
                      label="Mobile Number"
                      id="mobileNumber"
                      value={editFormData.mobileNumber}
                      onChange={handleEditChange}
                      placeholder="9876543210"
                      error={editErrors.mobileNumber}
                      type="tel"
                      disabled={isSavingEdit}
                    />
                    <FormInput
                      label="Age"
                      id="age"
                      value={editFormData.age}
                      onChange={handleEditChange}
                      placeholder="30"
                      error={editErrors.age}
                      type="number"
                      disabled={isSavingEdit}
                    />
                    <FormSelect
                      label="Gender"
                      id="gender"
                      value={editFormData.gender}
                      onChange={handleEditChange}
                      options={[
                        { value: '', label: 'Select Gender', disabled: true },
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' }
                      ]}
                      error={editErrors.gender}
                      disabled={isSavingEdit}
                    />
                    <FormInput
                      label="Email"
                      id="email"
                      value={editFormData.email}
                      onChange={handleEditChange}
                      placeholder="patient@gmail.com"
                      error={editErrors.email}
                      type="email"
                      disabled={isSavingEdit}
                    />
                    <FormInput
                      label="Pincode"
                      id="pincode"
                      value={editFormData.pincode}
                      onChange={handleEditChange}
                      placeholder="600001"
                      error={editErrors.pincode}
                      disabled={isSavingEdit}
                    />
                    <FormInput
                      label="City"
                      id="city"
                      value={editFormData.city}
                      onChange={handleEditChange}
                      placeholder="Chennai"
                      error={editErrors.city}
                      disabled={isSavingEdit}
                    />
                    <FormInput
                      label="Address"
                      id="address"
                      value={editFormData.address}
                      onChange={handleEditChange}
                      placeholder="Address"
                      error={editErrors.address}
                      disabled={isSavingEdit}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setEditingPatient(null)}
                    disabled={isSavingEdit}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={isSavingEdit}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {isSavingEdit ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

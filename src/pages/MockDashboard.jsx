import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { 
  Users, 
  Calendar, 
  IndianRupee, 
  Activity, 
  Plus, 
  Search,
  FileText,
  Clock,
  Printer,
  X,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';

const TREATMENTS = [
  { id: 'T-101', name: 'Root Canal Therapy', cost: 450 },
  { id: 'T-102', name: 'Teeth Scaling & Polishing', cost: 120 },
  { id: 'T-103', name: 'Dental Veneers / Crowns', cost: 800 },
  { id: 'T-104', name: 'Composite Teeth Filling', cost: 150 },
  { id: 'T-105', name: 'Wisdom Tooth Extraction', cost: 300 }
];

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

export default function MockDashboard({ tab, onNavigate, onPrintInvoice }) {
  const [patients, setPatients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [nextInvoiceNo, setNextInvoiceNo] = useState('');
  
  // Create Invoice Form State
  const [formPatientId, setFormPatientId] = useState('');
  const [formTreatment, setFormTreatment] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formStatus, setFormStatus] = useState('Paid');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Appointments State
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [selectedDate, setSelectedDate] = useState('2026-06-15');
  const [showBookModal, setShowBookModal] = useState(false);
  
  // Book Appointment Form State
  const [bookPatientId, setBookPatientId] = useState('');
  const [bookTimeSlot, setBookTimeSlot] = useState('09:00 AM');
  const [bookReason, setBookReason] = useState('');
  const [bookError, setBookError] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Billing Search, Pagination & Edit State
  const [billingSearchTerm, setBillingSearchTerm] = useState('');
  const [billingCurrentPage, setBillingCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  
  // Edit Invoice Form State
  const [editFormTreatment, setEditFormTreatment] = useState('');
  const [editFormAmount, setEditFormAmount] = useState('');
  const [editFormStatus, setEditFormStatus] = useState('Paid');
  const [editFormDate, setEditFormDate] = useState('');
  const [editFormError, setEditFormError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Treatments Database States
  const [treatments, setTreatments] = useState([]);
  const [treatmentsSearchTerm, setTreatmentsSearchTerm] = useState('');
  const [treatmentsCurrentPage, setTreatmentsCurrentPage] = useState(1);
  const [showAddTreatmentModal, setShowAddTreatmentModal] = useState(false);
  const [showEditTreatmentModal, setShowEditTreatmentModal] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);

  // Add Treatment Form State
  const [addFormCode, setAddFormCode] = useState('');
  const [addFormName, setAddFormName] = useState('');
  const [addFormCost, setAddFormCost] = useState('');
  const [addFormDuration, setAddFormDuration] = useState('30 mins');
  const [addFormError, setAddFormError] = useState('');
  const [isAddingTreatment, setIsAddingTreatment] = useState(false);

  // Edit Treatment Form State
  const [editFormTreatmentName, setEditFormTreatmentName] = useState('');
  const [editFormTreatmentCost, setEditFormTreatmentCost] = useState('');
  const [editFormTreatmentDuration, setEditFormTreatmentDuration] = useState('');
  const [editFormTreatmentError, setEditFormTreatmentError] = useState('');
  const [isUpdatingTreatment, setIsUpdatingTreatment] = useState(false);

  const fetchTreatments = () => {
    fetch(`${API_BASE}/api/treatments`)
      .then((res) => res.json())
      .then((data) => setTreatments(data))
      .catch((err) => console.error('Error loading treatments:', err));
  };

  const fetchInvoices = () => {
    fetch(`${API_BASE}/api/invoices`)
      .then((res) => res.json())
      .then((data) => setInvoices(data))
      .catch((err) => console.error('Error loading invoices:', err));
  };

  const fetchAppointments = (date) => {
    fetch(`${API_BASE}/api/appointments?date=${date}`)
      .then((res) => res.json())
      .then((data) => setAppointmentsList(data))
      .catch((err) => console.error('Error loading appointments:', err));
  };

  useEffect(() => {
    fetchTreatments();

    if (tab === 'dashboard') {
      fetch(`${API_BASE}/api/patients`)
        .then((res) => res.json())
        .then((data) => setPatients(data))
        .catch((err) => console.error('Error loading dashboard patients:', err));
    } else if (tab === 'billing') {
      fetchInvoices();
    } else if (tab === 'appointments') {
      fetchAppointments(selectedDate);
    }
  }, [tab, selectedDate]);

  const handleOpenCreateModal = async () => {
    setFormPatientId('');
    setFormTreatment('');
    setFormAmount('');
    setFormStatus('Paid');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormError('');
    setShowCreateModal(true);

    try {
      const patientsRes = await fetch(`${API_BASE}/api/patients`);
      const patientsData = await patientsRes.json();
      setPatientsList(patientsData);

      const nextNoRes = await fetch(`${API_BASE}/api/invoices/next-no`);
      const nextNoData = await nextNoRes.json();
      setNextInvoiceNo(nextNoData.nextNo);
    } catch (err) {
      console.error('Error opening create invoice modal:', err);
      setFormError('Failed to load required invoice data.');
    }
  };

  const handleTreatmentChange = (e) => {
    const value = e.target.value;
    setFormTreatment(value);
    const selected = treatments.find(t => t.treatment_name === value);
    if (selected) {
      setFormAmount(selected.cost);
    } else {
      setFormAmount('');
    }
  };

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!formPatientId || !formTreatment || !formAmount || !formStatus || !formDate) {
      setFormError('All fields are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const response = await fetch(`${API_BASE}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNo: nextInvoiceNo,
          patientId: formPatientId,
          treatmentName: formTreatment,
          amount: parseFloat(formAmount),
          status: formStatus,
          invoiceDate: formDate
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save invoice.');
      }

      setShowCreateModal(false);
      fetchInvoices();
    } catch (err) {
      console.error('Error saving invoice:', err);
      setFormError('Failed to save invoice to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (invoice) => {
    setEditingInvoice(invoice);
    setEditFormTreatment(invoice.treatment_name || '');
    setEditFormAmount(invoice.amount || '');
    setEditFormStatus(invoice.status || 'Paid');
    setEditFormDate(invoice.invoice_date || '');
    setEditFormError('');
    setShowEditModal(true);
  };

  const handleEditTreatmentChange = (e) => {
    const value = e.target.value;
    setEditFormTreatment(value);
    const selected = treatments.find(t => t.treatment_name === value);
    if (selected) {
      setEditFormAmount(selected.cost);
    } else {
      setEditFormAmount('');
    }
  };

  const handleUpdateInvoice = async (e) => {
    e.preventDefault();
    if (!editFormTreatment || editFormAmount === '' || !editFormStatus || !editFormDate) {
      setEditFormError('All fields are required.');
      return;
    }

    setIsUpdating(true);
    setEditFormError('');

    try {
      const response = await fetch(`${API_BASE}/api/invoices/${editingInvoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatmentName: editFormTreatment,
          amount: parseFloat(editFormAmount),
          status: editFormStatus,
          invoiceDate: editFormDate
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice.');
      }

      setShowEditModal(false);
      fetchInvoices();
    } catch (err) {
      console.error('Error updating invoice:', err);
      setEditFormError('Failed to update invoice in database.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenAddTreatmentModal = () => {
    setAddFormCode('');
    setAddFormName('');
    setAddFormCost('');
    setAddFormDuration('30 mins');
    setAddFormError('');
    setShowAddTreatmentModal(true);
  };

  const handleSaveTreatment = async (e) => {
    e.preventDefault();
    if (!addFormName || addFormCost === '' || !addFormDuration) {
      setAddFormError('Name, Cost, and Duration are required.');
      return;
    }
    setIsAddingTreatment(true);
    setAddFormError('');
    try {
      const response = await fetch(`${API_BASE}/api/treatments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatmentCode: addFormCode || null,
          treatmentName: addFormName,
          cost: parseFloat(addFormCost),
          duration: addFormDuration
        })
      });
      if (!response.ok) {
        throw new Error('Failed to save treatment.');
      }
      setShowAddTreatmentModal(false);
      fetchTreatments();
    } catch (err) {
      console.error('Error saving treatment:', err);
      setAddFormError('Failed to save treatment to database.');
    } finally {
      setIsAddingTreatment(false);
    }
  };

  const handleOpenEditTreatmentModal = (treatment) => {
    setEditingTreatment(treatment);
    setEditFormTreatmentName(treatment.treatment_name || '');
    setEditFormTreatmentCost(treatment.cost || '');
    setEditFormTreatmentDuration(treatment.duration || '30 mins');
    setEditFormTreatmentError('');
    setShowEditTreatmentModal(true);
  };

  const handleUpdateTreatment = async (e) => {
    e.preventDefault();
    if (!editFormTreatmentName || editFormTreatmentCost === '' || !editFormTreatmentDuration) {
      setEditFormTreatmentError('Name, Cost, and Duration are required.');
      return;
    }
    setIsUpdatingTreatment(true);
    setEditFormTreatmentError('');
    try {
      const response = await fetch(`${API_BASE}/api/treatments/${editingTreatment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatmentName: editFormTreatmentName,
          cost: parseFloat(editFormTreatmentCost),
          duration: editFormTreatmentDuration
        })
      });
      if (!response.ok) {
        throw new Error('Failed to update treatment.');
      }
      setShowEditTreatmentModal(false);
      fetchTreatments();
    } catch (err) {
      console.error('Error updating treatment:', err);
      setEditFormTreatmentError('Failed to update treatment in database.');
    } finally {
      setIsUpdatingTreatment(false);
    }
  };

  const handleDeleteTreatment = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the treatment "${name}"?`)) {
      try {
        const response = await fetch(`${API_BASE}/api/treatments/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          throw new Error('Failed to delete treatment.');
        }
        fetchTreatments();
      } catch (err) {
        console.error('Error deleting treatment:', err);
        alert('Failed to delete treatment from database.');
      }
    }
  };

  const handleOpenBookModal = async () => {
    setBookPatientId('');
    setBookTimeSlot('09:00 AM');
    setBookReason('');
    setBookError('');
    setShowBookModal(true);

    try {
      const patientsRes = await fetch(`${API_BASE}/api/patients`);
      const patientsData = await patientsRes.json();
      setPatientsList(patientsData);
    } catch (err) {
      console.error('Error loading patients list for booking:', err);
      setBookError('Failed to load registered patient records.');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!bookPatientId || !bookReason || !bookTimeSlot || !selectedDate) {
      setBookError('All fields are required.');
      return;
    }

    setIsBooking(true);
    setBookError('');

    try {
      const response = await fetch(`${API_BASE}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: bookPatientId,
          appointmentDate: selectedDate,
          appointmentTime: bookTimeSlot,
          reason: bookReason,
          doctorName: 'Dr. Arjun Sharma'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save appointment.');
      }

      setShowBookModal(false);
      fetchAppointments(selectedDate);
    } catch (err) {
      console.error('Error booking appointment:', err);
      setBookError('Failed to save appointment to database.');
    } finally {
      setIsBooking(false);
    }
  };

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
              <IndianRupee size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Today's Revenue</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '2px' }}>₹1,240</h3>
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
            <div className="card-header-flex">
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
              <div className="table-responsive-container" style={{ border: 'none' }}>
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
                    {patients.slice(0, 5).map((patient, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--primary)' }}>{patient.patient_id_seq}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 500 }}>{patient.patient_name}</td>
                        <td style={{ padding: '12px 8px' }}>{patient.mobile_number}</td>
                        <td style={{ padding: '12px 8px' }}>{patient.city || '—'}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {patient.chief_complaint || 'No complaints recorded'}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', flexDirection: 'row' }}>
            <div>
              <h2 className="card-title">Appointments</h2>
              <p className="card-subtitle">Manage patient visit slots and schedules.</p>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleOpenBookModal}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <Plus size={16} /> Book Appointment
            </button>
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
                  const dayStr = `2026-06-${String(day).padStart(2, '0')}`;
                  const isSelected = selectedDate === dayStr;
                  return (
                    <div 
                      key={day} 
                      onClick={() => setSelectedDate(dayStr)}
                      style={{ 
                        padding: '8px', 
                        borderRadius: '8px', 
                        backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                        color: isSelected ? 'white' : 'var(--text-primary)',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                      className={!isSelected ? "table-row-hover" : ""}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontWeight: 600 }}>Active Appointments: {formatDate(selectedDate)}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {appointmentsList.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={32} style={{ opacity: 0.3 }} />
                    <p style={{ fontSize: '0.9rem' }}>No appointments scheduled for this date.</p>
                  </div>
                ) : (
                  appointmentsList.map((app) => (
                    <div key={app.id} style={{ border: '1px solid var(--border-color)', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h5 style={{ fontWeight: 600, fontSize: '0.9rem' }}>{app.patient_name}</h5>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reason: {app.reason}</p>
                      </div>
                      <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '20px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>
                        {app.appointment_time}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Book Appointment Modal Overlay */}
        {showBookModal && (
          <div className="modal-backdrop" onClick={() => setShowBookModal(false)}>
            <div className="invoice-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
              <div className="invoice-modal-header">
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Book New Appointment</h3>
                <button 
                  onClick={() => setShowBookModal(false)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleBookAppointment}>
                <div className="invoice-modal-body" style={{ gap: '16px' }}>
                  {bookError && (
                    <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontSize: '0.85rem', fontWeight: 500 }}>
                      {bookError}
                    </div>
                  )}

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Select Patient</label>
                    <div className="select-wrapper">
                      <select 
                        className="form-select" 
                        value={bookPatientId} 
                        onChange={(e) => setBookPatientId(e.target.value)}
                        required
                      >
                        <option value="">Choose Patient...</option>
                        {patientsList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.patient_name} ({p.patient_id_seq})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Appointment Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={selectedDate} 
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Time Slot</label>
                    <div className="select-wrapper">
                      <select 
                        className="form-select" 
                        value={bookTimeSlot} 
                        onChange={(e) => setBookTimeSlot(e.target.value)}
                        required
                      >
                        {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'].map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Reason for Visit</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g., Routine Checkup, Tooth Pain"
                      value={bookReason} 
                      onChange={(e) => setBookReason(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="invoice-modal-footer">
                  <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setShowBookModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} disabled={isBooking}>
                    {isBooking ? 'Booking...' : 'Confirm Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Treatments View
  if (tab === 'treatments') {
    const filteredTreatments = treatments.filter((t) => {
      const term = treatmentsSearchTerm.toLowerCase();
      return (
        (t.treatment_code || '').toLowerCase().includes(term) ||
        (t.treatment_name || '').toLowerCase().includes(term) ||
        (t.cost || '').toString().includes(term) ||
        (t.duration || '').toLowerCase().includes(term)
      );
    });

    const itemsPerPage = 8;
    const totalPages = Math.ceil(filteredTreatments.length / itemsPerPage);
    const startIndex = (treatmentsCurrentPage - 1) * itemsPerPage;
    const paginatedTreatments = filteredTreatments.slice(startIndex, startIndex + itemsPerPage);
    const totalEntries = filteredTreatments.length;
    const displayStart = totalEntries === 0 ? 0 : startIndex + 1;
    const displayEnd = Math.min(startIndex + itemsPerPage, totalEntries);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Treatments & Services</h2>
              <p className="card-subtitle">Manage service list, pricing, and treatment duration.</p>
            </div>
            <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="search-input-wrapper" style={{ position: 'relative', minWidth: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search treatments..." 
                  value={treatmentsSearchTerm}
                  onChange={(e) => {
                    setTreatmentsSearchTerm(e.target.value);
                    setTreatmentsCurrentPage(1);
                  }}
                  style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
                />
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleOpenAddTreatmentModal}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem', height: '38px' }}
              >
                <Plus size={16} /> Add Treatment
              </button>
            </div>
          </div>

          <div className="table-responsive-container" style={{ border: 'none' }}>
            {filteredTreatments.length === 0 ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <Activity size={40} style={{ opacity: 0.3 }} />
                <p>No treatments found.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Code</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Treatment Name</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Cost</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Duration</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTreatments.map((tr) => (
                    <tr key={tr.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--primary)' }}>{tr.treatment_code}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 500 }}>{tr.treatment_name}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>₹{parseFloat(tr.cost).toFixed(2)}</td>
                      <td style={{ padding: '12px 8px' }}>{tr.duration}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleOpenEditTreatmentModal(tr)}
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'hsl(0, 75%, 45%)' }}
                            onClick={() => handleDeleteTreatment(tr.id, tr.treatment_name)}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Showing {displayStart} to {displayEnd} of {totalEntries} entries
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setTreatmentsCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={treatmentsCurrentPage === 1}
                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setTreatmentsCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={treatmentsCurrentPage === totalPages}
                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Treatment Modal Overlay */}
        {showAddTreatmentModal && (
          <div className="modal-backdrop" onClick={() => setShowAddTreatmentModal(false)}>
            <div className="invoice-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
              <div className="invoice-modal-header">
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Add New Treatment</h3>
                <button 
                  onClick={() => setShowAddTreatmentModal(false)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveTreatment}>
                <div className="invoice-modal-body" style={{ gap: '16px' }}>
                  {addFormError && (
                    <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontSize: '0.85rem', fontWeight: 500 }}>
                      {addFormError}
                    </div>
                  )}

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Treatment Code (Optional)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. T-106 (Auto-generated if left blank)"
                      value={addFormCode} 
                      onChange={(e) => setAddFormCode(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Treatment Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Teeth Whitening"
                      value={addFormName} 
                      onChange={(e) => setAddFormName(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Cost (₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-input" 
                      placeholder="0.00"
                      value={addFormCost} 
                      onChange={(e) => setAddFormCost(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Duration</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 30 mins"
                      value={addFormDuration} 
                      onChange={(e) => setAddFormDuration(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="invoice-modal-footer">
                  <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setShowAddTreatmentModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} disabled={isAddingTreatment}>
                    {isAddingTreatment ? 'Saving...' : 'Add Treatment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Treatment Modal Overlay */}
        {showEditTreatmentModal && editingTreatment && (
          <div className="modal-backdrop" onClick={() => setShowEditTreatmentModal(false)}>
            <div className="invoice-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
              <div className="invoice-modal-header">
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Edit Treatment - {editingTreatment.treatment_code}</h3>
                <button 
                  onClick={() => setShowEditTreatmentModal(false)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateTreatment}>
                <div className="invoice-modal-body" style={{ gap: '16px' }}>
                  {editFormTreatmentError && (
                    <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontSize: '0.85rem', fontWeight: 500 }}>
                      {editFormTreatmentError}
                    </div>
                  )}

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Treatment Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editFormTreatmentName} 
                      onChange={(e) => setEditFormTreatmentName(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Cost (₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-input" 
                      value={editFormTreatmentCost} 
                      onChange={(e) => setEditFormTreatmentCost(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Duration</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editFormTreatmentDuration} 
                      onChange={(e) => setEditFormTreatmentDuration(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="invoice-modal-footer">
                  <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setShowEditTreatmentModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} disabled={isUpdatingTreatment}>
                    {isUpdatingTreatment ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Billing View
  if (tab === 'billing') {
    const filteredInvoices = invoices.filter((inv) => {
      const term = billingSearchTerm.toLowerCase();
      return (
        (inv.invoice_no || '').toLowerCase().includes(term) ||
        (inv.patient_name || '').toLowerCase().includes(term) ||
        (inv.treatment_name || '').toLowerCase().includes(term) ||
        (inv.status || '').toLowerCase().includes(term)
      );
    });

    const itemsPerPage = 8;
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const startIndex = (billingCurrentPage - 1) * itemsPerPage;
    const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);
    const totalEntries = filteredInvoices.length;
    const displayStart = totalEntries === 0 ? 0 : startIndex + 1;
    const displayEnd = Math.min(startIndex + itemsPerPage, totalEntries);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Billing & Invoices</h2>
              <p className="card-subtitle">Manage billing accounts, pending balances, and printed invoices.</p>
            </div>
            <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="search-input-wrapper" style={{ position: 'relative', minWidth: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search invoices..." 
                  value={billingSearchTerm}
                  onChange={(e) => {
                    setBillingSearchTerm(e.target.value);
                    setBillingCurrentPage(1);
                  }}
                  style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
                />
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleOpenCreateModal}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem', height: '38px' }}
              >
                <Plus size={16} /> Create Invoice
              </button>
            </div>
          </div>

          <div className="table-responsive-container" style={{ border: 'none' }}>
            {filteredInvoices.length === 0 ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <FileText size={40} style={{ opacity: 0.3 }} />
                <p>No invoices found.</p>
              </div>
            ) : (
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
                  {paginatedInvoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>{inv.invoice_no}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 500 }}>{inv.patient_name}</td>
                      <td style={{ padding: '12px 8px' }}>{formatDate(inv.invoice_date)}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>₹{parseFloat(inv.amount).toFixed(2)}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span 
                          style={{ 
                            backgroundColor: inv.status === 'Paid' ? 'hsl(142, 70%, 95%)' : 'hsl(36, 100%, 95%)', 
                            color: inv.status === 'Paid' ? 'hsl(142, 70%, 40%)' : 'hsl(36, 100%, 45%)', 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600 
                          }}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleOpenEditModal(inv)}
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => onPrintInvoice && onPrintInvoice({
                              invoiceNo: inv.invoice_no,
                              patient: inv.patient_name,
                              patientId: inv.patient_id_seq,
                              date: formatDate(inv.invoice_date),
                              amount: `₹${parseFloat(inv.amount).toFixed(2)}`,
                              status: inv.status,
                              description: inv.treatment_name,
                              doctor: 'Dr. Arjun Sharma'
                            })}
                          >
                            <Printer size={12} /> Print
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Showing {displayStart} to {displayEnd} of {totalEntries} entries
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setBillingCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={billingCurrentPage === 1}
                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setBillingCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={billingCurrentPage === totalPages}
                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create Invoice Modal Overlay */}
        {showCreateModal && (
          <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
            <div className="invoice-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
              <div className="invoice-modal-header">
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Create New Invoice</h3>
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveInvoice}>
                <div className="invoice-modal-body" style={{ gap: '16px' }}>
                  {formError && (
                    <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontSize: '0.85rem', fontWeight: 500 }}>
                      {formError}
                    </div>
                  )}

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Invoice Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={nextInvoiceNo} 
                      readOnly 
                      disabled 
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Select Patient</label>
                    <div className="select-wrapper">
                      <select 
                        className="form-select" 
                        value={formPatientId} 
                        onChange={(e) => setFormPatientId(e.target.value)}
                        required
                      >
                        <option value="">Choose Patient...</option>
                        {patientsList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.patient_name} ({p.patient_id_seq})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Treatment / Service</label>
                    <div className="select-wrapper">
                      <select 
                        className="form-select" 
                        value={formTreatment} 
                        onChange={handleTreatmentChange}
                        required
                      >
                        <option value="">Choose Treatment...</option>
                        {treatments.map((t) => (
                          <option key={t.id} value={t.treatment_name}>
                            {t.treatment_name} (₹{parseFloat(t.cost).toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Amount (₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-input" 
                      placeholder="0.00"
                      value={formAmount} 
                      onChange={(e) => setFormAmount(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Payment Status</label>
                    <div className="select-wrapper">
                      <select 
                        className="form-select" 
                        value={formStatus} 
                        onChange={(e) => setFormStatus(e.target.value)}
                        required
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Invoice Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={formDate} 
                      onChange={(e) => setFormDate(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="invoice-modal-footer">
                  <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Invoice Modal Overlay */}
        {showEditModal && editingInvoice && (
          <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
            <div className="invoice-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
              <div className="invoice-modal-header">
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Edit Invoice - {editingInvoice.invoice_no}</h3>
                <button 
                  onClick={() => setShowEditModal(false)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateInvoice}>
                <div className="invoice-modal-body" style={{ gap: '16px' }}>
                  {editFormError && (
                    <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'hsl(0, 75%, 95%)', color: 'hsl(0, 75%, 45%)', fontSize: '0.85rem', fontWeight: 500 }}>
                      {editFormError}
                    </div>
                  )}

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Patient</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={`${editingInvoice.patient_name} (${editingInvoice.patient_id_seq})`} 
                      disabled 
                      readOnly
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Treatment / Service</label>
                    <div className="select-wrapper">
                      <select 
                        className="form-select" 
                        value={editFormTreatment} 
                        onChange={handleEditTreatmentChange}
                        required
                      >
                        <option value="">Choose Treatment...</option>
                        {treatments.map((t) => (
                          <option key={t.id} value={t.treatment_name}>
                            {t.treatment_name} (₹{parseFloat(t.cost).toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Amount (₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-input" 
                      placeholder="0.00"
                      value={editFormAmount} 
                      onChange={(e) => setEditFormAmount(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Payment Status</label>
                    <div className="select-wrapper">
                      <select 
                        className="form-select" 
                        value={editFormStatus} 
                        onChange={(e) => setEditFormStatus(e.target.value)}
                        required
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Invoice Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={editFormDate} 
                      onChange={(e) => setEditFormDate(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="invoice-modal-footer">
                  <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} disabled={isUpdating}>
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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

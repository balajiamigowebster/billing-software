import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import PatientRegistry from './pages/PatientRegistry';
import PatientList from './pages/PatientList';
import MockDashboard from './pages/MockDashboard';
import Toast from './components/Toast';
import Login from './pages/Login';
import { Menu, Stethoscope, X, Printer } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('dental_clinic_auth') === 'true'
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);

  const doctorInfo = {
    name: 'Dr. Arjun Sharma',
    email: 'arjun.sharma@dentalerp.com',
    initials: 'DA'
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavigate = (tabId) => {
    if (tabId === 'patient-registry') {
      setActiveTab('patient-list');
      setOpenRegisterModal(true);
    } else {
      setActiveTab(tabId);
    }
  };

  const handleSaveSuccess = (message) => {
    setToast({
      message,
      type: 'success'
    });
    setActiveTab('patient-list');
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  const handleLogin = () => {
    sessionStorage.setItem('dental_clinic_auth', 'true');
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('dental_clinic_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  return (
    <>
      <div className="app-container">
      {/* Mobile Sticky Header Bar */}
      <header className="mobile-header">
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="logo-icon" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
            <Stethoscope size={16} strokeWidth={2.5} />
          </div>
          <span className="logo-text" style={{ fontSize: '1.1rem' }}>Dental</span>
        </div>
        <div className="profile-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
          {doctorInfo.initials}
        </div>
      </header>

      {/* Mobile Sidebar Overlay Backdrop */}
      <div 
        className={`sidebar-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        activeTab={activeTab}
        onTabChange={handleNavigate}
        doctorInfo={doctorInfo}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Panel Content */}
      <main 
        className="main-content"
        style={{
          marginLeft: '0px', // Handled by Flex layouts
        }}
      >
        {activeTab === 'patient-list' || activeTab === 'patient-registry' ? (
          <PatientList 
            onNavigate={handleNavigate} 
            openRegisterModal={openRegisterModal || activeTab === 'patient-registry'}
            onCloseRegisterModal={() => setOpenRegisterModal(false)}
            onSaveSuccess={handleSaveSuccess}
          />
        ) : (
          <MockDashboard tab={activeTab} onNavigate={handleNavigate} onPrintInvoice={setActiveInvoice} />
        )}
      </main>

      {/* Toast Notification Popups */}
      {toast && (
        <div className="toast-container">
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={handleCloseToast} 
          />
        </div>
      )}
      </div>

      {/* Screen Preview Modal */}
      {activeInvoice && (
        <div className="modal-backdrop" onClick={() => setActiveInvoice(null)}>
          <div className="invoice-modal" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <h3 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Invoice Preview</h3>
              <button 
                onClick={() => setActiveInvoice(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="invoice-modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '1.1rem' }}>Dental ERP</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>123 Medical Avenue, Chennai</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ fontWeight: 700, color: 'var(--primary)' }}>{activeInvoice.invoiceNo}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Date: {activeInvoice.date}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Bill To</p>
                  <p style={{ fontWeight: 600, marginTop: '4px' }}>{activeInvoice.patient}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Patient ID: {activeInvoice.patientId || 'PAT-0001'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Practitioner</p>
                  <p style={{ fontWeight: 600, marginTop: '4px' }}>{activeInvoice.doctor || 'Dr. Arjun Sharma'}</p>
                </div>
              </div>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', marginTop: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-input)', fontSize: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Description</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '14px', fontSize: '0.9rem' }}>
                        {activeInvoice.description || (activeInvoice.invoiceNo === 'INV-2026-001' ? 'Composite Teeth Filling' : 'Dental Veneers / Crowns')}
                      </td>
                      <td style={{ padding: '14px', fontSize: '0.9rem', textAlign: 'right', fontWeight: 600 }}>{activeInvoice.amount}</td>
                    </tr>
                    <tr style={{ borderTop: '2.5px double var(--border-color)' }}>
                      <td style={{ padding: '14px', fontWeight: 700 }}>Total</td>
                      <td style={{ padding: '14px', fontWeight: 700, textAlign: 'right', color: 'var(--primary)' }}>{activeInvoice.amount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status: </span>
                  <span 
                    style={{ 
                      fontSize: '0.8rem', 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontWeight: 600,
                      backgroundColor: activeInvoice.status === 'Paid' ? 'hsl(142, 70%, 95%)' : 'hsl(36, 100%, 95%)',
                      color: activeInvoice.status === 'Paid' ? 'hsl(142, 70%, 40%)' : 'hsl(36, 100%, 45%)',
                    }}
                  >
                    {activeInvoice.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="invoice-modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveInvoice(null)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  window.print();
                  setActiveInvoice(null);
                }}
              >
                <Printer size={16} /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Container (Printer Only) */}
      {activeInvoice && (
        <div className="printable-invoice-container">
          <div className="invoice-print-header">
            <div className="clinic-info">
              <h2>Dental ERP Clinic</h2>
              <p>123 Medical Avenue, Chennai, 600001</p>
              <p>Phone: +91 98765 43210 | Email: contact@dentalerp.com</p>
            </div>
            <div className="invoice-meta">
              <h1>INVOICE</h1>
              <p><strong>Invoice No:</strong> {activeInvoice.invoiceNo}</p>
              <p><strong>Date:</strong> {activeInvoice.date}</p>
            </div>
          </div>
          
          <div className="invoice-print-bill-to">
            <div>
              <h3>Bill To:</h3>
              <p><strong>Patient Name:</strong> {activeInvoice.patient}</p>
              <p><strong>Patient ID:</strong> {activeInvoice.patientId || 'PAT-0001'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h3>Assigned Doctor:</h3>
              <p>{activeInvoice.doctor || 'Dr. Arjun Sharma'}</p>
            </div>
          </div>
          
          <table className="invoice-print-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{activeInvoice.description || (activeInvoice.invoiceNo === 'INV-2026-001' ? 'Composite Teeth Filling' : 'Dental Veneers / Crowns')}</td>
                <td style={{ textAlign: 'right' }}>{activeInvoice.amount}</td>
              </tr>
              <tr className="invoice-print-total-row">
                <td><strong>Total:</strong></td>
                <td style={{ textAlign: 'right' }}><strong>{activeInvoice.amount}</strong></td>
              </tr>
            </tbody>
          </table>
          
          <div className="invoice-print-footer">
            <p><strong>Payment Status:</strong> {activeInvoice.status}</p>
            <p style={{ marginTop: '8px' }}>Thank you for choosing Dental ERP Clinic!</p>
          </div>
        </div>
      )}
    </>
  );
}

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

  const showToast = (message, type = 'success') => {
    setToast({
      message,
      type
    });
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
          <div className="logo-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsl(266, 40%, 96%)', boxShadow: '0 4px 10px rgba(107, 76, 113, 0.12)', flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" width="34" height="34">
              <path fill="#6b4c71" d="M20,25 C20,12 35,8 50,22 C65,8 80,12 80,25 C80,50 68,68 64,85 C63,88 59,88 58,85 C55,72 53,60 50,60 C47,60 45,72 42,85 C41,88 37,88 36,85 C32,68 20,50 20,25 Z" />
            </svg>
          </div>
          <span className="logo-text" style={{ fontSize: '1.25rem', fontWeight: 800 }}>Ranga's</span>
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
          <MockDashboard tab={activeTab} onNavigate={handleNavigate} onPrintInvoice={setActiveInvoice} showToast={showToast} />
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
          <div className="invoice-modal" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="invoice-modal-header" style={{ borderBottom: '1px solid var(--border-color)', padding: '16px 24px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Invoice Preview</h3>
              <button 
                onClick={() => setActiveInvoice(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="invoice-modal-body" style={{ position: 'relative', overflow: 'hidden', minHeight: '480px', padding: '24px', backgroundColor: '#fff', color: '#000' }}>
              {/* Background watermark */}
              <div style={{
                position: 'absolute',
                top: '55%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.04,
                zIndex: 0,
                pointerEvents: 'none'
              }}>
                <svg viewBox="0 0 100 100" width="300" height="300">
                  <path fill="#6b4c71" d="M20,25 C20,12 35,8 50,22 C65,8 80,12 80,25 C80,50 68,68 64,85 C63,88 59,88 58,85 C55,72 53,60 50,60 C47,60 45,72 42,85 C41,88 37,88 36,85 C32,68 20,50 20,25 Z" />
                </svg>
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Letterhead Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2.5px solid #6b4c71', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <svg viewBox="0 0 100 100" width="100" height="100" style={{ marginRight: '16px', flexShrink: 0 }}>
                      <path fill="#6b4c71" d="M20,25 C20,12 35,8 50,22 C65,8 80,12 80,25 C80,50 68,68 64,85 C63,88 59,88 58,85 C55,72 53,60 50,60 C47,60 45,72 42,85 C41,88 37,88 36,85 C32,68 20,50 20,25 Z" />
                    </svg>
                    <div>
                      <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.45rem', color: '#111', lineHeight: '1.1', letterSpacing: '0.5px', margin: 0 }}>RANGA'S</h2>
                      <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.85rem', color: '#333', letterSpacing: '1px', margin: '2px 0 6px 0' }}>DENTAL CLINIC</h3>
                      <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#444', margin: 0 }}>Dr. DINESH KUMAR, <span style={{ fontSize: '0.6rem', fontWeight: 500 }}>B.D.S., Dental Surgeon</span></p>
                      <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#444', margin: '1px 0 0 0' }}>Dr. DIVYA, <span style={{ fontSize: '0.6rem', fontWeight: 500 }}>B.D.S., PGDMRCPV</span></p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#333', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', fontWeight: 600 }}>
                      <span>📞</span> <span>: 95660 68757</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', fontWeight: 600, marginBottom: '6px' }}>
                      <span>📞</span> <span>: 80159 64997</span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#555' }}>Reg. No. 13750</div>
                    <div style={{ fontSize: '0.68rem', color: '#555' }}>Reg. No. 14427</div>
                  </div>
                </div>

                {/* Patient Info Block */}
                <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', borderBottom: '1px solid #ddd', paddingBottom: '12px', fontSize: '0.9rem' }}>
                  <div><strong>Name:</strong> <span style={{ borderBottom: '1px dotted #666', paddingBottom: '2px', display: 'inline-block', minWidth: '150px', fontWeight: 600 }}>{activeInvoice.patient}</span></div>
                  <div><strong>Age:</strong> <span style={{ borderBottom: '1px dotted #666', paddingBottom: '2px', display: 'inline-block', minWidth: '45px', fontWeight: 600 }}>{activeInvoice.age || '—'}</span></div>
                  <div><strong>Sex:</strong> <span style={{ borderBottom: '1px dotted #666', paddingBottom: '2px', display: 'inline-block', minWidth: '55px', textTransform: 'capitalize', fontWeight: 600 }}>{activeInvoice.gender || '—'}</span></div>
                </div>

                {/* Prescription & Metadata */}
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111', fontFamily: 'serif', fontStyle: 'italic', lineHeight: '1' }}>℞</div>
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#444' }}>
                    <div><strong>Invoice No:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{activeInvoice.invoiceNo}</span></div>
                    <div style={{ marginTop: '2px' }}><strong>Date:</strong> {activeInvoice.date}</div>
                  </div>
                </div>

                {/* Bill Details Table */}
                <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', marginTop: '16px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9f9f9', fontSize: '0.85rem', borderBottom: '1px solid #ddd' }}>
                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#333' }}>S.No.</th>
                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#333' }}>Description</th>
                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#333', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ fontSize: '0.92rem', borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '14px', width: '60px' }}>1</td>
                        <td style={{ padding: '14px' }}>
                          {activeInvoice.description || 'Dental Treatment'}
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right', fontWeight: 600 }}>{activeInvoice.amount}</td>
                      </tr>
                      <tr style={{ borderTop: '2px solid #333', fontWeight: 700, fontSize: '0.98rem' }}>
                        <td colSpan="2" style={{ padding: '14px' }}>Total</td>
                        <td style={{ padding: '14px', textAlign: 'right', color: '#6b4c71' }}>{activeInvoice.amount}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Status & Doctor Block */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#555' }}>Status: </span>
                    <span 
                      style={{ 
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
                  <div style={{ color: '#444' }}>
                    <strong>Assigned Doctor:</strong> {activeInvoice.doctor || 'Dr. Arjun Sharma'}
                  </div>
                </div>

                {/* Footer Address */}
                <div style={{ marginTop: '32px', borderTop: '1px solid #ddd', paddingTop: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', color: '#444', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                    @ RKP HOSPITALS, No.5, Medavakkam Main Road, Vaithiyalingam Nagar, Nanmangalam, Chennai - 600 129.
                  </p>
                  <div style={{
                    display: 'inline-block',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '4px 12px',
                    fontSize: '0.7rem',
                    color: '#444',
                    backgroundColor: '#fafafa'
                  }}>
                    <strong>Consulting Time:</strong> 10.00 a.m. to 1.00 p.m. | Evening: 5.00 p.m. to 9.00 p.m. (Sunday By Prior Appointment only)
                  </div>
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
        <div className="printable-invoice-container" style={{ position: 'relative', fontFamily: "'Outfit', sans-serif", color: '#000', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' }}>
          {/* Background watermark */}
          <div style={{
            position: 'absolute',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.05,
            zIndex: 0,
            pointerEvents: 'none'
          }}>
            <svg viewBox="0 0 100 100" width="380" height="380">
              <path fill="#6b4c71" d="M20,25 C20,12 35,8 50,22 C65,8 80,12 80,25 C80,50 68,68 64,85 C63,88 59,88 58,85 C55,72 53,60 50,60 C47,60 45,72 42,85 C41,88 37,88 36,85 C32,68 20,50 20,25 Z" />
            </svg>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2.5px solid #6b4c71', paddingBottom: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <svg viewBox="0 0 100 100" width="100" height="100" style={{ marginRight: '18px', flexShrink: 0 }}>
                  <path fill="#6b4c71" d="M20,25 C20,12 35,8 50,22 C65,8 80,12 80,25 C80,50 68,68 64,85 C63,88 59,88 58,85 C55,72 53,60 50,60 C47,60 45,72 42,85 C41,88 37,88 36,85 C32,68 20,50 20,25 Z" />
                </svg>
                <div>
                  <h2 style={{ fontWeight: 800, fontSize: '1.9rem', color: '#111', lineHeight: '1.1', letterSpacing: '0.5px', margin: 0 }}>RANGA'S</h2>
                  <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#333', letterSpacing: '1.5px', margin: '2px 0 8px 0' }}>DENTAL CLINIC</h3>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', margin: 0 }}>Dr. DINESH KUMAR, <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>B.D.S., Dental Surgeon</span></p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', margin: '2px 0 0 0' }}>Dr. DIVYA, <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>B.D.S., PGDMRCPV</span></p>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#333', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', fontWeight: 600 }}>
                  <span>📞</span> <span>: 95660 68757</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', fontWeight: 600, marginBottom: '8px' }}>
                  <span>📞</span> <span>: 80159 64997</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#555' }}>Reg. No. 13750</div>
                <div style={{ fontSize: '0.8rem', color: '#555' }}>Reg. No. 14427</div>
              </div>
            </div>

            {/* Patient Info Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', borderBottom: '1px solid #ddd', paddingBottom: '16px', marginBottom: '20px', fontSize: '1.05rem' }}>
              <div><strong>Name:</strong> <span style={{ borderBottom: '1.5px dotted #555', paddingBottom: '2px', display: 'inline-block', minWidth: '220px', fontWeight: 600 }}>{activeInvoice.patient}</span></div>
              <div><strong>Age:</strong> <span style={{ borderBottom: '1.5px dotted #555', paddingBottom: '2px', display: 'inline-block', minWidth: '60px', fontWeight: 600 }}>{activeInvoice.age || '—'}</span></div>
              <div><strong>Sex:</strong> <span style={{ borderBottom: '1.5px dotted #555', paddingBottom: '2px', display: 'inline-block', minWidth: '70px', textTransform: 'capitalize', fontWeight: 600 }}>{activeInvoice.gender || '—'}</span></div>
            </div>

            {/* Rx and Invoice Metadata */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#111', fontFamily: 'serif', fontStyle: 'italic', lineHeight: '1' }}>℞</div>
              <div style={{ textAlign: 'right', fontSize: '0.95rem', color: '#444' }}>
                <div><strong>Invoice No:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.05rem' }}>{activeInvoice.invoiceNo}</span></div>
                <div style={{ marginTop: '4px' }}><strong>Date:</strong> {activeInvoice.date}</div>
              </div>
            </div>

            {/* Particulars Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '40px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #111', fontSize: '0.95rem' }}>
                  <th style={{ padding: '10px 0', fontWeight: 700, textTransform: 'uppercase', width: '80px' }}>S.No.</th>
                  <th style={{ padding: '10px 0', fontWeight: 700, textTransform: 'uppercase' }}>Description</th>
                  <th style={{ padding: '10px 0', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ fontSize: '1.05rem', borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '16px 0' }}>1</td>
                  <td style={{ padding: '16px 0' }}>
                    {activeInvoice.description || 'Dental Treatment'}
                  </td>
                  <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: 600 }}>{activeInvoice.amount}</td>
                </tr>
                <tr style={{ borderTop: '2px solid #111', fontWeight: 700, fontSize: '1.15rem' }}>
                  <td colSpan="2" style={{ padding: '16px 0' }}>Total</td>
                  <td style={{ padding: '16px 0', textAlign: 'right' }}>{activeInvoice.amount}</td>
                </tr>
              </tbody>
            </table>

            {/* Status indicators */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px', fontSize: '1rem' }}>
              <div>
                <span><strong>Payment Status:</strong> </span>
                <span style={{ 
                  fontWeight: 700, 
                  textTransform: 'uppercase',
                  color: activeInvoice.status === 'Paid' ? 'hsl(142, 76%, 36%)' : 'hsl(36, 100%, 40%)' 
                }}>
                  {activeInvoice.status}
                </span>
              </div>
              <div style={{ textTransform: 'capitalize' }}>
                <strong>Assigned Doctor:</strong> {activeInvoice.doctor || 'Dr. Arjun Sharma'}
              </div>
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1.5px solid #111', paddingTop: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', color: '#111', margin: '0 0 10px 0', fontWeight: 500, lineHeight: '1.4' }}>
                @ RKP HOSPITALS, No.5, Medavakkam Main Road, Vaithiyalingam Nagar, Nanmangalam, Chennai - 600 129.
              </p>
              <div style={{
                display: 'inline-block',
                border: '1.5px solid #111',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#111',
                backgroundColor: '#fff'
              }}>
                Consulting Time: 10.00 a.m. to 1.00 p.m. | Evening: 5.00 p.m. to 9.00 p.m. (Sunday By Prior Appointment only)
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

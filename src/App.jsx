import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import PatientRegistry from './pages/PatientRegistry';
import PatientList from './pages/PatientList';
import MockDashboard from './pages/MockDashboard';
import Toast from './components/Toast';
import { Menu, Stethoscope } from 'lucide-react';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('patient-registry');
  const [toast, setToast] = useState(null);

  const doctorInfo = {
    name: 'Dr. Arjun Sharma',
    email: 'arjun.sharma@dentalerp.com',
    initials: 'DA'
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
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

  return (
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
        onTabChange={setActiveTab}
        doctorInfo={doctorInfo}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Panel Content */}
      <main 
        className="main-content"
        style={{
          marginLeft: '0px', // Handled by Flex layouts
        }}
      >
        {activeTab === 'patient-registry' ? (
          <PatientRegistry onSaveSuccess={handleSaveSuccess} />
        ) : activeTab === 'patient-list' ? (
          <PatientList />
        ) : (
          <MockDashboard tab={activeTab} onNavigate={setActiveTab} />
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
  );
}

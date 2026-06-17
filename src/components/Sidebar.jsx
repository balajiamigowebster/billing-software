import React from 'react';
import { 
  LayoutDashboard, 
  Users,
  Calendar, 
  Activity, 
  Receipt, 
  ClipboardList, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight,
  Stethoscope,
  LogOut
} from 'lucide-react';
import ProfileCard from './ProfileCard';

export default function Sidebar({ 
  collapsed, 
  onToggle, 
  activeTab, 
  onTabChange,
  doctorInfo,
  mobileOpen,
  onCloseMobile,
  onLogout
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patient-list', label: 'Patient List', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'treatments', label: 'Treatments', icon: Activity },
    { id: 'billing', label: 'Billing', icon: Receipt },
    { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardList },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div>
        <div className="sidebar-header">
          {!collapsed && (
            <div className="logo-container" style={{ gap: '14px' }}>
              <div className="logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsl(266, 40%, 96%)', boxShadow: '0 4px 10px rgba(107, 76, 113, 0.15)', width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0 }}>
                <svg viewBox="0 0 100 100" width="34" height="34">
                  <path fill="#6b4c71" d="M20,25 C20,12 35,8 50,22 C65,8 80,12 80,25 C80,50 68,68 64,85 C63,88 59,88 58,85 C55,72 53,60 50,60 C47,60 45,72 42,85 C41,88 37,88 36,85 C32,68 20,50 20,25 Z" />
                </svg>
              </div>
              <span className="logo-text" style={{ fontSize: '1.45rem', fontWeight: 800 }}>Ranga's</span>
            </div>
          )}
          {collapsed && (
            <div className="logo-icon" style={{ margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsl(266, 40%, 96%)', boxShadow: '0 4px 10px rgba(107, 76, 113, 0.15)', width: '48px', height: '48px', borderRadius: '12px' }}>
              <svg viewBox="0 0 100 100" width="34" height="34">
                <path fill="#6b4c71" d="M20,25 C20,12 35,8 50,22 C65,8 80,12 80,25 C80,50 68,68 64,85 C63,88 59,88 58,85 C55,72 53,60 50,60 C47,60 45,72 42,85 C41,88 37,88 36,85 C32,68 20,50 20,25 Z" />
              </svg>
            </div>
          )}
          <button 
            className="sidebar-toggle" 
            onClick={onToggle}
            style={{ 
              position: collapsed ? 'static' : 'absolute',
              right: '-14px',
              top: '30px'
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`menu-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onTabChange(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                title={collapsed ? item.label : undefined}
              >
                <span className="menu-item-icon">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </span>
                {!collapsed && <span className="menu-item-text">{item.label}</span>}
              </button>
            );
          })}
          {onLogout && (
            <button
              className="menu-item"
              style={{ marginTop: '16px', color: 'hsl(0, 75%, 45%)' }}
              onClick={onLogout}
              title={collapsed ? "Log Out" : undefined}
            >
              <span className="menu-item-icon">
                <LogOut size={20} />
              </span>
              {!collapsed && <span className="menu-item-text">Log Out</span>}
            </button>
          )}
        </nav>
      </div>

      <div className="profile-section">
        <ProfileCard 
          name={doctorInfo.name} 
          email={doctorInfo.email} 
          initials={doctorInfo.initials} 
          collapsed={collapsed}
        />
      </div>
    </aside>
  );
}

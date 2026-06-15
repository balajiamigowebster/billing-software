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
            <div className="logo-container">
              <div className="logo-icon">
                <Stethoscope size={20} strokeWidth={2.5} />
              </div>
              <span className="logo-text">Dental</span>
            </div>
          )}
          {collapsed && (
            <div className="logo-icon" style={{ margin: '0 auto' }}>
              <Stethoscope size={20} strokeWidth={2.5} />
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

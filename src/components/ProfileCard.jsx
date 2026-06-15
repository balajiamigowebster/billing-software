import React from 'react';

export default function ProfileCard({ name, email, initials, collapsed }) {
  return (
    <div className="profile-card" title={collapsed ? `${name} (${email})` : undefined}>
      <div className="profile-avatar">{initials}</div>
      {!collapsed && (
        <div className="profile-info">
          <span className="profile-name">{name}</span>
          <span className="profile-email">{email}</span>
        </div>
      )}
    </div>
  );
}

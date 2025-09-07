import React from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';

const UserProfile = () => {
  const { user } = useAuth();

  return (
    <div className="card">
      <h2 style={{ marginBottom: '2rem', color: '#333' }}>👤 User Profile</h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1rem' 
      }}>
        <div className="profile-field">
          <strong>Username:</strong> {user.username}
        </div>
        <div className="profile-field">
          <strong>Name:</strong> {user.name}
        </div>
        <div className="profile-field">
          <strong>Email:</strong> {user.email}
        </div>
        <div className="profile-field">
          <strong>Contact Number:</strong> {user.contactNumber}
        </div>
        <div className="profile-field">
          <strong>Country:</strong> {user.country}
        </div>
        <div className="profile-field">
          <strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
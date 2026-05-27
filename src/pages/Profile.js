import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();   // { email, role } from JWT
  const [profile, setProfile] = useState({
    name: '',
    address: '',
    phone: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Password change form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');

  // Load current profile
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/user/profile`)
      .then(res => {
        setProfile({
          name: res.data.name || '',
          address: res.data.address || '',
          phone: res.data.phone || ''
        });
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load profile.');
      });
  }, []);

  // Update profile handler
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/user/profile`, profile);
      setMessage('Profile updated successfully!');
      setProfile({
        name: res.data.name,
        address: res.data.address,
        phone: res.data.phone
      });
    } catch (err) {
      setError('Failed to update profile.');
      console.error(err);
    }
  };

  // Change password handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMessage('');
    setPwError('');
    if (newPassword.length < 6) {
      setPwError('Password must be at least 6 characters.');
      return;
    }
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/user/change-password`, {
        oldPassword,
        newPassword
      });
      setPwMessage('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setPwError(err.response?.data || 'Failed to change password.');
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 600 }}>
      <h2 className="mb-4">My Profile</h2>

      {/* Profile update form */}
      <form onSubmit={handleProfileUpdate} className="mb-5">
        <h4>Personal Information</h4>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={user?.email || ''} disabled />
          <div className="form-text">Email cannot be changed.</div>
        </div>

        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={profile.name}
            onChange={e => setProfile({...profile, name: e.target.value})}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Address</label>
          <input
            type="text"
            className="form-control"
            value={profile.address}
            onChange={e => setProfile({...profile, address: e.target.value})}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input
            type="text"
            className="form-control"
            value={profile.phone}
            onChange={e => setProfile({...profile, phone: e.target.value})}
          />
        </div>

        <button type="submit" className="btn btn-primary">Update Profile</button>
      </form>

      {/* Password change form */}
      <form onSubmit={handlePasswordChange}>
        <h4>Change Password</h4>
        {pwMessage && <div className="alert alert-success">{pwMessage}</div>}
        {pwError && <div className="alert alert-danger">{pwError}</div>}

        <div className="mb-3">
          <label className="form-label">Current Password</label>
          <input
            type="password"
            className="form-control"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">New Password</label>
          <input
            type="password"
            className="form-control"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-outline-primary">Change Password</button>
      </form>
    </div>
  );
}
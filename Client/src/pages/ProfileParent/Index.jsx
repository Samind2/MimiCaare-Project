import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './ProfileForm.css';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate(); // Hook for navigation
  const { user } = useContext(AuthContext);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [picture, setPicture] = useState(user?.picture || '');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPicture(user.picture || '');
    }
  }, [user]);

  // Handle input change
  const handleFirstNameChange = (e) => setFirstName(e.target.value);
  const handleLastNameChange = (e) => setLastName(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);

  // Handle file change
  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPicture(URL.createObjectURL(file)); // Create a preview URL
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/profile-update'); // Navigate to the profile update page
  };

  return (
    <div className="profile-form-container">
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-pic-section">
          <div className="profile-pic-wrapper">
          <img src={picture || '/images/default-profile.png'} alt="Profile" className="profile-pic" />
          <label htmlFor="profilePicInput" className="profile-pic-upload-button">
              📷 {/* Camera Icon */}
            </label>
            <input
              id="profilePicInput"
              type="file"
              accept="image/*"
              onChange={handlePictureChange} // Handle picture change
              style={{ display: 'none' }}
              disabled
            />
          </div>
        </div>

        <div className="form-fields">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">ชื่อ *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={firstName}
                onChange={handleFirstNameChange} // Handle first name change
                readOnly
                placeholder="กรอกชื่อจริง"
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">นามสกุล *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={lastName}
                onChange={handleLastNameChange} // Handle last name change
                readOnly
                placeholder="กรอกนามสกุล"
                className="readonly-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">อีเมล *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleEmailChange} // Handle email change
              readOnly
              placeholder="กรอกอีเมล"
              className="readonly-input"
            />
          </div>

          <button type="submit" className="submit-button">แก้ไข</button>
        </div>
      </form>
    </div>
  );
};

export default Index;

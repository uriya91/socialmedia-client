import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';
import { auth } from '../auth/firebaseConfig';
import Spinner from './Spinner';
import './EditProfile.css';

const EditProfile = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    profileImage: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        username: user.username || '',
        phone: user.phone || '',
        profileImage: user.profileImage || ''
      });
      const userImage = user.profileImage && user.profileImage.trim() 
        ? user.profileImage.trim() 
        : '/default-avatar.png';
      setPreviewImage(userImage);
      setError('');
      setImageFile(null);
    }
  }, [isOpen, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      let profileImageUrl = formData.profileImage;
      if (imageFile) {
        profileImageUrl = await uploadToCloudinary(imageFile);
      }

      const updateData = {
        username: formData.username.trim(),
        phone: formData.phone.trim(),
        profileImage: profileImageUrl
      };

      const response = await axios.put(`/users/${user._id}`, updateData, {
        headers: { 'x-user-id': auth.currentUser?.uid }
      });

      onSave(response.data);
      onClose();
      
    } catch (err) {
      console.error('Error updating profile:', err);
      
      if (err.response?.status === 400) {
        const errorMsg = err.response.data.message;
        if (errorMsg.includes('phone')) {
          setError('This phone number is already in use by another user');
        } else {
          setError(errorMsg);
        }
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username || '',
        phone: user.phone || '',
        profileImage: user.profileImage || ''
      });
      const userImage = user.profileImage && user.profileImage.trim() 
        ? user.profileImage.trim() 
        : '/default-avatar.png';
      setPreviewImage(userImage);
    }
    setError('');
    setImageFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleCancel}>
      <div className="edit-profile-container" onClick={e => e.stopPropagation()}>
        {loading && (
          <div className="modal-spinner-overlay">
            <Spinner overlay={false} text="Updating profile..." />
          </div>
        )}
        
        <h2 className="modal-title">Edit Magical Profile</h2>
        
        <div className="profile-image-section">
          <img 
            src={previewImage && previewImage.trim() ? previewImage : '/default-avatar.png'} 
            alt="Profile Preview" 
            className="profile-preview-large"
            onError={(e) => {
              e.target.src = '/default-avatar.png';
            }}
          />
          <label htmlFor="profile-image-input" className="change-image-btn">
            Change Picture
          </label>
          <input 
            type="file" 
            id="profile-image-input"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </div>

        <div className="form-fields">
          <div className="form-group">
            <label className="field-label">Username</label>
            <input 
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="field-input"
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="field-label">Phone Number</label>
            <input 
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="field-input"
              placeholder="Enter 10-digit phone number"
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="modal-actions">
          <button 
            onClick={handleCancel}
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="save-btn"
            disabled={loading || !formData.username.trim()}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
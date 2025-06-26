import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../auth/firebaseConfig';
import axios from '../../utils/axiosConfig';
import { uploadToCloudinary } from '../../utils/uploadToCloudinary';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import Spinner from '../../components/Spinner';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('/default-avatar.png');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const { firstName, lastName, email, phone, password, confirmPassword, birthDate } = formData;

    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword || !birthDate) {
      setError('Please fill out all fields.');
      return false;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be exactly 10 digits.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseUser = userCredential.user;

      const profileImage = imageFile ? await uploadToCloudinary(imageFile) : '';

      await axios.post('/users', {
        userId: firebaseUser.uid,
        username: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        birthDate: formData.birthDate,
        profileImage,
      });

      alert('Registration successful!');
      await auth.signOut();
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className='signup-container'>
      <h1 className="title">Sign Up to the Magical World</h1>

      <div className="signup-card">
        <div className="image-upload-wrapper">
          <label htmlFor='image-upload'>
            <img src={previewImage} alt="Preview" className="profile-preview" />
          </label>
          <label className='choose-label'>Choose Profile Picture</label>
          <input type="file" id="image-upload" accept="image/*" onChange={handleImageChange} className="image-upload-input" />
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">First Name</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="input-label">Last Name</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="input-label">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="input-label">Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="input-label">Birthdate</label>
            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="input-label">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="input-label">Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <div className="form-buttons">
            <button type="submit" className="form-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
            <button type="button" className="form-button" onClick={() => navigate('/')}>Back to Login</button>
          </div>

          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Register;
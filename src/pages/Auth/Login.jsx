import React, { useState } from 'react';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '../../auth/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const persistenceType = remember ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceType);
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Incorrect email or password.');
    }
  };

  return (
    <div className="signin-container">
      <h1 className="title">Welcome to Wizard Social Media!</h1>

      <div className="login-card">
        <form className="login-form" onSubmit={handleLogin}>

          <div className="form-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="remember-login-row">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember Me
            </label>

            <button type="submit" className="form-button login-btn">Login</button>
          </div>

          <div className="signup-redirect">
            <span>Don't have an account?</span>
            <button type="button" className="form-button" onClick={() => navigate('/register')}>Sign Up</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

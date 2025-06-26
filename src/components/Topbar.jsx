import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../auth/firebaseConfig';
import SearchResults from './SearchResults';
import './Topbar.css';

export default function Topbar({ onSearchSelect, currentUserId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setShowResults(searchTerm.trim().length >= 3);
  }, [searchTerm]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem('mongoUserId');
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleSelect = (item) => {
    setShowResults(false);
    setSearchTerm('');
    
    if (onSearchSelect) {
      onSearchSelect(item);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.topbar-left')) {
        setShowResults(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <input
          className="topbar-search"
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search for magical friends and groups..."
          onFocus={() => {
            if (searchTerm.trim().length >= 3) {
              setShowResults(true);
            }
          }}
        />

        {showResults && (
          <SearchResults
            searchTerm={searchTerm}
            currentUserId={currentUserId}
            onSelect={handleSelect}
          />
        )}
      </div>

      <div className="topbar-right">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
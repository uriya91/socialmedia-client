import { useEffect, useState } from 'react';
import axios from '../utils/axiosConfig';
import { auth } from '../auth/firebaseConfig';
import SearchResultItem from './SearchResultItem';
import './SearchResults.css';

export default function SearchResults({ searchTerm = '', currentUserId, onSelect }) {
  const [data, setData] = useState({ users: [], groups: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 3) {
      setData({ users: [], groups: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/search', {
          params: { term, page: 1, limit: 12 },
          headers: { 'x-user-id': auth.currentUser?.uid }
        });
        
        const filteredUsers = data.users
          .filter(u => u._id !== currentUserId)
          .map(u => {
            const enrichedUser = {
              ...u,
              __type: 'user',
              isFriend: u.isFriend || false,
              isPendingSent: u.isPendingSent || false,
              isPendingReceived: u.isPendingReceived || false
            };
                       
            return enrichedUser;
          });

        const enrichedGroups = data.groups.map(g => {
          const enrichedGroup = {
            ...g,
            __type: 'group',
            isMember: g.isMember || false,
            isPending: g.isPending || false
          };
          
          return enrichedGroup;
        });

        setData({
          users: filteredUsers,
          groups: enrichedGroups
        });
      } catch (err) { 
        console.error('Search error:', err);
        setData({ users: [], groups: [] });
      }
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, currentUserId]);

  return (
    <div className="sr-dropdown">
      {loading ? (
        <div className="sr-loading">
          <div className="mini-spinner"></div>
          <span className="sr-loading-text">Searching...</span>
        </div>
      ) : (
        <>
          {data.users.length > 0 && (
            <>
              <div className="sr-section-header">Users</div>
              {data.users.map(u => (
                <SearchResultItem 
                  key={u._id} 
                  item={u} 
                  onSelect={onSelect} 
                />
              ))}
            </>
          )}

          {data.groups.length > 0 && (
            <>
              <div className="sr-section-header">Groups</div>
              {data.groups.map(g => (
                <SearchResultItem 
                  key={g._id} 
                  item={g} 
                  onSelect={onSelect} 
                />
              ))}
            </>
          )}

          {data.users.length === 0 && data.groups.length === 0 && !loading && (
            <div className="sr-empty">No magical matches found</div>
          )}
        </>
      )}
    </div>
  );
}
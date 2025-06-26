import { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';
import { auth } from '../../auth/firebaseConfig';
import FeedList from '../../components/FeedList';
import Spinner from '../../components/Spinner';
import defaultAvatar from '/default-avatar.png';
import './UserProfile.css';

export default function UserProfile({ userId }) {
  const [data, setData] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);
  const [loading, setLoad] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoad(true);
      try {
        const [profileRes, currentUserRes] = await Promise.all([
          axios.get(`/users/${userId}/profile`, {
            headers: { 'x-user-id': auth.currentUser?.uid }
          }),
          axios.get('/users/me', {
            headers: { 'x-user-id': auth.currentUser?.uid }
          })
        ]);
        
        setData(profileRes.data);
        setMongoUser(currentUserRes.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.response?.status || 'ERR');
      } finally {
        setLoad(false);
      }
    };
    
    fetchProfile();
  }, [userId]);

  const handlePostUpdated = (postId, newContent) => {
    setData(prev => ({
      ...prev,
      posts: prev.posts.map(p => 
        p._id === postId ? { ...p, content: newContent } : p
      )
    }));
  };

  const handlePostDeleted = (postId) => {
    setData(prev => ({
      ...prev,
      posts: prev.posts.filter(p => p._id !== postId)
    }));
  };

  if (loading) return <Spinner />;

  if (error === 403) return (
    <div className="profile-error">
      🚧 Only friends can view this profile.
    </div>
  );

  if (error === 404 || !data) return (
    <div className="profile-error">User not found.</div>
  );

  const { user, posts } = data;

  const isSelf = mongoUser?._id === user._id;

  return (
    <div className="user-profile">
      <div className="profile-header">
        <img
          src={user.profileImage || defaultAvatar}
          alt={user.username}
          className="profile-avatar"
          onError={(e) => {
            e.target.src = defaultAvatar;
          }}
        />
        <div className="profile-info">
          <h2 className="profile-name">{user.username}</h2>
          <div className="profile-stats">
            <span className="profile-stat">
              📝 {posts.length} Post{posts.length !== 1 ? 's' : ''}
            </span>
            {user.email && isSelf && (
              <span className="profile-stat">
                📧 {user.email}
              </span>
            )}
            {user.phone && isSelf && (
              <span className="profile-stat">
                📱 {user.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="profile-posts">
        <h3 className="posts-title">
          {isSelf ? 'My Posts' : `${user.username}'s Posts`}
        </h3>
        
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>
              {isSelf 
                ? "You haven't posted anything yet. Share your first magical thought!" 
                : `${user.username} hasn't posted anything yet.`
              }
            </p>
          </div>
        ) : (
          <FeedList
            posts={posts}
            mongoUser={mongoUser}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
            hideFilters={true}
            isGroupAdmin={false}
          />
        )}
      </div>
    </div>
  );
}
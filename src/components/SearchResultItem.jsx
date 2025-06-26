import { useState } from 'react';
import axios from '../utils/axiosConfig';
import { auth } from '../auth/firebaseConfig';
import avatarPlaceholder from '/default-avatar.png';
import './SearchResultItem.css';

export default function SearchResultItem({ item, onSelect }) {
  const [rel, setRel] = useState(() => {
    if (item.__type !== 'user') return null;
    if (item.isFriend)            return 'friend';
    if (item.isPendingSent)       return 'pendingSent';
    if (item.isPendingReceived)   return 'pendingRecv';
    return 'none';
  });

  const [groupStatus, setGroupStatus] = useState(() => {
    if (item.__type !== 'group') return null;
    if (item.isMember) return 'member';
    if (item.isPending) return 'pending';
    return 'none';
  });

  const cfg = { headers: { 'x-user-id': auth.currentUser?.uid } };

  const addFriend = async () => {
    try {
      const { data } = await axios.post(
        `/users/${item._id}/friend-request`, {}, cfg
      );

      if (data.message === 'Friend request auto-accepted')
        setRel('friend');
      else
        setRel('pendingSent');
    } catch (err) { console.error(err); }
  };

  const cancelFriendRequest = async () => {
    try {
      await axios.post(`/users/${item._id}/friend-cancel`, {}, cfg);
      setRel('none');
    } catch (err) { console.error(err); }
  };

  const removeFriend = async () => {
    try {
      await axios.delete(`/users/${item._id}/friend-remove`, cfg);
      setRel('none');
    } catch (err) { console.error(err); }
  };

  const acceptFriend = async () => {
    try {
      await axios.post(`/users/${item._id}/friend-accept`, {}, cfg);
      setRel('friend');
    } catch (err) { console.error(err); }
  };

  const joinGroup = async () => {
    try {
      await axios.post(`/groups/${item._id}/join`, {}, cfg);
      setGroupStatus('pending');
    } catch (err) { console.error(err); }
  };

  const leaveGroup = async () => {
    try {
      await axios.delete(`/groups/${item._id}/members/${auth.currentUser?.uid}`, cfg);
      setGroupStatus('none');
    } catch (err) { console.error(err); }
  };

  const cancelGroupRequest = async () => {
    try {
      await axios.delete(`/groups/${item._id}/join`, cfg);
      setGroupStatus('none');
    } catch (err) { console.error(err); }
  };

  const handleCardClick = () => {
    if (item.__type === 'user') {
      if (rel === 'friend') {
        onSelect(item);
      }
    } else if (item.__type === 'group') {
      if (groupStatus === 'member') {
        onSelect(item);
      }
    }
  };

  let userButton = null;
  if (item.__type === 'user') {
    const buttonConfigs = {
      friend: { 
        text: 'Remove Friend', 
        className: 'sr-btn remove', 
        onClick: removeFriend 
      },
      pendingSent: { 
        text: 'Cancel Request', 
        className: 'sr-btn cancel', 
        onClick: cancelFriendRequest 
      },
      pendingRecv: { 
        text: 'Accept Request', 
        className: 'sr-btn accept', 
        onClick: acceptFriend 
      },
      none: { 
        text: 'Add Friend', 
        className: 'sr-btn add', 
        onClick: addFriend 
      }
    };

    const config = buttonConfigs[rel];
    if (config) {
      userButton = (
        <button 
          className={config.className} 
          onClick={e => {
            e.stopPropagation(); 
            config.onClick();
          }}
        >
          {config.text}
        </button>
      );
    }
  }

  let groupButton = null;
  if (item.__type === 'group') {
    const buttonConfigs = {
      member: { 
        text: 'Leave Group', 
        className: 'sr-btn remove', 
        onClick: leaveGroup 
      },
      pending: { 
        text: 'Cancel Request', 
        className: 'sr-btn cancel', 
        onClick: cancelGroupRequest 
      },
      none: { 
        text: 'Join Group', 
        className: 'sr-btn add', 
        onClick: joinGroup 
      }
    };

    const config = buttonConfigs[groupStatus];
    if (config) {
      groupButton = (
        <button 
          className={config.className} 
          onClick={e => {
            e.stopPropagation(); 
            config.onClick();
          }}
        >
          {config.text}
        </button>
      );
    }
  }

  return (
    <div 
      className={`sr-row ${(item.__type === 'user' && rel === 'friend') || (item.__type === 'group' && groupStatus === 'member') ? 'clickable' : 'non-clickable'}`} 
      onClick={handleCardClick}
    >
      <img
        className="sr-avatar"
        src={(item.profileImage && item.profileImage.trim()) || (item.image && item.image.trim()) || avatarPlaceholder}
        alt=""
      />
      <span className="sr-name">{item.username || item.name}</span>
      
      {item.__type === 'user' ? userButton : groupButton}
    </div>
  );
}
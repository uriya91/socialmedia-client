import React from 'react';
import './GroupPendingItem.css';

const FALLBACK = '/default-avatar.png';

export default function GroupPendingItem({ user, onRespond }) {
  return (
    <li className="gpi-item">
      <img
        className="gpi-avatar"
        src={user.profileImage || FALLBACK}
        alt={user.username}
      />
      <span className="gpi-name">{user.username}</span>
      <button
        className="gpi-accept"
        onClick={() => onRespond(user._id, true)}
      >
        Accept
      </button>
      <button
        className="gpi-reject"
        onClick={() => onRespond(user._id, false)}
      >
        Reject
      </button>
    </li>
  );
}

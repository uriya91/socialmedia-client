import React from 'react';
import GroupPendingItem from './GroupPendingItem';
import './GroupPendingList.css';

export default function GroupPendingList({ pending, onRespond }) {
  if (!pending.length) return null;
  return (
    <div className="gpl-wrap">
      <h4 className="gpl-title">Pending Requests</h4>
      <ul className="gpl-list">
        {pending.map(u => (
          <GroupPendingItem
            key={u._id}
            user={u}
            onRespond={onRespond}
          />
        ))}
      </ul>
    </div>
  );
}

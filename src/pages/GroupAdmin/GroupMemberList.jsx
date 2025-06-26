import React from 'react';
import GroupMemberItem from './GroupMemberItem';
import './GroupMemberList.css';

export default function GroupMemberList({
    members,
    admins,
    currentUserId,
    onToggleRole,
    onRemove,
    showActions = true
}) {
    return (
        <ul className="gml-wrap">
            {members.map(u => (
                <GroupMemberItem
                    key={u._id}
                    user={u}
                    isAdmin={admins.includes(u._id)}
                    isSelf={u._id === currentUserId}
                    onToggleRole={onToggleRole}
                    onRemove={onRemove}
                    showActions={showActions}
                />
            ))}
        </ul>
    );
}

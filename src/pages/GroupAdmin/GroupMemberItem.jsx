import React from 'react';
import { FaTrash, FaUserShield } from 'react-icons/fa';
import './GroupMemberItem.css';

const FALLBACK = '/default-avatar.png';

export default function GroupMemberItem({
    user: member,
    isAdmin,
    isSelf,
    showActions,
    onToggleRole,
    onRemove
}) {
    const imgSrc = member.profileImage?.trim() || FALLBACK;

    return (
        <li className="gmember-item">
            <img src={imgSrc} alt={member.username} />
            <span className="gmi-name">
                {member.username}{isSelf && ' (You)'}
            </span>

            {isAdmin && <FaUserShield className="shield" />}

            {showActions && !isSelf && (
                <>
                    <button
                        className="role-btn"
                        onClick={() => onToggleRole(member._id, isAdmin)}>
                        {isAdmin ? 'Demote' : 'Promote'}
                    </button>

                    <button
                        className="remove-btn"
                        onClick={() => onRemove(member._id)}>
                        <FaTrash />
                    </button>
                </>
            )}
        </li>
    );
}

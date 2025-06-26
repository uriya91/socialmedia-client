import { FaSignOutAlt, FaEdit } from 'react-icons/fa';
import './MyGroupSpinnerItem.css';

const FALLBACK = '/default-avatar.png';

export default function MyGroupSpinnerItem({ group, onLeave, onEdit, onGroupSelect, currentUserId }) {
  
  const handleGroupClick = () => {
    if (onGroupSelect) {
      onGroupSelect(group._id);
    }
  };

  const isManager = group?.managers?.includes(currentUserId) || false;
  
  const isCreator = (
    group?.creator?._id === currentUserId || 
    group?.creator === currentUserId ||
    (typeof group?.creator === 'string' && group?.creator === currentUserId)
  );
  
  const canEdit = isManager || isCreator;

  const membersCount = group?.membersCount || (Array.isArray(group?.members) ? group.members.length : 0);

  return (
    <div className="mg-group-card">
      <div className="mg-group-image-container" onClick={handleGroupClick}>
        <img 
          src={group?.image || FALLBACK}
          alt={group?.name || 'Group'}
          className="mg-group-image"
        />
        <div className="mg-group-overlay">
          <span className="mg-group-overlay-text">View Group</span>
        </div>
      </div>

      <div className="mg-group-info">
        <h4 className="mg-group-name" title={group?.name || ''}>
          {group?.name || 'Unnamed Group'}
        </h4>
        <p className="mg-group-members">
          {membersCount} member{membersCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="mg-group-actions">
        {canEdit && onEdit && (
          <button 
            className="mg-action-btn mg-edit-btn" 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            title="Edit Group"
          >
            <FaEdit />
          </button>
        )}
        
        {onLeave && (
          <button 
            className="mg-action-btn mg-leave-btn" 
            onClick={(e) => { e.stopPropagation(); onLeave(); }}
            title="Leave Group"
          >
            <FaSignOutAlt />
          </button>
        )}
      </div>
    </div>
  );
}
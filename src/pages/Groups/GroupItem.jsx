import { FaUserPlus, FaSignOutAlt, FaRegClock } from 'react-icons/fa';
import './GroupItem.css';

const FALLBACK = '/default-avatar.png';

export default function GroupItem({ group, status, onJoin, onCancel, onLeave, onGroupSelect }) {

  const handleCardClick = () => {
    if (status === 'member' && onGroupSelect) {
      onGroupSelect(group._id);
    }
  };

  const Btn = {
    member: (
      <button className="leave" onClick={(e) => { e.stopPropagation(); onLeave(); }}>
        <FaSignOutAlt /> Leave
      </button>
    ),
    pending: (
      <button className="pending" onClick={(e) => { e.stopPropagation(); onCancel(); }}>
        <FaRegClock /> Cancel
      </button>
    ),
    none: (
      <button className="join" onClick={(e) => { e.stopPropagation(); onJoin(); }}>
        <FaUserPlus /> Join
      </button>
    ),
  }[status];

  const count =
    typeof group.membersCount === 'number'
      ? group.membersCount
      : Array.isArray(group.members)
        ? group.members.length
        : 0;

  return (
    <div 
      className={`gitem ${status === 'member' ? 'clickable' : 'non-clickable'}`}
      onClick={handleCardClick}
      style={{ cursor: status === 'member' ? 'pointer' : 'default' }}
    >
      <img
        src={group.image || FALLBACK}
        alt={group.name}
      />
      <h4>{group.name}</h4>
      <small>{count} members</small>
      {Btn}
    </div>
  );
}
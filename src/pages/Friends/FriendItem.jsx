import defaultAvatar from '/default-avatar.png';
import './FriendItem.css';

export default function FriendItem({ friend, onRemove, onSelect }) {
  return (
    <div className="friend-card" onClick={onSelect}>
      <img
        src={friend.profileImage || defaultAvatar}
        alt={friend.username}
        className="friend-avatar"
      />
      <span className="friend-name">{friend.username}</span>

      <button
        className="friend-remove"
        onClick={e => { e.stopPropagation(); onRemove(); }}
      >
        Remove
      </button>
    </div>
  );
}

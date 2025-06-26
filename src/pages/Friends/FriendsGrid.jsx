import FriendItem from './FriendItem';
import './FriendsGrid.css';

export default function FriendsGrid({ friends, onRemove, onSelect }) {
  if (!friends.length)
    return <div className="friends-empty">No friends yet 🙃</div>;

  return (
    <div className="friends-grid">
      {friends.map(f => (
        <FriendItem
          key={f._id}
          friend={f}
          onRemove={() => onRemove(f._id)}
          onSelect={() => onSelect(f._id)}
        />
      ))}
    </div>
  );
}

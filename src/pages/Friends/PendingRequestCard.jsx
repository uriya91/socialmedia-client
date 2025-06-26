import defaultAvatar from '/default-avatar.png';
import './PendingRequestCard.css';

export default function PendingRequestCard({ user, onAccept, onDecline }) {
  return (
    <div className="pr-card">
      <img
        src={user.profileImage || defaultAvatar}
        alt={user.username}
        className="pr-avatar"
      />

      <span className="pr-name">{user.username}</span>

      <div className="pr-actions">
        <button className="btn-accept"  onClick={onAccept}>✓</button>
        <button className="btn-decline" onClick={onDecline}>✕</button>
      </div>
    </div>
  );
}
